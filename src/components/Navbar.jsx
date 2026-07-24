import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiHeart, FiMenu, FiShoppingCart, FiUser, FiX } from 'react-icons/fi'
import { useCart } from '../contexts/CartContext.jsx'

const desktopNavLinks = [
  { to: '/about', label: 'About' },
  { to: '/shop', label: 'Shop' },
]

const quickLinks = [
  { to: '/wishlist', label: 'Wishlist', icon: FiHeart },
  { to: '/cart', label: 'Cart', icon: FiShoppingCart },
  { to: '/account', label: 'Account', icon: FiUser },
]

export default function Navbar() {
  const { totalItems } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function navClassName({ isActive }) {
    return `transition ${isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'}`
  }

  function closeMobileMenu() {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    if (!isMobileMenuOpen) return

    function onKeyDown(event) {
      if (event.key === 'Escape') closeMobileMenu()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
        <div className="justify-self-start">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Bounce Academy
          </Link>
        </div>

        <nav className="hidden gap-8 text-sm md:flex">
          {desktopNavLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClassName}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          {quickLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className="relative rounded-xl border border-gray-300 p-2 transition hover:border-black"
            >
              <Icon className="h-5 w-5" />
              {to === '/cart' && totalItems > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                  {totalItems}
                </span>
              ) : null}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="inline-flex rounded-xl border border-gray-300 p-2 transition hover:border-black md:hidden"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileMenu}
          />

          <aside className="absolute right-0 top-0 h-full w-[19rem] max-w-[90vw] border-l border-gray-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold tracking-tight">Menu</p>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex rounded-xl border border-gray-300 p-2 transition hover:border-black"
                aria-label="Close menu"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-6 space-y-2">
              {desktopNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block rounded-2xl border px-4 py-3 text-sm transition ${
                      isActive ? 'border-black bg-black text-white' : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-6 border-t border-gray-200 pt-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Quick links</p>
              <div className="mt-3 space-y-2">
                {quickLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-black hover:text-black"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {to === '/cart' && totalItems > 0 ? (
                      <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                        {totalItems}
                      </span>
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  )
}
