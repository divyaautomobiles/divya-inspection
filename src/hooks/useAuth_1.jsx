import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, phone, branch, is_active')
        .eq('id', userId)
        .single()

      if (data && !error) {
        console.log('Profile loaded:', data.role) // debug
        setProfile(data)
      } else {
        // Profile nahi mili — auth user se fallback
        const { data: { user } } = await supabase.auth.getUser()
        setProfile({
          id: userId,
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          role: user?.user_metadata?.role || 'inspector',
          email: user?.email || '',
          phone: '',
          branch: '',
        })
      }
    } catch (e) {
      console.error('fetchProfile error:', e)
      setProfile(null)
    }
    setLoading(false)
  }

  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refetchProfile = () => {
    if (user?.id) fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
