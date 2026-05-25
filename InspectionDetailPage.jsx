import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Badge, ScoreRing, Card, SectionTitle, Btn, LoadingOverlay } from '../ui'
import { STATUS_CONFIG, fmtL, fmtMoney, fmtDate } from '../../lib/constants'

export function InspectionDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [ins, setIns] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerNote, setOfferNote] = useState('')
  const [showOffer, setShowOffer] = useState(false)
  const [quotes, setQuotes] = useState([])

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('inspections').select('*').eq('id', id).single()
    setIns(data)
    // Load quotes if table exists
    try {
      const { data: q } = await supabase.from('negotiation_quotes').select('*').eq('inspection_id', id).order('created_at', { ascending: false })
      setQuotes(q || [])
    } catch {}
    setLoading(false)
  }

  async function updateStatus(status) {
    setSaving(true)
    await supabase.from('inspections').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setIns(p => ({ ...p, status }))
    toast('Status updated → ' + status, 'success')
    setSaving(false)
  }

  async function submitOffer() {
    if (!offerPrice) return
    setSaving(true)
    try {
      await supabase.from('negotiation_quotes').insert({ inspection_id: id, negotiator_id: profile?.id, offered_price: +offerPrice, remarks: offerNote, status: 'Pending', created_at: new Date().toISOString() })
      setQuotes(p => [{ offered_price: +offerPrice, remarks: offerNote, created_at: new Date().toISOString() }, ...p])
      await updateStatus('Under Negotiation')
      setShowOffer(false); setOfferPrice(''); setOfferNote('')
      toast('Offer submitted ✓', 'success')
    } catch (e) { toast('Failed: ' + e.message, 'error') }
    setSaving(false)
  }

  if (loading) return <LoadingOverlay message="Loading inspection…" />
  if (!ins) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--red)' }}>Inspection not found</div>

  const canNeg = ['negotiator', 'admin'].includes(profile?.role)
  const canStat = ['negotiator', 'admin'].includes(profile?.role)

  return (
    <div style={{ padding: '24px 24px 60px', maxWidth: 860, margin: '0 auto' }}>
      {saving && <LoadingOverlay message="Updating…" />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Btn variant="ghost" size="sm" onClick={() => navigate('/')}>← Back</Btn>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--gold)' }}>{ins.make} {ins.model} {ins.year}</div>
        <Badge status={ins.status} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="green" size="sm" onClick={() => navigate(`/inspection/${id}/edit`)}>✏️ Edit</Btn>
        </div>
      </div>

      {/* Car info */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
          {[
            ['Make / Model', `${ins.make} ${ins.model}`], ['Variant', ins.variant || '—'],
            ['Year', ins.year], ['Reg No.', ins.registration_number],
            ['Fuel', ins.fuel_type], ['Transmission', ins.transmission],
            ['Odometer', ins.odometer ? Number(ins.odometer).toLocaleString() + ' km' : '—'],
            ['Owners', ins.ownership], ['Color', ins.color || '—'],
            ['Customer', ins.customer_name || '—'], ['Phone', ins.customer_phone || '—'],
            ['City', ins.customer_city || '—'],
            ['Inspector', ins.inspector_name || '—'], ['Branch', ins.branch || '—'],
            ['Date', fmtDate(ins.inspection_date)],
          ].map(([l, v]) => (
            <div key={l}><span style={{ color: 'var(--sub)' }}>{l}: </span><span style={{ fontWeight: 600 }}>{v}</span></div>
          ))}
        </div>
      </Card>

      {/* Scores */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <ScoreRing score={ins.overall_score} label="Overall" size={90} />
        <ScoreRing score={ins.exterior_score} label="Exterior" />
        <ScoreRing score={ins.engine_score} label="Engine" />
        <ScoreRing score={ins.electrical_score} label="AC/Elec" />
        <ScoreRing score={ins.interior_score} label="Interior" />
        <ScoreRing score={ins.steering_score} label="Steering" />
        <ScoreRing score={ins.document_risk} max={100} label="Doc Risk" />
      </div>

      {/* Market Value */}
      <div style={{ background: 'linear-gradient(135deg, #0a0c16, #13152b)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[{ l: 'Dealer Buy', v: ins.dealer_value, c: 'var(--red)' }, { l: 'Market Value', v: ins.market_value, c: 'var(--gold)' }, { l: 'Resale', v: ins.resale_value, c: 'var(--green)' }].map(item => (
            <div key={item.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: item.c }}>{fmtL(item.v)}</div>
              <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 3 }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--sub)' }}>
          Est. Repair Cost: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmtMoney(ins.repair_cost)}</span>
          {ins.document_risk != null && <span style={{ marginLeft: 16 }}>Doc Risk: <span style={{ color: ins.document_risk >= 50 ? 'var(--red)' : ins.document_risk >= 20 ? 'var(--orange)' : 'var(--green)', fontWeight: 700 }}>{ins.document_risk}%</span></span>}
        </div>
      </div>

      {/* Remarks */}
      {ins.remarks && (
        <Card>
          <SectionTitle icon="📝">Inspector Remarks</SectionTitle>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{ins.remarks}</div>
        </Card>
      )}

      {/* Negotiation */}
      {canNeg && (
        <Card>
          <SectionTitle icon="💼">Negotiation History</SectionTitle>
          {quotes.length === 0 && <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 12 }}>No offers yet</div>}
          {quotes.map((q, i) => (
            <div key={i} style={{ background: 'var(--card2)', borderRadius: 10, padding: '10px 14px', marginBottom: 9, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--gold)' }}>₹{Number(q.offered_price).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 11, color: 'var(--sub)' }}>{fmtDate(q.created_at)}</span>
              </div>
              {q.remarks && <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 5 }}>{q.remarks}</div>}
            </div>
          ))}
          {!showOffer ? (
            <Btn variant="ghost" style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--gold)', color: 'var(--gold)' }} onClick={() => setShowOffer(true)}>+ Add Offer Price</Btn>
          ) : (
            <div style={{ background: 'var(--card2)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>New Offer</div>
              <input type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} placeholder="Offered Price (₹)"
                style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border2)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none', marginBottom: 9, fontFamily: 'inherit' }} />
              <input value={offerNote} onChange={e => setOfferNote(e.target.value)} placeholder="Remarks…"
                style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border2)', borderRadius: 9, background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none', marginBottom: 12, fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowOffer(false)}>Cancel</Btn>
                <Btn variant="gold" style={{ flex: 1, justifyContent: 'center' }} onClick={submitOffer}>Submit Offer</Btn>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Status change */}
      {canStat && (
        <Card>
          <SectionTitle icon="🔄">Change Status</SectionTitle>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
              <button key={s} onClick={() => updateStatus(s)} style={{
                padding: '6px 14px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 12,
                border: `1.5px solid ${ins.status === s ? cfg.color : 'var(--border)'}44`,
                background: ins.status === s ? cfg.bg : 'transparent',
                color: cfg.color, transition: 'all .15s',
              }}>{s}</button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
