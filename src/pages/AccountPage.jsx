import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SmartImage from '../components/ui/SmartImage.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { getOrdersByUser } from '../lib/db.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function AccountPage() {
  const { user, profile, logout } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [orders, setOrders] = useState([])

  const activeOrders = orders.filter((order) => String(order.status).toLowerCase() !== 'delivered')
  const deliveredOrders = orders.filter((order) => String(order.status).toLowerCase() === 'delivered')

  useEffect(() => {
    async function loadOrders() {
      if (!user) return

      try {
        const rows = await getOrdersByUser(user.id)
        setOrders(rows)
      } catch (error) {
        console.error(error)
      }
    }

    loadOrders()
  }, [user])

  async function handleLogout() {
    await logout()
    navigate('/auth')
  }

  async function handleOrderAgain(item) {
    if (!item?.products) return

    try {
      await addToCart(item.products, item.quantity, item.size || null, item.color || null)
      alert('Item added to cart.')
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className="page-shell space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Account</h1>

      {location.state?.orderSuccess ? (
        <div className="card border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          <p className="font-medium">Order placed successfully.</p>
          <p className="mt-1">
            {location.state?.orderId ? `Order #${location.state.orderId} ` : ''}
            {location.state?.orderTotal ? `for ${formatCurrency(location.state.orderTotal)} ` : ''}
            is now in your order history.
          </p>
        </div>
      ) : null}

      <section className="card">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <p>
            <span className="font-medium text-black">Name:</span> {profile?.full_name ?? '-'}
          </p>
          <p>
            <span className="font-medium text-black">Email:</span> {user?.email}
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="button-secondary mt-4">
          Logout
        </button>
      </section>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Orders</h2>

          {activeOrders.length === 0 ? <div className="card text-sm text-gray-600">No active orders.</div> : null}

          {activeOrders.map((order) => (
            <article key={order.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm font-medium">Total: {formatCurrency(order.total_price)}</p>

              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={item.products?.image_url}
                        alt={item.products?.name ?? 'Product image'}
                        className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                        loading="lazy"
                      />
                      <div>
                        <span>{item.products?.name ?? 'Product'} x{item.quantity}</span>
                        {(item.size || item.color) ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.size ? <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] text-gray-700">Size: {item.size}</span> : null}
                            {item.color ? <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] text-gray-700">Color: {item.color}</span> : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Order History</h2>

          {deliveredOrders.length === 0 ? (
            <div className="card text-sm text-gray-600">No delivered orders yet.</div>
          ) : null}

          {deliveredOrders.map((order) => (
            <article key={order.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-600">Delivered on {formatDate(order.created_at)}</p>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm font-medium">Total: {formatCurrency(order.total_price)}</p>

              <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={item.products?.image_url}
                        alt={item.products?.name ?? 'Product image'}
                        className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                        loading="lazy"
                      />
                      <div>
                        <span>{item.products?.name ?? 'Product'} x{item.quantity}</span>
                        {(item.size || item.color) ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.size ? <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] text-gray-700">Size: {item.size}</span> : null}
                            {item.color ? <span className="rounded-full border border-gray-300 px-2 py-0.5 text-[11px] text-gray-700">Color: {item.color}</span> : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => handleOrderAgain(item)}
                        className="button-secondary px-3 py-1.5 text-xs"
                      >
                        Order Again
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
