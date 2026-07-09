import { useState } from 'react'
import { FiBox, FiGrid, FiLogOut, FiMenu, FiShoppingBag, FiUsers, FiX } from 'react-icons/fi'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const adminLinks = [
  { to: '/admin/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/admin/products', icon: FiBox, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/auth')
  }

  function closeMobileNav() {
    setIsMobileNavOpen(false)
  }

  function renderNavLinks(onNavigate) {
    return adminLinks.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
            isActive ? 'border-black bg-black text-white' : 'border-gray-300 bg-white hover:border-black'
          }`
        }
      >
        <Icon className="h-4 w-4" />
        {label}
      </NavLink>
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <p className="text-base font-semibold">Bounce Admin</p>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 transition hover:border-black"
          aria-label="Open admin navigation"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </header>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobileNav} aria-hidden="true" />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-5 transition-transform md:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between md:block">
          <p className="text-lg font-semibold">Bounce Admin</p>
          <button
            type="button"
            onClick={closeMobileNav}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 transition hover:border-black md:hidden"
            aria-label="Close admin navigation"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">{renderNavLinks(closeMobileNav)}</nav>

        <button type="button" onClick={handleLogout} className="button-secondary mt-5 w-full gap-2">
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white p-5 md:flex">
        <p className="mb-8 text-lg font-semibold">Bounce Admin</p>

        <nav className="flex flex-1 flex-col gap-2">{renderNavLinks(undefined)}</nav>

        <button type="button" onClick={handleLogout} className="button-secondary mt-5 w-full gap-2">
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <main className="min-h-[calc(100vh-57px)] p-4 md:ml-64 md:min-h-screen md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
