import { Link } from 'react-router-dom'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand"><div className="brand-mark">BOUNCE <span>ACADEMY</span></div><p>Elevate your game. Own your bounce. Premium basketball lifestyle from the Philippines.</p></div>
        <div><div className="footer-heading">Explore</div><div className="footer-links"><a href="/shop">Shop</a><a href="/training">Training</a><a href="/announcements">Announcements</a></div></div>
        <div><div className="footer-heading">About</div><div className="footer-links"><Link to="/about">Our story</Link><Link to="/#contact">Contact</Link><Link to="/#shipping">Shipping &amp; returns</Link></div></div>
        <div><div className="footer-heading">Follow along</div><div className="footer-links"><a href="#instagram">Instagram</a><a href="#facebook">Facebook</a><a href="#tiktok">TikTok</a></div></div>
      </div>
      <div className="footer-bottom"><span>© {currentYear} Bounce Academy. All rights reserved.</span><span>Made for the next generation of Filipino basketball.</span></div>
    </footer>
  )
}
