import { Link, useLocation } from 'react-router-dom'

const pageTitles = {
  '/shop': 'Shop',
  '/training': 'Training',
  '/announcements': 'Announcements',
}

export function FeaturePlaceholderPage() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] || 'This area'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-bold uppercase tracking-[0.2em] text-brand-500">Coming soon</p>
      <h1 className="mt-3 text-4xl font-black text-slate-950">{title}</h1>
      <p className="mt-3 max-w-md text-slate-600">This foundation is ready for the next Bounce Academy feature.</p>
      <Link className="mt-6 font-semibold text-brand-600 hover:text-brand-700" to="/">Return home</Link>
    </div>
  )
}
