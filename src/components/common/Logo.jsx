import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="text-xl font-black tracking-tight text-slate-950" to="/">
      BOUNCE <span className="text-brand-500">ACADEMY</span>
    </Link>
  )
}
