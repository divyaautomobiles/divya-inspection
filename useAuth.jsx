import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user) }
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); fetchProfile(session.user) }
      else { setUser(null); setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(u) {
    setLoading(true)
    try {
      // Try users table first (your main table)
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', u.email)
        .single()

      if (userData && !userErr) {
        setProfile({
          id: u.id,
          name: userData.name || u.email?.split('@')[0] || 'User',
          role: userData.role || 'inspector',
          email: userData.email || u.email,
          phone: userData.phone || '',
          branch: userData.branch || '',
          avatar: (userData.name || u.email).charAt(0).toUpperCase(),
        })
        setLoading(false)
        return
      }
    } catch (e) { console.log('users table:', e.message) }

    try {
      // Try profiles table
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', u.email)
        .single()

      if (profData && !profErr) {
        setProfile({
          id: u.id,
          name: profData.name || u.email?.split('@')[0] || 'User',
          role: profData.role || 'inspector',
          email: profData.email || u.email,
          phone: profData.phone || '',
          branch: profData.branch || '',
          avatar: (profData.name || u.email).charAt(0).toUpperCase(),
        })
        setLoading(false)
        return
      }
    } catch (e) { console.log('profiles table:', e.message) }

    // Fallback
    setProfile({
      id: u.id,
      name: u.email?.split('@')[0] || 'User',
      role: 'inspector',
      email: u.email,
      phone: '', branch: '',
      avatar: (u.email || 'U').charAt(0).toUpperCase(),
    })
    setLoading(false)
  }

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setProfile(null) }
  const refetchProfile = () => { if (user) fetchProfile(user) }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
