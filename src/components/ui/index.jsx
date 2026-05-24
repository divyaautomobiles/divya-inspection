import { useState, useRef } from 'react'
import { STATUS_CONFIG } from '../../lib/constants'

// ── Badge ──
export function Badge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: '#7a82a8', bg: '#1f223530' }
  return (
    <span style={{
      padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}44`, whiteSpace: 'nowrap'
    }}>{status}</span>
  )
}

// ── Button ──
export function Btn({ children, onClick, variant = 'gold', size = 'md', disabled, style, type = 'button' }) {
  const styles = {
    gold:   { background: 'linear-gradient(135deg, #ea580c, #f59e0b)', color: '#fff', border: 'none' },
    green:  { background: 'linear-gradient(135deg, #065f46, #10b981)', color: '#fff', border: 'none' },
    ghost:  { background: 'var(--card2)', color: 'var(--text2)', border: '1px solid var(--border2)' },
    red:    { background: 'var(--redDim)', color: 'var(--red)', border: '1px solid var(--red)' },
    purple: { background: 'var(--purpleDim)', color: 'var(--purple)', border: '1px solid var(--purple)' },
  }
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '10px 20px', fontSize: 13 },
    lg: { padding: '13px 28px', fontSize: 15 },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant], ...sizes[size],
      borderRadius: 'var(--rsm)', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 7, opacity: disabled ? 0.6 : 1,
      transition: 'all .15s', whiteSpace: 'nowrap', ...style,
    }}>{children}</button>
  )
}

// ── Card ──
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
      marginBottom: 12, boxShadow: 'var(--shadow2)', ...style
    }}>{children}</div>
  )
}

// ── Field ──
export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, letterSpacing: '.3px' }}>{label}</label>
      {children}
    </div>
  )
}

// ── Input ──
const inputStyle = {
  fontFamily: 'inherit', fontSize: 13, padding: '9px 11px',
  border: '1px solid var(--border2)', borderRadius: 'var(--rsm)',
  background: 'var(--card2)', color: 'var(--text)', width: '100%',
  outline: 'none', transition: 'border .15s',
}

export function Input({ label, ...props }) {
  const [focus, setFocus] = useState(false)
  if (label) return (
    <Field label={label}>
      <input {...props} style={{ ...inputStyle, borderColor: focus ? 'var(--gold)' : 'var(--border2)' }}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
    </Field>
  )
  return <input {...props} style={{ ...inputStyle, borderColor: focus ? 'var(--gold)' : 'var(--border2)', ...props.style }}
    onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
}

export function Select({ label, children, ...props }) {
  const [focus, setFocus] = useState(false)
  const el = (
    <select {...props} style={{ ...inputStyle, borderColor: focus ? 'var(--gold)' : 'var(--border2)', cursor: 'pointer' }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>
      {children}
    </select>
  )
  if (label) return <Field label={label}>{el}</Field>
  return el
}

export function Textarea({ label, ...props }) {
  const [focus, setFocus] = useState(false)
  const el = (
    <textarea {...props} style={{ ...inputStyle, borderColor: focus ? 'var(--gold)' : 'var(--border2)', resize: 'vertical', minHeight: 70, ...props.style }}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
  )
  if (label) return <Field label={label}>{el}</Field>
  return el
}

// ── Section Title ──
export function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.9px' }}>{children}</span>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  )
}

// ── SubSection ──
export function SubSection({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold)', margin: '14px 0 10px', padding: '6px 10px', background: '#1a1c2e', borderLeft: '3px solid var(--gold)', borderRadius: '0 6px 6px 0' }}>
      {children}
    </div>
  )
}

// ── Grid ──
export function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
      {children}
    </div>
  )
}

// ── Photo Slots ──
export function PhotoSlots({ photos = [], onAdd, onRemove, max = 3 }) {
  const ref = useRef()
  const pick = e => {
    Array.from(e.target.files).slice(0, max - photos.length).forEach(f => {
      onAdd(URL.createObjectURL(f), f)
    })
    e.target.value = ''
  }
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
      {photos.map((url, i) => (
        <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
          <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 9, border: '1px solid var(--border2)' }} />
          <button onClick={() => onRemove(i)} style={{ position: 'absolute', top: -5, right: -5, width: 19, height: 19, borderRadius: '50%', background: 'var(--red)', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, zIndex: 2 }}>×</button>
        </div>
      ))}
      {photos.length < max && (
        <div onClick={() => ref.current?.click()} style={{ width: 72, height: 72, border: '1.5px dashed var(--border2)', borderRadius: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--card)', gap: 3, transition: 'border-color .15s' }}>
          <span style={{ fontSize: 22 }}>📷</span>
          <span style={{ fontSize: 9, color: 'var(--sub)' }}>Add Photo</span>
          <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={pick} />
        </div>
      )}
    </div>
  )
}

// ── Video Upload ──
export function VideoUpload({ videoFile, onSet, label = 'Upload Video' }) {
  const ref = useRef()
  return (
    <div style={{ marginTop: 9 }}>
      <input ref={ref} type="file" accept="video/*" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) onSet(e.target.files[0]); e.target.value = '' }} />
      {videoFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--green)' }}>
          <span>✅</span>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {videoFile.name?.substring(0, 28)}…
          </span>
          <button onClick={() => onSet(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 16, fontWeight: 900 }}>×</button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1.5px dashed #3b82f6', borderRadius: 8, background: '#0f1f35', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          🎬 {label}
        </button>
      )}
    </div>
  )
}

// ── Rating Buttons ──
export function RatingBtns({ value, onChange }) {
  const opts = [
    { v: 'Good',    c: 'var(--green)'  },
    { v: 'Average', c: 'var(--orange)' },
    { v: 'Poor',    c: 'var(--red)'    },
    { v: 'N/A',     c: 'var(--sub)'    },
  ]
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
      {opts.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)} style={{
          border: `1.5px solid ${o.c}`, cursor: 'pointer', padding: '4px 12px',
          borderRadius: 6, fontSize: 11, fontWeight: 700, transition: 'all .15s',
          background: value === o.v ? o.c : 'transparent',
          color: value === o.v ? '#fff' : o.c,
        }}>{o.v}</button>
      ))}
    </div>
  )
}

// ── Score Ring ──
export function ScoreRing({ score, max = 10, label, size = 84 }) {
  const pct = score != null ? (max === 100 ? score : (score / max) * 100) : 0
  const clr = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--orange)' : score != null ? 'var(--red)' : 'var(--sub)'
  const r = 32, circ = 2 * Math.PI * r, dash = circ * pct / 100
  return (
    <div style={{ textAlign: 'center', width: size }}>
      <svg width={size} height={size} viewBox="0 0 72 72">
        <circle cx={36} cy={36} r={r} fill="none" stroke="var(--border2)" strokeWidth={5.5} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={clr} strokeWidth={5.5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray .6s ease' }} />
        <text x={36} y={36} textAnchor="middle" fontSize={11} fontWeight={800}
          fill={score != null ? clr : 'var(--sub)'} dy={4}>
          {score != null ? (max === 100 ? score + '%' : score + '/' + max) : '—'}
        </text>
      </svg>
      <div style={{ fontSize: 10, color: 'var(--sub)', marginTop: -3 }}>{label}</div>
    </div>
  )
}

// ── Stat Card ──
export function StatCard({ label, value, icon, color, sub, trend }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 18px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
        {trend && <div style={{ fontSize: 11, color: trend > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</div>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--sub)' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--sub)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

// ── Modal ──
export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9990, padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 16, padding: 24, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Loading Overlay ──
export function LoadingOverlay({ message = 'Loading…' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,12,22,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column', gap: 14 }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <div style={{ color: 'var(--sub)', fontSize: 14 }}>{message}</div>
    </div>
  )
}

// ── Empty State ──
export function EmptyState({ icon = '📋', title, sub, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sub)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginBottom: 16 }}>{sub}</div>}
      {action}
    </div>
  )
}
