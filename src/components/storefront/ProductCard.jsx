import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../data/mockStorefront'

export function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link aria-label={`View ${product.name}`} to={product.slug ? `/shop/${product.slug}` : '/shop'}>
        <div className="product-image">
          <img alt={product.name} loading="lazy" src={product.image} onError={(event) => { event.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'; } } />
          {product.badge && <span className="product-badge">{product.badge}</span>}
        </div>
        <div className="product-info">
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <ArrowUpRight aria-hidden="true" size={16} />
          </div>
          <h3 className="product-name">{product.name}</h3>
          <div className="product-meta">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="availability">{product.inStock === false ? 'Sold out' : product.availability || 'In stock'}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
