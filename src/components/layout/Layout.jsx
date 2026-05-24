import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { NotificationBell } from '../notifications/Notifications'

export function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = profile?.role || 'inspector'

  const NAV_BY_ROLE = {
    inspector: [
      { path: '/', icon: '📊', label: 'Dashboard' },
      { path: '/new', icon: '➕', label: 'New Inspection' },
      { path: '/history', icon: '📋', label: 'My History' },
      { path: '/customers', icon: '👥', label: 'Customers' },
    ],
    negotiator: [
      { path: '/', icon: '📊', label: 'Dashboard' },
      { path: '/negotiate', icon: '💼', label: 'Negotiations' },
      { path: '/history', icon: '📋', label: 'All Inspections' },
      { path: '/reports', icon: '📈', label: 'Reports' },
    ],
    admin: [
      { path: '/', icon: '📊', label: 'Dashboard' },
      { path: '/new', icon: '➕', label: 'New Inspection' },
      { path: '/negotiate', icon: '💼', label: 'Negotiations' },
      { path: '/history', icon: '📋', label: 'All Inspections' },
      { path: '/customers', icon: '👥', label: 'Customers' },
      { path: '/reports', icon: '📈', label: 'Reports' },
      { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
    ],
  }

  const NAV = NAV_BY_ROLE[role] || NAV_BY_ROLE.inspector
  const isActive = p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)

  const roleColors = { admin: '#f59e0b', negotiator: '#8b5cf6', inspector: '#3b82f6' }
  const roleColor = roleColors[role] || '#3b82f6'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {mobileOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99 }} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 68 : 240,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#ea580c,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 16px #f59e0b30' }}>🚗</div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 900, fontSize: 12, color: 'var(--gold)', letterSpacing: '1px', lineHeight: 1, whiteSpace: 'nowrap' }}>DIVYA</div>
                <div style={{ fontWeight: 900, fontSize: 12, color: 'var(--text)', letterSpacing: '1px', lineHeight: 1.3, whiteSpace: 'nowrap' }}>AUTOMOBILES</div>
              </div>
            )}
          </div>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: roleColor + '18', border: `1px solid ${roleColor}33` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: roleColor, textTransform: 'capitalize' }}>{role}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              background: isActive(item.path) ? 'var(--goldDim)' : 'transparent',
              color: isActive(item.path) ? 'var(--gold)' : 'var(--sub)',
              fontWeight: isActive(item.path) ? 700 : 500, fontSize: 13, transition: 'all .15s',
              borderLeft: isActive(item.path) ? '3px solid var(--gold)' : '3px solid transparent',
            }}>
              <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse */}
        <button onClick={() => setCollapsed(!collapsed)} style={{ margin: '0 8px 6px', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--sub)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, transition: 'all .15s' }}>
          {collapsed ? '→' : '← Collapse'}
        </button>

        {/* User */}
        <div style={{ padding: '10px 12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${roleColor},${roleColor}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && <>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.name}</div>
                <div style={{ fontSize: 10, color: 'var(--sub)' }}>{profile?.branch || profile?.email?.split('@')[0]}</div>
              </div>
              <button onClick={signOut} title="Sign Out" style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0 }}>⏻</button>
            </>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: collapsed ? 68 : 240, transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, position: 'sticky', top: 0, zIndex: 80 }}>
          <NotificationBell />
          <button onClick={signOut} style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--sub)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            ⏻ Sign Out
          </button>
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </main>

      <style>{`
        @media(max-width:768px){
          aside{transform:translateX(${mobileOpen?'0':'-100%'});position:fixed;z-index:100;}
          main{margin-left:0!important;}
        }
      `}</style>
    </div>
  )
}
