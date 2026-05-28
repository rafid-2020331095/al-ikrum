import { Routes, Route, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}
