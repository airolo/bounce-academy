import { Link } from 'react-router-dom'
import { Logo } from '../common/Logo'

export function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="auth-page">
      <div className="auth-panel">
        <Link className="auth-logo" to="/"><Logo /></Link>
        <div className="auth-heading">
          <span className="eyebrow orange">{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
      <div className="auth-visual"><span>OWN<br /><em>YOUR</em><br />BOUNCE.</span></div>
    </main>
  )
}

export function FormField({ label, error, ...props }) {
  const fieldId = props.id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label className="form-field" htmlFor={fieldId}>
      <span>{label}</span>
      <input id={fieldId} aria-invalid={Boolean(error)} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export function FormAlert({ children }) {
  return <div className="form-alert" role="alert">{children}</div>
}
