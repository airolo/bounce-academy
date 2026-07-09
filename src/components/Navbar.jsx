import { Link, NavLink } from 'react-router-dom'
import { FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useCart } from '../contexts/CartContext.jsx'

export default function Navbar() {
  const { totalItems } = useCart()

  function navClassName({ isActive }) {
    return `transition ${isActive ? 'text-black font-medium' : 'text-gray-700 hover:text-black'}`
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-4 sm:px-6 lg:px-8">
        <div className="justify-self-start">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Bounce Academy
          </Link>
        </div>

        <nav className="hidden gap-8 text-sm md:flex">
           <NavLink to="/about" className={navClassName}>
            About
          </NavLink>
          <NavLink to="/shop" className={navClassName}>
            Shop
          </NavLink>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <NavLink to="/wishlist" className="rounded-xl border border-gray-300 p-2 transition hover:border-black">
            <FiHeart className="h-5 w-5" />
          </NavLink>

          <NavLink to="/cart" className="relative rounded-xl border border-gray-300 p-2 transition hover:border-black">
            <FiShoppingCart className="h-5 w-5" />
            {totalItems > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white">
                {totalItems}
              </span>
            ) : null}
          </NavLink>

          <NavLink to="/account" className="rounded-xl border border-gray-300 p-2 transition hover:border-black">
            <FiUser className="h-5 w-5" />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
