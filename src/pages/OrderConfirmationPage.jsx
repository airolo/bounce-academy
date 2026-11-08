import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContextValue'
import { formatPrice } from '../data/mockStorefront'
import { loadOrder } from '../services/orderService'

export function OrderConfirmationPage() {
  const { user } = useAuth()
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { loadOrder(orderId, user.id).then(setOrder).catch((loadError) => { console.error('Unable to load order.', loadError); setError('This order could not be loaded.') }) }, [orderId, user.id])
  if (error) return <div className="shop-state page-state"><p>{error}</p></div>
  if (!order) return <div className="shop-state page-state"><p>Loading your order...</p></div>
  const address = order.shipping_address || {}
  const items = order.order_items || []
  return <div className="storefront confirmation-page"><section className="section"><span className="eyebrow orange">Order confirmed</span><h1>Thanks for your order.</h1><p className="confirmation-lead">Order {order.order_number} is now {order.status}.</p><div className="confirmation-grid"><section className="checkout-card"><h2>Order details</h2>{items.map((item) => <div className="checkout-item" key={item.sku || item.id}><span>{item.product_name || 'Item'} · {item.variant_name || ''} × {item.quantity}</span><strong>{formatPrice(item.line_total)}</strong></div>)}<div className="checkout-item"><span>Shipping fee</span><strong>{formatPrice(order.shipping_total)}</strong></div><div className="checkout-total"><span>Total</span><strong>{formatPrice(order.total)}</strong></div></section><section className="checkout-card"><h2>Delivery</h2><p>{address.recipient_name || ''}<br />{address.phone || ''}<br />{address.line1 || ''}{address.line2 && `, ${address.line2}`}<br />{address.city || ''}, {address.province || ''} {address.postal_code || ''}</p><p><strong>Payment:</strong> Cash on Delivery<br /><strong>Status:</strong> {order.status}</p></section></div><Link className="button button-primary" to="/shop">Continue shopping</Link></section></div>
}
