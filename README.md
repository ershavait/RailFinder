# RailFinder 🚂

**Indian Railways Wayfinder** — Find restaurants, hotels, hospitals, and more near any Indian railway station.

---

## Project Structure

```
railfinder/
├── backend/          ← FastAPI — deploy to Railway
└── frontend/         ← React + Vite — deploy to Vercel
```

---

## Local Development

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at `http://localhost:8000`
Swagger docs at `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local → set VITE_API_URL=http://localhost:8000
npm run dev
```

App will be live at `http://localhost:5173`

---

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Railway auto-detects Python via `nixpacks.toml`
5. Copy the Railway public URL (e.g. `https://railfinder-api.up.railway.app`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` = your Railway URL from above
4. Deploy — Vercel handles the rest

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/stations/search?q=NDLS` | Search stations by name or code |
| GET | `/stations/{code}` | Get station by exact code |
| GET | `/nearby?lat=&lon=&radius=3000&category=` | Get nearby places |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Data | `stations.json` (GeoJSON), Overpass API (OSM) |
| Hosting | Vercel (frontend), Railway (backend) |

---

## Design System

Follows **"The Modern Wayfinder"** design system:
- Font: **Plus Jakarta Sans**
- Primary: `#002653` (deep navy)
- Accent: `#feae2c` (warm orange)
- All surfaces use tonal layering — no hard borders
