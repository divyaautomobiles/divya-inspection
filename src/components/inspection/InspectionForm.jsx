import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import {
  Card, SectionTitle, Grid, Input, Select, Textarea,
  PhotoSlots, VideoUpload, RatingBtns, ScoreRing,
  LoadingOverlay, Btn, SubSection
} from '../ui'
import {
  STRUCT, EXT_PANELS, LIGHTS, ORVM, TYRES, ENGINE, AC, ELEC,
  SEATS, DASH_ITEMS, INT_PANELS, STEER, ALL_ITEMS,
  calcScore, calcMarketValue, calcRepairCost, calcDocRisk,
  fmtL, fmtMoney
} from '../../lib/constants'

const TABS = [
  'Customer & Car', 'Documents', 'Exterior', 'Engine',
  'AC & Electricals', 'Interior', 'Steering', 'Summary & PDF'
]

const initRatings = () => ({})
const initPhotos = () => ({})
const initVideos = () => ({})

export function InspectionForm({ existing }) {
  const { profile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState(0)
  const [saving, setSaving] = useState(false)

  // Customer
  const [cust, setCust] = useState(existing?.cust || { name: '', phone: '', email: '', city: '' })
  // Car
  const [car, setCar] = useState(existing?.car || {
    make: '', model: '', variant: '', year: '', mfgmon: '', color: '',
    fuel: '', trans: '', odo: '', owners: '', reg: '', rto: '',
    regdate: '', date: new Date().toISOString().slice(0, 10),
    inspector: profile?.name || '', branch: ''
  })
  // Documents
  const [doc, setDoc] = useState(existing?.doc || {
    rc: '', rcc: '', rcm: '', ins: '', insexp: '', hyp: '', loan: '',
    noc: '', tax: '', taxdate: '', fit: '', key: '', bs: '', chassis: '',
    cng: '', scrap: 'No', mig: 'No', conv: 'No', adapt: 'No', black: 'No',
    theft: '0', fir: '0', crim: '0', civil: '0', acc: '0', seize: '0'
  })
  // Inspection ratings/remarks
  const [ratings, setRatings] = useState(existing?.ratings || initRatings())
  const [remarks, setRemarks] = useState(existing?.remarks || initRatings())
  const [photos, setPhotos] = useState(existing?.photos || initPhotos())
  const [videos, setVideos] = useState(existing?.videos || initVideos())
  const [tyremm, setTyremm] = useState(existing?.tyremm || {})
  const [damage, setDamage] = useState(existing?.damage || {})
  const [globalRemarks, setGlobalRemarks] = useState(existing?.globalRemarks || '')

  const setRating = useCallback((id, val) => setRatings(p => ({ ...p, [id]: val })), [])
  const setRemark = useCallback((id, val) => setRemarks(p => ({ ...p, [id]: val })), [])
  const addPhoto = useCallback((id, url, file) => setPhotos(p => ({ ...p, [id]: [...(p[id] || []), { url, file }] })), [])
  const removePhoto = useCallback((id, i) => setPhotos(p => ({ ...p, [id]: (p[id] || []).filter((_, j) => j !== i) })), [])
  const setVideo = useCallback((id, file) => setVideos(p => ({ ...p, [id]: file })), [])
  const setTyreMm = useCallback((id, val) => setTyremm(p => ({ ...p, [id]: val })), [])
  const toggleDamage = useCallback((id) => setDamage(p => ({ ...p, [id]: !p[id] })), [])

  const docRisk = calcDocRisk(doc)
  const extSc = calcScore([...STRUCT, ...EXT_PANELS, ...LIGHTS, ...ORVM], ratings)
  const engSc = calcScore(ENGINE, ratings)
  const acSc = calcScore([...AC, ...ELEC], ratings)
  const intSc = calcScore([...SEATS, ...DASH_ITEMS, ...INT_PANELS], ratings)
  const stSc = calcScore(STEER, ratings)
  const allSc = [extSc, engSc, acSc, intSc, stSc].filter(s => s !== null)
  const overall = allSc.length ? Math.round(allSc.reduce((a, b) => a + b) / allSc.length) : null
  const mv = calcMarketValue(car.year, car.odo, car.owners, overall)
  const repair = calcRepairCost(ratings)

  async function save(status = 'Draft') {
    setSaving(true)
    try {
      const inspData = { ratings, remarks, tyremm, damage, doc }
      const payload = {
        inspector_id: profile?.id,
        status,
        make: car.make, model: car.model, variant: car.variant,
        year: parseInt(car.year) || null, color: car.color,
        fuel_type: car.fuel, transmission: car.trans,
        odometer: parseInt(car.odo) || null, ownership: car.owners,
        registration_number: car.reg, rto: car.rto,
        inspection_date: car.date, inspector_name: car.inspector, branch: car.branch,
        customer_name: cust.name, customer_phone: cust.phone,
        customer_email: cust.email, customer_city: cust.city,
        overall_score: overall, exterior_score: extSc, engine_score: engSc,
        electrical_score: acSc, interior_score: intSc, steering_score: stSc,
        document_risk: docRisk,
        market_value: mv.market || null, dealer_value: mv.dealer || null, resale_value: mv.resale || null,
        repair_cost: repair || null,
        remarks: globalRemarks,
        inspection_data: inspData,
        updated_at: new Date().toISOString(),
      }
      let result
      if (existing?.id) {
        result = await supabase.from('inspections').update(payload).eq('id', existing.id)
      } else {
        payload.created_at = new Date().toISOString()
        result = await supabase.from('inspections').insert(payload).select().single()
      }
      if (result.error) throw result.error
      toast(status === 'Submitted' ? '✅ Inspection submitted!' : '💾 Draft saved!', 'success')
      if (status === 'Submitted') navigate('/')
    } catch (e) {
      toast('Save failed: ' + (e.message || 'Unknown error'), 'error')
    }
    setSaving(false)
  }

  function genPDF() {
    const { jsPDF } = window.jspdf
    if (!jsPDF) { toast('PDF library loading, try again', 'error'); return }
    const doc2 = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210, M = 14; let y = 0

    doc2.setFillColor(10, 12, 22); doc2.rect(0, 0, W, 42, 'F')
    doc2.setFillColor(234, 88, 12); doc2.rect(0, 42, W, 2, 'F')
    doc2.setFillColor(245, 158, 11); doc2.rect(0, 44, W, 1, 'F')
    doc2.setTextColor(245, 158, 11); doc2.setFont('helvetica', 'bold'); doc2.setFontSize(22)
    doc2.text('DIVYA AUTOMOBILES', W / 2, 16, { align: 'center' })
    doc2.setFontSize(10); doc2.setFont('helvetica', 'normal'); doc2.setTextColor(200, 200, 215)
    doc2.text('Professional Vehicle Inspection Report', W / 2, 25, { align: 'center' })
    doc2.text(`Date: ${car.date || '—'}  |  Reg: ${car.reg || '—'}  |  Inspector: ${car.inspector || profile?.name || '—'}`, W / 2, 34, { align: 'center' })
    y = 52

    const sh = t => { if (y > 265) { doc2.addPage(); y = 16 } doc2.setFillColor(20, 22, 38); doc2.rect(M, y, W - M * 2, 8, 'F'); doc2.setFillColor(245, 158, 11); doc2.rect(M, y, 3, 8, 'F'); doc2.setTextColor(245, 158, 11); doc2.setFont('helvetica', 'bold'); doc2.setFontSize(10); doc2.text(t, M + 6, y + 5.5); y += 12; doc2.setFont('helvetica', 'normal'); doc2.setTextColor(220, 222, 232); doc2.setFontSize(9) }
    const r2 = (l1, v1, l2, v2) => { if (y > 270) { doc2.addPage(); y = 16 } const cw = (W - M * 2) / 2; doc2.setTextColor(130, 140, 165); doc2.text(l1, M, y); doc2.setTextColor(220, 222, 232); doc2.text(String(v1 || '—'), M + 38, y); if (l2 !== undefined) { doc2.setTextColor(130, 140, 165); doc2.text(String(l2), M + cw, y); doc2.setTextColor(220, 222, 232); doc2.text(String(v2 || '—'), M + cw + 38, y) } y += 5.5 }
    const chk = () => { if (y > 265) { doc2.addPage(); y = 16 } }

    sh('Customer Details')
    r2('Name:', cust.name, 'Phone:', cust.phone)
    r2('Email:', cust.email, 'City:', cust.city)
    y += 2; sh('Vehicle Details')
    r2('Make:', car.make, 'Model:', car.model)
    r2('Variant:', car.variant, 'Year:', car.year)
    r2('Fuel:', car.fuel, 'Trans:', car.trans)
    r2('ODO:', car.odo ? car.odo + ' km' : '', 'Reg:', car.reg)
    r2('Owners:', car.owners, 'Color:', car.color)

    // Score summary
    y += 3; sh('Inspection Scores')
    doc2.setFillColor(10, 12, 20); doc2.roundedRect(M, y, W - M * 2, 24, 4, 4, 'F')
    ;[{ l: 'Overall', v: overall }, { l: 'Exterior', v: extSc }, { l: 'Engine', v: engSc }, { l: 'AC/Elec', v: acSc }, { l: 'Interior', v: intSc }, { l: 'Steering', v: stSc }].forEach((s, i) => {
      const x = M + 4 + i * ((W - M * 2 - 8) / 6)
      const c = s.v != null ? (s.v >= 7 ? [16, 185, 129] : s.v >= 5 ? [249, 115, 22] : [239, 68, 68]) : [147, 152, 176]
      doc2.setTextColor(...c); doc2.setFont('helvetica', 'bold'); doc2.setFontSize(12)
      doc2.text(s.v != null ? s.v + '/10' : '—', x, y + 13)
      doc2.setTextColor(147, 152, 176); doc2.setFont('helvetica', 'normal'); doc2.setFontSize(7)
      doc2.text(s.l, x, y + 21)
    }); y += 30

    // Sections
    const secList = [
      { title: 'Structure', items: STRUCT }, { title: 'Exterior Panels', items: EXT_PANELS },
      { title: 'Lights', items: LIGHTS }, { title: 'ORVM', items: ORVM },
      { title: 'Engine & Transmission', items: ENGINE }, { title: 'Air Conditioning', items: AC },
      { title: 'Electricals', items: ELEC }, { title: 'Seats', items: SEATS },
      { title: 'Dashboard & Controls', items: DASH_ITEMS }, { title: 'Interior Panels', items: INT_PANELS },
      { title: 'Steering, Suspension & Brakes', items: STEER },
    ]
    secList.forEach(sec => {
      chk(); y += 2; sh(sec.title)
      const cw2 = (W - M * 2) / 2
      for (let i = 0; i < sec.items.length; i += 2) {
        chk()
        for (let j = 0; j < 2; j++) {
          const it = sec.items[i + j]; if (!it) break
          const r = ratings[it.id] || ''; const rm = remarks[it.id] || ''; const x = M + j * cw2
          doc2.setTextColor(115, 125, 155); doc2.text(it.name + ':', x, y)
          const rc = { Good: [16, 185, 129], Average: [249, 115, 22], Poor: [239, 68, 68], 'N/A': [136, 146, 170] }[r] || [180, 180, 180]
          doc2.setTextColor(...rc); doc2.setFont('helvetica', 'bold'); doc2.text(r || '—', x + 46, y); doc2.setFont('helvetica', 'normal')
          if (rm) { doc2.setTextColor(160, 168, 188); doc2.setFontSize(7.5); const rl = doc2.splitTextToSize('→ ' + rm, cw2 - 8); y += 3.5; doc2.text(rl, x, y); doc2.setFontSize(9); y += rl.length * 3.5 - 3.5 }
        }
        y += 5.5
      }
    })

    chk(); y += 2; sh('Tyre Condition')
    TYRES.forEach(t => { chk(); doc2.setTextColor(115, 125, 155); doc2.text(t.name + ':', M, y); doc2.setTextColor(220, 222, 232); doc2.text(tyremm[t.id] ? tyremm[t.id] + ' mm tread' : '—', M + 46, y); y += 5.5 })

    y += 3; sh('Market Value Estimate')
    doc2.setFillColor(10, 12, 20); doc2.roundedRect(M, y, W - M * 2, 26, 4, 4, 'F')
    ;[{ l: 'Dealer Buy', v: mv.dealer, c: [239, 68, 68] }, { l: 'Market Value', v: mv.market, c: [245, 158, 11] }, { l: 'Resale', v: mv.resale, c: [16, 185, 129] }].forEach((item, i) => {
      const x = M + 4 + i * ((W - M * 2 - 8) / 3)
      doc2.setTextColor(...item.c); doc2.setFont('helvetica', 'bold'); doc2.setFontSize(12)
      doc2.text(fmtL(item.v), x, y + 14)
      doc2.setTextColor(147, 152, 176); doc2.setFont('helvetica', 'normal'); doc2.setFontSize(8)
      doc2.text(item.l, x, y + 22)
    }); y += 31
    r2('Est. Repair Cost:', fmtMoney(repair), 'Doc Risk:', docRisk + '%')
    if (globalRemarks) { chk(); y += 2; sh('Remarks'); const rl = doc2.splitTextToSize(globalRemarks, W - M * 2); doc2.text(rl, M, y) }

    const pg = doc2.internal.getNumberOfPages()
    for (let i = 1; i <= pg; i++) {
      doc2.setPage(i); doc2.setFillColor(10, 12, 24); doc2.rect(0, 286, W, 11, 'F')
      doc2.setTextColor(90, 100, 125); doc2.setFontSize(7.5)
      doc2.text('Inspector: ' + (car.inspector || profile?.name || '___'), M, 293)
      doc2.text('Divya Automobiles — Confidential', W / 2, 293, { align: 'center' })
      doc2.text(`Page ${i}/${pg}`, W - M, 293, { align: 'right' })
    }
    doc2.save(`Divya_${car.reg || 'Report'}_${car.date}.pdf`)
    toast('✅ PDF downloaded!', 'success')
  }

  // ── Part Row Component ──
  const PartRow = ({ item }) => {
    const rat = ratings[item.id] || ''
    const rmk = remarks[item.id] || ''
    const phArr = (photos[item.id] || []).map(p => p.url)
    const vid = videos[item.id] || null
    const borderColor = rat === 'Good' ? 'var(--green)' : rat === 'Average' ? 'var(--orange)' : rat === 'Poor' ? 'var(--red)' : rat === 'N/A' ? 'var(--sub)' : 'var(--border2)'

    if (item.txt) return (
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, background: 'var(--card2)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{item.name}</div>
        <input value={rmk} onChange={e => setRemark(item.id, e.target.value)} placeholder="Enter value…"
          style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
      </div>
    )

    return (
      <div style={{ border: '1px solid var(--border)', borderLeft: `3px solid ${borderColor}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10, background: 'var(--card2)', transition: 'border-left-color .2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
          <RatingBtns value={rat} onChange={v => setRating(item.id, v)} />
        </div>
        <input value={rmk} onChange={e => setRemark(item.id, e.target.value)} placeholder="Condition / remarks…"
          style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'var(--card)', color: 'var(--text)', fontSize: 12, outline: 'none', marginBottom: 6, fontFamily: 'inherit' }} />
        <div style={{ fontSize: 10, color: 'var(--sub)', fontWeight: 700, marginBottom: 5 }}>📷 PHOTOS (max 3)</div>
        <PhotoSlots photos={phArr} max={3}
          onAdd={(url, file) => addPhoto(item.id, url, file)}
          onRemove={i => removePhoto(item.id, i)} />
        {item.video && <VideoUpload videoFile={vid} onSet={f => setVideo(item.id, f)} label={`Upload ${item.name} Video`} />}
      </div>
    )
  }

  const NavBtns = ({ showPrev = true, nextLabel = 'Next →', onNext }) => (
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      {showPrev && <Btn variant="ghost" onClick={() => setTab(t => t - 1)} style={{ padding: '12px 18px', fontSize: 18 }}>←</Btn>}
      <Btn variant="gold" style={{ flex: 1, padding: 13, fontSize: 14, justifyContent: 'center' }} onClick={onNext || (() => setTab(t => t + 1))}>{nextLabel}</Btn>
    </div>
  )

  return (
    <div>
      {saving && <LoadingOverlay message="Saving inspection…" />}

      {/* Header */}
      <div style={{ background: '#090b14', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 90, flexWrap: 'wrap' }}>
        <Btn variant="ghost" size="sm" onClick={() => navigate('/')}>← Back</Btn>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gold)' }}>{existing ? 'Edit Inspection' : 'New Inspection'}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => save('Draft')}>💾 Save Draft</Btn>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: '#090b14', display: 'flex', overflowX: 'auto', padding: '0 12px', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            flex: '0 0 auto', padding: '10px 16px', border: 'none', background: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: tab === i ? 800 : 500,
            color: tab === i ? 'var(--gold)' : 'var(--sub)',
            borderBottom: `2.5px solid ${tab === i ? 'var(--gold)' : 'transparent'}`,
            whiteSpace: 'nowrap', transition: 'all .15s',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '16px 14px 40px' }}>

        {/* TAB 0: Customer & Car */}
        {tab === 0 && <div className="fade-in">
          <Card>
            <SectionTitle icon="👤">Customer Details</SectionTitle>
            <Grid cols={2}>
              <Input label="Full Name" value={cust.name} onChange={e => setCust(p => ({ ...p, name: e.target.value }))} placeholder="Customer name" />
              <Input label="Phone" type="tel" value={cust.phone} onChange={e => setCust(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
              <Input label="Email" type="email" value={cust.email} onChange={e => setCust(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
              <Input label="City" value={cust.city} onChange={e => setCust(p => ({ ...p, city: e.target.value }))} placeholder="City" />
            </Grid>
          </Card>
          <Card>
            <SectionTitle icon="🚗">Vehicle Details</SectionTitle>
            <Grid cols={3}>
              <Input label="Make" value={car.make} onChange={e => setCar(p => ({ ...p, make: e.target.value }))} placeholder="Mahindra / Maruti…" />
              <Input label="Model" value={car.model} onChange={e => setCar(p => ({ ...p, model: e.target.value }))} placeholder="XUV500 / Swift…" />
              <Input label="Variant" value={car.variant} onChange={e => setCar(p => ({ ...p, variant: e.target.value }))} placeholder="W6 / ZXi…" />
              <Input label="Year" type="number" value={car.year} onChange={e => setCar(p => ({ ...p, year: e.target.value }))} placeholder="2019" />
              <Input label="Mfg. Month" value={car.mfgmon} onChange={e => setCar(p => ({ ...p, mfgmon: e.target.value }))} placeholder="October" />
              <Input label="Color" value={car.color} onChange={e => setCar(p => ({ ...p, color: e.target.value }))} placeholder="White" />
              <Select label="Fuel Type" value={car.fuel} onChange={e => setCar(p => ({ ...p, fuel: e.target.value }))}><option value="">Select</option>{['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Transmission" value={car.trans} onChange={e => setCar(p => ({ ...p, trans: e.target.value }))}><option value="">Select</option>{['Manual', 'Automatic', 'AMT', 'CVT'].map(o => <option key={o}>{o}</option>)}</Select>
              <Input label="Odometer (km)" type="number" value={car.odo} onChange={e => setCar(p => ({ ...p, odo: e.target.value }))} placeholder="45000" />
              <Select label="No. of Owners" value={car.owners} onChange={e => setCar(p => ({ ...p, owners: e.target.value }))}><option value="">Select</option>{['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner'].map(o => <option key={o}>{o}</option>)}</Select>
              <Input label="Registration No." value={car.reg} onChange={e => setCar(p => ({ ...p, reg: e.target.value }))} placeholder="UP32 AB 1234" />
              <Input label="RTO" value={car.rto} onChange={e => setCar(p => ({ ...p, rto: e.target.value }))} placeholder="UP-32 LUCKNOW" />
              <Input label="Reg. Month/Year" value={car.regdate} onChange={e => setCar(p => ({ ...p, regdate: e.target.value }))} placeholder="Nov-2019" />
              <Input label="Inspection Date" type="date" value={car.date} onChange={e => setCar(p => ({ ...p, date: e.target.value }))} />
              <Input label="Inspector Name" value={car.inspector} onChange={e => setCar(p => ({ ...p, inspector: e.target.value }))} placeholder="Inspector name" />
              <Input label="Branch / Location" value={car.branch} onChange={e => setCar(p => ({ ...p, branch: e.target.value }))} placeholder="Lucknow Hub" />
            </Grid>
          </Card>
          <NavBtns showPrev={false} nextLabel="Next: Documents →" />
        </div>}

        {/* TAB 1: Documents */}
        {tab === 1 && <div className="fade-in">
          <Card>
            <SectionTitle icon="📄" right={
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: docRisk >= 50 ? 'var(--redDim)' : docRisk >= 20 ? 'var(--orangeDim)' : 'var(--greenDim)', color: docRisk >= 50 ? 'var(--red)' : docRisk >= 20 ? 'var(--orange)' : 'var(--green)' }}>Risk: {docRisk}%</span>
            }>Important Documents</SectionTitle>
            <Grid cols={2}>
              <Select label="RC Availability" value={doc.rc} onChange={e => setDoc(p => ({ ...p, rc: e.target.value }))}><option value="">Select</option>{['Original', 'Duplicate', 'Not Available'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="RC Condition" value={doc.rcc} onChange={e => setDoc(p => ({ ...p, rcc: e.target.value }))}><option value="">Select</option>{['Ok', 'Damaged'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Mismatch in RC" value={doc.rcm} onChange={e => setDoc(p => ({ ...p, rcm: e.target.value }))}><option value="">Select</option>{['No Mismatch', 'Name Mismatch', 'Variant Mismatch', 'Address Mismatch', 'Other'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Insurance Type" value={doc.ins} onChange={e => setDoc(p => ({ ...p, ins: e.target.value }))}><option value="">Select</option>{['Comprehensive', '3rd Party', 'Expired'].map(o => <option key={o}>{o}</option>)}</Select>
              <Input label="Insurance Expiry" type="date" value={doc.insexp} onChange={e => setDoc(p => ({ ...p, insexp: e.target.value }))} />
              <Select label="Under Hypothecation" value={doc.hyp} onChange={e => setDoc(p => ({ ...p, hyp: e.target.value }))}><option value="">Select</option>{['Yes', 'No'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Loan Status" value={doc.loan} onChange={e => setDoc(p => ({ ...p, loan: e.target.value }))}><option value="">Select</option>{['Open', 'Closed', 'N/A'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="RTO NOC Issued" value={doc.noc} onChange={e => setDoc(p => ({ ...p, noc: e.target.value }))}><option value="">Select</option>{['Yes', 'No'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Road Tax Paid" value={doc.tax} onChange={e => setDoc(p => ({ ...p, tax: e.target.value }))}><option value="">Select</option>{['OTT/LTT', 'Yearly', 'Pending'].map(o => <option key={o}>{o}</option>)}</Select>
              <Input label="Road Tax Valid Till" type="date" value={doc.taxdate} onChange={e => setDoc(p => ({ ...p, taxdate: e.target.value }))} />
              <Input label="Fitness Upto" type="date" value={doc.fit} onChange={e => setDoc(p => ({ ...p, fit: e.target.value }))} />
              <Select label="Duplicate Key" value={doc.key} onChange={e => setDoc(p => ({ ...p, key: e.target.value }))}><option value="">Select</option>{['Yes', 'No'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="BS / Euro Rating" value={doc.bs} onChange={e => setDoc(p => ({ ...p, bs: e.target.value }))}><option value="">Select</option>{['BS VI', 'BS IV', 'BS III'].map(o => <option key={o}>{o}</option>)}</Select>
              <Select label="Chassis Embossing" value={doc.chassis} onChange={e => setDoc(p => ({ ...p, chassis: e.target.value }))}><option value="">Select</option>{['Ok', 'Tampered', 'Missing'].map(o => <option key={o}>{o}</option>)}</Select>
            </Grid>
            <SubSection>⚠️ Critical Vehicle Information</SubSection>
            <Grid cols={2}>
              {[['mig', 'Migration'], ['conv', 'Converted'], ['adapt', 'Adapted Vehicle'], ['black', 'Blacklisted']].map(([k, l]) => (
                <Select key={k} label={l} value={doc[k]} onChange={e => setDoc(p => ({ ...p, [k]: e.target.value }))}><option>No</option><option>Yes</option></Select>
              ))}
              {[['theft', 'Theft Cases'], ['fir', 'FIR Cases'], ['crim', 'Criminal Cases'], ['civil', 'Civil Cases'], ['acc', 'Road Accident Cases'], ['seize', 'Seized/Stolen Cases']].map(([k, l]) => (
                <Input key={k} label={l} type="number" value={doc[k]} onChange={e => setDoc(p => ({ ...p, [k]: e.target.value }))} />
              ))}
            </Grid>
          </Card>
          <NavBtns nextLabel="Next: Exterior →" />
        </div>}

        {/* TAB 2: Exterior */}
        {tab === 2 && <div className="fade-in">
          <Card>
            <SectionTitle icon="🏗️">Structure</SectionTitle>
            {STRUCT.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="🚗">Exterior Panels</SectionTitle>
            {EXT_PANELS.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="💡">Lights</SectionTitle>
            {LIGHTS.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="🪞">ORVM (Side Mirrors)</SectionTitle>
            {ORVM.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="⭕">Tyres</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {TYRES.map(t => {
                const mm = parseFloat(tyremm[t.id] || 0)
                const pct = Math.min(100, mm / 10 * 100)
                const barColor = pct >= 50 ? 'var(--green)' : pct >= 25 ? 'var(--orange)' : 'var(--red)'
                const phArr = (photos[t.id] || []).map(p => p.url)
                return (
                  <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 13, background: 'var(--card2)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 9 }}>⭕ {t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                      <input type="number" min="0" max="12" step="0.5" value={tyremm[t.id] || ''} onChange={e => setTyreMm(t.id, e.target.value)}
                        placeholder="mm" style={{ width: 75, padding: '6px 8px', border: '1px solid var(--border2)', borderRadius: 6, background: 'var(--card)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                      <span style={{ fontSize: 12, color: 'var(--sub)' }}>mm tread depth</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border2)', borderRadius: 3, marginBottom: 9 }}>
                      <div style={{ width: pct + '%', height: '100%', background: barColor, borderRadius: 3, transition: 'width .3s, background .3s' }} />
                    </div>
                    <PhotoSlots photos={phArr} max={2} onAdd={(url, file) => addPhoto(t.id, url, file)} onRemove={i => removePhoto(t.id, i)} />
                  </div>
                )
              })}
            </div>
          </Card>
          <NavBtns nextLabel="Next: Engine →" />
        </div>}

        {/* TAB 3: Engine */}
        {tab === 3 && <div className="fade-in">
          <Card>
            <SectionTitle icon="⚙️" right={engSc != null && <span style={{ background: engSc >= 7 ? 'var(--greenDim)' : 'var(--orangeDim)', color: engSc >= 7 ? 'var(--green)' : 'var(--orange)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>{engSc}/10</span>}>Engine & Transmission</SectionTitle>
            {ENGINE.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <NavBtns nextLabel="Next: AC & Electricals →" />
        </div>}

        {/* TAB 4: AC & Electricals */}
        {tab === 4 && <div className="fade-in">
          <Card>
            <SectionTitle icon="❄️">Air Conditioning</SectionTitle>
            {AC.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="⚡" right={acSc != null && <span style={{ background: 'var(--blueDim)', color: 'var(--blue)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>{acSc}/10</span>}>Electricals</SectionTitle>
            {ELEC.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <NavBtns nextLabel="Next: Interior →" />
        </div>}

        {/* TAB 5: Interior */}
        {tab === 5 && <div className="fade-in">
          <Card>
            <SectionTitle icon="🪑" right={intSc != null && <span style={{ background: intSc >= 7 ? 'var(--greenDim)' : 'var(--orangeDim)', color: intSc >= 7 ? 'var(--green)' : 'var(--orange)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>{intSc}/10</span>}>Seats</SectionTitle>
            {SEATS.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="🎛️">Dashboard & Controls</SectionTitle>
            {DASH_ITEMS.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="🏠">Interior Panels & Flooring</SectionTitle>
            {INT_PANELS.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <NavBtns nextLabel="Next: Steering →" />
        </div>}

        {/* TAB 6: Steering */}
        {tab === 6 && <div className="fade-in">
          <Card>
            <SectionTitle icon="🔧" right={stSc != null && <span style={{ background: 'var(--purpleDim)', color: 'var(--purple)', padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 800 }}>{stSc}/10</span>}>Steering, Suspension & Brakes</SectionTitle>
            {STEER.map(item => <PartRow key={item.id} item={item} />)}
          </Card>
          <Card>
            <SectionTitle icon="📝">Inspector Remarks</SectionTitle>
            <Textarea value={globalRemarks} onChange={e => setGlobalRemarks(e.target.value)} placeholder="Overall observations, repair recommendations…" style={{ minHeight: 90 }} />
          </Card>
          <NavBtns nextLabel="View Summary →" onNext={() => setTab(7)} />
        </div>}

        {/* TAB 7: Summary */}
        {tab === 7 && <div className="fade-in">
          {/* Overall Score */}
          <div style={{ background: 'linear-gradient(135deg, #0a0c16, #13152b)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 20px', marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 6 }}>Overall Score</div>
            <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, color: overall != null ? (overall >= 7 ? 'var(--green)' : overall >= 5 ? 'var(--orange)' : 'var(--red)') : 'var(--sub)' }}>
              {overall != null ? overall + '/10' : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 8 }}>{car.make} {car.model} {car.year} · {car.reg || 'No Reg'}</div>
          </div>

          {/* Score Rings */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <ScoreRing score={extSc} label="Exterior" />
            <ScoreRing score={engSc} label="Engine" />
            <ScoreRing score={acSc} label="AC/Elec" />
            <ScoreRing score={intSc} label="Interior" />
            <ScoreRing score={stSc} label="Steering" />
            <ScoreRing score={docRisk} max={100} label="Doc Risk" />
          </div>

          {/* Market Value */}
          <div style={{ background: 'linear-gradient(135deg, #0a0c16, #13152b)', border: '1px solid var(--gold)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--sub)', marginBottom: 12, fontWeight: 700 }}>💰 Market Value</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[{ l: 'Dealer Buy', v: mv.dealer, c: 'var(--red)' }, { l: 'Market Value', v: mv.market, c: 'var(--gold)' }, { l: 'Resale Value', v: mv.resale, c: 'var(--green)' }].map(item => (
                <div key={item.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: item.c }}>{fmtL(item.v)}</div>
                  <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: 3 }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Repair */}
          <Card style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--sub)' }}>Estimated Repair Cost</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 4, color: repair > 50000 ? 'var(--red)' : repair > 20000 ? 'var(--orange)' : 'var(--green)' }}>{fmtMoney(repair)}</div>
          </Card>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => setTab(6)} style={{ padding: '12px 16px', fontSize: 18 }}>←</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={genPDF}>📥 PDF</Btn>
            <Btn variant="ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => save('Draft')}>💾 Save</Btn>
            <Btn variant="green" style={{ flex: 1, justifyContent: 'center' }} onClick={() => save('Submitted')}>✅ Submit</Btn>
          </div>
        </div>}

      </div>

      {/* jsPDF CDN */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
    </div>
  )
}
