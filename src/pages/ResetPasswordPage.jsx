import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { AuthLayout, FormAlert, FormField } from '../components/auth/AuthLayout'
import { resetPasswordSchema } from '../schemas/auth'
import { supabase } from '../lib/supabase'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data?.session))).catch(() => setReady(false))
  }, [])

  async function onSubmit({ password }) {
    setServerError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setServerError(error.message)
    else navigate('/account', { replace: true })
  }

  return (
    <AuthLayout eyebrow="New password" title="Set a fresh password." description="Choose a strong password you’ll remember for your next session.">
      {!ready ? <FormAlert>This reset link is invalid or has expired. Request a new one to continue.</FormAlert> : (
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {serverError && <FormAlert>{serverError}</FormAlert>}
          <FormField autoComplete="new-password" label="New password" type="password" {...register('password')} error={errors.password?.message} />
          <FormField autoComplete="new-password" label="Confirm new password" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">{isSubmitting ? 'Updating...' : 'Update password'}</button>
        </form>
      )}
      <div className="auth-switch"><Link to="/login">Back to sign in</Link></div>
    </AuthLayout>
  )
}
