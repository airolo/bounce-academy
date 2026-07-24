import { Link } from 'react-router-dom'
import { FiFacebook, FiInstagram, FiMail, FiPhone } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="overflow-hidden rounded-3xl border border-black bg-black px-6 py-10 text-white sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/60">Bounce Academy</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Movement-ready essentials for every day.
          </h2>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Explore</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
            <Link to="/shop" className="transition hover:text-white">
              Shop all products
            </Link>
            <Link to="/wishlist" className="transition hover:text-white">
              Saved items
            </Link>
            <Link to="/cart" className="transition hover:text-white">
              Cart
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Account</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
            <Link to="/auth" className="transition hover:text-white">
              Sign in
            </Link>
            <Link to="/account" className="transition hover:text-white">
              My account
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">Connect</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
            <a href="mailto:info@bounceacademy.com" className="inline-flex items-center gap-2 transition hover:text-white">
              <FiMail size={16} />
              info@bounceacademy.com
            </a>
            <a href="tel:+1234567890" className="inline-flex items-center gap-2 transition hover:text-white">
              <FiPhone size={16} />
              0927 437 2354
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/50">© {new Date().getFullYear()} Bounce Academy. All rights reserved.</p>
          </div>
          <div className="flex gap-4 sm:gap-5">
            <a
              href="https://www.facebook.com/bounceacademynaga"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/60 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FiFacebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/bounce_academyph"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white/60 transition hover:border-white hover:bg-white/10 hover:text-white"
            >
              <FiInstagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}