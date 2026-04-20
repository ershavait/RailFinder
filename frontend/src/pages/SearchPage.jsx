import { useNavigate } from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import { searchStations } from '../utils/api'

export default function SearchPage() {
  const navigate = useNavigate()

  const handleSelect = (station) => {
    sessionStorage.setItem('rf_station', JSON.stringify(station))
    navigate('/station')
  }

  // Look up real coordinates before navigating — avoids lat:0 lon:0 bug
  const handleQuickSelect = async (code) => {
    try {
      const res = await searchStations(code)
      const station = res.data?.[0]
      if (station) handleSelect(station)
    } catch {
      // silently ignore — chip just won't navigate
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero */}
      <div
        className="rounded-lg p-10 mb-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002653 0%, #1a3c6e 100%)' }}
      >
        <div className="relative z-10">
          <p className="text-primary-fixed-dim text-sm font-bold uppercase tracking-widest mb-3">
            Indian Railways
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Where to,<br />Traveler?
          </h1>
          <p className="text-primary-fixed-dim max-w-md">
            Find restaurants, hotels, hospitals, and more near any Indian railway station.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-secondary-container/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute right-10 bottom-0 w-32 h-32 bg-primary-fixed/10 rounded-full blur-2xl -mb-10 pointer-events-none" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <p className="text-center text-on-surface-variant text-sm font-medium mb-4">
          Search by station name or code
        </p>
        <SearchBox onSelect={handleSelect} />
      </div>

      {/* Quick suggestions */}
      <div className="mt-8">
        <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-3">
          Popular Stations
        </p>
        <div className="flex flex-wrap gap-2">
          {['NDLS', 'CSTM', 'HWH', 'MAS', 'SBC', 'ADI', 'BPL', 'PUNE'].map(code => (
            <button
              key={code}
              onClick={() => handleQuickSelect(code)}
              className="px-4 py-2 rounded-full bg-surface-container-low hover:bg-primary-fixed text-on-surface-variant hover:text-on-primary-fixed text-sm font-semibold transition-all"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-12 grid grid-cols-3 gap-4">
        {[
          { icon: 'train', label: '8,000+', sub: 'Stations' },
          { icon: 'location_on', label: '0.5 km - 10 km', sub: 'Search radius' },
          { icon: 'category', label: '7', sub: 'Categories' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-1 p-4 bg-surface-container-low rounded-lg">
            <span className="material-symbols-outlined text-primary">{s.icon}</span>
            <span className="text-lg font-black text-on-surface">{s.label}</span>
            <span className="text-xs text-on-surface-variant">{s.sub}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
