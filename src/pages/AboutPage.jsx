import { ArrowRight, Mail, Phone, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export function AboutPage() {
  const [activeFaq, setActiveFaq] = useState(null)
  const [statsAnimated, setStatsAnimated] = useState(false)
  const statsRef = useRef(null)

  // Animate stats when they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsAnimated(true)
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const stats = [
    { label: 'Years on the court', value: statsAnimated ? '10+' : '0', suffix: '+' },
    { label: 'Players trained', value: statsAnimated ? '500+' : '0', suffix: '+' },
    { label: 'Products shipped', value: statsAnimated ? '200+' : '0', suffix: '+' },
    { label: 'Community members', value: statsAnimated ? '1K+' : '0', suffix: '+' },
  ]

  const faqs = [
    {
      q: 'Where is Bounce Academy based?',
      a: 'Manila, Philippines. We design and test everything on the outdoor courts across the city.',
    },
    {
      q: 'Do you ship nationwide?',
      a: 'Yes. We offer free nationwide shipping on orders over ₱3,000. Cash on Delivery is available.',
    },
    {
      q: 'Do you offer team or bulk orders?',
      a: 'Absolutely. Whether you need jerseys for a school team or gear for a barangay tournament, we can help. Email us at hello@bounceacademy.ph.',
    },
    {
      q: 'Do you offer training programs?',
      a: 'Yes. We run clinics, camps, and 1-on-1 coaching sessions. Visit the Training page to see upcoming programs.',
    },
  ]

  const team = [
    {
      name: 'Carlo Reyes',
      role: 'Founder & Head Coach',
      bio: 'Former collegiate player turned designer. Carlo started Bounce Academy after realizing there was no gear built for Filipino courts.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Maya Santos',
      role: 'Product Designer',
      bio: 'Maya leads product design, ensuring every piece of gear performs as good as it looks on and off the court.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Diego Lim',
      role: 'Training Lead',
      bio: 'Diego runs our training clinics and camps, helping players of all levels improve their game.',
      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
    },
  ]

  return (
    <div className="storefront">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="mr-2" />
            Established on Manila courts
          </div>
          <span className="eyebrow orange">About Bounce Academy</span>
          <h1>More than a game.<br /><span className="text-brand-500">It’s a movement.</span></h1>
          <p className="hero-lead">
            We’re a home for the next generation of Filipino basketball. Premium gear, honest pricing, and coaching that meets you where you are — on the court, the streets, and everywhere in between.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/shop">
              Shop the collection <ArrowRight size={15} />
            </Link>
            <Link className="button button-outline" to="/training">
              Explore training <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section stats-section" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#f5f5f6' }}>
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '800px', margin: '0 auto' }}>
          <span className="eyebrow orange">By the numbers</span>
          <h2>Numbers that tell our story.</h2>
        </div>
        <div className="stats-grid" ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '16px', transition: 'transform 0.3s ease, box-shadow 0.3s ease', style: { transform: 'translateY(0)' } }}>
              <div className="stat-value" style={{ fontFamily: 'var(--display)', fontSize: '48px', fontWeight: 800, color: 'var(--ink)', marginBottom: '8px', letterSpacing: '-0.05em' }}>
                {statsAnimated ? stat.value : '0'}{stat.suffix}
              </div>
              <div className="text-muted text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ORIGIN STORY ===== */}
      <section className="section" style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="story-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="story-visual" style={{ position: 'relative', height: '480px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div className="story-image-bg" style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, #f36b21 0%, #d95510 100%)',
              opacity: 0.7,
            }} />
            <div className="story-content" style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '40px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              color: 'white',
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              <div className="text-3xl font-black mb-2">THE COURT</div>
              <div className="text-sm opacity-80 uppercase tracking-widest">Where it all began</div>
            </div>
          </div>
          <div className="story-copy space-y-5">
            <span className="eyebrow orange inline-block mb-3">Our story</span>
            <h2 className="font-black text-4xl tracking-tight text-slate-950 mb-4">Built for Filipino courts.</h2>
            <p className="text-muted text-lg leading-relaxed mb-4">
              Bounce Academy started on the outdoor courts of Manila, where premium basketball gear was hard to find — and even harder to afford. We set out to change that, designing essentials engineered for Filipino players, priced for real life.
            </p>
            <p className="text-muted text-lg leading-relaxed mb-6">
              Every product is tested on the court before it ever reaches your hands. From varsity tees to court-ready footwear and training equipment, we believe in quality gear and honest pricing.
            </p>
            <div className="story-stats" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="stat-item" style={{ flex: 1, minWidth: '140px' }}>
                <div className="text-brand-500 font-black text-2xl">{ '10+' }</div>
                <div className="text-muted text-sm">Years of hustle</div>
              </div>
              <div className="stat-item" style={{ flex: 1, minWidth: '140px' }}>
                <div className="text-brand-500 font-black text-2xl">{ '500+' }</div>
                <div className="text-muted text-sm">Players coached</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TEAM ===== */}
      <section className="section" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#f5f5f6' }}>
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="eyebrow orange">Meet the team</span>
          <h2>The people behind the bounce.</h2>
        </div>
        <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {team.map((member, i) => (
            <div key={i} className="team-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.3s ease, box-shadow 0.3s ease', style: { transform: 'translateY(0)' } }}>
              <div className="team-image" style={{ height: '200px', background: '#e8e8e8', position: 'relative', overflow: 'hidden' }}>
                <img src={member.image} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                <div className="team-role-badge" style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {member.role}
                </div>
              </div>
              <div className="team-info" style={{ padding: '24px' }}>
                <h3 className="font-black text-slate-900 mb-1">{member.name}</h3>
                <div className="text-brand-500 text-sm font-semibold mb-3">{member.role}</div>
                <p className="text-muted text-sm leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== COMMUNITY GALLERY ===== */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="eyebrow orange">Community</span>
          <h2>The squad.</h2>
        </div>
        <div className="community-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { name: 'Manila Courts', desc: 'Saturday pickup games' },
            { name: 'Barangay League', desc: 'Weekly tournaments' },
            { name: 'School Clinics', desc: 'Youth development' },
            { name: 'Street Events', desc: 'Pop-up games' },
          ].map((item, i) => (
            <div key={i} className="community-card" style={{ position: 'relative', height: '200px', borderRadius: '12px', overflow: 'hidden', background: '#e8e8e8', cursor: 'pointer', transition: 'transform 0.3s ease' }}>
              <div className="community-overlay" style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                display: 'flex', alignItems: 'flex-end', padding: '16px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              }}>
                <div>
                  <div className="text-white font-bold">{item.name}</div>
                  <div className="text-brand-300 text-sm">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '100px', background: '#f5f5f6' }}>
        <div className="section-heading" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="eyebrow orange">Questions?</span>
          <h2>Frequently asked questions.</h2>
        </div>
        <div className="faq-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
              <button
                className="faq-question"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'color 0.2s ease',
                }}
              >
                <span className="font-semibold text-slate-900">{faq.q}</span>
                <span className={activeFaq === i ? 'text-brand-500' : 'text-muted'}>{activeFaq === i ? '▲' : '▼'}</span>
              </button>
              {activeFaq === i && (
                <div className="faq-answer" style={{ padding: '0 24px 20px', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="section newsletter-section" style={{ paddingTop: '80px', paddingBottom: '100px', background: '#f36b21' }}>
        <div className="newsletter-card" style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '24px', padding: '56px 40px', textAlign: 'center', color: 'white' }}>
          <span className="eyebrow orange text-brand-300">Stay in the loop</span>
          <h2 className="font-black text-3xl text-white mb-4">New drops, training tips, and court stories.</h2>
          <p className="text-brand-200 text-lg mb-6">No noise. Just the good stuff — straight to your inbox.</p>
          <form className="newsletter-form" style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto' }} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              style={{ flex: 1, padding: '14px 20px', borderRadius: '8px', border: 'none', fontSize: '14px', fontFamily: 'inherit' }}
              required
            />
            <button className="button button-primary" style={{ padding: '14px 28px', fontSize: '14px' }}>
              Join the squad <ArrowRight size={15} />
            </button>
          </form>
          <div className="social-links" style={{ marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a href="#" className="social-link" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(243,107,33,.15)', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s ease' }}>
              <Phone size={16} />
            </a>
            <a href="#" className="social-link" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(243,107,33,.15)', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s ease' }}>
              <Mail size={16} />
            </a>
            <a href="#" className="social-link" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(243,107,33,.15)', color: '#111111', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'transform 0.2s ease' }}>
              <MapPin size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}