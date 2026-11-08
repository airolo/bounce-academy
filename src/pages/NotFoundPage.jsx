import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-bold text-brand-500">404</p>
      <h1 className="mt-2 text-4xl font-black text-slate-950">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you’re looking for doesn’t exist.</p>
      <Link className="mt-6 font-semibold text-brand-600 hover:text-brand-700" to="/">Return home</Link>
    </div>
  )
}
