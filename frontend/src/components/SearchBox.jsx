import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { searchStations } from '../utils/api'

export default function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 350)
  const ref = useRef(null)

  useEffect(() => {
    if (debouncedQuery.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    searchStations(debouncedQuery)
      .then(res => { setResults(res.data); setOpen(true) })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (station) => {
    setQuery(station.name)
    setOpen(false)
    onSelect(station)
  }

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl px-5 py-4 shadow-[0_20px_40px_rgba(26,27,31,0.06)] border border-outline-variant/20">
        <span className="material-symbols-outlined text-primary mr-3">search</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Station name or code (e.g. NDLS, Mumbai)"
          className="flex-1 bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant text-base font-medium"
        />
        {loading && (
          <div className="w-5 h-5 rounded-full border-2 border-surface-container-high border-t-secondary-container animate-spin" />
        )}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">
            close
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-[0_20px_40px_rgba(26,27,31,0.12)] overflow-hidden z-50">
          {results.map((s, i) => (
            <button
              key={s.code + i}
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container-low transition-colors text-left"
            >
              <span className="material-symbols-outlined text-primary opacity-60">train</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-on-surface truncate">{s.name}</p>
                <p className="text-xs text-on-surface-variant">{s.code} · {s.state}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      )}

      {open && results.length === 0 && !loading && debouncedQuery.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-lg p-5 text-center text-on-surface-variant z-50">
          No stations found for <strong>"{debouncedQuery}"</strong>
        </div>
      )}
    </div>
  )
}
