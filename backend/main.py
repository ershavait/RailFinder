from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json, math, requests, time, hashlib, bisect
from concurrent.futures import ThreadPoolExecutor, wait, FIRST_COMPLETED
from functools import lru_cache
from typing import Optional

app = FastAPI(title="RailFinder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rail-finder.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Overpass mirrors — query ALL in parallel, take the fastest response
# ---------------------------------------------------------------------------
OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

# ---------------------------------------------------------------------------
# In-memory cache — avoids re-hitting the API. TTL = 10 minutes.
# ---------------------------------------------------------------------------
_overpass_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL = 600  # seconds


def _cache_key(query: str) -> str:
    return hashlib.md5(query.encode()).hexdigest()


def _get_cached(query: str) -> list | None:
    key = _cache_key(query)
    if key in _overpass_cache:
        ts, data = _overpass_cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
        del _overpass_cache[key]
    return None


def _set_cache(query: str, data: list):
    if len(_overpass_cache) > 200:
        oldest_key = min(_overpass_cache, key=lambda k: _overpass_cache[k][0])
        del _overpass_cache[oldest_key]
    _overpass_cache[_cache_key(query)] = (time.time(), data)


# ---------------------------------------------------------------------------
# Station loader + fast index
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def load_stations():
    with open("stations.json", encoding="utf-8") as f:
        raw = json.load(f)
    stations = []
    for feat in raw["features"]:
        if feat.get("geometry") is None:
            continue
        props = feat["properties"]
        coords = feat["geometry"]["coordinates"]
        stations.append({
            "code":    props.get("code", "").strip(),
            "name":    props.get("name", "").strip(),
            "state":   props.get("state", ""),
            "zone":    props.get("zone", ""),
            "address": props.get("address", ""),
            "lat":     coords[1],
            "lon":     coords[0],
        })
    return stations


@lru_cache(maxsize=1)
def load_station_index():
    """
    Build two fast lookup structures built once at startup:
      - by_code: dict  code_lower -> station
      - names_lower: sorted list of (name_lower, code, station) for bisect prefix search
    """
    stations = load_stations()
    by_code = {s["code"].lower(): s for s in stations}
    # Add s["code"] as tie-breaker so sorted() never tries to compare dictionaries
    names_lower = sorted((s["name"].lower(), s["code"], s) for s in stations)
    return by_code, names_lower


def distance_km(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat/2)**2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Category mappings
# ---------------------------------------------------------------------------
CATEGORY_LABELS = {
    "restaurant": "Restaurant", "cafe": "Cafe", "fast_food": "Fast Food",
    "food_court": "Food Court", "bar": "Bar",
    "hotel": "Hotel", "guest_house": "Guest House", "hostel": "Hostel", "lodge": "Lodge",
    "hospital": "Hospital", "clinic": "Clinic", "pharmacy": "Pharmacy", "doctors": "Doctor",
    "attraction": "Attraction", "museum": "Museum", "viewpoint": "Viewpoint", "artwork": "Artwork",
    "park": "Park", "garden": "Garden", "stadium": "Stadium",
    "place_of_worship": "Temple/Mosque/Church",
    "mall": "Shopping Mall", "supermarket": "Supermarket", "department_store": "Dept. Store",
}

CATEGORY_GROUPS = {
    "Food & Drinks":   ["Restaurant", "Cafe", "Fast Food", "Food Court", "Bar"],
    "Hotels & Stay":   ["Hotel", "Guest House", "Hostel", "Lodge"],
    "Sightseeing":     ["Attraction", "Museum", "Viewpoint", "Artwork"],
    "Parks & Leisure": ["Park", "Garden", "Stadium"],
    "Healthcare":      ["Hospital", "Clinic", "Pharmacy", "Doctor"],
    "Worship":         ["Temple/Mosque/Church"],
    "Shopping":        ["Shopping Mall", "Supermarket", "Dept. Store"],
}

# Overpass query fragments per category group — avoids fetching everything
# when the user filters to a single category.
CATEGORY_OVERPASS: dict[str, str] = {
    "Food & Drinks":   'node["amenity"~"restaurant|cafe|fast_food|food_court|bar"]',
    "Hotels & Stay":   'nwr["amenity"~"hotel|guest_house|hostel|lodge"] nwr["tourism"~"hotel|guest_house"]',
    "Sightseeing":     'node["tourism"~"attraction|museum|viewpoint|artwork"]',
    "Parks & Leisure": 'node["leisure"~"park|garden"] nwr["leisure"="stadium"]',
    "Healthcare":      'nwr["amenity"~"hospital"] node["amenity"~"clinic|pharmacy|doctors"]',
    "Worship":         'node["amenity"="place_of_worship"]',
    "Shopping":        'nwr["shop"~"mall|supermarket|department_store"]',
}

# Full query (all categories) used when category == "All"
ALL_CATEGORIES_QUERY = """
  node["amenity"~"restaurant|cafe|fast_food|food_court|bar"]{around};
  node["amenity"~"clinic|pharmacy|doctors"]{around};
  node["amenity"="place_of_worship"]{around};
  node["tourism"~"attraction|museum|viewpoint|artwork"]{around};
  node["leisure"~"park|garden"]{around};
  nwr["amenity"~"hospital"]{around};
  nwr["amenity"~"hotel|guest_house|hostel|lodge"]{around};
  nwr["tourism"~"hotel|guest_house"]{around};
  nwr["leisure"="stadium"]{around};
  nwr["shop"~"mall|supermarket|department_store"]{around};
"""


def get_label(tags):
    for key in ("amenity", "tourism", "leisure", "shop"):
        val = tags.get(key, "")
        if val in CATEGORY_LABELS:
            return CATEGORY_LABELS[val]
    return None


def _build_overpass_query(lat: float, lon: float, radius: int, category: Optional[str]) -> str:
    around = f"(around:{radius},{lat},{lon})"
    if category and category != "All" and category in CATEGORY_OVERPASS:
        # Build a minimal query for just this category
        fragments = CATEGORY_OVERPASS[category].split("\n")
        lines = "\n".join(f"  {frag.strip()}{around};" for frag in fragments if frag.strip())
    else:
        lines = ALL_CATEGORIES_QUERY.replace("{around}", around)
    return f"[out:json][timeout:25];\n(\n{lines}\n);\nout center qt;"


# ---------------------------------------------------------------------------
# Overpass fetcher — queries ALL mirrors in PARALLEL, returns the fastest
# ---------------------------------------------------------------------------
def _query_single_mirror(mirror: str, query: str) -> list:
    """Try a single mirror. Returns elements list or raises."""
    resp = requests.post(
        mirror,
        data={"data": query},
        headers={"User-Agent": "RailFinder/1.0 (FastAPI)"},
        timeout=28,
    )
    resp.raise_for_status()
    return resp.json().get("elements", [])


def fetch_overpass(query: str) -> list:
    cached = _get_cached(query)
    if cached is not None:
        return cached

    last_error = None
    empty_result = None

    with ThreadPoolExecutor(max_workers=len(OVERPASS_MIRRORS)) as pool:
        future_to_mirror = {
            pool.submit(_query_single_mirror, mirror, query): mirror
            for mirror in OVERPASS_MIRRORS
        }
        # Use wait() so we can properly stop early once we have a good result
        pending = set(future_to_mirror.keys())
        while pending:
            done, pending = wait(pending, timeout=30, return_when=FIRST_COMPLETED)
            for future in done:
                mirror = future_to_mirror[future]
                try:
                    elements = future.result()
                    if len(elements) > 0:
                        _set_cache(query, elements)
                        # Cancel remaining pending futures
                        for f in pending:
                            f.cancel()
                        return elements
                    elif empty_result is None:
                        empty_result = elements
                except Exception as e:
                    last_error = f"{mirror}: {e}"

    if empty_result is not None:
        return empty_result

    raise HTTPException(
        status_code=502,
        detail=f"All Overpass mirrors failed. Last: {last_error}"
    )


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "stations": len(load_stations())}


@app.get("/stations/search")
def search_stations(q: str = Query(..., min_length=1)):
    by_code, names_lower = load_station_index()
    ql = q.strip().lower()

    # Exact code match — O(1)
    if ql in by_code:
        return [by_code[ql]]

    results = []
    seen_codes = set()

    # Exact name match — O(log n) via bisect
    idx = bisect.bisect_left(names_lower, (ql,))
    if idx < len(names_lower) and names_lower[idx][0] == ql:
        s = names_lower[idx][2]
        results.append(s)
        seen_codes.add(s["code"])

    # Prefix matches on name — O(log n) find start, then scan prefix window
    prefix_idx = bisect.bisect_left(names_lower, (ql,))
    for name_l, code_l, s in names_lower[prefix_idx:]:
        if not name_l.startswith(ql):
            break
        if s["code"] not in seen_codes:
            results.append(s)
            seen_codes.add(s["code"])
        if len(results) >= 10:
            return results

    # Code prefix matches — fast dict scan (codes are short, ~4 chars)
    if len(results) < 10:
        for code_l, s in by_code.items():
            if code_l.startswith(ql) and s["code"] not in seen_codes:
                results.append(s)
                seen_codes.add(s["code"])
            if len(results) >= 10:
                break

    # Substring fallback — only if we still need more results
    if len(results) < 5:
        for name_l, code_l, s in names_lower:
            if ql in name_l and s["code"] not in seen_codes:
                results.append(s)
                seen_codes.add(s["code"])
            if len(results) >= 10:
                break

    return results[:10]


@app.get("/stations/{code}")
def get_station(code: str):
    by_code, _ = load_station_index()
    s = by_code.get(code.lower())
    if s:
        return s
    raise HTTPException(status_code=404, detail="Station not found")


@app.get("/nearby")
def nearby_places(
    lat: float,
    lon: float,
    radius: int = Query(default=3000, ge=500, le=10000),
    category: Optional[str] = None,
):
    query = _build_overpass_query(lat, lon, radius, category)
    elements = fetch_overpass(query)

    seen = set()
    places = []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "").strip()
        if not name or name in seen:
            continue
        label = get_label(tags)
        if not label:
            continue
        if el["type"] == "node":
            p_lat, p_lon = el.get("lat"), el.get("lon")
        else:
            center = el.get("center", {})
            p_lat, p_lon = center.get("lat"), center.get("lon")
        if p_lat is None or p_lon is None:
            continue
        dist = distance_km(lat, lon, p_lat, p_lon)
        seen.add(name)
        group = "Other"
        for g, types in CATEGORY_GROUPS.items():
            if label in types:
                group = g
                break
        places.append({
            "name": name, "type": label, "group": group,
            "dist": round(dist, 2), "lat": p_lat, "lon": p_lon,
        })

    places.sort(key=lambda x: x["dist"])
    if category and category != "All":
        places = [p for p in places if p["group"] == category]
    grouped = {}
    for p in places:
        grouped.setdefault(p["group"], []).append(p)
    return {"total": len(places), "grouped": grouped, "places": places}
