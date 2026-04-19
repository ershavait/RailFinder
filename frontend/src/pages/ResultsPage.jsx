import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PlaceCard from '../components/PlaceCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getNearby } from '../utils/api'

const GROUP_ORDER = [
  'Food & Drinks', 'Hotels & Stay', 'Sightseeing',
  'Parks & Leisure', 'Healthcare', 'Worship', 'Shopping',
]

const MAX_RETRIES = 3

export default function ResultsPage() {
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [category, setCategory] = useState('All')
  const [radius, setRadius] = useState(3000)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeGroup, setActiveGroup] = useState('All')
  const [retryCount, setRetryCount] = useState(0)
  const [autoRetrying, setAutoRetrying] = useState(false)

  // Use a ref to avoid stale closure in fetchData
  const autoRetryingRef = useRef(false)

  const fetchData = useCallback((s, cat, r, attempt = 0) => {
    setLoading(true)
    setError(null)
    autoRetryingRef.current = attempt > 0
    setAutoRetrying(attempt > 0)

    getNearby(s.lat, s.lon, r, cat === 'All' ? null : cat)
      .then(res => {
        setData(res.data)
        setRetryCount(0)
        setAutoRetrying(false)
        autoRetryingRef.current = false
        setLoading(false)
      })
      .catch(err => {
        const detail = err.response?.data?.detail || 'Failed to fetch nearby places.'
        const isTimeout = detail.toLowerCase().includes('timeout') ||
                          detail.toLowerCase().includes('overpass') ||
                          err.code === 'ECONNABORTED'

        if (isTimeout && attempt < MAX_RETRIES) {
          setRetryCount(attempt + 1)
          setTimeout(() => fetchData(s, cat, r, attempt + 1), 2000 * (attempt + 1))
        } else {
          setError(detail)
          setAutoRetrying(false)
          autoRetryingRef.current = false
          setLoading(false)
        }
      })
  }, []) // no deps — uses refs to avoid stale closures

  useEffect(() => {
    const rawStation = sessionStorage.getItem('rf_station')
    const rawCat = sessionStorage.getItem('rf_category')
    const rawRadius = sessionStorage.getItem('rf_radius')
    if (!rawStation) { navigate('/'); return }

    const s = JSON.parse(rawStation)
    const cat = rawCat || 'All'
    const r = rawRadius ? Number(rawRadius) : 3000
    setStation(s); setCategory(cat); setRadius(r)

    fetchData(s, cat, r, 0)
  }, [navigate, fetchData])

  const handleRetry = () => {
    if (!station) return
    setRetryCount(0)
    fetchData(station, category, radius, 0)
  }

  const allGroups = data ? Object.keys(data.grouped) : []
  const visibleGroups = activeGroup === 'All' ? GROUP_ORDER.filter(g => allGroups.includes(g)) : [activeGroup]
  const maxDist = data ? Math.max(...data.places.map(p => p.dist), radius / 1000) : radius / 1000

  return (
    <main className="max-w-5xl mx-auto px-6 py-8 pb-24">
      {/* Context header */}
      {station && (
        <div
          className="mb-8 p-6 rounded-lg text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #002653 0%, #1a3c6e 100%)' }}
        >
          <div className="relative z-10">
            <h1 className="text-2xl font-black mb-1">{station.name} ({station.code})</h1>
            <div className="flex items-center gap-3 text-primary-fixed-dim text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">category</span>
                {category}
              </span>
              <span className="w-1 h-1 rounded-full bg-primary-fixed-dim" />
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">distance</span>
                {(radius / 1000).toFixed(1)} km radius
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/category')}
            className="relative z-10 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            Change
          </button>
          <div className="absolute right-0 top-0 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        </div>
      )}

      {/* Loading state */}
      {loading && !autoRetrying && (
        <LoadingSpinner message="Fetching nearby places via OpenStreetMap…" />
      )}

      {/* Auto-retrying state */}
      {autoRetrying && (
        <div className="bg-secondary-fixed/30 text-on-secondary-fixed-variant rounded-lg p-5 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-on-secondary-fixed-variant/30 border-t-on-secondary-fixed-variant animate-spin flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">OpenStreetMap is busy — retrying automatically…</p>
            <p className="text-sm opacity-80">
              Attempt {retryCount + 1} of {MAX_RETRIES + 1}. This usually works in a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !autoRetrying && (
        <div className="bg-error-container text-on-error-container rounded-lg p-5 flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <div>
            <p className="font-bold mb-1">Couldn't reach OpenStreetMap</p>
            <p className="text-sm mb-1">{error}</p>
            <p className="text-xs opacity-70 mb-3">
              The free OpenStreetMap Overpass servers can be busy. Retrying usually fixes this.
            </p>
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-full bg-on-error-container text-error-container text-sm font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !autoRetrying && data && (
        <>
          {/* Stats row */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-on-surface-variant text-sm">
              Found <strong className="text-on-surface">{data.total}</strong> places
            </p>
            <button onClick={() => navigate('/')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-base">refresh</span>
              New search
            </button>
          </div>

          {/* Group filter pills */}
          {allGroups.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
              {['All', ...allGroups].map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeGroup === g
                      ? 'bg-secondary-container text-on-secondary-container'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {data.total === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-40">search_off</span>
              <p className="mt-4 text-on-surface-variant font-medium">
                No places found within {(radius / 1000).toFixed(1)} km.
              </p>
              <button
                onClick={() => navigate('/category')}
                className="mt-4 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:opacity-90 transition-all"
              >
                Try larger radius
              </button>
            </div>
          )}

          {/* Results grouped */}
          {visibleGroups.map(group => {
            const items = data.grouped[group]
            if (!items || items.length === 0) return null
            return (
              <div key={group} className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-black text-on-surface">{group}</h2>
                  <span className="px-2 py-0.5 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant">
                    {items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.slice(0, 8).map((place, i) => (
                    <PlaceCard key={place.name + i} place={place} maxDist={maxDist} />
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}
    </main>
  )
}