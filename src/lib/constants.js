export const STRUCT = [
  { id: 'pillar_lhs_abc', name: 'Left Pillar (A, B, C)' },
  { id: 'pillar_rhs_ab', name: 'Right Pillar (A, B)' },
  { id: 'pillar_rhs_c', name: 'Right Pillar (C)' },
  { id: 'apron', name: 'Apron' },
  { id: 'boot_floor', name: 'Boot Floor' },
  { id: 'firewall', name: 'Firewall' },
  { id: 'cowl_top', name: 'Cowl Top' },
  { id: 'lower_cross', name: 'Lower Cross Member' },
  { id: 'upper_cross', name: 'Upper Cross Member (Bonnet Patti)' },
  { id: 'hl_support', name: 'Head Light Support' },
  { id: 'rad_support', name: 'Radiator Support' },
]

export const EXT_PANELS = [
  { id: 'bonnet', name: 'Bonnet / Hood' },
  { id: 'roof', name: 'Roof' },
  { id: 'windshield', name: 'Windshield' },
  { id: 'rear_glass', name: 'Rear Glass' },
  { id: 'dicky', name: 'Dicky Door / Boot Door' },
  { id: 'front_bumper', name: 'Front Bumper' },
  { id: 'rear_bumper', name: 'Rear Bumper' },
  { id: 'lhs_fd', name: 'Door — LHS Front' },
  { id: 'rhs_fd', name: 'Door — RHS Front' },
  { id: 'lhs_rd', name: 'Door — LHS Rear' },
  { id: 'rhs_rd', name: 'Door — RHS Rear' },
  { id: 'lhs_fender', name: 'Fender — LHS' },
  { id: 'rhs_fender', name: 'Fender — RHS' },
  { id: 'lhs_qp', name: 'Quarter Panel — LHS' },
  { id: 'rhs_qp', name: 'Quarter Panel — RHS' },
  { id: 'lhs_rb', name: 'Running Border — LHS' },
  { id: 'rhs_rb', name: 'Running Border — RHS' },
  { id: 'alloy', name: 'Alloy Wheel' },
]

export const LIGHTS = [
  { id: 'lhs_hl', name: 'LHS Headlight' },
  { id: 'rhs_hl', name: 'RHS Headlight' },
  { id: 'lhs_tl', name: 'LHS Taillight' },
  { id: 'rhs_tl', name: 'RHS Taillight' },
  { id: 'lhs_fog', name: 'LHS Fog Light' },
  { id: 'rhs_fog', name: 'RHS Fog Light' },
]

export const ORVM = [
  { id: 'lhs_orvm', name: 'ORVM — LHS (Manual / Electrical)' },
  { id: 'rhs_orvm', name: 'ORVM — RHS (Manual / Electrical)' },
]

export const TYRES = [
  { id: 'tyre_lf', name: 'LHS Front Tyre' },
  { id: 'tyre_rf', name: 'RHS Front Tyre' },
  { id: 'tyre_lr', name: 'LHS Rear Tyre' },
  { id: 'tyre_rr', name: 'RHS Rear Tyre' },
  { id: 'tyre_sp', name: 'Spare Tyre' },
]

export const ENGINE = [
  { id: 'engine', name: 'Engine Body', video: true },
  { id: 'battery', name: 'Battery' },
  { id: 'oil_dip', name: 'Engine Oil Level Dipstik' },
  { id: 'eng_oil', name: 'Engine Oil' },
  { id: 'coolant', name: 'Coolant' },
  { id: 'eng_mount', name: 'Engine Mounting' },
  { id: 'eng_sound', name: 'Engine Sound', video: true },
  { id: 'exhaust', name: 'Exhaust Smoke', video: true },
  { id: 'clutch', name: 'Clutch' },
  { id: 'gear', name: 'Gear Shifting' },
  { id: 'turbo', name: 'Turbo Charger' },
  { id: 'fuel_inj', name: 'Fuel Injector' },
  { id: 'mil', name: 'MIL / Check Engine Light' },
]

export const AC = [
  { id: 'ac_cool', name: 'AC Cooling' },
  { id: 'heater', name: 'Heater' },
  { id: 'climate', name: 'Climate Control AC' },
  { id: 'blower', name: 'Blower / Fan' },
]

export const ELEC = [
  { id: 'pw_no', name: 'No. of Power Windows', txt: true },
  { id: 'ab_no', name: 'No. of Airbags', txt: true },
  { id: 'pw_win', name: 'Power Windows', video: true },
  { id: 'airbag', name: 'Airbag Feature' },
  { id: 'music', name: 'Music System', video: true },
  { id: 'steer_au', name: 'Steering Mounted Audio' },
  { id: 'abs', name: 'ABS' },
  { id: 'rear_def', name: 'Rear Defogger' },
  { id: 'rev_cam', name: 'Reverse Camera', video: true },
  { id: 'park_sen', name: 'Parking Sensor' },
  { id: 'sunroof', name: 'Sunroof', video: true },
  { id: 'nav_chip', name: 'Navigation Chip' },
  { id: 'lock_sys', name: 'Lock System' },
  { id: 'odometer', name: 'Odometer' },
]

export const SEATS = [
  { id: 'drv_seat', name: 'Driver Seat', video: true },
  { id: 'row2_lhs', name: '2nd Row — LHS Seat', video: true },
  { id: 'row2_rhs', name: '2nd Row — RHS Seat' },
  { id: 'row2_mid', name: '2nd Row — Middle Seat' },
  { id: 'row3_lhs', name: '3rd Row — LHS Seat', video: true },
  { id: 'row3_rhs', name: '3rd Row — RHS Seat' },
  { id: 'leath_seat', name: 'Leather Seat Condition' },
  { id: 'fab_seat', name: 'Fabric Seat Condition' },
  { id: 'sbelt_f', name: 'Front Seatbelts' },
  { id: 'sbelt_r', name: 'Rear Seatbelts' },
]

export const DASH_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', video: true },
  { id: 'steer_whl', name: 'Steering Wheel' },
  { id: 'gear_knob', name: 'Gear Knob' },
  { id: 'handbrake', name: 'Handbrake' },
  { id: 'inst_clus', name: 'Instrument Cluster' },
  { id: 'infotn', name: 'Infotainment Screen' },
  { id: 'ac_vents', name: 'AC Vents & Controls' },
  { id: 'glove_box', name: 'Glove Box' },
  { id: 'sun_visor', name: 'Sun Visor' },
  { id: 'int_mirror', name: 'Interior Rear View Mirror' },
  { id: 'int_lights', name: 'Interior Lights' },
]

export const INT_PANELS = [
  { id: 'dtrim_lhf', name: 'Door Trim — LHS Front' },
  { id: 'dtrim_rhf', name: 'Door Trim — RHS Front' },
  { id: 'dtrim_lhr', name: 'Door Trim — LHS Rear' },
  { id: 'dtrim_rhr', name: 'Door Trim — RHS Rear' },
  { id: 'headliner', name: 'Headliner / Roof Lining' },
  { id: 'flooring', name: 'Flooring / Floor Carpet' },
  { id: 'floor_mats', name: 'Floor Mats' },
  { id: 'boot_carp', name: 'Boot / Dicky Carpet' },
  { id: 'pilr_trim', name: 'Pillar Trim (A, B, C)' },
]

export const STEER = [
  { id: 'steering', name: 'Steering' },
  { id: 'suspension', name: 'Suspension' },
  { id: 'brake', name: 'Brake' },
  { id: 'pow_steer', name: 'Power Steering' },
  { id: 'whl_align', name: 'Wheel Alignment' },
]

export const ALL_ITEMS = [
  ...STRUCT, ...EXT_PANELS, ...LIGHTS, ...ORVM,
  ...ENGINE, ...AC, ...ELEC, ...SEATS, ...DASH_ITEMS, ...INT_PANELS, ...STEER
]

export const STATUS_CONFIG = {
  Draft:             { color: '#8892aa', bg: '#1f223530', label: 'Draft' },
  Submitted:         { color: '#ea580c', bg: '#ea580c18', label: 'Submitted' },
  'Under Negotiation':{ color: '#8b5cf6', bg: '#8b5cf618', label: 'Negotiating' },
  Approved:          { color: '#16a34a', bg: '#16a34a18', label: 'Approved' },
  Purchased:         { color: '#16a34a', bg: '#16a34a28', label: 'Purchased' },
  Rejected:          { color: '#dc2626', bg: '#dc262618', label: 'Rejected' },
}

export function calcScore(items, ratings) {
  let g = 0, tot = 0
  items.filter(i => !i.txt).forEach(i => {
    const r = ratings[i.id]
    if (r && r !== 'N/A') { tot++; if (r === 'Good') g += 2; else if (r === 'Average') g += 1 }
  })
  return tot ? Math.round(g / (tot * 2) * 10) : null
}

export function calcMarketValue(year, odo, owners, overallScore) {
  if (!year || !odo) return { market: 0, dealer: 0, resale: 0 }
  const age = 2026 - parseInt(year)
  let base = 900000
  base *= Math.pow(0.85, age)
  base *= Math.max(0.5, 1 - (parseInt(odo) / 300000) * 0.45)
  const ow = owners || ''
  if (ow.includes('2nd')) base *= 0.93
  else if (ow.includes('3rd')) base *= 0.87
  else if (ow.includes('4th')) base *= 0.80
  const cf = overallScore ? 0.75 + (overallScore / 10) * 0.5 : 1
  base *= cf
  base = Math.round(base / 5000) * 5000
  return {
    market: base,
    dealer: Math.round(base * 0.82 / 5000) * 5000,
    resale: Math.round(base * 1.08 / 5000) * 5000,
  }
}

export function calcRepairCost(ratings) {
  let rep = 0
  ALL_ITEMS.filter(i => !i.txt).forEach(i => {
    const r = ratings[i.id]
    if (r === 'Poor') rep += 5000
    else if (r === 'Average') rep += 1200
  })
  return rep
}

export function calcDocRisk(doc) {
  let r = 0
  if (doc.rc && doc.rc !== 'Original') r += 15
  if (doc.ins === 'Expired') r += 25
  if (doc.hyp === 'Yes') r += 20
  if (doc.loan === 'Open') r += 15
  if (doc.black === 'Yes') r += 30
  if (parseInt(doc.theft) > 0) r += 20
  if (parseInt(doc.fir) > 0) r += 15
  if (doc.mig === 'Yes') r += 10
  return Math.min(100, r)
}

export const fmtMoney = n => n ? '₹' + Math.round(n).toLocaleString('en-IN') : '—'
export const fmtL = n => n ? '₹' + (n / 100000).toFixed(1) + 'L' : '—'
export const fmtDate = d => {
  if (!d) return '—'
  const dt = new Date(d)
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`
}

export const ALL_STATUSES = Object.keys(STATUS_CONFIG)
