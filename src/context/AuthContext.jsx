import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone, avatar_url')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    setProfile(data)
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Unable to restore the Supabase session.', error)
      if (active) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (!nextSession) setProfile(null)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!session) return undefined
    // eslint-disable-next-line react/set-state-in-effect -- Async data fetch (profile load) requires setState in an effect; result cannot be derived during render.
    loadProfile(session.user.id)
      .catch((profileError) => {
        console.error('Unable to load the customer profile.', profileError)
        if (active) setProfile(null)
      })
    return () => { active = false }
  }, [session])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    refreshProfile: session ? () => loadProfile(session.user.id) : () => {},
    signOut: () => supabase.auth.signOut(),
  }), [loading, profile, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
