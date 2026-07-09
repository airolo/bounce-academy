import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)
const REQUEST_TIMEOUT_MS = 12000

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // removed unused withTimeout helper

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Profile fetch exception:', error)
      return null
    }
  }, [])

  const ensureProfileForUser = useCallback(async (user) => {
    if (!user?.id) return null

    try {
      const existing = await fetchProfile(user.id)
      if (existing) return existing

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name ?? null,
        email: user.email ?? null,
      })

      if (error && error.code !== '23505') {
        console.error('Profile insert error:', error)
        return null
      }

      return fetchProfile(user.id)
    } catch (error) {
      console.error('Ensure profile exception:', error)
      return null
    }
  }, [fetchProfile])

  const refreshProfile = useCallback(async (userIdArg = null) => {
    let userId = userIdArg ?? session?.user?.id

    if (!userId) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      userId = authUser?.id ?? null
    }

    if (!userId) {
      setProfile(null)
      return null
    }

    const latestProfile = await fetchProfile(userId)
    setProfile(latestProfile)
    return latestProfile
  }, [session?.user?.id, fetchProfile])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(initialSession)

        if (mounted) setLoading(false)
      } catch (error) {
        console.error('Auth bootstrap failed:', error)
        if (mounted) setLoading(false)
      }
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      try {
        setSession(nextSession)
        if (mounted) setLoading(false)
      } catch (error) {
        console.error('Auth state change failed:', error)
        if (mounted) setLoading(false)
      }
    })

    const profileLoadTimer = setTimeout(() => {
      if (mounted && session?.user?.id) {
        ensureProfileForUser(session.user)
          .then((profile) => {
            if (mounted) setProfile(profile)
          })
          .catch((error) => console.error('Background profile load failed:', error))
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(profileLoadTimer)
      subscription.unsubscribe()
    }
  }, [session, ensureProfileForUser])

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  }

  async function register({ fullName, email, password }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
  }

  async function loginWithProvider(provider, redirectTo = '/') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(redirectTo)}`,
      },
    })

    if (error) throw error
  }

  async function logout() {
    // Clear local state first so protected routes immediately stop showing loading.
    setSession(null)
    setProfile(null)
    setLoading(false)

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      loading,
      isAdmin: profile?.role === 'admin',
      refreshProfile,
      login,
      register,
      loginWithProvider,
      logout,
    }),
    [session, profile, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
