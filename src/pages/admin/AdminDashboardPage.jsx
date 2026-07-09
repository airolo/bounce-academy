import { useEffect, useMemo, useState } from 'react'
import { getAllOrders, getProducts, getUsers } from '../../lib/db.js'
import { formatCurrency, formatDate } from '../../utils/format.js'
import { useAuth } from '../../contexts/AuthContext.jsx'
import {
  FiAlertCircle,
  FiBox,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi'

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered']
const statusStyles = {
  pending: 'bg-amber-500',
  processing: 'bg-sky-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!user?.id) {
      setProducts([])
      setOrders([])
      setUsers([])
      return
    }

    async function loadData() {
      const [productsResult, ordersResult, usersResult] = await Promise.allSettled([
        getProducts(),
        getAllOrders(),
        getUsers(),
      ])

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value)
      } else {
        console.error('Failed to load products for dashboard', productsResult.reason)
      }

      if (ordersResult.status === 'fulfilled') {
        setOrders(ordersResult.value)
      } else {
        console.error('Failed to load orders for dashboard', ordersResult.reason)
      }

      if (usersResult.status === 'fulfilled') {
        setUsers(usersResult.value)
      } else {
        console.error('Failed to load users for dashboard', usersResult.reason)
      }
    }

    loadData()
  }, [user?.id])

  const revenue = useMemo(
    () => orders.reduce((acc, order) => acc + Number(order.total_price ?? 0), 0),
    [orders],
  )

  const averageOrderValue = useMemo(() => {
    if (orders.length === 0) return 0
    return revenue / orders.length
  }, [orders.length, revenue])

  const statusCounts = useMemo(() => {
    return orderStatuses.reduce((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status).length
      return acc
    }, {})
  }, [orders])

  const deliveredRate = useMemo(() => {
    if (orders.length === 0) return 0
    return Math.round(((statusCounts.delivered ?? 0) / orders.length) * 100)
  }, [orders.length, statusCounts])

  const lowStockProducts = useMemo(
    () => products.filter((product) => Number(product.stock ?? 0) <= 5).slice(0, 5),
    [products],
  )

  const topProducts = useMemo(() => {
    const totalsByProductId = new Map()

    orders.forEach((order) => {
      order.order_items?.forEach((item) => {
        const key = item.product_id
        const current = totalsByProductId.get(key)

        if (current) {
          current.quantity += Number(item.quantity ?? 0)
          return
        }

        totalsByProductId.set(key, {
          productId: key,
          name: item.products?.name ?? `Product #${key}`,
          quantity: Number(item.quantity ?? 0),
        })
      })
    })

    return [...totalsByProductId.values()].sort((a, b) => b.quantity - a.quantity)
  }, [orders])

  const last7DaysRevenue = useMemo(() => {
    const result = []
    const today = new Date()

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today)
      date.setHours(0, 0, 0, 0)
      date.setDate(today.getDate() - i)

      const dayKey = date.toISOString().slice(0, 10)
      const total = orders
        .filter((order) => (order.created_at ?? '').slice(0, 10) === dayKey)
        .reduce((sum, order) => sum + Number(order.total_price ?? 0), 0)

      result.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        total,
      })
    }

    return result
  }, [orders])

  const maxRevenueDay = useMemo(
    () => Math.max(...last7DaysRevenue.map((entry) => entry.total), 1),
    [last7DaysRevenue],
  )

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Products</p>
            <FiBox className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{products.length}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Orders</p>
            <FiShoppingBag className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Users</p>
            <FiUsers className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{users.length}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Revenue</p>
            <FiDollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(revenue)}</p>
        </article>

        <article className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Avg order value</p>
            <FiTrendingUp className="h-4 w-4 text-gray-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(averageOrderValue)}</p>
          <p className="mt-1 text-xs text-gray-500">Delivered rate: {deliveredRate}%</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Revenue (Last 7 Days)</h2>
            <p className="text-xs text-gray-500">Daily gross sales</p>
          </div>

          <div className="grid grid-cols-7 items-end gap-2">
            {last7DaysRevenue.map((entry) => {
              const heightPercent = Math.max(Math.round((entry.total / maxRevenueDay) * 100), 6)

              return (
                <div key={entry.label} className="flex flex-col items-center gap-2">
                  <div className="h-28 w-full rounded-lg bg-gray-100 p-1">
                    <div
                      className="h-full w-full rounded-md bg-black/85"
                      style={{
                        transform: `scaleY(${heightPercent / 100})`,
                        transformOrigin: 'bottom',
                      }}
                      title={formatCurrency(entry.total)}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{entry.label}</p>
                </div>
              )
            })}
          </div>
        </article>

        <article className="card">
          <h2 className="text-lg font-semibold">Order Status</h2>
          <div className="mt-4 space-y-3">
            {orderStatuses.map((status) => {
              const count = statusCounts[status] ?? 0
              const width = orders.length > 0 ? Math.max(Math.round((count / orders.length) * 100), 4) : 0

              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div className={`h-2 rounded-full ${statusStyles[status]}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
            <FiPackage className="h-4 w-4 text-gray-500" />
          </div>

          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-600">No sales yet.</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {topProducts.map((product) => (
                <div key={product.productId} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-sm text-gray-700">{product.quantity} sold</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <p className="text-xs text-gray-500">{orders.length} total</p>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-600">No orders found.</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-gray-200 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">#{order.id}</p>
                    <span className="text-xs capitalize text-gray-600">{order.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.profiles?.full_name ?? order.profiles?.email ?? 'Unknown customer'}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(order.created_at)}</span>
                    <span className="text-sm font-semibold text-black">{formatCurrency(order.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Inventory Alerts</h2>
          <FiAlertCircle className="h-4 w-4 text-gray-500" />
        </div>

        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-gray-600">Inventory levels are healthy.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="rounded-xl border border-gray-200 px-3 py-2">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="mt-1 text-xs text-gray-500">Stock remaining</p>
                <p className="text-sm font-semibold text-red-600">{product.stock}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
