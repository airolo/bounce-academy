import { Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useCartStore } from '../stores/cartStore'
import { getProductBySlug } from '../services/productService'
import { formatPrice } from '../data/mockStorefront'

export function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [product, setProduct] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    getProductBySlug(slug).then((nextProduct) => {
      setProduct(nextProduct)
      setSelectedId(nextProduct?.variants.find((variant) => variant.available)?.id || nextProduct?.variants[0]?.id || '')
      setStatus(nextProduct ? 'ready' : 'missing')
    }).catch((loadError) => {
      console.error('Unable to load product.', loadError)
      setError('We could not load this product.')
      setStatus('error')
    })
  }, [slug])

  if (status === 'loading') return <div className="shop-state page-state"><LoadingSpinner /><p>Loading product...</p></div>
  if (status === 'missing') return <div className="shop-state page-state"><h2>Product not found</h2><Link className="button button-outline" to="/shop">Back to shop</Link></div>
  if (status === 'error') return <div className="shop-state page-state"><p>{error}</p><Link className="button button-outline" to="/shop">Back to shop</Link></div>

  const variant = product.variants.find((item) => item.id === selectedId)
  const canAdd = variant?.available && quantity <= variant.stockQuantity
  const addToCart = () => {
    if (!canAdd) return
    addItem({ variantId: variant.id, productId: product.id, productName: product.name, productSlug: product.slug, variantName: variant.name, sku: variant.sku, price: variant.price, stockQuantity: variant.stockQuantity, quantity, imageUrl: product.image })
    navigate('/cart')
  }

  return <div className="storefront product-page"><div className="product-detail"><div className="product-gallery">{product.images.length ? product.images.map((image) => <img alt={image.alt_text || product.name} key={image.id} src={image.url} onError={(event) => { event.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'; } } />) : <div className="image-placeholder">Bounce Academy</div>}</div><div className="product-copy"><Link className="back-link" to="/shop">← Back to shop</Link><span className="eyebrow orange">{product.category}</span><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)} <span>starting price</span></p><p className="detail-description">{product.description || 'Purpose-built performance gear for every session.'}</p><div className="variant-heading"><strong>Size / color</strong><span>{variant?.available ? `${variant.stockQuantity} available` : 'Out of stock'}</span></div><div className="variant-list">{product.variants.map((item) => <button className={selectedId === item.id ? 'selected' : ''} disabled={!item.available} key={item.id} onClick={() => { setSelectedId(item.id); setQuantity(1) }} type="button" title={!item.available ? 'Out of stock' : ''}>{item.name}{item.available && selectedId === item.id && <Check size={14} />}</button>)}</div><div className="quantity-row"><strong>Quantity</strong><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => value - 1)} type="button"><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={!variant?.available || quantity >= variant.stockQuantity} onClick={() => setQuantity((value) => value + 1)} type="button"><Plus size={14} /></button></div></div><button className="button button-primary add-button" disabled={!canAdd} onClick={addToCart} type="button"><ShoppingBag size={16} />{canAdd ? 'Add to cart' : 'Unavailable'}</button></div></div></div>
}

