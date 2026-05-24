import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './hooks/useToast'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './components/pages/LoginPage'
import { DashboardPage } from './components/pages/DashboardPage'
import { InspectionForm } from './components/inspection/InspectionForm'
import { InspectionDetailPage } from './components/pages/InspectionDetailPage'
import { HistoryPage, CustomersPage, ReportsPage } from './components/pages/OtherPages'
import { AdminPanel } from './components/pages/admin/AdminPanel'
import { NegotiatorDash } from './components/pages/negotiator/NegotiatorDash'
import { LoadingOverlay } from './components/ui'
import './index.css'

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <LoadingOverlay message="Loading…" />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile?.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingOverlay message="Loading…" />
  if (user) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute roles={['inspector','admin']}><InspectionForm /></ProtectedRoute>} />
            <Route path="/inspection/:id" element={<ProtectedRoute><InspectionDetailPage /></ProtectedRoute>} />
            <Route path="/inspection/:id/edit" element={<ProtectedRoute roles={['inspector','admin']}><InspectionForm /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/negotiate" element={<ProtectedRoute roles={['negotiator','admin']}><NegotiatorDash /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
