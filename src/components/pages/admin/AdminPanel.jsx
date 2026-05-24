import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useToast } from '../../../hooks/useToast'
import { Card, SectionTitle, Btn, Badge, Modal, Input, Select, LoadingOverlay } from '../../ui'
import { fmtDate, fmtL, STATUS_CONFIG, ALL_STATUSES } from '../../../lib/constants'

export function AdminPanel() {
  const toast = useToast()
  const [tab, setTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [inspections, setInspections] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'inspector', branch: '' })
  const [newBranch, setNewBranch] = useState({ name: '', city: '', manager: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: ins }, { data: prof }, { data: br }] = await Promise.all([
      supabase.from('inspections').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('branches').select('*').order('name'),
    ])
    setInspections(ins || [])
    setUsers(prof || [])
    setBranches(br || [])
    setLoading(false)
  }

  async function createUser() {
    if (!newUser.email || !newUser.password || !newUser.name) { toast('Fill all fields', 'error'); return }
    setSaving(true)
    try {
      // Create auth user via Supabase admin (requires service key - use anon for now)
      const { data, error } = await supabase.auth.admin?.createUser({
        email: newUser.email, password: newUser.password,
        user_metadata: { name: newUser.name, role: newUser.role, branch: newUser.branch },
        email_confirm: true,
      }) || {}
      
      if (error) throw error

      // Insert profile
      if (data?.user) {
        await supabase.from('profiles').insert({
          id: data.user.id, email: newUser.email,
          name: newUser.name, role: newUser.role, branch: newUser.branch,
          created_at: new Date().toISOString()
        })
      }
      toast('User created! ✓', 'success')
      setShowAddUser(false)
      setNewUser({ email: '', password: '', name: '', role: 'inspector', branch: '' })
      loadAll()
    } catch (e) {
      // If admin API not available, show instructions
      toast('Create user manually in Supabase Auth → Users, then set role in profiles table', 'info')
    }
    setSaving(false)
  }

  async function updateUserRole(userId, role) {
    await supabase.from('profiles').update({ role }).eq('id', userId)
    setUsers(p => p.map(u => u.id === userId ? { ...u, role } : u))
    toast('Role updated → ' + role, 'success')
  }

  async function updateInspectionStatus(id, status) {
    await supabase.from('inspections').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setInspections(p => p.map(i => i.id === id ? { ...i, status } : i))
    toast('Status → ' + status, 'success')
  }

  async function createBranch() {
    if (!newBranch.name) { toast('Branch name required', 'error'); return }
    setSaving(true)
    await supabase.from('branches').insert({ ...newBranch, created_at: new Date().toISOString() })
    toast('Branch created ✓', 'success')
    setShowAddBranch(false)
    setNewBranch({ name: '', city: '', manager: '' })
    loadAll()
    setSaving(false)
  }

  async function deleteUser(userId) {
    if (!confirm('Delete this user profile?')) return
    await supabase.from('profiles').delete().eq('id', userId)
    setUsers(p => p.filter(u => u.id !== userId))
    toast('User removed', 'success')
  }

  const stats = {
    total: inspections.length,
    today: inspections.filter(i => i.created_at?.slice(0,10) === new Date().toISOString().slice(0,10)).length,
    pending: inspections.filter(i => ['Submitted','Under Negotiation'].includes(i.status)).length,
    approved: inspections.filter(i => ['Approved','Purchased'].includes(i.status)).length,
    portfolio: inspections.reduce((a, i) => a + (i.market_value || 0), 0),
    revenue: inspections.filter(i => i.status === 'Purchased').reduce((a, i) => a + (i.dealer_value || 0), 0),
    inspectors: users.filter(u => u.role === 'inspector').length,
    negotiators: users.filter(u => u.role === 'negotiator').length,
  }

  const TABS = ['overview', 'inspections', 'users', 'branches']

  if (loading) return <LoadingOverlay message="Loading admin data…" />

  return (
    <div style={{ padding: '24px 24px 60px' }}>
      {saving && <LoadingOverlay message="Saving…" />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>⚙️ Admin Panel</div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>Full system control & management</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={loadAll}>↻ Refresh</Btn>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t ? 800 : 500,
            color: tab === t ? 'var(--gold)' : 'var(--sub)',
            borderBottom: `2.5px solid ${tab === t ? 'var(--gold)' : 'transparent'}`,
            textTransform: 'capitalize', transition: 'all .15s',
          }}>{t}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { l: 'Total Inspections', v: stats.total, c: 'var(--blue)', i: '🚗' },
              { l: "Today's", v: stats.today, c: 'var(--purple)', i: '📅' },
              { l: 'Pending', v: stats.pending, c: 'var(--orange)', i: '⏳' },
              { l: 'Approved', v: stats.approved, c: 'var(--green)', i: '✅' },
              { l: 'Portfolio', v: fmtL(stats.portfolio), c: 'var(--gold)', i: '💰' },
              { l: 'Revenue (Purchased)', v: fmtL(stats.revenue), c: 'var(--green)', i: '💵' },
              { l: 'Inspectors', v: stats.inspectors, c: 'var(--blue)', i: '👷' },
              { l: 'Negotiators', v: stats.negotiators, c: 'var(--purple)', i: '🤝' },
            ].map(s => (
              <div key={s.l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.c }} />
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.i}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <Card>
            <SectionTitle icon="📊">Status Breakdown</SectionTitle>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
                const count = inspections.filter(i => i.status === s).length
                return (
                  <div key={s} style={{ padding: '12px 18px', borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: cfg.color }}>{count}</div>
                    <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>{s}</div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Inspector performance */}
          <Card>
            <SectionTitle icon="👷">Inspector Performance</SectionTitle>
            {users.filter(u => u.role === 'inspector').map(u => {
              const myIns = inspections.filter(i => i.inspector_id === u.id)
              const approved = myIns.filter(i => ['Approved','Purchased'].includes(i.status)).length
              const avgScore = myIns.filter(i => i.overall_score).length
                ? (myIns.filter(i => i.overall_score).reduce((a, i) => a + i.overall_score, 0) / myIns.filter(i => i.overall_score).length).toFixed(1)
                : '—'
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15, flexShrink: 0 }}>
                    {(u.name||'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--sub)' }}>{u.branch || 'No branch'}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '4px 12px', background: 'var(--card2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)' }}>{myIns.length}</div>
                    <div style={{ fontSize: 9, color: 'var(--sub)' }}>Total</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '4px 12px', background: 'var(--card2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green)' }}>{approved}</div>
                    <div style={{ fontSize: 9, color: 'var(--sub)' }}>Approved</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '4px 12px', background: 'var(--card2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>{avgScore}</div>
                    <div style={{ fontSize: 9, color: 'var(--sub)' }}>Avg Score</div>
                  </div>
                </div>
              )
            })}
            {users.filter(u => u.role === 'inspector').length === 0 && <div style={{ color: 'var(--sub)', fontSize: 13 }}>No inspectors found</div>}
          </Card>
        </div>
      )}

      {/* ALL INSPECTIONS */}
      {tab === 'inspections' && (
        <div className="fade-in">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text2)', alignSelf: 'center' }}>{inspections.length} inspections</div>
          </div>
          {inspections.map(ins => (
            <div key={ins.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${STATUS_CONFIG[ins.status]?.color || 'var(--border)'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{ins.make} {ins.model} {ins.year}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{ins.registration_number} · {ins.customer_name} · {fmtDate(ins.created_at)}</div>
                  <div style={{ fontSize: 11, color: 'var(--sub)' }}>Inspector: {ins.inspector_name || '—'} · Branch: {ins.branch || '—'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {ins.overall_score != null && <span style={{ fontWeight: 800, fontSize: 16, color: ins.overall_score>=7?'var(--green)':ins.overall_score>=5?'var(--orange)':'var(--red)' }}>{ins.overall_score}/10</span>}
                  <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{fmtL(ins.market_value)}</span>
                  <Badge status={ins.status} />
                  <select value={ins.status} onChange={e => updateInspectionStatus(ins.id, e.target.value)}
                    style={{ padding: '5px 9px', border: '1px solid var(--border2)', borderRadius: 8, background: 'var(--card2)', color: 'var(--text)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--sub)' }}>{users.length} users</div>
            <Btn variant="gold" size="sm" onClick={() => setShowAddUser(true)}>+ Add User</Btn>
          </div>

          {users.map(u => (
            <div key={u.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${u.role==='admin'?'#ea580c,#f59e0b':u.role==='negotiator'?'#7c3aed,#8b5cf6':'#1d4ed8,#3b82f6'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 17, flexShrink: 0 }}>
                {(u.name||'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name || 'Unknown'}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>{u.email}</div>
                <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>{u.branch || 'No branch'} · Joined {fmtDate(u.created_at)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: u.role==='admin'?'#f59e0b18':u.role==='negotiator'?'#8b5cf618':'#3b82f618',
                  color: u.role==='admin'?'#f59e0b':u.role==='negotiator'?'#8b5cf6':'#3b82f6',
                  border: `1px solid ${u.role==='admin'?'#f59e0b':u.role==='negotiator'?'#8b5cf6':'#3b82f6'}44`
                }}>{u.role || 'inspector'}</div>
                <select value={u.role || 'inspector'} onChange={e => updateUserRole(u.id, e.target.value)}
                  style={{ padding: '5px 9px', border: '1px solid var(--border2)', borderRadius: 8, background: 'var(--card2)', color: 'var(--text)', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <option value="inspector">Inspector</option>
                  <option value="negotiator">Negotiator</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => deleteUser(u.id)} style={{ background: 'var(--redDim)', border: '1px solid var(--red)44', color: 'var(--red)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Remove</button>
              </div>
            </div>
          ))}

          {users.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--sub)' }}>No users found.<br/>Create users in Supabase Authentication → Users</div>}

          {/* Add User Modal */}
          <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add New User">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Full Name" value={newUser.name} onChange={e => setNewUser(p=>({...p,name:e.target.value}))} placeholder="Rahul Kumar" />
              <Input label="Email" type="email" value={newUser.email} onChange={e => setNewUser(p=>({...p,email:e.target.value}))} placeholder="user@email.com" />
              <Input label="Password" type="password" value={newUser.password} onChange={e => setNewUser(p=>({...p,password:e.target.value}))} placeholder="Min 6 characters" />
              <Select label="Role" value={newUser.role} onChange={e => setNewUser(p=>({...p,role:e.target.value}))}>
                <option value="inspector">Inspector</option>
                <option value="negotiator">Negotiator</option>
                <option value="admin">Admin</option>
              </Select>
              <Select label="Branch" value={newUser.branch} onChange={e => setNewUser(p=>({...p,branch:e.target.value}))}>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </Select>
              <div style={{ marginTop: 8, padding: 12, background: 'var(--card2)', borderRadius: 8, fontSize: 12, color: 'var(--sub)', lineHeight: 1.6 }}>
                💡 <strong style={{color:'var(--text2)'}}>Note:</strong> If auto-create fails, manually create the user in Supabase → Authentication → Users, then update their role here.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Btn variant="ghost" style={{flex:1,justifyContent:'center'}} onClick={() => setShowAddUser(false)}>Cancel</Btn>
                <Btn variant="gold" style={{flex:1,justifyContent:'center'}} onClick={createUser}>Create User</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* BRANCHES */}
      {tab === 'branches' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: 'var(--sub)' }}>{branches.length} branches</div>
            <Btn variant="gold" size="sm" onClick={() => setShowAddBranch(true)}>+ Add Branch</Btn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {branches.map(b => {
              const branchIns = inspections.filter(i => i.branch === b.name)
              return (
                <div key={b.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🏢</div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 2 }}>📍 {b.city || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 12 }}>👤 Manager: {b.manager || '—'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ textAlign: 'center', background: 'var(--card2)', borderRadius: 9, padding: '8px 4px' }}>
                      <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--blue)' }}>{branchIns.length}</div>
                      <div style={{ fontSize: 10, color: 'var(--sub)' }}>Inspections</div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'var(--card2)', borderRadius: 9, padding: '8px 4px' }}>
                      <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--green)' }}>{branchIns.filter(i=>['Approved','Purchased'].includes(i.status)).length}</div>
                      <div style={{ fontSize: 10, color: 'var(--sub)' }}>Approved</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {branches.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--sub)' }}>No branches yet. Add your first branch.</div>}

          <Modal open={showAddBranch} onClose={() => setShowAddBranch(false)} title="Add Branch">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Branch Name" value={newBranch.name} onChange={e => setNewBranch(p=>({...p,name:e.target.value}))} placeholder="Lucknow Hub" />
              <Input label="City" value={newBranch.city} onChange={e => setNewBranch(p=>({...p,city:e.target.value}))} placeholder="Lucknow" />
              <Input label="Manager Name" value={newBranch.manager} onChange={e => setNewBranch(p=>({...p,manager:e.target.value}))} placeholder="Manager name" />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Btn variant="ghost" style={{flex:1,justifyContent:'center'}} onClick={() => setShowAddBranch(false)}>Cancel</Btn>
                <Btn variant="gold" style={{flex:1,justifyContent:'center'}} onClick={createBranch}>Create Branch</Btn>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  )
}
