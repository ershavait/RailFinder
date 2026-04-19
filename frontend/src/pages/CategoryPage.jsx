import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoryGrid from '../components/CategoryGrid'

export default function CategoryPage() {
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [selected, setSelected] = useState('All')
  const [radius, setRadius] = useState(3000)

  useEffect(() => {
    const raw = sessionStorage.getItem('rf_station')
    if (!raw) { navigate('/'); return }
    setStation(JSON.parse(raw))
  }, [navigate])

  const handleFind = () => {
    sessionStorage.setItem('rf_category', selected)
    sessionStorage.setItem('rf_radius', radius)
    navigate('/results')
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-primary mb-1">Choose Category</h2>
        {station && (
          <p className="text-on-surface-variant">
            Searching near <strong className="text-primary">{station.name}</strong>
          </p>
        )}
      </div>

      {/* Category grid */}
      <div className="mb-8">
        <CategoryGrid selected={selected} onSelect={setSelected} />
      </div>

      {/* Radius selector */}
      <div className="bg-surface-container-low rounded-lg p-5 mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold text-on-surface">Search Radius</p>
          <span className="text-secondary-container bg-on-secondary-container px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: '#feae2c', color: '#6b4500' }}>
            {(radius / 1000).toFixed(1)} km
          </span>
        </div>
        <input
          type="range"
          min={500} max={10000} step={500}
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
          className="w-full accent-[#feae2c]"
        />
        <div className="flex justify-between text-xs text-on-surface-variant mt-1">
          <span>0.5 km</span><span>10 km</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleFind}
        className="w-full py-4 rounded-full font-black text-white text-base flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #002653, #1a3c6e)' }}
      >
        <span className="material-symbols-outlined">travel_explore</span>
        Find Nearby Places
      </button>
    </main>
  )
}
