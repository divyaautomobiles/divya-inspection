import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(u) {
    try {
      // Pehle profiles table se lo — yahan role sahi hoga
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()

      if (data && !error) {
        // Profile table mein jo role hai woh use karo
        setProfile({
          id:       data.id,
          name:     data.name     || u.email?.split('@')[0] || 'User',
          role:     data.role     || 'inspector',
          email:    data.email    || u.email,
          phone:    data.phone    || '',
          branch:   data.branch   || '',
          is_active: data.is_active !== false,
          created_at: data.created_at,
        })
        setLoading(false)
        return
      }
    } catch (e) {
      console.warn('Profile fetch error:', e.message)
    }

    // Fallback — profile table nahi mili to user_metadata se lo
    // Yeh sirf pehli baar hoga — profile table mein insert karo bhi
    const fallbackRole = u.user_metadata?.role || 'inspector'
    const fallbackName = u.user_metadata?.name || u.email?.split('@')[0] || 'User'

    const fallback = {
      id:     u.id,
      name:   fallbackName,
      role:   fallbackRole,
      email:  u.email,
      phone:  u.user_metadata?.phone || '',
      branch: u.user_metadata?.branch || '',
      is_active: true,
    }

    // Auto-create profile if missing
    try {
      await supabase.from('profiles').upsert({
        ...fallback,
        created_at: new Date().toISOString(),
      })
    } catch {}

    setProfile(fallback)
    setLoading(false)
  }

  async function signIn(email, password) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Admin panel se role update hone ke baad refresh karne ke liye
  async function refetchProfile() {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
