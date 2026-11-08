import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { AuthLayout, FormAlert, FormField } from '../components/auth/AuthLayout'
import { registerSchema } from '../schemas/auth'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContextValue'

export function RegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [serverError, setServerError] = useState('')
  const [complete, setComplete] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  if (user) {
    navigate('/account', { replace: true })
    return null
  }

  async function onSubmit({ fullName, email, password }) {
    setServerError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error || data.user?.identities?.length === 0) {
      const message = error?.message || 'An account with this email already exists. Try signing in.'
      setServerError(message.toLowerCase().includes('already') ? 'An account with this email already exists. Try signing in.' : message)
      return
    }
    if (data.session) navigate('/account', { replace: true })
    else setComplete(true)
  }

  if (complete) {
    return (
      <AuthLayout eyebrow="One more step" title="Check your inbox." description="We sent a confirmation link to your email address. Confirm it to activate your Bounce Academy account.">
        <Link className="button button-primary auth-submit" to="/login">Back to sign in</Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout eyebrow="Join the academy" title="Build your next chapter." description="Create an account to shop, train, and keep your progress in one place.">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        {serverError && <FormAlert>{serverError}</FormAlert>}
        <FormField autoComplete="name" label="Full name" {...register('fullName')} error={errors.fullName?.message} />
        <FormField autoComplete="email" label="Email address" type="email" {...register('email')} error={errors.email?.message} />
        <FormField autoComplete="new-password" label="Password" type="password" {...register('password')} error={errors.password?.message} />
        <p className="password-hint">8+ characters, including uppercase, lowercase, and a number.</p>
        <FormField autoComplete="new-password" label="Confirm password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Creating account...' : 'Create account'}</button>
      </form>
      <div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div>
    </AuthLayout>
  )
}
