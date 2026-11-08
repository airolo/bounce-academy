import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { AuthLayout, FormAlert, FormField } from '../components/auth/AuthLayout'
import { forgotPasswordSchema } from '../schemas/auth'
import { supabase } from '../lib/supabase'

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit({ email }) {
    setServerError('')
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/reset-password` })
    if (error) setServerError(error.message)
    else setSent(true)
  }

  return (
    <AuthLayout eyebrow="Account recovery" title="Forgot your password?" description="Enter your email and we’ll send you a secure reset link.">
      {sent ? <><div className="form-success">Check your inbox for a password reset link.</div><Link className="button button-outline auth-submit" to="/login">Back to sign in</Link></> : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {serverError && <FormAlert>{serverError}</FormAlert>}
          <FormField autoComplete="email" label="Email address" type="email" {...register('email')} error={errors.email?.message} />
          <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Sending...' : 'Send reset link'}</button>
        </form>
      )}
      {!sent && <div className="auth-switch"><Link to="/login">Back to sign in</Link></div>}
    </AuthLayout>
  )
}
