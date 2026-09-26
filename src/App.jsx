import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import Painel from './pages/Painel'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="app-loading" role="status">Carregando...</div>
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/painel" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}