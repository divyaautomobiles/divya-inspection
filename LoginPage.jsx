import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export function LoginPage() {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { setErr('Please enter email and password'); return }
    setLoading(true); setErr('')
    const { error } = await signIn(email, password)
    if (error) { setErr(error.message); setLoading(false); return }
    toast('Welcome back! 👋', 'success')
    navigate('/')
    setLoading(false)
  }

  const inp = {
    width: '100%', padding: '11px 14px',
    border: '1px solid #e2e8f0', borderRadius: 10,
    background: '#f8fafc', color: '#1e293b',
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>

      {/* BG circles */}
      <div style={{ position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #dbeafe 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -150, left: -150, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #fee2e2 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '14px 24px',
            display: 'inline-block',
            boxShadow: '0 4px 24px rgba(37,99,235,0.12)',
            border: '1px solid #dbeafe', marginBottom: 14,
          }}>
            <img
              src="/logo.png"
              alt="Divya Automobiles"
              style={{ width: 240, height: 72, objectFit: 'contain', display: 'block' }}
              onError={e => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'block'
              }}
            />
            <div style={{ display: 'none' }}>
              <div style={{ fontWeight: 900, fontSize: 22, color: '#dc2626', letterSpacing: 2 }}>DIVYA</div>
              <div style={{ fontWeight: 900, fontSize: 22, color: '#1e3a8a', letterSpacing: 2 }}>AUTOMOBILES</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Professional Vehicle Inspection System</div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #dbeafe', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 40px rgba(37,99,235,0.1)' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#1e293b', marginBottom: 24 }}>Sign In</div>

          {err && (
            <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 9, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
              ⚠️ {err}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inp} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 14, borderRadius: 12, border: 'none',
              background: '#1d4ed8', color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(29,78,216,0.3)',
            }}>
              {loading ? (
                <><div className="spinner" />Signing in…</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>ℹ️ Login Info</div>
            Use your Supabase credentials.<br />
            Create users: Supabase → Auth → Users
          </div>
        </div>
      </div>
    </div>
  )
}
