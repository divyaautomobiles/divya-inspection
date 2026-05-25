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

function Loading() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0c16',flexDirection:'column',gap:14}}>
      <div className="spinner" style={{width:36,height:36,borderWidth:3}}/>
      <div style={{color:'#7880a0',fontSize:14}}>Loading…</div>
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
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
