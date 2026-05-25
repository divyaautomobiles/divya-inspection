import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge, StatCard, EmptyState, Btn } from '../ui'
import { STATUS_CONFIG, fmtL, fmtDate } from '../../lib/constants'

export function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      let query = supabase.from('inspections').select('*').order('created_at', { ascending: false })
      if (profile?.role !== 'admin') query = query.eq('inspector_id', profile?.id)
      const { data } = await query
      setInspections(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const today = new Date().toISOString().slice(0, 10)
  const stats = {
    total: inspections.length,
    today: inspections.filter(i => i.created_at?.slice(0, 10) === today).length,
    pending: inspections.filter(i => ['Submitted', 'Under Negotiation'].includes(i.status)).length,
    approved: inspections.filter(i => ['Approved', 'Purchased'].includes(i.status)).length,
    portfolio: inspections.filter(i => i.market_value).reduce((a, i) => a + (i.market_value || 0), 0),
    avgScore: inspections.filter(i => i.overall_score).length
      ? Math.round(inspections.filter(i => i.overall_score).reduce((a, i) => a + i.overall_score, 0) / inspections.filter(i => i.overall_score).length * 10) / 10
      : 0,
  }

  const filtered = inspections.filter(i => {
    const ms = filter === 'All' || i.status === filter
    const mq = search ? JSON.stringify(i).toLowerCase().includes(search.toLowerCase()) : true
    return ms && mq
  })

  const statusCounts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(s => [s, inspections.filter(i => i.status === s).length])
  )

  return (
    <div style={{ padding: '24px 24px 40px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
            {profile?.role === 'admin' ? 'Admin Dashboard' : 'My Inspections'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>
            Welcome back, <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{profile?.name}</span> 👋
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={loadData}>↻ Refresh</Btn>
          <Btn variant="gold" onClick={() => navigate('/new')}>➕ New Inspection</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Inspections" value={stats.total} icon="🚗" color="var(--blue)" />
        <StatCard label="Today" value={stats.today} icon="📅" color="var(--purple)" />
        <StatCard label="Pending Review" value={stats.pending} icon="⏳" color="var(--orange)" />
        <StatCard label="Approved" value={stats.approved} icon="✅" color="var(--green)" />
        <StatCard label="Portfolio Value" value={fmtL(stats.portfolio)} icon="💰" color="var(--gold)" />
        <StatCard label="Avg Score" value={stats.avgScore ? stats.avgScore + '/10' : '—'} icon="⭐" color="var(--gold2)" />
      </div>

      {/* Status breakdown */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 14 }}>📊 Status Breakdown</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
            <div key={s} onClick={() => setFilter(filter === s ? 'All' : s)} style={{
              cursor: 'pointer', padding: '8px 16px', borderRadius: 10,
              background: filter === s ? cfg.bg : 'var(--card2)',
              border: `1px solid ${filter === s ? cfg.color : 'var(--border)'}`,
              transition: 'all .15s',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: cfg.color }}>{statusCounts[s] || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 22 }}>
        {[
          { icon: '➕', label: 'New Inspection', path: '/new', color: 'var(--gold)' },
          { icon: '🔍', label: 'Search Vehicle', action: () => document.getElementById('searchBox')?.focus(), color: 'var(--blue)' },
          { icon: '📈', label: 'Reports', path: '/reports', color: 'var(--green)' },
          { icon: '👥', label: 'Customers', path: '/customers', color: 'var(--purple)' },
        ].map((q, i) => (
          <button key={i} onClick={q.action || (() => navigate(q.path))} style={{
            padding: '14px 12px', borderRadius: 12, border: `1px solid ${q.color}22`,
            background: q.color + '10', cursor: 'pointer', textAlign: 'center',
            color: q.color, fontWeight: 700, fontSize: 12, transition: 'all .15s',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{q.icon}</div>
            {q.label}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input id="searchBox" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search car, customer, reg…"
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1px solid var(--border2)', borderRadius: 'var(--rsm)', background: 'var(--card2)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        {['All', 'Draft', 'Submitted', 'Approved', 'Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: 'var(--rsm)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${filter === f ? (STATUS_CONFIG[f]?.color || 'var(--gold)') : 'var(--border)'}`,
            background: filter === f ? ((STATUS_CONFIG[f]?.color || 'var(--gold)') + '18') : 'var(--card2)',
            color: filter === f ? (STATUS_CONFIG[f]?.color || 'var(--gold)') : 'var(--sub)',
            transition: 'all .15s',
          }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--sub)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />Loading…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🚗" title="No inspections found"
          sub={search ? 'Try different search terms' : 'Start your first inspection'}
          action={<Btn variant="gold" onClick={() => navigate('/new')}>➕ New Inspection</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(ins => <InspCard key={ins.id} ins={ins} onClick={() => navigate(`/inspection/${ins.id}`)} />)}
        </div>
      )}
    </div>
  )
}

function InspCard({ ins, onClick }) {
  const cfg = STATUS_CONFIG[ins.status] || STATUS_CONFIG.Draft
  const score = ins.overall_score
  const sc = score != null ? (score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--orange)' : 'var(--red)') : 'var(--sub)'
  return (
    <div onClick={onClick} className="fade-in" style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${cfg.color}`, borderRadius: 'var(--radius)',
      padding: '14px 18px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12, transition: 'all .15s',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          {ins.make || '—'} {ins.model} {ins.year}
        </div>
        <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 3 }}>
          {ins.registration_number || 'No Reg'} · {ins.customer_name || '—'} · {ins.fuel_type || ''} {ins.odometer ? '· ' + Number(ins.odometer).toLocaleString() + ' km' : ''}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sub)' }}>{fmtDate(ins.inspection_date || ins.created_at)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {score != null && <div style={{ fontWeight: 900, fontSize: 20, color: sc }}>{score}/10</div>}
        {ins.market_value && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold)' }}>{fmtL(ins.market_value)}</div>
            <div style={{ fontSize: 9, color: 'var(--sub)' }}>Market Value</div>
          </div>
        )}
        <Badge status={ins.status} />
      </div>
    </div>
  )
}
