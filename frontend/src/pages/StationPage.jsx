import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StationCard from '../components/StationCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { searchStations } from '../utils/api'

export default function StationPage() {
  const navigate = useNavigate()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('rf_station')
    if (!raw) { navigate('/'); return }
    const parsed = JSON.parse(raw)

    // If we only have the code (quick pick), fetch full details
    if (!parsed.lat || parsed.lat === 0) {
      searchStations(parsed.code)
        .then(res => {
          if (res.data && res.data.length > 0) {
            const full = res.data[0]
            sessionStorage.setItem('rf_station', JSON.stringify(full))
            setStation(full)
          } else {
            navigate('/')
          }
        })
        .catch(() => navigate('/'))
        .finally(() => setLoading(false))
    } else {
      setStation(parsed)
      setLoading(false)
    }
  }, [navigate])

  const handleConfirm = () => navigate('/category')
  const handleBack = () => { sessionStorage.removeItem('rf_station'); navigate('/') }

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-primary mb-1">Confirm Station</h2>
        <p className="text-on-surface-variant">Is this the right station?</p>
      </div>

      {loading
        ? <LoadingSpinner message="Looking up station details…" />
        : station && <StationCard station={station} onConfirm={handleConfirm} onBack={handleBack} />
      }
    </main>
  )
}
