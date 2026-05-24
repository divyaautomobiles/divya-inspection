import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { LoadingOverlay } from '../../ui'
import { fmtDate, fmtL, STATUS_CONFIG } from '../../../lib/constants'

const ROLES = ['admin', 'inspector', 'negotiator']
const ROLE_COLOR = {
  admin:      { color: '#f59e0b', bg: '#f59e0b14', label: 'Admin' },
  inspector:  { color: '#3b82f6', bg: '#3b82f614', label: 'Inspector' },
  negotiator: { color: '#8b5cf6', bg: '#8b5cf614', label: 'Negotiator' },
}

const S = {
  page:      { padding: '22px 22px 60px' },
  hdr:       { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  title:     { fontSize: 22, fontWeight: 900, color: '#f1f3ff', marginBottom: 3 },
  sub:       { fontSize: 13, color: '#7880a0' },
  tabBar:    { display: 'flex', gap: 0, borderBottom: '1px solid #232640', marginBottom: 20 },
  tab:       (on) => ({ padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: on ? 700 : 500, color: on ? '#f59e0b' : '#7880a0', borderBottom: `2.5px solid ${on ? '#f59e0b' : 'transparent'}`, transition: 'all .15s', fontFamily: 'inherit' }),
  card:      { background: '#12152a', border: '1px solid #232640', borderRadius: 14, padding: '15px 18px', marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: 800, color: '#7880a0', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 },
  statGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 18 },
  stat:      (c) => ({ background: '#12152a', border: '1px solid #232640', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden', borderTop: `2px solid ${c}` }),
  statVal:   (c) => ({ fontSize: 26, fontWeight: 900, color: c, lineHeight: 1, marginBottom: 4 }),
  statLbl:   { fontSize: 11, color: '#7880a0' },
  statIco:   { fontSize: 20, marginBottom: 8 },
  btnGold:   { background: 'linear-gradient(135deg,#ea580c,#f59e0b)', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit' },
  btnGhost:  { background: '#181b30', border: '1px solid #2a2e4a', color: '#c4c8e0', borderRadius: 9, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  btnRed:    { background: '#ef444414', border: '1px solid #ef444430', color: '#ef4444', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  userRow:   { background: '#12152a', border: '1px solid #232640', borderRadius: 12, padding: '13px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  avatar:    (c) => ({ width: 42, height: 42, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 17, color: '#fff', flexShrink: 0 }),
  rolePill:  (role) => ({ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: ROLE_COLOR[role]?.color || '#7880a0', background: ROLE_COLOR[role]?.bg || '#1e2138', border: `1px solid ${ROLE_COLOR[role]?.color || '#7880a0'}33` }),
  overlay:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 16 },
  modal:     { background: '#12152a', border: '1px solid #2a2e4a', borderRadius: 18, padding: '26px 24px', width: '100%', maxWidth: 460, boxShadow: '0 8px 40px rgba(0,0,0,.6)' },
  label:     { fontSize: 11, color: '#7880a0', fontWeight: 700, marginBottom: 5, display: 'block' },
  input:     { width: '100%', padding: '10px 12px', border: '1px solid #2a2e4a', borderRadius: 9, background: '#181b30', color: '#f1f3ff', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 12 },
  select:    { width: '100%', padding: '10px 12px', border: '1px solid #2a2e4a', borderRadius: 9, background: '#181b30', color: '#f1f3ff', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 12, cursor: 'pointer' },
  perfBox:   (c) => ({ textAlign: 'center', background: '#181b30', borderRadius: 9, padding: '8px 14px', border: `1px solid ${c}22` }),
  perfVal:   (c) => ({ fontSize: 18, fontWeight: 900, color: c }),
  perfLbl:   { fontSize: 9, color: '#7880a0', marginTop: 2 },
  insCard:   (c) => ({ background: '#12152a', border: '1px solid #232640', borderLeft: `3px solid ${c}`, borderRadius: 12, padding: '11px 15px', marginBottom: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }),
  badge:     (status) => {
    const cfg = STATUS_CONFIG[status] || { color: '#7880a0', bg: '#1e2138' }
    return { padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}44`, whiteSpace: 'nowrap' }
  },
  branchCard:{ background: '#12152a', border: '1px solid #232640', borderRadius: 14, padding: '18px 20px' },
}

export function AdminPanel() {
  const { profile } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [inspections, setInspections] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Add User Modal
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', password: '', role: 'inspector', branch: '' })
  const [userErr, setUserErr] = useState('')

  // Add Branch Modal
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [newBranch, setNewBranch] = useState({ name: '', city: '', manager: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [{ data: ins }, { data: prof }, { data: br }] = await Promise.all([
        supabase.from('inspections').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('branches').select('*').order('name'),
      ])
      setInspections(ins || [])
      setUsers(prof || [])
      setBranches(br || [])
    } catch (e) { toast('Load failed: ' + e.message, 'error') }
    setLoading(false)
  }

  // ── CREATE USER ─────────────────────────────────────────
  async function createUser() {
    setUserErr('')
    if (!newUser.name.trim()) { setUserErr('Name is required'); return }
    if (!newUser.email.trim()) { setUserErr('Email is required'); return }
    if (!newUser.password || newUser.password.length < 6) { setUserErr('Password must be at least 6 characters'); return }
    if (!newUser.role) { setUserErr('Role is required'); return }

    setSaving(true)
    try {
      // Step 1: Create auth user via Supabase signup (works with anon key)
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password,
        options: {
          data: {
            name: newUser.name.trim(),
            role: newUser.role,
            phone: newUser.phone.trim(),
          }
        }
      })

      if (authErr) throw authErr
      if (!authData?.user) throw new Error('User creation failed')

      // Step 2: Upsert profile with all details
      const { error: profErr } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        phone: newUser.phone.trim(),
        role: newUser.role,
        branch: newUser.branch,
        created_by: profile?.id,
        created_at: new Date().toISOString(),
        is_active: true,
      })

      if (profErr) throw profErr

      toast(`✅ User "${newUser.name}" created as ${newUser.role}!`, 'success')
      setShowAddUser(false)
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'inspector', branch: '' })
      loadAll()
    } catch (e) {
      setUserErr(e.message || 'Failed to create user')
    }
    setSaving(false)
  }

  // ── UPDATE ROLE ─────────────────────────────────────────
  async function updateRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u))
    toast('Role updated → ' + role, 'success')
  }

  // ── TOGGLE ACTIVE ────────────────────────────────────────
  async function toggleActive(userId, current) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    setUsers(p => p.map(u => u.id === userId ? { ...u, is_active: !current } : u))
    toast(!current ? 'User activated' : 'User deactivated', 'info')
  }

  // ── UPDATE INSPECTION STATUS ─────────────────────────────
  async function updateInspStatus(id, status) {
    await supabase.from('inspections').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setInspections(p => p.map(i => i.id === id ? { ...i, status } : i))
    toast('Status → ' + status, 'success')
  }

  // ── CREATE BRANCH ────────────────────────────────────────
  async function createBranch() {
    if (!newBranch.name) { toast('Branch name required', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('branches').insert({ ...newBranch, created_at: new Date().toISOString() })
    if (error) { toast('Failed: ' + error.message, 'error') }
    else { toast('Branch created ✓', 'success'); setShowAddBranch(false); setNewBranch({ name: '', city: '', manager: '' }); loadAll() }
    setSaving(false)
  }

  // ── STATS ────────────────────────────────────────────────
  const stats = {
    total:       inspections.length,
    today:       inspections.filter(i => i.created_at?.slice(0,10) === new Date().toISOString().slice(0,10)).length,
    pending:     inspections.filter(i => ['Submitted','Under Negotiation'].includes(i.status)).length,
    approved:    inspections.filter(i => ['Approved','Purchased'].includes(i.status)).length,
    portfolio:   inspections.reduce((a, i) => a + (i.market_value || 0), 0),
    revenue:     inspections.filter(i => i.status === 'Purchased').reduce((a, i) => a + (i.dealer_value || 0), 0),
    admins:      users.filter(u => u.role === 'admin').length,
    inspectors:  users.filter(u => u.role === 'inspector').length,
    negotiators: users.filter(u => u.role === 'negotiator').length,
  }

  const avatarGradient = (role) => ({
    admin:      'linear-gradient(135deg,#ea580c,#f59e0b)',
    inspector:  'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    negotiator: 'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  }[role] || 'linear-gradient(135deg,#374151,#6b7280)')

  if (loading) return <LoadingOverlay message="Loading admin data…" />

  return (
    <div style={S.page}>
      {saving && <LoadingOverlay message="Saving…" />}

      {/* Header */}
      <div style={S.hdr}>
        <div>
          <div style={S.title}>⚙️ Admin Panel</div>
          <div style={S.sub}>Full system control & management</div>
        </div>
        <button style={S.btnGhost} onClick={loadAll}>↻ Refresh</button>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {['overview','inspections','users','branches'].map(t => (
          <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="animate-fade">
          <div style={S.statGrid}>
            {[
              { l: 'Total Inspections', v: stats.total,                  c: '#3b82f6', i: '🚗' },
              { l: "Today's",           v: stats.today,                  c: '#8b5cf6', i: '📅' },
              { l: 'Pending',           v: stats.pending,                c: '#f97316', i: '⏳' },
              { l: 'Approved',          v: stats.approved,               c: '#10b981', i: '✅' },
              { l: 'Portfolio',         v: fmtL(stats.portfolio),        c: '#f59e0b', i: '💰' },
              { l: 'Revenue',           v: fmtL(stats.revenue),          c: '#10b981', i: '💵' },
              { l: 'Inspectors',        v: stats.inspectors,             c: '#3b82f6', i: '👷' },
              { l: 'Negotiators',       v: stats.negotiators,            c: '#8b5cf6', i: '🤝' },
            ].map(s => (
              <div key={s.l} style={S.stat(s.c)}>
                <div style={S.statIco}>{s.i}</div>
                <div style={S.statVal(s.c)}>{s.v}</div>
                <div style={S.statLbl}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Status Breakdown */}
          <div style={S.card}>
            <div style={S.cardTitle}>📊 Status Breakdown</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <div key={s} style={{ padding: '10px 16px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: cfg.color }}>{inspections.filter(i => i.status === s).length}</div>
                  <div style={{ fontSize: 10, color: '#7880a0', marginTop: 2 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspector Performance */}
          <div style={S.card}>
            <div style={S.cardTitle}>👷 Inspector Performance</div>
            {users.filter(u => u.role === 'inspector').length === 0
              ? <div style={{ fontSize: 13, color: '#7880a0' }}>No inspectors found</div>
              : users.filter(u => u.role === 'inspector').map(u => {
                  const mine = inspections.filter(i => i.inspector_id === u.id)
                  const approved = mine.filter(i => ['Approved','Purchased'].includes(i.status)).length
                  const scores = mine.filter(i => i.overall_score)
                  const avg = scores.length ? (scores.reduce((a,i) => a + i.overall_score, 0) / scores.length).toFixed(1) : '—'
                  return (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #232640' }}>
                      <div style={S.avatar(avatarGradient(u.role))}>{(u.name||'U').charAt(0).toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: '#7880a0' }}>{u.branch || 'No branch'} · {u.phone || u.email}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={S.perfBox('#3b82f6')}><div style={S.perfVal('#3b82f6')}>{mine.length}</div><div style={S.perfLbl}>Total</div></div>
                        <div style={S.perfBox('#10b981')}><div style={S.perfVal('#10b981')}>{approved}</div><div style={S.perfLbl}>Approved</div></div>
                        <div style={S.perfBox('#f59e0b')}><div style={S.perfVal('#f59e0b')}>{avg}</div><div style={S.perfLbl}>Avg Score</div></div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}

      {/* ── ALL INSPECTIONS ── */}
      {tab === 'inspections' && (
        <div className="animate-fade">
          <div style={{ fontSize: 13, color: '#7880a0', marginBottom: 14 }}>{inspections.length} total inspections</div>
          {inspections.map(ins => (
            <div key={ins.id} style={S.insCard(STATUS_CONFIG[ins.status]?.color || '#7880a0')}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f3ff' }}>{ins.make} {ins.model} {ins.year}</div>
                <div style={{ fontSize: 12, color: '#7880a0', marginTop: 3 }}>{ins.registration_number} · {ins.customer_name} · {fmtDate(ins.created_at)}</div>
                <div style={{ fontSize: 11, color: '#7880a0' }}>Inspector: {ins.inspector_name || '—'} · Branch: {ins.branch || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {ins.overall_score != null && (
                  <span style={{ fontWeight: 800, fontSize: 16, color: ins.overall_score>=7?'#10b981':ins.overall_score>=5?'#f97316':'#ef4444' }}>{ins.overall_score}/10</span>
                )}
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>{fmtL(ins.market_value)}</span>
                <span style={S.badge(ins.status)}>{ins.status}</span>
                <select value={ins.status} onChange={e => updateInspStatus(ins.id, e.target.value)}
                  style={{ padding: '5px 9px', border: '1px solid #2a2e4a', borderRadius: 8, background: '#181b30', color: '#f1f3ff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          {inspections.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#7880a0' }}>No inspections yet</div>}
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 13, color: '#7880a0' }}>{users.length} users registered</div>
            <button style={S.btnGold} onClick={() => { setShowAddUser(true); setUserErr('') }}>+ Add User</button>
          </div>

          {/* Role Legend */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {ROLES.map(r => (
              <div key={r} style={{ ...S.rolePill(r), fontSize: 11 }}>
                {ROLE_COLOR[r]?.label} — {users.filter(u => u.role === r).length}
              </div>
            ))}
          </div>

          {users.map(u => (
            <div key={u.id} style={{ ...S.userRow, opacity: u.is_active === false ? 0.5 : 1 }}>
              <div style={S.avatar(avatarGradient(u.role))}>{(u.name||'U').charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f3ff', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {u.name || 'Unknown'}
                  {u.is_active === false && <span style={{ fontSize: 10, color: '#ef4444', background: '#ef444418', padding: '2px 8px', borderRadius: 20 }}>Inactive</span>}
                </div>
                <div style={{ fontSize: 12, color: '#7880a0' }}>{u.email}</div>
                <div style={{ fontSize: 11, color: '#7880a0', marginTop: 2 }}>
                  {u.phone && `📱 ${u.phone} · `}{u.branch && `🏢 ${u.branch} · `}Joined {fmtDate(u.created_at)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={S.rolePill(u.role)}>{ROLE_COLOR[u.role]?.label || u.role}</span>
                <select value={u.role || 'inspector'} onChange={e => updateRole(u.id, e.target.value)}
                  style={{ padding: '5px 9px', border: '1px solid #2a2e4a', borderRadius: 8, background: '#181b30', color: '#f1f3ff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_COLOR[r].label}</option>)}
                </select>
                <button style={{ ...S.btnGhost, fontSize: 11, padding: '5px 10px', color: u.is_active === false ? '#10b981' : '#f97316', borderColor: u.is_active === false ? '#10b98133' : '#f9731633' }}
                  onClick={() => toggleActive(u.id, u.is_active !== false)}>
                  {u.is_active === false ? '▶ Activate' : '⏸ Deactivate'}
                </button>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#7880a0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>👥</div>
              <div>No users yet. Add your first user.</div>
            </div>
          )}

          {/* Permissions Reference */}
          <div style={{ ...S.card, marginTop: 20 }}>
            <div style={S.cardTitle}>🔐 Role Permissions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              {[
                { role: 'admin',      color: '#f59e0b', perms: ['Full system access','User management','All inspections','Reports & analytics','Branch management'] },
                { role: 'negotiator', color: '#8b5cf6', perms: ['View all inspections','Make & manage offers','Approve / Reject','Customer details','Valuation reports'] },
                { role: 'inspector',  color: '#3b82f6', perms: ['Create inspections','Upload photos/videos','Generate PDF','View own history','Customer info'] },
              ].map(r => (
                <div key={r.role} style={{ padding: '14px 16px', borderRadius: 12, background: '#181b30', border: `1px solid ${r.color}22` }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: r.color, marginBottom: 10, textTransform: 'capitalize' }}>{r.role}</div>
                  {r.perms.map(p => (
                    <div key={p} style={{ fontSize: 12, color: '#c4c8e0', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: r.color, fontSize: 10 }}>✓</span>{p}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BRANCHES ── */}
      {tab === 'branches' && (
        <div className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#7880a0' }}>{branches.length} branches</div>
            <button style={S.btnGold} onClick={() => setShowAddBranch(true)}>+ Add Branch</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 12 }}>
            {branches.map(b => {
              const bIns = inspections.filter(i => i.branch === b.name)
              return (
                <div key={b.id} style={S.branchCard}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>🏢</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: '#7880a0', marginBottom: 2 }}>📍 {b.city || '—'}</div>
                  <div style={{ fontSize: 12, color: '#7880a0', marginBottom: 14 }}>👤 {b.manager || '—'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={S.perfBox('#3b82f6')}><div style={S.perfVal('#3b82f6')}>{bIns.length}</div><div style={S.perfLbl}>Inspections</div></div>
                    <div style={S.perfBox('#10b981')}><div style={S.perfVal('#10b981')}>{bIns.filter(i=>['Approved','Purchased'].includes(i.status)).length}</div><div style={S.perfLbl}>Approved</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          {branches.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#7880a0' }}>No branches yet</div>}
        </div>
      )}

      {/* ── ADD USER MODAL ── */}
      {showAddUser && (
        <div style={S.overlay} onClick={() => setShowAddUser(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>➕ Add New User</div>
              <button onClick={() => setShowAddUser(false)} style={{ background: 'none', border: 'none', color: '#7880a0', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <label style={S.label}>Full Name *</label>
            <input value={newUser.name} onChange={e => setNewUser(p=>({...p,name:e.target.value}))}
              placeholder="e.g. Rahul Kumar" style={S.input} />

            <label style={S.label}>Email Address *</label>
            <input type="email" value={newUser.email} onChange={e => setNewUser(p=>({...p,email:e.target.value}))}
              placeholder="user@email.com" style={S.input} />

            <label style={S.label}>Mobile Number</label>
            <input type="tel" value={newUser.phone} onChange={e => setNewUser(p=>({...p,phone:e.target.value}))}
              placeholder="+91 XXXXX XXXXX" style={S.input} />

            <label style={S.label}>Password * (min 6 characters)</label>
            <input type="password" value={newUser.password} onChange={e => setNewUser(p=>({...p,password:e.target.value}))}
              placeholder="••••••••" style={S.input} />

            <label style={S.label}>Role *</label>
            <select value={newUser.role} onChange={e => setNewUser(p=>({...p,role:e.target.value}))} style={S.select}>
              <option value="inspector">Inspector — Inspection access only</option>
              <option value="negotiator">Negotiator — Customer, valuation, reports</option>
              <option value="admin">Admin — Full access</option>
            </select>

            <label style={S.label}>Branch</label>
            <select value={newUser.branch} onChange={e => setNewUser(p=>({...p,branch:e.target.value}))} style={S.select}>
              <option value="">Select branch (optional)</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>

            {/* Role permission preview */}
            <div style={{ padding: '10px 12px', background: '#181b30', borderRadius: 9, marginBottom: 14, fontSize: 11, color: '#7880a0', lineHeight: 1.7 }}>
              {newUser.role === 'inspector' && '🔵 Inspector: Can create & manage own inspections, upload photos/videos, generate PDF'}
              {newUser.role === 'negotiator' && '🟣 Negotiator: Can view all inspections, make offers, approve/reject, access reports'}
              {newUser.role === 'admin' && '🟡 Admin: Full access — users, branches, all inspections, analytics'}
            </div>

            {userErr && (
              <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: '#ef444414', borderRadius: 8, border: '1px solid #ef444430' }}>
                ⚠️ {userErr}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAddUser(false)} style={{ ...S.btnGhost, flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={createUser} disabled={saving} style={{ ...S.btnGold, flex: 1, justifyContent: 'center', opacity: saving ? .7 : 1 }}>
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>

            <div style={{ marginTop: 14, padding: '10px 12px', background: '#181b30', borderRadius: 9, fontSize: 11, color: '#7880a0', lineHeight: 1.6 }}>
              💡 User will receive a confirmation email. Their name will show correctly in dashboard based on their role.
            </div>
          </div>
        </div>
      )}

      {/* ── ADD BRANCH MODAL ── */}
      {showAddBranch && (
        <div style={S.overlay} onClick={() => setShowAddBranch(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>🏢 Add Branch</div>
              <button onClick={() => setShowAddBranch(false)} style={{ background: 'none', border: 'none', color: '#7880a0', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            <label style={S.label}>Branch Name *</label>
            <input value={newBranch.name} onChange={e => setNewBranch(p=>({...p,name:e.target.value}))} placeholder="e.g. Lucknow Hub" style={S.input} />
            <label style={S.label}>City</label>
            <input value={newBranch.city} onChange={e => setNewBranch(p=>({...p,city:e.target.value}))} placeholder="Lucknow" style={S.input} />
            <label style={S.label}>Manager Name</label>
            <input value={newBranch.manager} onChange={e => setNewBranch(p=>({...p,manager:e.target.value}))} placeholder="Manager name" style={S.input} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAddBranch(false)} style={{ ...S.btnGhost, flex: 1 }}>Cancel</button>
              <button onClick={createBranch} disabled={saving} style={{ ...S.btnGold, flex: 1, justifyContent: 'center', opacity: saving ? .7 : 1 }}>
                {saving ? 'Creating…' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
