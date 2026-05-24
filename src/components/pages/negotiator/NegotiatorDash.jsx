import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { Badge, Card, SectionTitle, Btn, ScoreRing, LoadingOverlay, Modal, Input } from '../../ui'
import { fmtL, fmtDate, fmtMoney, STATUS_CONFIG } from '../../../lib/constants'

export function NegotiatorDash() {
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedIns, setSelectedIns] = useState(null)
  const [quotes, setQuotes] = useState([])
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('inspections')
      .select('*')
      .in('status', ['Submitted', 'Under Negotiation', 'Approved', 'Rejected', 'Purchased'])
      .order('updated_at', { ascending: false })
    setInspections(data || [])
    setLoading(false)
  }

  async function openDetail(ins) {
    setSelectedIns(ins)
    try {
      const { data } = await supabase.from('negotiation_quotes')
        .select('*').eq('inspection_id', ins.id).order('created_at', { ascending: false })
      setQuotes(data || [])
    } catch { setQuotes([]) }
  }

  async function submitOffer() {
    if (!offerPrice || !selectedIns) return
    setSaving(true)
    try {
      await supabase.from('negotiation_quotes').insert({
        inspection_id: selectedIns.id,
        negotiator_id: profile?.id,
        offered_price: parseFloat(offerPrice),
        remarks: offerNote,
        status: 'Pending',
        created_at: new Date().toISOString()
      })
      await supabase.from('inspections').update({
        status: 'Under Negotiation', updated_at: new Date().toISOString()
      }).eq('id', selectedIns.id)

      setQuotes(p => [{ offered_price: parseFloat(offerPrice), remarks: offerNote, created_at: new Date().toISOString(), negotiator_name: profile?.name }, ...p])
      setSelectedIns(p => ({ ...p, status: 'Under Negotiation' }))
      setInspections(p => p.map(i => i.id === selectedIns.id ? { ...i, status: 'Under Negotiation' } : i))
      setShowOfferModal(false); setOfferPrice(''); setOfferNote('')
      toast('Offer submitted ✓', 'success')
    } catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }

  async function updateStatus(insId, status) {
    setSaving(true)
    await supabase.from('inspections').update({ status, updated_at: new Date().toISOString() }).eq('id', insId)
    setInspections(p => p.map(i => i.id === insId ? { ...i, status } : i))
    if (selectedIns?.id === insId) setSelectedIns(p => ({ ...p, status }))
    toast('Status → ' + status, 'success')
    setSaving(false)
  }

  const stats = {
    submitted: inspections.filter(i => i.status === 'Submitted').length,
    negotiating: inspections.filter(i => i.status === 'Under Negotiation').length,
    approved: inspections.filter(i => ['Approved','Purchased'].includes(i.status)).length,
    rejected: inspections.filter(i => i.status === 'Rejected').length,
  }

  const filtered = inspections.filter(i => {
    const ms = filter === 'All' || i.status === filter
    const mq = search ? JSON.stringify(i).toLowerCase().includes(search.toLowerCase()) : true
    return ms && mq
  })

  if (loading) return <LoadingOverlay message="Loading negotiations…" />

  return (
    <div style={{ padding: '24px 24px 60px' }}>
      {saving && <LoadingOverlay message="Saving…" />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>💼 Negotiation Dashboard</div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>Manage submitted inspections & offers</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={load}>↻ Refresh</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Pending Review', v: stats.submitted, c: 'var(--orange)', i: '📥' },
          { l: 'Negotiating', v: stats.negotiating, c: 'var(--purple)', i: '🤝' },
          { l: 'Approved', v: stats.approved, c: 'var(--green)', i: '✅' },
          { l: 'Rejected', v: stats.rejected, c: 'var(--red)', i: '❌' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: s.c }} />
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.i}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search…"
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1px solid var(--border2)', borderRadius: 9, background: 'var(--card2)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        {['All','Submitted','Under Negotiation','Approved','Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer',
            border: `1px solid ${filter===f?(STATUS_CONFIG[f]?.color||'var(--gold)'):'var(--border)'}`,
            background: filter===f?((STATUS_CONFIG[f]?.color||'var(--gold)')+'18'):'var(--card2)',
            color: filter===f?(STATUS_CONFIG[f]?.color||'var(--gold)'):'var(--sub)', transition: 'all .15s',
          }}>{f}</button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--sub)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div>No inspections found</div>
        </div>
      ) : filtered.map(ins => {
        const cfg = STATUS_CONFIG[ins.status] || STATUS_CONFIG.Draft
        const sc = ins.overall_score != null ? (ins.overall_score>=7?'var(--green)':ins.overall_score>=5?'var(--orange)':'var(--red)') : 'var(--sub)'
        return (
          <div key={ins.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderLeft: `3px solid ${cfg.color}`, borderRadius: 14, padding: '14px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div style={{ cursor: 'pointer' }} onClick={() => openDetail(ins)}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ins.make} {ins.model} {ins.year}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 2 }}>{ins.registration_number} · {ins.customer_name}</div>
                <div style={{ fontSize: 12, color: 'var(--sub)' }}>
                  Score: <span style={{ color: sc, fontWeight: 700 }}>{ins.overall_score || '—'}/10</span>
                  {ins.repair_cost ? ` · Repair: ${fmtMoney(ins.repair_cost)}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--gold)' }}>{fmtL(ins.market_value)}</div>
                <Badge status={ins.status} />
                <div style={{ fontSize: 11, color: 'var(--sub)' }}>{fmtDate(ins.updated_at)}</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Btn variant="ghost" size="sm" onClick={() => openDetail(ins)}>📋 View Details</Btn>
              {ins.status === 'Submitted' && (
                <Btn variant="purple" size="sm" onClick={() => { openDetail(ins); setShowOfferModal(true) }}
                  style={{ background: 'var(--purpleDim)', border: '1px solid var(--purple)44', color: 'var(--purple)' }}>
                  💼 Make Offer
                </Btn>
              )}
              {ins.status === 'Under Negotiation' && (
                <Btn variant="ghost" size="sm" onClick={() => { openDetail(ins); setShowOfferModal(true) }}
                  style={{ borderColor: 'var(--purple)44', color: 'var(--purple)' }}>
                  💰 Counter Offer
                </Btn>
              )}
              {['Submitted','Under Negotiation'].includes(ins.status) && <>
                <Btn size="sm" onClick={() => updateStatus(ins.id, 'Approved')}
                  style={{ background: 'var(--greenDim)', border: '1px solid var(--green)44', color: 'var(--green)', padding: '6px 14px', borderRadius: 'var(--rsm)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  ✅ Approve
                </Btn>
                <Btn size="sm" onClick={() => updateStatus(ins.id, 'Rejected')}
                  style={{ background: 'var(--redDim)', border: '1px solid var(--red)44', color: 'var(--red)', padding: '6px 14px', borderRadius: 'var(--rsm)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  ❌ Reject
                </Btn>
              </>}
              {ins.status === 'Approved' && (
                <Btn size="sm" onClick={() => updateStatus(ins.id, 'Purchased')}
                  style={{ background: '#0ea47218', border: '1px solid #0ea47244', color: '#0ea472', padding: '6px 14px', borderRadius: 'var(--rsm)', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  🛒 Mark Purchased
                </Btn>
              )}
            </div>
          </div>
        )
      })}

      {/* Detail side panel */}
      {selectedIns && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 480, background: 'var(--card)', borderLeft: '1px solid var(--border)', zIndex: 200, overflow: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,.5)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, background: 'var(--card)', zIndex: 1 }}>
            <button onClick={() => setSelectedIns(null)} style={{ background: 'none', border: 'none', color: 'var(--sub)', cursor: 'pointer', fontSize: 20 }}>←</button>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gold)', flex: 1 }}>{selectedIns.make} {selectedIns.model}</div>
            <Badge status={selectedIns.status} />
          </div>

          <div style={{ padding: '16px 20px' }}>
            {/* Car info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, marginBottom: 16 }}>
              {[['Reg No.', selectedIns.registration_number],['Customer',selectedIns.customer_name],
                ['Phone',selectedIns.customer_phone],['ODO',selectedIns.odometer?Number(selectedIns.odometer).toLocaleString()+' km':'—'],
                ['Fuel',selectedIns.fuel_type],['Year',selectedIns.year]].map(([l,v])=>(
                <div key={l}><span style={{color:'var(--sub)'}}>{l}: </span><span style={{fontWeight:600}}>{v||'—'}</span></div>
              ))}
            </div>

            {/* Scores */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <ScoreRing score={selectedIns.overall_score} label="Overall" size={78} />
              <ScoreRing score={selectedIns.engine_score} label="Engine" size={68} />
              <ScoreRing score={selectedIns.electrical_score} label="Elec" size={68} />
              <ScoreRing score={selectedIns.interior_score} label="Interior" size={68} />
            </div>

            {/* Market value */}
            <div style={{ background: 'var(--card2)', border: '1px solid var(--gold)33', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                {[{l:'Dealer Buy',v:selectedIns.dealer_value,c:'var(--red)'},{l:'Market',v:selectedIns.market_value,c:'var(--gold)'},{l:'Resale',v:selectedIns.resale_value,c:'var(--green)'}].map(item=>(
                  <div key={item.l} style={{textAlign:'center'}}>
                    <div style={{fontSize:15,fontWeight:800,color:item.c}}>{fmtL(item.v)}</div>
                    <div style={{fontSize:10,color:'var(--sub)',marginTop:2}}>{item.l}</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'center',fontSize:12,color:'var(--sub)'}}>Repair: <span style={{fontWeight:700,color:'var(--text)'}}>{fmtMoney(selectedIns.repair_cost)}</span></div>
            </div>

            {/* Quotes history */}
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: 'var(--text2)' }}>💼 Offer History</div>
            {quotes.length === 0 && <div style={{fontSize:12,color:'var(--sub)',marginBottom:12}}>No offers yet</div>}
            {quotes.map((q, i) => (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 14px', marginBottom: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--gold)' }}>₹{Number(q.offered_price).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 10, color: 'var(--sub)' }}>{fmtDate(q.created_at)}</span>
                </div>
                {q.remarks && <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 4 }}>{q.remarks}</div>}
              </div>
            ))}

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              <Btn variant="gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowOfferModal(true)}>💰 Make Offer</Btn>
              {['Submitted','Under Negotiation'].includes(selectedIns.status) && <>
                <Btn style={{ flex: 1, justifyContent: 'center', background: 'var(--greenDim)', border: '1px solid var(--green)44', color: 'var(--green)', padding: 12, borderRadius: 'var(--rsm)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }} onClick={() => updateStatus(selectedIns.id, 'Approved')}>✅ Approve</Btn>
                <Btn style={{ flex: 1, justifyContent: 'center', background: 'var(--redDim)', border: '1px solid var(--red)44', color: 'var(--red)', padding: 12, borderRadius: 'var(--rsm)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }} onClick={() => updateStatus(selectedIns.id, 'Rejected')}>❌ Reject</Btn>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      <Modal open={showOfferModal} onClose={() => setShowOfferModal(false)} title="Make Offer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selectedIns && (
            <div style={{ padding: 12, background: 'var(--card2)', borderRadius: 10, fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{selectedIns.make} {selectedIns.model} {selectedIns.year}</div>
              <div style={{ color: 'var(--sub)' }}>Market Value: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{fmtL(selectedIns.market_value)}</span></div>
              <div style={{ color: 'var(--sub)' }}>Dealer Buy: <span style={{ color: 'var(--red)', fontWeight: 700 }}>{fmtL(selectedIns.dealer_value)}</span></div>
            </div>
          )}
          <Input label="Your Offer Price (₹)" type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="e.g. 380000" />
          <div>
            <label style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, display: 'block', marginBottom: 5 }}>Remarks / Notes</label>
            <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)} placeholder="Reason for this price, conditions…"
              style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border2)', borderRadius: 9, background: 'var(--card2)', color: 'var(--text)', fontSize: 13, outline: 'none', minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowOfferModal(false)}>Cancel</Btn>
            <Btn variant="gold" style={{ flex: 1, justifyContent: 'center' }} onClick={submitOffer}>Submit Offer</Btn>
          </div>
        </div>
      </Modal>
    </div>
  )
}
