import { useEffect, useMemo, useState } from 'react'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContextValue'
import { formatPrice } from '../data/mockStorefront'
import { loadCart } from '../services/cartService'
import { createCodOrder } from '../services/orderService'
import { loadShippingRates, selectShippingRate } from '../services/shippingService'
import { selectSubtotal, useCartStore } from '../stores/cartStore'
import { supabase } from '../lib/supabase'

const methods = [{ id: 'cod', name: 'Cash on Delivery', description: 'Pay when your order arrives.' }, { id: 'gcash', name: 'GCash' }, { id: 'paypal', name: 'PayPal' }, { id: 'bank', name: 'Bank Transfer' }]

export function CheckoutPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, hydrate } = useCartStore()
  const subtotal = useCartStore(selectSubtotal)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [rates, setRates] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: 'Home', recipient_name: '', phone: '', line1: '', line2: '', city: '', province: '', region: '', postal_code: '' })

  useEffect(() => {
    Promise.all([
      loadCart(user.id),
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
      loadShippingRates(),
    ]).then(([cart, addressResult, loadedRates]) => {
      if (addressResult.error) throw addressResult.error
      hydrate(cart)
      setAddresses(addressResult.data || [])
      setAddressId(addressResult.data?.[0]?.id || '')
      setRates(loadedRates)
      setStatus('ready')
    }).catch((loadError) => { console.error('Unable to load checkout.', loadError); setError('Checkout could not be loaded.'); setStatus('error') })
  }, [hydrate, user.id])

  const address = addresses.find((entry) => entry.id === addressId)
  const shippingRate = useMemo(() => address && selectShippingRate(rates, address, subtotal), [address, rates, subtotal])
  function updateNewAddress(event) {
    setNewAddress((current) => ({ ...current, [event.target.name]: event.target.value }))
  }
  async function saveNewAddress(event) {
    event.preventDefault()
    setError('')
    const { data, error: addressError } = await supabase.from('addresses').insert({ ...newAddress, user_id: user.id }).select().single()
    if (addressError) { setError(addressError.message); return }
    setAddresses((current) => [...current, data])
    setAddressId(data.id)
    setShowAddressForm(false)
  }
  async function submitOrder(event) {
    event.preventDefault()
    if (submitting) return
    if (!address) return setError('Select a delivery address.')
    if (!shippingRate) return setError('Shipping is not available for this address.')
    setError(''); setSubmitting(true)
    try { const orderId = await createCodOrder(address, items, shippingRate.id); useCartStore.getState().clearCart(); navigate(`/orders/${orderId}`) }
    catch (submitError) { console.error('Unable to create order.', submitError); setError(submitError.message || 'Your order could not be created.'); setSubmitting(false) }
  }

  if (status === 'loading') return <div className="shop-state page-state"><LoadingSpinner /><p>Preparing checkout...</p></div>
  if (status === 'error') return <div className="shop-state page-state"><p>{error}</p></div>
  if (!items.length) return <div className="shop-state page-state"><h2>Your cart is empty</h2><Link className="button button-primary" to="/shop">Shop the collection</Link></div>

  return <div className="storefront checkout-page"><section className="section"><span className="eyebrow orange">Secure checkout</span><h1>Complete your order.</h1>{error && <p className="form-error">{error}</p>}<div className="checkout-layout"><div className="checkout-main"><section className="checkout-card"><div className="card-heading"><h2>1. Delivery address</h2><button className="text-button" onClick={() => setShowAddressForm(!showAddressForm)} type="button">{showAddressForm ? 'Cancel' : '+ Add address'}</button></div>{showAddressForm && <form className="address-form checkout-address-form" onSubmit={saveNewAddress}>{Object.entries({ label: 'Label', recipient_name: 'Recipient name', phone: 'Phone', line1: 'Address line', line2: 'Apartment, unit, etc.', city: 'City', province: 'Province', region: 'Region', postal_code: 'Postal code' }).map(([name, label]) => <label className="field" key={name}><span>{label}</span><input name={name} onChange={updateNewAddress} required={name !== 'line2'} value={newAddress[name]} /></label>)}<button className="button button-primary" type="submit">Save address</button></form>}{!addresses.length && !showAddressForm ? <p className="empty-state">Add a delivery address to continue.</p> : <div className="address-choice">{addresses.map((entry) => <label className={`address-option ${entry.id === addressId ? 'selected' : ''}`} key={entry.id}><input checked={entry.id === addressId} name="address" onChange={() => setAddressId(entry.id)} type="radio" value={entry.id} /><span><strong>{entry.label}</strong>{entry.is_default && <small>Default</small>}<br />{entry.recipient_name}, {entry.phone}<br />{entry.line1}{entry.line2 && `, ${entry.line2}`}<br />{entry.city}, {entry.province} {entry.postal_code}</span></label>)}</div>}</section><section className="checkout-card"><h2>2. Payment method</h2><div className="payment-options">{methods.map((method) => <label className={`payment-option ${method.id !== 'cod' ? 'disabled' : ''}`} key={method.id}><input checked={method.id === 'cod'} disabled={method.id !== 'cod'} name="payment" type="radio" value={method.id} readOnly /><span><strong>{method.name}</strong>{method.id !== 'cod' && <small>Coming soon</small>}<br />{method.description || 'Online payment is not available yet.'}</span></label>)}</div></section><section className="checkout-card"><h2>3. Review items</h2>{items.map((item) => <div className="checkout-item" key={item.variantId}><span>{item.productName} · {item.variantName} × {item.quantity}</span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</section></div><aside className="checkout-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><div><span>Shipping</span><strong>{shippingRate ? formatPrice(shippingRate.rate) : 'Unavailable'}</strong></div>{shippingRate && <p>{shippingRate.name}</p>}<div className="checkout-total"><span>Total</span><strong>{formatPrice(subtotal + Number(shippingRate?.rate || 0))}</strong></div><button className="button button-primary" disabled={submitting || !address || !shippingRate} onClick={submitOrder} type="button">{submitting ? 'Placing order...' : 'Confirm COD order'}</button></aside></div></section></div>
}
