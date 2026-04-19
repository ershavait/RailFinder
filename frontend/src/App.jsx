import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TopBar from './components/TopBar'
import SearchPage from './pages/SearchPage'
import StationPage from './pages/StationPage'
import CategoryPage from './pages/CategoryPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface font-body">
        <TopBar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/station" element={<StationPage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
