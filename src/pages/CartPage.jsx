import { Minus, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProductSkeleton } from '../components/common/ProductSkeleton'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContextValue'
import { formatPrice } from '../data/mockStorefront'
import { loadCart, saveCart } from '../services/cartService'
import { selectSubtotal, useCartStore } from '../stores/cartStore'

export function CartPage() {
  const { user } = useAuth()
  const { items, hydrate, updateQuantity, removeItem } = useCartStore()
  const subtotal = useCartStore(selectSubtotal)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    loadCart(user.id).then((cart) => {
      const localItems = useCartStore.getState().items
      const merged = [...cart]
      localItems.forEach((localItem) => {
        if (!merged.some((item) => item.variantId === localItem.variantId)) merged.push(localItem)
      })
      hydrate(merged)
      setStatus('ready')
    }).catch((loadError) => { console.error('Unable to load cart.', loadError); setError('Your cart could not be loaded.'); setStatus('error') })
  }, [user, hydrate])

  useEffect(() => {
    if (status !== 'ready') return
    saveCart(user.id, items).catch((saveError) => { console.error('Unable to save cart.', saveError); setError('Your latest cart change could not be saved.') })
  }, [items, status, user.id])

  if (status === 'loading') return <div className="shop-state page-state"><div className="product-grid shop-grid">{Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}</div></div>
  if (status === 'error') return <div className="shop-state page-state"><p>{error}</p></div>

  return <div className="storefront cart-page"><section className="section"><span className="eyebrow orange">Your selection</span><h1>Shopping cart</h1>{error && <p className="form-error">{error}</p>}{!items.length ? <div className="shop-state"><h2>Your cart is empty</h2><p>Find something built for your next session.</p><Link className="button button-primary" to="/shop">Shop the collection</Link></div> : <div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-item" key={item.variantId}><img alt={item.productName} src={item.imageUrl} onError={(event) => { event.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'; } } /><div className="cart-item-copy"><Link to={`/shop/${item.productSlug}`}><h2>{item.productName}</h2></Link><p>{item.variantName} · {formatPrice(item.price)}</p><div className="quantity-control"><button aria-label={`Decrease ${item.productName}`} onClick={() => updateQuantity(item.variantId, item.quantity - 1)} type="button"><Minus size={14} /></button><span>{item.quantity}</span><button aria-label={`Increase ${item.productName}`} disabled={item.quantity >= item.stockQuantity} onClick={() => updateQuantity(item.variantId, item.quantity + 1)} type="button"><Plus size={14} /></button></div></div><strong>{formatPrice(item.price * item.quantity)}</strong><button aria-label={`Remove ${item.productName}`} className="remove-button" onClick={() => removeItem(item.variantId)} type="button"><Trash2 size={16} /></button></article>)}</div><aside className="cart-summary"><span className="eyebrow">Summary</span><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>Shipping is calculated from your delivery address at checkout.</p><Link className="button button-primary" to="/checkout">Proceed to checkout</Link></aside></div>}</section></div>
}
