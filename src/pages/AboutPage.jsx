import { ArrowRight, Clock, Users, Shield, Trophy, MapPin, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="storefront">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <span className="eyebrow orange">About Bounce Academy</span>
          <h1>More than a game.</h1>
          <p>Bounce Academy is a home for the next generation of Filipino basketball. We make the gear, knowledge, and energy to help you show up as your best self — on the court, the streets, and everywhere in between.</p>
          <Link className="button button-primary" to="/shop">Shop the collection <ArrowRight size={15} /></Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px', background: '#f5f5f6' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow orange">By the numbers</span>
            <h2>Built on community.</h2>
          </div>
        </div>
        <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div className="text-brand-500 font-black text-3xl mb-2">10+</div>
            <div className="text-muted text-sm uppercase tracking-wider">Years on the court</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div className="text-brand-500 font-black text-3xl mb-2">500+</div>
            <div className="text-muted text-sm uppercase tracking-wider">Players trained</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div className="text-brand-500 font-black text-3xl mb-2">200+</div>
            <div className="text-muted text-sm uppercase tracking-wider">Products shipped</div>
          </div>
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px' }}>
            <div className="text-brand-500 font-black text-3xl mb-2">1</div>
            <div className="text-muted text-sm uppercase tracking-wider">Community</div>
          </div>
        </div>
      </section>

      {/* Story Section - Two Column */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div className="story-image" style={{ 
            position: 'relative', 
            height: '400px', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            background: 'linear-gradient(135deg, #f36b21 0%, #d95510 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="text-4xl font-black mb-4">THE COURT</div>
              <div className="text-sm opacity-80 uppercase tracking-widest">Where it all began</div>
            </div>
          </div>
          <div className="space-y-6">
            <span className="eyebrow orange">Our story</span>
            <h2 className="font-black text-3xl tracking-tight text-slate-950 mb-4">Built for the court.</h2>
            <p className="text-muted text-lg leading-relaxed">
              Bounce Academy started on the outdoor courts of Manila, where premium basketball gear was hard to find — and even harder to afford. We set out to change that, designing essentials engineered for Filipino players, priced for real life.
            </p>
            <p className="text-muted text-lg leading-relaxed">
              Every product is tested on the court before it ever reaches your hands. From varsity tees to court-ready footwear and training equipment, we believe in quality gear and honest pricing.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="text-brand-500 mt-1" size={16} />
                <div>
                  <div className="font-semibold text-slate-900">Founded in Manila</div>
                  <div className="text-muted text-sm">Outdoor courts, real players</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="text-brand-500 mt-1" size={16} />
                <div>
                  <div className="font-semibold text-slate-900">Community-first</div>
                  <div className="text-muted text-sm">Training, clinics, and camps</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-brand-500 mt-1" size={16} />
                <div>
                  <div className="font-semibold text-slate-900">Quality guaranteed</div>
                  <div className="text-muted text-sm">Tested on the court, built to last</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px', background: '#f5f5f6' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow orange">Our promise</span>
            <h2>Quality you can trust.</h2>
          </div>
        </div>
        <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ padding: '32px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', textAlign: 'center' }}>
            <div className="text-brand-500 mb-4" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff1e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Trophy size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Performance tested</h3>
            <p className="text-muted text-sm">Every item is tested on the court before it reaches your hands.</p>
          </div>
          <div style={{ padding: '32px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', textAlign: 'center' }}>
            <div className="text-brand-500 mb-4" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff1e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Shield size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Built to last</h3>
            <p className="text-muted text-sm">Quality materials and honest construction, priced for real life.</p>
          </div>
          <div style={{ padding: '32px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: '12px', textAlign: 'center' }}>
            <div className="text-brand-500 mb-4" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff1e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Trophy size={20} />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Community focused</h3>
            <p className="text-muted text-sm">Training programs, clinics, and camps for the next generation.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section brand-section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="brand-copy" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <span className="eyebrow orange">Get in touch</span>
          <h2 className="font-black text-3xl tracking-tight text-slate-950 mb-4">Ready to bounce?</h2>
          <p className="text-muted text-lg mb-6">Have questions about our products, training programs, or wholesale inquiries? We'd love to hear from you.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Mail className="text-brand-500" size={16} />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Email</div>
                <div className="text-muted text-sm">hello@bounceacademy.ph</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Phone className="text-brand-500" size={16} />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Location</div>
                <div className="text-muted text-sm">Manila, Philippines</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MapPin className="text-brand-500" size={16} />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Shipping</div>
                <div className="text-muted text-sm">Free nationwide on orders over ₱3,000</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Trophy className="text-brand-500" size={16} />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Payment</div>
                <div className="text-muted text-sm">Cash on Delivery available</div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link className="button button-primary" to="/shop">Start shopping <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </div>
  )
}