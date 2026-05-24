import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function NotificationBell() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!profile?.id) return
    loadNotifications()
    // Realtime subscription
    const channel = supabase.channel('inspections-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inspections' }, payload => {
        handleChange(payload)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [profile])

  async function loadNotifications() {
    try {
      const { data } = await supabase.from('notifications')
        .select('*').eq('user_id', profile?.id)
        .order('created_at', { ascending: false }).limit(20)
      setNotifications(data || [])
    } catch { setNotifications([]) }
  }

  function handleChange(payload) {
    const ins = payload.new
    if (!ins) return
    let msg = ''
    if (payload.eventType === 'INSERT') msg = `New inspection: ${ins.make} ${ins.model} ${ins.year}`
    else if (payload.eventType === 'UPDATE') msg = `${ins.make} ${ins.model} → ${ins.status}`
    if (msg) {
      setNotifications(p => [{ id: Date.now(), message: msg, read: false, created_at: new Date().toISOString() }, ...p].slice(0, 20))
    }
  }

  async function markRead(id) {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n))
    try { await supabase.from('notifications').update({ read: true }).eq('id', id) } catch {}
  }

  async function markAllRead() {
    setNotifications(p => p.map(n => ({ ...n, read: true })))
    try { await supabase.from('notifications').update({ read: true }).eq('user_id', profile?.id) } catch {}
  }

  const fmtDate = d => {
    if (!d) return ''
    const dt = new Date(d)
    return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' · ' + dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{
        background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px',
        cursor: 'pointer', color: 'var(--text)', fontSize: 18, position: 'relative', display: 'flex', alignItems: 'center',
      }}>
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340, background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,.5)', zIndex: 200, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>🔔 Notifications {unread > 0 && <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>({unread} new)</span>}</div>
              {unread > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Mark all read</button>}
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--sub)', fontSize: 13 }}>No notifications yet</div>
              ) : notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'var(--blueDim)',
                  cursor: 'pointer', transition: 'background .15s',
                }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, marginBottom: 3 }}>{n.message}</div>
                  <div style={{ fontSize: 10, color: 'var(--sub)' }}>{fmtDate(n.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
