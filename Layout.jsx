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
      { path: '/',          icon: '📊', label: 'Dashboard' },
      { path: '/new',       icon: '➕', label: 'New Inspection' },
      { path: '/history',   icon: '📋', label: 'My History' },
      { path: '/customers', icon: '👥', label: 'Customers' },
    ],
    negotiator: [
      { path: '/',          icon: '📊', label: 'Dashboard' },
      { path: '/negotiate', icon: '💼', label: 'Negotiations' },
      { path: '/history',   icon: '📋', label: 'All Inspections' },
      { path: '/reports',   icon: '📈', label: 'Reports' },
    ],
    admin: [
      { path: '/',          icon: '📊', label: 'Dashboard' },
      { path: '/new',       icon: '➕', label: 'New Inspection' },
      { path: '/negotiate', icon: '💼', label: 'Negotiations' },
      { path: '/history',   icon: '📋', label: 'All Inspections' },
      { path: '/customers', icon: '👥', label: 'Customers' },
      { path: '/reports',   icon: '📈', label: 'Reports' },
      { path: '/admin',     icon: '⚙️', label: 'Admin Panel' },
    ],
  }

  const NAV = NAV_BY_ROLE[role] || NAV_BY_ROLE.inspector
  const isActive = p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)

  const ROLE_CFG = {
    admin:      { color: '#1e3a8a', bg: '#dbeafe', label: 'Admin' },
    inspector:  { color: '#dc2626', bg: '#fee2e2', label: 'Inspector' },
    negotiator: { color: '#7c3aed', bg: '#ede9fe', label: 'Negotiator' },
  }
  const rc = ROLE_CFG[role] || ROLE_CFG.inspector

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f5ff' }}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,58,138,0.25)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 70 : 240,
        background: '#ffffff',
        borderRight: '1px solid #dbeafe',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        boxShadow: '2px 0 16px rgba(37,99,235,0.08)',
        overflow: 'hidden',
      }}>

        {/* Logo Section - White background, real logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            background: '#ffffff',
            borderBottom: '2px solid #dbeafe',
            padding: collapsed ? '12px 8px' : '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            cursor: 'pointer',
            minHeight: 80,
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            /* Collapsed: small icon */
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#fff',
              border: '2px solid #dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <img
                src="/logo.png"
                alt="DA"
                style={{ width: 40, height: 40, objectFit: 'contain' }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontWeight: 900, fontSize: 13, color: '#dc2626' }}>DA</div>
            </div>
          ) : (
            /* Expanded: full logo */
            <div style={{
              width: '100%',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 0',
            }}>
              <img
                src="/logo.png"
                alt="Divya Automobiles"
                style={{
                  width: '100%',
                  maxWidth: 190,
                  height: 58,
                  objectFit: 'contain',
                  display: 'block',
                }}
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              {/* Fallback if logo not found */}
              <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#dc2626', letterSpacing: 1 }}>DIVYA</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#1e3a8a', letterSpacing: 1 }}>AUTOMOBILES</div>
              </div>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ padding: '9px 14px', borderBottom: '1px solid #dbeafe', flexShrink: 0 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              background: rc.bg, border: `1px solid ${rc.color}33`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: rc.color }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: rc.color }}>{rc.label}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {NAV.map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false) }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 9, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              background: isActive(item.path) ? '#eff6ff' : 'transparent',
              color: isActive(item.path) ? '#1d4ed8' : '#64748b',
              fontWeight: isActive(item.path) ? 700 : 500, fontSize: 13,
              transition: 'all .15s',
              borderLeft: `3px solid ${isActive(item.path) ? '#1d4ed8' : 'transparent'}`,
            }}>
              <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1 }}>{item.icon}</span>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse button */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          margin: '0 8px 6px', padding: '8px 12px', borderRadius: 9,
          border: '1px solid #dbeafe', background: '#f8fafc',
          color: '#64748b', cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .15s', flexShrink: 0,
        }}>
          {collapsed ? '→' : '← Collapse'}
        </button>

        {/* User */}
        <div style={{ padding: '10px 12px 16px', borderTop: '1px solid #dbeafe', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc2626, #1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0,
            }}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.name || 'User'}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    {profile?.branch || profile?.email?.split('@')[0] || ''}
                  </div>
                </div>
                <button onClick={signOut} style={{
                  background: 'none', border: 'none', color: '#dc2626',
                  cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0,
                }}>⏻</button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 70 : 240,
        transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #dbeafe',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          position: 'sticky', top: 0, zIndex: 80,
          boxShadow: '0 2px 8px rgba(37,99,235,0.06)',
        }}>
          <NotificationBell />
          <button onClick={signOut} style={{
            padding: '7px 14px', borderRadius: 9,
            border: '1px solid #dbeafe', background: '#eff6ff',
            color: '#1d4ed8', fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ⏻ Sign Out
          </button>
        </div>

        <div style={{ flex: 1 }}>{children}</div>
      </main>

      <style>{`
        @media(max-width:768px){
          aside{transform:translateX(${mobileOpen?'0':'-100%'});width:240px!important;}
          main{margin-left:0!important;}
        }
      `}</style>
    </div>
  )
}
