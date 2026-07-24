import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { createOrder } from '../lib/db.js'
import { formatCurrency } from '../utils/format.js'

export default function CheckoutPage() {
  const { user, profile } = useAuth()
  const { items, removeItemsByKeys } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const selectedCartKeys = useMemo(() => {
    if (Array.isArray(location.state?.selectedCartKeys) && location.state.selectedCartKeys.length > 0) {
      return location.state.selectedCartKeys
    }

    return items.map((item) => item.cartKey)
  }, [items, location.state])

  const [form, setForm] = useState({
    address: '',
    contactNumber: '',
    paymentMethod: 'cod',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedItems = useMemo(
    () => items.filter((item) => selectedCartKeys.includes(item.cartKey)),
    [items, selectedCartKeys],
  )
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
    [selectedItems],
  )

  const total = useMemo(
    () => selectedSubtotal + (selectedItems.length > 0 ? 10 : 0),
    [selectedSubtotal, selectedItems.length],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (selectedItems.length === 0 || !user || isSubmitting) return

    if (!form.address.trim() || !form.contactNumber.trim()) {
      setErrorMessage('Please complete your address and contact number before placing the order.')
      return
    }

    setIsConfirmModalOpen(true)
  }

  async function handleConfirmOrder() {
    if (selectedItems.length === 0 || !user) return

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const order = await createOrder({
        userId: user.id,
        totalPrice: total,
        shipping: {
          fullName: profile?.full_name?.trim() || user?.email || 'N/A',
          address: form.address,
          contactNumber: form.contactNumber,
          paymentMethod: form.paymentMethod,
        },
        items: selectedItems,
      })

      setIsConfirmModalOpen(false)
      await removeItemsByKeys(selectedCartKeys)
      navigate('/account', { state: { orderSuccess: true, orderId: order.id, orderTotal: total } })
    } catch (error) {
      console.error(error)
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-shell space-y-5">
      <section className="card overflow-hidden border border-gray-200 p-0 shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="bg-black px-5 py-5 text-white sm:px-6">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">Checkout</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Review and confirm your order.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Make sure your delivery details are correct. Bounce Academy uses Cash on Delivery for a simple and secure purchase flow.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-5 text-sm sm:px-6">
            <div>
              <p className="text-gray-500">Items</p>
              <p className="mt-1 font-semibold text-black">{selectedItems.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Shipping fee</p>
              <p className="mt-1 font-semibold text-black">{formatCurrency(selectedItems.length > 0 ? 10 : 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Payment</p>
              <p className="mt-1 font-semibold text-black">COD</p>
            </div>
          </div>
        </div>
      </section>

      {selectedItems.length === 0 ? (
        <div className="card text-sm text-gray-600">
          No items selected for checkout. <Link to="/cart" className="underline">Return to cart</Link>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form className="card space-y-4" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold">Shipping details</h2>
          <p className="text-sm text-gray-600">Enter the address and phone number where your order should be delivered.</p>

          {[
            ['address', 'Address'],
            ['contactNumber', 'Contact number'],
          ].map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block text-gray-700">{label}</span>
              <input
                required
                value={form[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="input"
              />
            </label>
          ))}

          <div className="pt-2">
            <h3 className="text-sm font-medium">Payment method</h3>
            <label className="mt-2 inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={form.paymentMethod === 'cod'}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
              />
              Cash on Delivery (COD)
            </label>
            <p className="mt-2 text-xs text-gray-500">Payment is collected when your order arrives.</p>
          </div>

          <button type="submit" disabled={isSubmitting || selectedItems.length === 0} className="button-primary w-full disabled:opacity-60">
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>

        <aside className="card h-fit lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <p className="mt-1 text-sm text-gray-600">Double-check the items, sizes, and colors before confirming.</p>
          <div className="mt-3 space-y-3 text-sm">
            {selectedItems.map((item) => (
              <div key={item.cartKey} className="flex justify-between gap-3 rounded-lg border border-gray-200 p-3">
                <span className="text-gray-600">
                  <span className="block font-medium text-gray-900">{item.name} x{item.quantity}</span>
                  {item.size ? <span className="text-xs text-gray-500">Size: {item.size}</span> : null}
                  {item.color ? <span className="text-xs text-gray-500">Color: {item.color}</span> : null}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(selectedSubtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Shipping</span>
              <span>{formatCurrency(selectedItems.length > 0 ? 10 : 0)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>Payment</span>
              <span>COD</span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
            Need help before paying? Use the assistant or contact the owner from the footer.
          </div>
        </aside>
      </div>

      {isConfirmModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-order-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg"
          >
            <h2 id="confirm-order-title" className="text-lg font-semibold">
              Confirm COD order
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Please confirm your Cash on Delivery order total of <span className="font-semibold">{formatCurrency(total)}</span> before placing the order.
            </p>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm">
              <p className="font-medium text-black">Delivery to</p>
              <p className="mt-1 text-gray-600">{form.address.trim() || 'No address provided yet'}</p>
              <p className="mt-2 font-medium text-black">Contact number</p>
              <p className="mt-1 text-gray-600">{form.contactNumber.trim() || 'No contact number provided yet'}</p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="button-secondary flex-1"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-primary flex-1 disabled:opacity-60"
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing order...' : 'Confirm order'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
