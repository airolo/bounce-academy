import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiFacebook } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function AuthPage() {
  const { login, register, loginWithProvider, refreshProfile, profile, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const searchParams = new URLSearchParams(location.search)
  const explicitRedirect =
    searchParams.get('next') ??
    (location.state?.from ? `${location.state.from.pathname}${location.state.from.search ?? ''}${location.state.from.hash ?? ''}` : null)

  useEffect(() => {
    if (authLoading || !user) return undefined

    let active = true

    async function redirectAuthenticatedUser() {
      if (explicitRedirect) {
        navigate(explicitRedirect, { replace: true })
        return
      }

      const latestProfile = profile ?? (await refreshProfile(user.id))
      if (!active) return

      navigate(latestProfile?.role === 'admin' ? '/admin/dashboard' : '/', { replace: true })
    }

    redirectAuthenticatedUser()

    return () => {
      active = false
    }
  }, [authLoading, user, profile, explicitRedirect, navigate, refreshProfile])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)

    try {
      if (mode === 'login') {
        const signedInUser = await login({ email: form.email, password: form.password })

        const latestProfile = await refreshProfile(signedInUser?.id)
        const fallback = latestProfile?.role === 'admin' ? '/admin/dashboard' : '/'
        navigate(explicitRedirect ?? fallback, { replace: true })
      } else {
        await register({ fullName: form.fullName, email: form.email, password: form.password })

        navigate(explicitRedirect ?? '/', { replace: true })
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuthLogin(provider) {
    setLoading(true)

    try {
      await loginWithProvider(provider, explicitRedirect ?? '/')
    } catch (error) {
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex min-h-[80vh] items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="mb-4 flex items-center justify-start">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 transition hover:border-black hover:text-black"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back </span>
          </button>
        </div>

        <div className="mb-5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Bounce Academy</h1>
          <p className="mt-1 text-sm text-gray-600">Sign in or create an account to continue.</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="block text-sm">
              <span className="mb-1 block text-gray-700">Full name</span>
              <input
                className="input"
                required
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
            </label>
          ) : null}

          <label className="block text-sm">
            <span className="mb-1 block text-gray-700">Email</span>
            <input
              className="input"
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-gray-700">Password</span>
            <input
              className="input"
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </label>

          <button type="submit" disabled={loading} className="button-primary w-full disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Or continue with</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuthLogin('google')}
            className="button-secondary w-full gap-2 disabled:opacity-60"
          >
            <FcGoogle size={18} />
            Google
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleOAuthLogin('facebook')}
            className="button-secondary w-full gap-2 disabled:opacity-60"
          >
            <FiFacebook size={18} className="text-blue-600" />
            Facebook
          </button>
        </div>

        <div className="mt-5 border-t border-gray-200 pt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => setMode('register')} className="font-medium text-black underline underline-offset-4">
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-medium text-black underline underline-offset-4">
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
