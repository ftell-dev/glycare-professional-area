import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { hasSupabaseConfig, supabase } from './lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setInitializing(false)
      return undefined
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setProfile(null)
      setProfileError('')
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setProfileError('Não foi possível recuperar sua sessão.')
      setSession(data?.session ?? null)
      setInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!supabase || !userId) {
      setProfile(null)
      setProfileLoading(false)
      return undefined
    }

    let active = true
    setProfileLoading(true)
    setProfileError('')

    supabase
      .from('profiles')
      .select('id, full_name, profession, registration_type, registration_number, registration_state, status')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        setProfile(data)
        setProfileError(error ? 'Não foi possível carregar seu perfil profissional.' : '')
        setProfileLoading(false)
      })

    return () => {
      active = false
    }
  }, [session?.user?.id])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading: initializing || profileLoading,
    profileError,
    configured: hasSupabaseConfig,
  }), [session, profile, initializing, profileLoading, profileError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}