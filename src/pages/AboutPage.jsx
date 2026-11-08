import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div className="storefront">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow orange">About Bounce Academy</span>
          <h1>More than a game.</h1>
          <p>Bounce Academy is a home for the next generation of Filipino basketball. We make the gear, knowledge, and energy to help you show up as your best self — on the court, the streets, and everywhere in between.</p>
          <Link className="button button-primary" to="/shop">Shop the collection <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow orange">Our story</span>
            <h2>Built for the court.</h2>
          </div>
        </div>
        <div className="category-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <div>
            <h3 className="text-brand-600 font-semibold mb-2">Our roots</h3>
            <p>Bounce Academy started on the outdoor courts of Manila, where premium basketball gear was hard to find and even harder to afford. We set out to change that — designing essentials engineered for Filipino players, priced for real life.</p>
          </div>
          <div>
            <h3 className="text-brand-600 font-semibold mb-2">What we make</h3>
            <p>From everyday varsity tees to court-ready footwear and training equipment, every product is tested on the court before it ever reaches your hands. Quality gear, honest pricing.</p>
          </div>
          <div>
            <h3 className="text-brand-600 font-semibold mb-2">Bounce Academy Training</h3>
            <p>Beyond gear, we offer focused coaching programs — clinics, camps, and community runs built for the next generation of Filipino basketball. Book a session and train with purpose.</p>
          </div>
        </div>
      </section>

      <section className="section brand-section">
        <div className="brand-copy">
          <span className="eyebrow orange">Our promise</span>
          <h2>Quality you can trust.</h2>
          <p>Every item in our catalog is designed for performance and built to last. If something isn't right, our team is here to make it right.</p>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow orange">Get in touch</span>
            <h2>Contact us.</h2>
          </div>
        </div>
        <div className="category-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          <div>
            <strong>Email:</strong> hello@bounceacademy.ph
          </div>
          <div>
            <strong>Location:</strong> Manila, Philippines
          </div>
          <div>
            <strong>Shipping:</strong> Free nationwide on orders over ₱3,000
          </div>
          <div>
            <strong>Payment:</strong> Cash on Delivery available
          </div>
        </div>
        <div className="mt-8">
          <Link className="button button-primary" to="/shop">Start shopping <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  )
}
