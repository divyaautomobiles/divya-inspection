import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Btn } from '../ui'

export function LoginPage() {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email || !password) { toast('Please enter email and password', 'error'); return }
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) { toast(error.message, 'error'); setLoading(false); return }
    toast('Welcome back! 👋', 'success')
    navigate('/')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>

      {/* BG decoration */}
      <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, #f59e0b08 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, #ea580c08 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #ea580c, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: '0 8px 32px #f59e0b44' }}>🚗</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 2, lineHeight: 1, background: 'linear-gradient(135deg, #f59e0b, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>DIVYA</div>
              <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 2, lineHeight: 1, color: 'var(--text)' }}>AUTOMOBILES</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>Professional Vehicle Inspection System</div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '32px 28px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Sign In</div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border2)', borderRadius: 10, background: 'var(--card2)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, color: 'var(--sub)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '11px 14px', border: '1px solid var(--border2)', borderRadius: 10, background: 'var(--card2)', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none', fontFamily: 'inherit',
              background: 'linear-gradient(135deg, #ea580c, #f59e0b)', color: '#fff',
              fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: loading ? .7 : 1, boxShadow: '0 4px 24px #f59e0b44', transition: 'all .2s',
            }}>
              {loading ? <><div className="spinner" />Signing in…</> : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 14, background: 'var(--card2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, color: 'var(--sub)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: 'var(--text2)', marginBottom: 4 }}>ℹ️ Login Info</div>
            Use your Supabase user credentials.<br />
            Create users: Authentication → Users
          </div>
        </div>
      </div>
    </div>
  )
}
