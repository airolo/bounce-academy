import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from '../components/common/Logo'
import { selectItemCount, useCartStore } from '../stores/cartStore'
import { useAuth } from '../context/AuthContextValue'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Training', to: '/training' },
  { label: 'Announcements', to: '/announcements' },
]

export function Navbar() {
  const itemCount = useCartStore(selectItemCount)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)
  const navClassName = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`

  const openSearch = () => {
    navigate('/shop')
  }

  return (
    <header className="site-header">
      <div className="announcement-bar">Free shipping on orders over ₱3,000 nationwide</div>
      <div className="nav-shell">
        <Logo />
        <nav className="main-nav">
          {links.map((link) => <NavLink className={navClassName} end={link.to === '/'} key={link.to} onClick={closeMenu} to={link.to}>{link.label}</NavLink>)}
          {isAdmin && <NavLink className={navClassName} onClick={closeMenu} to="/admin/announcements">Admin</NavLink>}
        </nav>
        <div className="header-actions">
          <button aria-label="Search" className="icon-button" onClick={openSearch} type="button"><Search size={18} /></button>
          <NavLink aria-label="Account" className="icon-button account-action" to={user ? '/account' : '/login'}><UserRound size={18} /></NavLink>
          <NavLink aria-label="Shopping cart" className="icon-button" to="/cart">
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </NavLink>
          <button aria-expanded={isMenuOpen} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className="icon-button mobile-menu" onClick={() => setIsMenuOpen((open) => !open)} type="button"><Menu size={20} /></button>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className={`mobile-nav ${isMenuOpen ? 'is-open' : ''}`}>
        {links.map((link) => <NavLink className={navClassName} end={link.to === '/'} key={link.to} onClick={closeMenu} to={link.to}>{link.label}</NavLink>)}
        {isAdmin && <NavLink className={navClassName} onClick={closeMenu} to="/admin/announcements">Admin</NavLink>}
      </nav>
    </header>
  )
}
