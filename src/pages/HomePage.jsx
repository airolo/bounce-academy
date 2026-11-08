import { ArrowRight, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryCard } from '../components/storefront/CategoryCard'
import { ProductCard } from '../components/storefront/ProductCard'
import { ProductSkeleton } from '../components/common/ProductSkeleton'
import { categories } from '../data/mockStorefront'
import { CampaignCard } from '../components/campaigns/CampaignCard'
import { listCampaigns } from '../services/campaignService'
import { listProducts } from '../services/productService'

export function HomePage() {
  const [campaigns, setCampaigns] = useState([])
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(false)
  useEffect(() => {
    listCampaigns().then(setCampaigns).catch((error) => console.error('Unable to load homepage campaigns.', error))
    listProducts({ pageSize: 4 }).then(({ products: nextProducts }) => setProducts(nextProducts)).catch((error) => {
      console.error('Unable to load homepage products.', error)
      setProductsError(true)
    }).finally(() => setProductsLoading(false))
  }, [])
  const visibleCampaigns = campaigns.filter((campaign) => ['active', 'upcoming'].includes(campaign.status)).slice(0, 3)
  return (
    <div className="storefront">
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content">
          <span className="eyebrow orange">The 2025 court collection</span>
          <h1>Elevate your game. <br/> Own your bounce.</h1>
          <p>Premium essentials for the court, the streets, and everywhere your game takes you.</p>
          <Link className="button button-primary" to="/shop">Shop the collection <ArrowRight size={15} /></Link>
        </div>
        <span className="hero-caption">01 / New season — Manila, PH</span>
      </section>
      <section className="section">
        <div className="section-heading"><div><span className="eyebrow orange">Shop by category</span><h2>Built for every<br />part of your game.</h2></div><Link className="text-link" to="/shop">View all <ChevronRight size={14} /></Link></div>
        <div className="category-grid">{categories.map((category) => <CategoryCard category={category} key={category.name} />)}</div>
      </section>
      <section className="section products-section">
        <div className="section-heading"><div><span className="eyebrow orange">Fresh from the lab</span><h2>New arrivals.</h2></div><Link className="text-link" to="/shop">Shop all products <ChevronRight size={14} /></Link></div>
        {productsError ? <p className="form-error">We could not load new arrivals. Please visit the shop to try again.</p> : productsLoading ? <div className="product-grid">{Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}</div> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="empty-state">No new arrivals yet.</p>}
      </section>
      <section className="training-promo">
        <div className="training-copy"><span className="eyebrow orange">Bounce Academy Training</span><h2>Train smarter.<br />Play longer.</h2><p>Purpose-built programs, expert coaching, and a community that keeps you moving forward.</p><Link className="button button-primary" to="/training">Explore training <ArrowRight size={15} /></Link></div>
        <div className="training-image" />
      </section>
      {visibleCampaigns.length > 0 && <section className="section homepage-campaigns">
        <div className="section-heading"><div><span className="eyebrow orange">On the calendar</span><h2>Train together.<br />Move forward.</h2></div><Link className="text-link" to="/announcements">View all campaigns <ChevronRight size={14} /></Link></div>
        <div className="campaign-feature-grid">{visibleCampaigns.map((campaign) => <CampaignCard campaign={campaign} key={campaign.id} />)}</div>
      </section>}
      <section className="brand-section">
        <div className="brand-copy"><span className="eyebrow">Our story</span><h2>More than<br />a game.</h2><p>Bounce Academy is a home for the next generation of Filipino basketball. We make the gear, knowledge, and energy to help you show up as your best self.</p><Link className="button button-light" to="/about">About Bounce Academy <ArrowRight size={15} /></Link></div>
        <div className="brand-image" />
      </section>
      <section className="section newsletter"><span className="eyebrow orange">Stay in the loop</span><h2>Get the good stuff.</h2><p>New drops, training tips, and court stories. No noise.</p><form className="subscribe-form" onSubmit={(event) => event.preventDefault()}><input aria-label="Email address" placeholder="Your email address" required type="email" /><button className="button button-primary" type="submit">Subscribe</button></form></section>
    </div>
  )
}
