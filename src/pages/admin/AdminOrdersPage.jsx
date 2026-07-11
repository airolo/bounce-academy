import { useEffect, useMemo, useState } from 'react'
import SmartImage from '../../components/ui/SmartImage.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { getAllOrders, updateOrderStatus } from '../../lib/db.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const statusOptions = ['pending', 'processing', 'shipped', 'delivered']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  async function loadOrders() {
    setIsLoading(true)
    try {
      const rows = await getAllOrders()
      setOrders(rows)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders().catch(console.error)
  }, [])

  const orderStats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((order) => String(order.status).toLowerCase() === 'pending').length
    const deliveredOrders = orders.filter((order) => String(order.status).toLowerCase() === 'delivered').length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0)

    return { totalOrders, pendingOrders, deliveredOrders, totalRevenue }
  }, [orders])

  const visibleOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = orders.filter((order) => {
      const shipping = order.shipping_details ?? {}
      const customerName = String(order.profiles?.full_name ?? order.profiles?.email ?? 'Unknown customer').toLowerCase()
      const address = String(shipping.address ?? '').toLowerCase()
      const contact = String(shipping.contactNumber ?? '').toLowerCase()
      const orderItemsText = (order.order_items ?? [])
        .map((item) => `${item.products?.name ?? ''} ${item.quantity} ${item.size ?? ''} ${item.color ?? ''}`)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [customerName, address, contact, orderItemsText, String(order.id)].join(' ').includes(normalizedSearch)

      const matchesStatus = statusFilter === 'All' || String(order.status).toLowerCase() === statusFilter

      return matchesSearch && matchesStatus
    })

    return [...filtered].sort((left, right) => {
      if (sortBy === 'total-desc') return Number(right.total_price) - Number(left.total_price)
      if (sortBy === 'total-asc') return Number(left.total_price) - Number(right.total_price)
      if (sortBy === 'status') return String(left.status).localeCompare(String(right.status))

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    })
  }, [orders, search, statusFilter, sortBy])

  async function handleChangeStatus(id, status) {
    await updateOrderStatus(id, status)
    loadOrders().catch(console.error)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track order status, review shipping details, and move orders forward faster.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`order-metric-${index}`} className="card space-y-3 p-4">
              <div className="h-3 w-20 rounded-full bg-gray-200" />
              <div className="h-8 w-16 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total orders</p>
            <p className="mt-2 text-2xl font-semibold">{orderStats.totalOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-semibold">{orderStats.pendingOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Delivered</p>
            <p className="mt-2 text-2xl font-semibold">{orderStats.deliveredOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Revenue</p>
            <p className="mt-2 text-2xl font-semibold">{formatCurrency(orderStats.totalRevenue)}</p>
          </div>
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))]">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Search</span>
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, address, or item"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Status</span>
          <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Sort</span>
          <select className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="status">Status</option>
            <option value="total-desc">Total: high to low</option>
            <option value="total-asc">Total: low to high</option>
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={`order-skeleton-${index}`} className="card space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-4 w-44 rounded-full bg-gray-200" />
                    <div className="h-4 w-36 rounded-full bg-gray-200" />
                    <div className="h-4 w-52 rounded-full bg-gray-200" />
                  </div>
                  <div className="h-8 w-24 rounded-full bg-gray-200" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="h-16 rounded-xl bg-gray-100" />
                  <div className="h-16 rounded-xl bg-gray-100" />
                  <div className="h-16 rounded-xl bg-gray-100" />
                </div>
              </article>
            ))}
          </div>
        ) : visibleOrders.length > 0 ? (
          visibleOrders.map((order) => {
            const shipping = order.shipping_details ?? {}
            const address = typeof shipping.address === 'string' ? shipping.address.trim() : ''
            const contactNumber = typeof shipping.contactNumber === 'string' ? shipping.contactNumber.trim() : ''
            const itemCount = (order.order_items ?? []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)

            return (
              <article key={order.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      Order #{order.id} · {formatDate(order.created_at)}
                    </p>
                    <p className="text-sm font-medium">
                      Customer: {order.profiles?.full_name ?? order.profiles?.email ?? 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-700">Address: {address || 'No address provided'}</p>
                    <p className="text-sm text-gray-700">Contact: {contactNumber || 'No contact number provided'}</p>
                    <p className="text-sm">Items: {itemCount}</p>
                    <p className="text-sm font-semibold">Total: {formatCurrency(order.total_price)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <select
                      value={order.status}
                      onChange={(event) => handleChangeStatus(order.id, event.target.value)}
                      className="input min-w-36"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-800">Ordered items</p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {order.order_items?.length ? (
                      order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
                          <SmartImage
                            src={item.products?.image_url}
                            alt={item.products?.name ?? 'Product'}
                            className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                            loading="lazy"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.products?.name ?? 'Product'}
                            </p>
                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-xs text-gray-500">
                              {item.size ? `Size: ${item.size}` : null}
                              {item.size && item.color ? ' · ' : null}
                              {item.color ? `Color: ${item.color}` : null}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">No order items found.</p>
                    )}
                  </div>
                </div>
              </article>
            )
          })
        ) : (
          <div className="card border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
            <p className="font-medium text-black">No orders match the current filters.</p>
            <p className="mt-1">Try resetting the filters to review the full order list.</p>
          </div>
        )}
      </div>
    </div>
  )
}
