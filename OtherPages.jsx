import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge, EmptyState, Btn } from '../ui'
import { fmtL, fmtDate } from '../../lib/constants'

export function HistoryPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('inspections').select('*').order('created_at', { ascending: false })
      if (profile?.role !== 'admin') q = q.eq('inspector_id', profile?.id)
      const { data } = await q
      setInspections(data || [])
      setLoading(false)
    }
    load()
  }, [profile])

  const filtered = search ? inspections.filter(i => JSON.stringify(i).toLowerCase().includes(search.toLowerCase())) : inspections

  return (
    <div style={{ padding: '24px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 3 }}>Inspection History</div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>{inspections.length} total inspections</div>
        </div>
        <Btn variant="gold" onClick={() => navigate('/new')}>➕ New Inspection</Btn>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search…"
        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border2)', borderRadius: 10, background: 'var(--card2)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit', marginBottom: 16 }} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--sub)' }}><div className="spinner" style={{ margin: '0 auto 12px' }} />Loading…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📋" title="No inspections found" action={<Btn variant="gold" onClick={() => navigate('/new')}>➕ New Inspection</Btn>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(ins => {
            const score = ins.overall_score
            const sc = score != null ? (score >= 7 ? 'var(--green)' : score >= 5 ? 'var(--orange)' : 'var(--red)') : 'var(--sub)'
            return (
              <div key={ins.id} onClick={() => navigate(`/inspection/${ins.id}`)} className="fade-in" style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14,
                padding: '14px 18px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, transition: 'all .15s',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ins.make} {ins.model} {ins.year}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)' }}>{ins.registration_number || 'No Reg'} · {ins.customer_name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>{fmtDate(ins.inspection_date || ins.created_at)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {score != null && <div style={{ fontWeight: 900, fontSize: 18, color: sc }}>{score}/10</div>}
                  {ins.market_value && <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--gold)' }}>{fmtL(ins.market_value)}</div>}
                  <Badge status={ins.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CustomersPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('inspections').select('customer_name,customer_phone,customer_email,customer_city,id,make,model,year,status').order('created_at', { ascending: false })
      if (profile?.role !== 'admin') q = q.eq('inspector_id', profile?.id)
      const { data } = await q
      // Group by customer name+phone
      const map = {}
      ;(data || []).forEach(i => {
        const key = (i.customer_name || '') + (i.customer_phone || '')
        if (!map[key]) map[key] = { name: i.customer_name, phone: i.customer_phone, email: i.customer_email, city: i.customer_city, cars: [] }
        map[key].cars.push({ id: i.id, make: i.make, model: i.model, year: i.year, status: i.status })
      })
      setCustomers(Object.values(map))
      setLoading(false)
    }
    load()
  }, [profile])

  return (
    <div style={{ padding: '24px 24px 60px' }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>Customers</div>
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 24 }}>{customers.length} unique customers</div>
      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      : customers.length === 0 ? <EmptyState icon="👥" title="No customers yet" />
      : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {customers.map((c, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 10 }}>
                {(c.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{c.name || 'Unknown'}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 2 }}>{c.phone || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10 }}>{c.city || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 6 }}>Vehicles: {c.cars.length}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {c.cars.slice(0, 3).map(car => (
                  <span key={car.id} onClick={() => navigate(`/inspection/${car.id}`)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: 'var(--card2)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text2)' }}>
                    {car.make} {car.model} {car.year}
                  </span>
                ))}
                {c.cars.length > 3 && <span style={{ fontSize: 10, color: 'var(--sub)' }}>+{c.cars.length - 3} more</span>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  )
}

export function ReportsPage() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      let q = supabase.from('inspections').select('status,overall_score,market_value,created_at,fuel_type,ownership')
      if (profile?.role !== 'admin') q = q.eq('inspector_id', profile?.id)
      const { data } = await q
      const ins = data || []
      const portfolio = ins.filter(i => i.market_value).reduce((a, i) => a + i.market_value, 0)
      const avgScore = ins.filter(i => i.overall_score).length
        ? (ins.filter(i => i.overall_score).reduce((a, i) => a + i.overall_score, 0) / ins.filter(i => i.overall_score).length).toFixed(1)
        : 0
      const byStatus = {}
      ins.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1 })
      const byFuel = {}
      ins.forEach(i => { if (i.fuel_type) byFuel[i.fuel_type] = (byFuel[i.fuel_type] || 0) + 1 })
      const byOwner = {}
      ins.forEach(i => { if (i.ownership) byOwner[i.ownership] = (byOwner[i.ownership] || 0) + 1 })
      // Monthly
      const monthly = {}
      ins.forEach(i => { const m = i.created_at?.slice(0, 7); if (m) monthly[m] = (monthly[m] || 0) + 1 })
      setStats({ total: ins.length, portfolio, avgScore, byStatus, byFuel, byOwner, monthly })
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
  if (!stats) return null

  const fmtL2 = n => n ? '₹' + (n / 100000).toFixed(1) + 'L' : '₹0'

  return (
    <div style={{ padding: '24px 24px 60px' }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 24 }}>Reports & Analytics</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Inspections', value: stats.total, color: 'var(--blue)', icon: '🚗' },
          { label: 'Portfolio Value', value: fmtL2(stats.portfolio), color: 'var(--gold)', icon: '💰' },
          { label: 'Avg Score', value: stats.avgScore + '/10', color: 'var(--green)', icon: '⭐' },
          { label: 'Approved', value: (stats.byStatus.Approved || 0) + (stats.byStatus.Purchased || 0), color: 'var(--green)', icon: '✅' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {[
          { title: '📊 By Status', data: stats.byStatus },
          { title: '⛽ By Fuel Type', data: stats.byFuel },
          { title: '👤 By Ownership', data: stats.byOwner },
        ].map(s => (
          <div key={s.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>{s.title}</div>
            {Object.entries(s.data).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text2)' }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
                <div style={{ height: 5, background: 'var(--border2)', borderRadius: 3 }}>
                  <div style={{ width: `${(v / stats.total) * 100}%`, height: '100%', background: 'var(--gold)', borderRadius: 3, transition: 'width .5s' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', marginTop: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>📅 Monthly Inspections</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
          {Object.entries(stats.monthly).sort().slice(-12).map(([m, v]) => {
            const max = Math.max(...Object.values(stats.monthly))
            return (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 700 }}>{v}</div>
                <div style={{ width: '100%', height: `${(v / max) * 70}px`, background: 'linear-gradient(135deg, var(--accent), var(--gold))', borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                <div style={{ fontSize: 9, color: 'var(--sub)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{m.slice(5)}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
