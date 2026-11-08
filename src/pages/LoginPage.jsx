import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AuthLayout, FormAlert, FormField } from '../components/auth/AuthLayout'
import { loginSchema } from '../schemas/auth'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContextValue'
import { useEffect, useState } from 'react'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, loading, isAdmin } = useAuth()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (!user || loading || !profile) return
    navigate(isAdmin ? '/admin' : (location.state?.from || '/account'), { replace: true })
  }, [isAdmin, loading, location.state, navigate, profile, user])

  async function onSubmit(values) {
    setServerError('')
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      setServerError('That email and password combination is not valid.')
      return
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Ready to bounce back in?" description="Sign in to manage your orders, training, and account.">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <FormAlert>{serverError}</FormAlert>}
        <FormField autoComplete="email" label="Email address" type="email" {...register('email')} error={errors.email?.message} />
        <FormField autoComplete="current-password" label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <div className="form-row-end"><Link to="/forgot-password">Forgot password?</Link></div>
        <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <div className="auth-switch">New to Bounce Academy? <Link to="/register">Create an account</Link></div>
    </AuthLayout>
  )
}
