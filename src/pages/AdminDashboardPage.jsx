import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, BarChart3, Boxes, CalendarDays, Check, ChevronRight, CircleDollarSign, ClipboardList, ImagePlus, LayoutDashboard, LogOut, Menu, Package, Pencil, Plus, Search, Settings, Truck, Users, X } from 'lucide-react'
import { manageBooking } from '../services/trainingService'
import { saveCampaign, updateCampaignStatus } from '../services/campaignService'
import { archiveProduct, changeOrderStatus, loadAdminData, saveCategory, saveProduct, saveShippingRate, updateShippingRateStatus, uploadProductImage } from '../services/adminService'
import { productImageUrl } from '../services/productService'
import { useAuth } from '../context/AuthContextValue'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'campaigns', label: 'Campaigns', icon: BarChart3 },
  { id: 'shipping', label: 'Shipping', icon: Truck },
]
const orderStatuses = ['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled']
const emptyProduct = { name: '', slug: '', description: '', categoryId: '', variantName: '', sku: '', price: '', stockQuantity: '', isActive: true }
const emptyCategory = { name: '', slug: '', description: '', isActive: true }
const emptyShipping = { name: '', region: '', province: '', city: '', minOrderTotal: '0', rate: '', isActive: true }
const ORDER_PAGE_SIZE = 10
const PRODUCT_PAGE_SIZE = 10

const money = (value) => `₱${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Pagination({ page, pageCount, onChange, disabled }) {
  return (
    <div className="admin-pagination">
      <button disabled={disabled || page === 1} onClick={() => onChange(page - 1)} type="button">Previous</button>
      <span>Page {page} of {pageCount}</span>
      <button disabled={disabled || page >= pageCount} onClick={() => onChange(page + 1)} type="button">Next</button>
    </div>
  )
}
const date = (value) => value ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—'
const titleCase = (value) => value.charAt(0).toUpperCase() + value.slice(1)

function StatusBadge({ value }) {
  return <span className={`admin-status admin-status-${value}`}>{titleCase(value)}</span>
}

function StatCard({ label, value, detail, icon: Icon, tone = '', trend }) {
  return <article className={`admin-stat-card ${tone}`}><div className="admin-stat-icon"><Icon size={18} /></div><p>{label}</p><strong>{value}</strong><span>{detail}</span>{trend && <span className={`admin-stat-trend ${trend.tone}`}>{trend.text}</span>}</article>
}

function EmptyState({ children, actionLabel, onAction }) {
  return <div className="admin-empty-illustration"><Boxes size={40} /><p>{children}</p>{actionLabel && <div className="admin-empty-actions"><button className="button button-primary" onClick={onAction} type="button">{actionLabel}</button></div>}</div>
}

function AdminLoading() {
  return <div aria-label="Loading dashboard" className="admin-loading" role="status">
    <div className="admin-loading-heading"><div className="admin-skeleton admin-skeleton-label" /><div className="admin-skeleton admin-skeleton-title" /><div className="admin-skeleton admin-skeleton-copy" /></div>
    <div className="admin-loading-grid">{Array.from({ length: 7 }, (_, index) => <div className="admin-skeleton admin-skeleton-card" key={index} />)}</div>
    <div className="admin-loading-panels"><div className="admin-skeleton admin-skeleton-panel" /><div className="admin-skeleton admin-skeleton-panel" /></div>
    <p>Loading secure dashboard data...</p>
  </div>
}

export function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [orderSearch, setOrderSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState('all')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [productCategory, setProductCategory] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [orderPage, setOrderPage] = useState(1)
  const [productPage, setProductPage] = useState(1)
  const [orderDetail, setOrderDetail] = useState(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState(new Set())
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [orderDateRange, setOrderDateRange] = useState({ start: '', end: '' })
  const [metricsNow] = useState(() => new Date())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [shippingForm, setShippingForm] = useState(emptyShipping)
  const [campaignForm, setCampaignForm] = useState({ title: '', description: '', location: '', startsAt: '', endsAt: '', registrationDeadline: '', availableSlots: '', status: 'draft', imageUrl: '' })
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function refresh() {
    setLoading(true)
    setError('')
    try { setData(await loadAdminData()) } catch (loadError) { setError(loadError.message || 'Unable to load the administration dashboard.') } finally { setLoading(false) }
  }
  // eslint-disable-next-line react/set-state-in-effect -- Async data fetch requires setState in an effect; admin data cannot be derived during render.
  useEffect(() => { refresh() }, [])
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(''), 3200); return () => window.clearTimeout(timer) }, [toast])
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setProductModalOpen(false); setCategoryModalOpen(false) // eslint-disable-line react/set-state-in-effect -- Escape key closes modals; state update is triggered by user input, not render.
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    function onBeforeUnload(event) {
      if (dirty) {
        event.preventDefault()
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const metrics = useMemo(() => {
    if (!data) return {}
    const paidOrders = data.orders.filter((order) => order.status !== 'cancelled')
    const thirtyDaysAgo = new Date(metricsNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(metricsNow.getTime() - 60 * 24 * 60 * 60 * 1000)
    const currentPeriodOrders = data.orders.filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
    const previousPeriodOrders = data.orders.filter((o) => new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo)
    const currentRevenue = currentPeriodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    return {
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      revenueTrend: trendLabel(currentRevenue, previousRevenue),
      collected: data.orders.filter((order) => order.payment_status === 'paid').reduce((sum, order) => sum + Number(order.total || 0), 0),
      pendingOrders: data.orders.filter((order) => order.status === 'pending').length,
      completedOrders: data.orders.filter((order) => order.status === 'completed').length,
      pendingBookings: data.bookings.filter((booking) => booking.status === 'pending').length,
      activeProducts: data.products.filter((product) => product.is_active).length,
      lowStock: data.products.filter((product) => product.is_active && product.product_variants?.some((variant) => variant.is_active && variant.stock_quantity <= 5)).length,
      activeCampaigns: data.campaigns.filter((campaign) => ['upcoming', 'active'].includes(campaign.status) && !campaign.is_archived).length,
    }
  }, [data, metricsNow])

  function notify(message) { setToast(message); setError('') }
  async function action(callback, message) {
    setSaving(true); setError('')
    try { await callback(); await refresh(); notify(message) } catch (actionError) { setError(actionError.message || 'The operation could not be completed.') } finally { setSaving(false) }
  }

  function editProduct(product) {
    const variant = product.product_variants?.[0] || {}
    setProductForm({ id: product.id, name: product.name, slug: product.slug, description: product.description || '', categoryId: product.category_id || '', variantId: variant.id || '', variantName: variant.name || '', sku: variant.sku || '', price: variant.price ?? '', stockQuantity: variant.stock_quantity ?? '', isActive: product.is_active })
    setProductModalOpen(true)
    setActiveTab('products')
  }

  function editShipping(rate) {
    setShippingForm({ id: rate.id, name: rate.name, region: rate.region || '', province: rate.province || '', city: rate.city || '', minOrderTotal: rate.min_order_total, rate: rate.rate, isActive: rate.is_active })
    setActiveTab('shipping')
  }

  function editCategory(category) {
    setCategoryForm({ id: category.id, name: category.name, slug: category.slug, description: category.description || '', isActive: category.is_active })
    setEditingCategoryId(category.id)
    setCategoryModalOpen(true)
  }

  function toggleOrderSelection(orderId) {
    setSelectedOrders((current) => {
      const next = new Set(current)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  function selectAllOrders() {
    setSelectedOrders(new Set(paginatedOrders.map((o) => o.id)))
  }

  function clearOrderSelection() {
    setSelectedOrders(new Set())
  }

  async function bulkChangeStatus(status) {
    if (selectedOrders.size === 0) return
    if (!window.confirm(`Change status to ${titleCase(status)} for ${selectedOrders.size} order(s)?`)) return
    setDirty(true)
    try {
      await Promise.all([...selectedOrders].map((id) => changeOrderStatus(id, status)))
      await refresh()
      clearOrderSelection()
      notify(`Updated ${selectedOrders.size} order(s).`)
    } catch (error) {
      setError(error.message || 'Bulk status update failed.')
    }
  }

  async function bulkArchiveOrders() {
    if (selectedOrders.size === 0) return
    if (!window.confirm(`Archive ${selectedOrders.size} order(s)? This cannot be undone.`)) return
    setDirty(true)
    try {
      await Promise.all([...selectedOrders].map((id) => changeOrderStatus(id, 'cancelled')))
      await refresh()
      clearOrderSelection()
      notify(`Archived ${selectedOrders.size} order(s).`)
    } catch (error) {
      setError(error.message || 'Bulk archive failed.')
    }
  }

  function selectAllProducts() {
    setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)))
  }

  function clearProductSelection() {
    setSelectedProducts(new Set())
  }

  async function bulkArchiveProducts() {
    if (selectedProducts.size === 0) return
    if (!window.confirm(`Archive ${selectedProducts.size} product(s)? They will no longer be visible in the storefront.`)) return
    setDirty(true)
    try {
      await Promise.all([...selectedProducts].map((id) => archiveProduct(id)))
      await refresh()
      clearProductSelection()
      notify(`Archived ${selectedProducts.size} product(s).`)
    } catch (error) {
      setError(error.message || 'Bulk archive failed.')
    }
  }

  function exportCSV(filename, headers, rows) {
    const escapeCell = (cell) => {
      const s = String(cell == null ? '' : cell)
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    }
    const lines = [headers.join(','), ...rows.map((row) => row.map(escapeCell).join(','))]
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function trendLabel(current, previous) {
    if (previous === 0) return current > 0 ? { text: 'New', tone: 'up' } : { text: '—', tone: 'neutral' }
    const change = ((current - previous) / previous) * 100
    const abs = Math.abs(change)
    if (abs < 1) return { text: 'No change', tone: 'neutral' }
    return {
      text: `${change > 0 ? '+' : ''}${change.toFixed(0)}% vs prev`,
      tone: change > 0 ? 'up' : 'down',
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (signOutError) {
      setError(signOutError.message || 'Unable to sign out. Please try again.')
    }
  }

  if (loading && !data) return <AdminLoading />
  if (!data) return <section className="section admin-shell"><div className="admin-error-panel"><h1>Dashboard unavailable.</h1><p>{error}</p><button className="button button-primary" onClick={refresh} type="button">Try again</button></div></section>

  const visibleOrders = data.orders.filter((order) => {
    const matchesStatus = orderFilter === 'all' || order.status === orderFilter
    const matchesSearch = `${order.order_number} ${order.shipping_address?.recipient_name || ''}`.toLowerCase().includes(orderSearch.toLowerCase())
    const matchesDate = (!orderDateRange.start || new Date(order.created_at) >= new Date(orderDateRange.start)) && (!orderDateRange.end || new Date(order.created_at) <= new Date(orderDateRange.end))
    return matchesStatus && matchesSearch && matchesDate
  })
  const paginatedOrders = visibleOrders.slice((orderPage - 1) * ORDER_PAGE_SIZE, orderPage * ORDER_PAGE_SIZE)
  const orderPageCount = Math.max(1, Math.ceil(visibleOrders.length / ORDER_PAGE_SIZE))
  const visibleProducts = data.products.filter((product) => (productFilter === 'all' || (productFilter === 'active' ? product.is_active : !product.is_active)) && (productCategory === 'all' || product.category_id === productCategory) && `${product.name} ${product.slug}`.toLowerCase().includes(productSearch.toLowerCase()))
  const paginatedProducts = visibleProducts.slice((productPage - 1) * PRODUCT_PAGE_SIZE, productPage * PRODUCT_PAGE_SIZE)
  const productPageCount = Math.max(1, Math.ceil(visibleProducts.length / PRODUCT_PAGE_SIZE))
  const visibleBookings = data.bookings.filter((booking) => {
    const matchesStatus = bookingFilter === 'all' || booking.status === bookingFilter
    const matchesDate = (!bookingDateRange.start || new Date(booking.starts_at) >= new Date(bookingDateRange.start)) && (!bookingDateRange.end || new Date(booking.starts_at) <= new Date(bookingDateRange.end))
    return matchesStatus && matchesDate
  })

  return <div className="admin-shell">
    <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileNav ? 'is-open' : ''}`}>
      <div className="admin-brand"><span className="admin-brand-mark">BA</span><div><strong>BOUNCE</strong><span>ADMIN</span></div></div>
      <div className="admin-sidebar-label">Workspace</div>
      <nav>{tabs.map(({ id, label, icon: Icon }) => <button className={activeTab === id ? 'is-active' : ''} key={id} onClick={() => { setActiveTab(id); setMobileNav(false) }} type="button"><Icon size={17} />{label}</button>)}</nav>
      <div className="admin-sidebar-footer"><button className="admin-signout" onClick={handleSignOut} type="button"><LogOut size={14} /> Sign out</button><span><Settings size={14} /> Admin access verified</span></div>
    </aside>
    {mobileNav && <button aria-label="Close navigation" className="admin-nav-overlay" onClick={() => setMobileNav(false)} type="button" />}
    <main className="admin-main">
      <header className="admin-topbar"><button aria-label="Open navigation" className="admin-menu-button" onClick={() => setMobileNav(true)} type="button"><Menu size={20} /></button><button className="admin-sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Collapse navigation" type="button">{sidebarCollapsed ? '‹' : '›'}</button><div><span className="eyebrow orange">Bounce Academy</span><h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1></div><div className="admin-user"><span>Administrator</span><div>AD</div></div></header>
      {error && <div className="admin-alert"><X size={15} />{error}<button onClick={() => setError('')} type="button"><X size={14} /></button></div>}
      {toast && <div className="admin-toast"><Check size={15} />{toast}</div>}
      {activeTab === 'overview' && <Overview data={data} metrics={metrics} setActiveTab={setActiveTab} />}
      {activeTab === 'orders' && <section className="admin-content"><PageIntro eyebrow="Commerce" title="Orders" detail={`${visibleOrders.length} of ${data.orders.length} orders shown`} action={<div className="admin-page-actions"><button className="button button-outline admin-export-btn" onClick={() => exportCSV('orders.csv', ['Order #', 'Customer', 'Total', 'Status', 'Payment', 'Placed'], visibleOrders.map((o) => [o.order_number, o.shipping_address?.recipient_name || '', o.total, o.status, o.payment_method, o.created_at]))} type="button">Export CSV</button></div>} /><div className="admin-toolbar"><label className="admin-search"><Search size={16} /><input aria-label="Search orders" onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order number or customer" value={orderSearch} /></label><select aria-label="Filter orders" onChange={(event) => setOrderFilter(event.target.value)} value={orderFilter}><option value="all">All statuses</option>{orderStatuses.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}</select><div className="admin-date-range"><label>From</label><input type="date" onChange={(event) => setOrderDateRange({ ...orderDateRange, start: event.target.value })} value={orderDateRange.start} /><label>To</label><input type="date" onChange={(event) => setOrderDateRange({ ...orderDateRange, end: event.target.value })} value={orderDateRange.end} /></div></div><OrderTable orders={paginatedOrders} onStatus={(id, status) => action(() => changeOrderStatus(id, status), 'Order status updated.')} onViewDetail={(order) => { setOrderDetail(order); setOrderDetailOpen(true); }} selectedOrderIds={selectedOrders} onToggleSelection={toggleOrderSelection} onSelectAll={selectAllOrders} /><div className="admin-table-actions"><Pagination page={orderPage} pageCount={orderPageCount} onChange={setOrderPage} /></div>{selectedOrders.size > 0 && <div className="admin-bulk-actions"><span>{selectedOrders.size} selected</span><button className="button button-outline" onClick={() => bulkChangeStatus('paid')} type="button">Mark paid</button><button className="button button-outline" onClick={() => bulkChangeStatus('processing')} type="button">Processing</button><button className="button button-outline" onClick={() => bulkChangeStatus('shipped')} type="button">Shipped</button><button className="button button-outline" onClick={() => bulkChangeStatus('completed')} type="button">Completed</button><button className="button button-outline danger" onClick={bulkArchiveOrders} type="button">Archive selected</button><button className="button button-outline" onClick={clearOrderSelection} type="button">Clear selection</button></div>}</section>}
      {activeTab === 'products' && <section className="admin-content"><PageIntro eyebrow="Catalog" title="Products" detail={`${paginatedProducts.length} of ${data.products.length} products shown`} action={<div className="admin-page-actions"><button className="button button-outline admin-export-btn" onClick={() => exportCSV('products.csv', ['Name', 'Slug', 'Category', 'Variants', 'Inventory', 'Status'], visibleProducts.map((p) => [p.name, p.slug, p.categories?.name || 'Uncategorized', p.product_variants?.length || 0, (p.product_variants || []).reduce((sum, variant) => sum + variant.stock_quantity, 0), p.is_active ? 'Active' : 'Archived']))} type="button">Export CSV</button><button className="button button-outline" onClick={() => { setCategoryForm(emptyCategory); setDirty(false); setCategoryModalOpen(true) }} type="button"><Plus size={15} /> New category</button><button className="button button-primary" onClick={() => { setProductForm(emptyProduct); setDirty(false); setProductModalOpen(true) }} type="button"><Plus size={15} /> New product</button></div>} /><div className="admin-toolbar admin-products-toolbar"><label className="admin-search"><Search size={16} /><input aria-label="Search products" onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products" value={productSearch} /></label><div className="admin-product-filters"><select aria-label="Filter products by category" onChange={(event) => setProductCategory(event.target.value)} value={productCategory}><option value="all">All categories</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><select aria-label="Filter products by status" onChange={(event) => setProductFilter(event.target.value)} value={productFilter}><option value="all">All products</option><option value="active">Active only</option><option value="archived">Archived only</option></select></div></div><article className="admin-panel admin-products-panel"><div className="admin-panel-heading"><div><span className="eyebrow orange">Catalog inventory</span><h3>All products</h3></div><span className="admin-analytics-note">Edit details or archive items from the table</span></div><ProductTable products={paginatedProducts} onEdit={editProduct} onArchive={(id) => window.confirm('Archive this product? It will no longer be visible in the storefront.') && action(() => archiveProduct(id), 'Product archived.')} onSelectAll={selectAllProducts} selectedProductIds={selectedProducts} /></article>{selectedProducts.size > 0 && <div className="admin-bulk-product-bar"><span className="admin-bulk-product-info">{selectedProducts.size} selected</span><button className="button button-outline danger" onClick={bulkArchiveProducts} type="button">Archive selected</button><button className="button button-outline" onClick={clearProductSelection} type="button">Clear selection</button></div>}<div className="admin-table-actions"><Pagination page={productPage} pageCount={productPageCount} onChange={setProductPage} /></div><article className="admin-panel admin-categories-panel"><div className="admin-panel-heading"><div><span className="eyebrow orange">Categories</span><h3>Category management</h3></div></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Slug</th><th>Status</th><th /></tr></thead><tbody>{data.categories.map((category) => <tr key={category.id}><td><strong>{category.name}</strong></td><td><small>{category.slug}</small></td><td><StatusBadge value={category.is_active ? 'active' : 'archived'} /></td><td><button className="icon-action" onClick={() => editCategory(category)} title="Edit category" type="button"><Pencil size={15} /></button></td></tr>)}</tbody></table></div></article>{productModalOpen && <ProductEditor categories={data.categories} form={productForm} saving={saving} onChange={(values) => { setDirty(true); setProductForm(values); }} onClose={() => { setDirty(false); setProductModalOpen(false); }} onSave={(file) => action(async () => { const id = await saveProduct(productForm); if (file) await uploadProductImage(file, id); setProductForm(emptyProduct); setDirty(false); setProductModalOpen(false) }, 'Product saved.')} />}{categoryModalOpen && <CategoryEditor categories={data.categories} form={categoryForm} editingCategoryId={editingCategoryId} onChange={(values) => { setDirty(true); setCategoryForm(values); }} onClose={() => { setDirty(false); setEditingCategoryId(null); setCategoryModalOpen(false); }} onSave={() => action(async () => { await saveCategory(categoryForm); setCategoryForm(emptyCategory); setEditingCategoryId(null); setDirty(false); setCategoryModalOpen(false) }, 'Category saved.')} />}</section>}
      {activeTab === 'bookings' && <div className="admin-content">
  <PageIntro eyebrow="Training operations" title="Booking requests" detail={`${visibleBookings.length} booking requests`} />
  <div className="admin-toolbar"><select aria-label="Filter bookings" onChange={(event) => setBookingFilter(event.target.value)} value={bookingFilter}><option value="all">All statuses</option>{['pending', 'confirmed', 'completed', 'rejected', 'cancelled'].map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}</select></div>
  {bookingCalendarView ? <div className="admin-calendar-view"><h3>Booking calendar</h3><div className="admin-calendar-grid"><table><thead><tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr></thead><tbody><tr>{[]}</tr></tbody></table></div><div className="admin-empty-illustration" style={{ minHeight: 'auto', padding: '40px 0' }}><CalendarDays size={48} /><p>No bookings in this period.</p></div></div> : <BookingPanel bookings={visibleBookings} trainers={data.trainers} filter={bookingFilter} onFilter={setBookingFilter} onAction={(id, values) => action(() => manageBooking({ bookingId: id, ...values }), 'Booking updated.')} />}
</div>}
      {activeTab === 'campaigns' && <CampaignPanel campaigns={data.campaigns} form={campaignForm} onChange={(values) => { setDirty(true); setCampaignForm(values); }} onSave={() => action(() => saveCampaign(campaignForm), 'Campaign saved.')} onStatus={(id, status) => action(() => updateCampaignStatus(id, status), 'Campaign status updated.')} />}
      {activeTab === 'shipping' && <ShippingPanel rates={data.shippingRates} form={shippingForm} onChange={(values) => { setDirty(true); setShippingForm(values); }} onEdit={editShipping} onSave={() => action(async () => { await saveShippingRate(shippingForm); setShippingForm(emptyShipping); setDirty(false) }, 'Shipping rate saved.')} onToggle={(id, isActive) => action(() => updateShippingRateStatus(id, isActive), 'Shipping rate updated.')} />}
    {orderDetailOpen && orderDetail && <OrderDetail order={orderDetail} onClose={() => setOrderDetailOpen(false)} />}
    </main>
  </div>
}

function PageIntro({ eyebrow, title, detail, action }) {
  return <div className="admin-page-intro"><div><span className="eyebrow orange">{eyebrow}</span><h2>{title}</h2><p>{detail}</p></div>{action}</div>
}

function Overview({ data, metrics, setActiveTab }) {
  const topProducts = useMemo(() => {
    const totals = {}
    data.orders.forEach((order) => (order.order_items || []).forEach((item) => { totals[item.product_name] = (totals[item.product_name] || 0) + item.quantity }))
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [data.orders])

  const activities = useMemo(() => {
    const items = []
    data.orders.slice(0, 5).forEach((order) => {
      items.push({
        id: `order-${order.id}`,
        title: 'New order placed',
        subtitle: `Order #${order.order_number} · ${money(order.total)}`,
        time: order.created_at,
        avatar: order.shipping_address?.recipient_name?.charAt(0) || '?',
      })
    })
    data.bookings.slice(0, 5).forEach((booking) => {
      items.push({
        id: `booking-${booking.id}`,
        title: 'Booking requested',
        subtitle: `${booking.training_services?.name || 'Training session'} · ${booking.profiles?.full_name || 'Customer'}`,
        time: booking.starts_at,
        avatar: booking.profiles?.full_name?.charAt(0) || '?',
      })
    })
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8)
  }, [data.orders, data.bookings])

  const [now] = useState(() => new Date())
  return <section className="admin-content"><PageIntro eyebrow="Good morning" title="Command center" detail={`Live data as of ${new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(now)}`} /><div className="admin-stat-grid"><StatCard icon={CircleDollarSign} label="Order revenue" value={money(metrics.revenue)} detail={`Collected COD: ${money(metrics.collected)}`} tone="is-orange" trend={metrics.revenueTrend} /><StatCard icon={ClipboardList} label="Total orders" value={data.orders.length} detail={`${metrics.pendingOrders} pending`} /><StatCard icon={Check} label="Completed orders" value={metrics.completedOrders} detail="Fulfilled orders" /><StatCard icon={Users} label="Customers" value={data.customers.length} detail={`${data.bookings.length} total bookings`} /><StatCard icon={CalendarDays} label="Pending bookings" value={metrics.pendingBookings} detail="Requests to review" /><StatCard icon={Package} label="Active products" value={metrics.activeProducts} detail={`${metrics.lowStock} low stock`} /><StatCard icon={BarChart3} label="Active campaigns" value={metrics.activeCampaigns} detail="Upcoming or live" /></div><SalesAnalytics orders={data.orders} /><div className="admin-overview-grid"><article className="admin-panel admin-activity-feed"><div className="admin-panel-heading"><div><span className="eyebrow orange">Recent activity</span><h3>Latest updates</h3></div><button className="text-button" onClick={() => setActiveTab('orders')} type="button">View all <ChevronRight size={14} /></button></div><div className="admin-activity-list">{activities.length ? activities.map((activity) => <div key={activity.id} className="admin-activity-item"><div className="admin-activity-avatar">{activity.avatar}</div><div className="admin-activity-content"><strong>{activity.title}</strong><span>{activity.subtitle}</span></div><div className="admin-activity-time">{new Date(activity.time).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</div></div>) : <div className="admin-empty-illustration" style={{ minHeight: 'auto', padding: '20px 0' }}><Boxes size={32} /><p>No recent activity.</p></div>}</div></article><article className="admin-panel"><div className="admin-panel-heading"><div><span className="eyebrow orange">Product velocity</span><h3>Top-selling products</h3></div></div>{topProducts.length ? <ol className="admin-ranking">{topProducts.map(([name, count], index) => <li key={name}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><em>{count} sold</em></li>)}</ol> : <EmptyState>No order items have been sold yet.</EmptyState>}</article></div></section>
}

function SalesAnalytics({ orders }) {
  const revenueOrders = orders.filter((order) => order.status !== 'cancelled')
  const [now] = useState(() => new Date())
  const ranges = [
    { label: 'Daily', days: 1 },
    { label: 'Weekly', days: 7 },
    { label: 'Monthly', days: 30 },
  ].map((range) => ({
    ...range,
    revenue: revenueOrders.filter((order) => now - new Date(order.created_at) <= range.days * 86400000).reduce((sum, order) => sum + Number(order.total || 0), 0),
    orders: revenueOrders.filter((order) => now - new Date(order.created_at) <= range.days * 86400000).length,
  }))
  const distribution = orderStatuses.map((status) => ({ status, count: orders.filter((order) => order.status === status).length })).filter((item) => item.count)
  return <article className="admin-panel admin-analytics"><div className="admin-panel-heading"><div><span className="eyebrow orange">Sales analytics</span><h3>Revenue trends</h3></div><span className="admin-analytics-note">Order revenue · COD collected tracked separately</span></div><div className="admin-period-grid">{ranges.map((range) => <div key={range.label}><span>{range.label}</span><strong>{money(range.revenue)}</strong><small>{range.orders} orders</small></div>)}</div><div className="admin-distribution"><span>Order distribution</span><div>{distribution.length ? distribution.map((item) => <div key={item.status}><i style={{ width: `${Math.max(8, (item.count / orders.length) * 100)}%` }} /><small>{titleCase(item.status)} <b>{item.count}</b></small></div>) : <small>No orders yet.</small>}</div></div></article>
}

function OrderDetail({ order, onClose }) {
  const items = order.order_items || []
  return <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation"><section className="admin-modal" role="dialog"><div className="admin-modal-header"><div><span className="eyebrow orange">Order details</span><h2>Order #{order.order_number}</h2></div><button aria-label="Close order details" className="icon-action" onClick={onClose} type="button"><X size={19} /></button></div><div className="admin-form-grid"><label>Order number<strong>{order.order_number}</strong></label><label>Status<StatusBadge value={order.status} /></label><label>Placed<strong>{date(order.created_at)}</strong></label><label>Customer<strong>{order.shipping_address?.recipient_name || 'Customer'}</strong></label><label>Phone<strong>{order.shipping_address?.phone || '—'}</strong></label><label>Delivery address<strong>{order.shipping_address?.line1 || ''}{order.shipping_address?.line2 && `, ${order.shipping_address.line2}`}<br />{order.shipping_address?.city || ''}, {order.shipping_address?.province || ''} {order.shipping_address?.postal_code || ''}</strong></label><label>Payment<strong>{order.payment_method?.toUpperCase() || 'COD'}</strong></label><label>Payment status<strong>{order.payment_status}</strong></label></div><div style={{ margin: '1rem 1.5rem' }}><h3>Items ({items.length})</h3><table className="admin-table" style={{ marginTop: '0.5rem' }}><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>{items.map((item) => <tr key={item.sku || item.id}><td><strong>{item.product_name}</strong></td><td>{item.variant_name}</td><td>{item.quantity}</td><td>{money(item.unit_price)}</td><td>{money(item.line_total)}</td></tr>)}</tbody></table><div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}><div><strong>Subtotal:</strong> {money(order.subtotal)}</div><div style={{ marginLeft: '1rem' }}><strong>Shipping:</strong> {money(order.shipping_total)}</div><div style={{ marginLeft: '1rem', fontWeight: 'bold' }}><strong>Total:</strong> {money(order.total)}</div></div></div><div className="admin-form-actions" style={{ marginTop: '1rem' }}><button className="button button-outline" onClick={onClose} type="button">Close</button></div></section></div>
  }

function OrderTable({ orders, onStatus, compact = false, onViewDetail, selectedOrderIds, onToggleSelection, onSelectAll }) {
  if (!orders.length) return <EmptyState actionLabel="Clear filters" onAction={() => { setOrderSearch(''); setOrderFilter('all'); setOrderDateRange({ start: '', end: '' }); setOrderPage(1); }}>No orders match these filters.</EmptyState>
  return <div className={`admin-table-wrap ${compact ? 'is-compact' : ''}`}><table className="admin-table"><thead><tr><th style={{ width: '30px' }}><input type="checkbox" checked={selectedOrderIds.size === orders.length && orders.length > 0} onChange={onSelectAll} /></th><th>Order</th><th>Customer / destination</th><th>Total</th><th>Status</th><th>Placed</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td style={{ width: '30px' }}><input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => onToggleSelection(order.id)} /></td><td><strong>{order.order_number}</strong><small>{order.payment_method?.toUpperCase() || 'COD'} · {order.payment_status}</small></td><td>{order.shipping_address?.recipient_name || 'Customer'}<small>{order.shipping_address?.city || 'No city'}, {order.shipping_address?.province || ''}</small></td><td><strong>{money(order.total)}</strong><small>{order.order_items?.length || 0} line items</small></td><td><StatusBadge value={order.status} /></td><td>{date(order.created_at)}</td><td className="admin-kebab-menu"><button className="admin-kebab-button" aria-label="Actions" title="Actions">···</button><ul className="admin-kebab-dropdown">{onStatus && !['completed', 'cancelled'].includes(order.status) && orderStatuses.filter((status) => status !== order.status).map((status) => <li key={status}><button onClick={(event) => { event.stopPropagation(); if (status === 'cancelled' && !window.confirm(`Cancel order ${order.order_number}? This cannot be undone.`)) return; onStatus(order.id, status); }} type="button">{titleCase(status)}</button></li>)}</ul></td><td>{!compact && onViewDetail && <button className="icon-action" onClick={() => onViewDetail(order)} type="button" title="View details"><Archive size={13} /></button>}</td></tr>)}</tbody></table></div>
}

function ProductEditor({ categories, form, onChange, onSave, onClose, saving }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const update = (key, value) => onChange({ ...form, [key]: value })
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url) // eslint-disable-line react/set-state-in-effect -- Preview state set when file changes; required for image preview.
      return () => URL.revokeObjectURL(url)
    }
    setPreview(null) // eslint-disable-line react/set-state-in-effect -- Cleanup resets preview state when file changes.
  }, [file])
  return <div aria-labelledby="product-modal-title" className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }} role="presentation"><section aria-modal="true" className="admin-modal" role="dialog"><div className="admin-modal-header"><div><span className="eyebrow orange">Catalog</span><h2 id="product-modal-title">{form.id ? 'Edit product' : 'Create product'}</h2><p>{form.id ? 'Update product details, pricing and inventory.' : 'Add a new product to the storefront catalog.'}</p></div><button aria-label="Close product form" className="icon-action" disabled={saving} onClick={onClose} type="button"><X size={19} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave(file) }}><div className="admin-form-grid"><label>Product name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Slug<input required pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => update('slug', event.target.value)} /></label><label>Category<select value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Variant / size / color<input required value={form.variantName} onChange={(event) => update('variantName', event.target.value)} /></label><label>SKU<input required value={form.sku} onChange={(event) => update('sku', event.target.value)} /></label><label>Price<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => update('price', event.target.value)} /></label><label>Stock quantity<input required min="0" type="number" value={form.stockQuantity} onChange={(event) => update('stockQuantity', event.target.value)} /></label><label>Product image<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}><input accept="image/*" type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} /><small className="upload-hint"><ImagePlus size={13} /> {file ? file.name : 'Optional image upload'}</small>{preview && <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', border: '1px solid #e2e8f0', borderRadius: '6px' }} />}</div></label></div><label>Description<textarea rows="3" value={form.description} onChange={(event) => update('description', event.target.value)} /></label><div className="admin-form-actions"><label className="admin-checkbox"><input checked={form.isActive} type="checkbox" onChange={(event) => update('isActive', event.target.checked)} /> Active in storefront</label><div className="admin-modal-actions"><button className="button button-outline" disabled={saving} onClick={onClose} type="button">Cancel</button><button className="button button-primary" disabled={saving} type="submit">{saving ? 'Saving...' : form.id ? 'Save product' : 'Create product'}</button></div></div></form></section></div>
}

function ProductTable({ products, onEdit, onArchive, selectedProductIds, onSelectAll }) {
  if (!products.length) return <EmptyState actionLabel="Clear filters" onAction={() => { setProductSearch(''); setProductCategory('all'); setProductFilter('all'); setProductPage(1); }}>No products match this search.</EmptyState>
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th style={{ width: '30px' }}><input type="checkbox" checked={selectedProductIds.size === products.length && products.length > 0} onChange={onSelectAll} /></th><th>Product</th><th>Category</th><th>Variants</th><th>Inventory</th><th>Status</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td style={{ width: '30px' }}><input type="checkbox" checked={selectedProductIds.has(product.id)} onChange={() => toggleProductSelection(product.id)} /></td><td><div className="admin-product-cell">{product.product_images?.[0] && <img alt="" src={productImageUrl(product.product_images[0].storage_path)} />}<strong>{product.name}</strong></div><small>{product.slug}</small></td><td>{product.categories?.name || 'Uncategorized'}</td><td>{product.product_variants?.length || 0}</td><td>{(product.product_variants || []).reduce((sum, variant) => sum + variant.stock_quantity, 0)} units</td><td><StatusBadge value={product.is_active ? 'active' : 'archived'} /></td><td><button className="icon-action" onClick={() => onEdit(product)} title="Edit product" type="button"><Pencil size={15} /></button>{product.is_active && <button className="icon-action danger" onClick={() => onArchive(product.id)} title="Archive product" type="button"><Archive size={15} /></button>}</td></tr>)}</tbody></table></div>
}

function CategoryEditor({ categories, form, onChange, onSave, onClose, editingCategoryId }) {
  const update = (key, value) => onChange({ ...form, [key]: value })
  const isEditing = Boolean(editingCategoryId)
  return <div aria-labelledby="category-modal-title" className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }} role="presentation"><section aria-modal="true" className="admin-modal admin-category-modal" role="dialog"><div className="admin-modal-header"><div><span className="eyebrow orange">Catalog</span><h2 id="category-modal-title">{isEditing ? 'Edit category' : 'New category'}</h2><p>{isEditing ? 'Update category details.' : 'Create a category for organizing products.'}</p></div><button aria-label="Close category form" className="icon-action" onClick={onClose} type="button"><X size={19} /></button></div><form onSubmit={(event) => { event.preventDefault(); onSave() }}><div className="admin-form-grid"><label>Name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Slug<input required pattern="[a-z0-9-]+" value={form.slug} onChange={(event) => update('slug', event.target.value)} /></label><label>Description<input value={form.description} onChange={(event) => update('description', event.target.value)} /></label><label className="admin-checkbox"><input checked={form.isActive} type="checkbox" onChange={(event) => update('isActive', event.target.checked)} /> Active</label></div><div className="admin-form-actions"><span className="upload-hint">{categories.filter((category) => category.is_active).length} active categories</span><div className="admin-modal-actions"><button className="button button-outline" onClick={onClose} type="button">Cancel</button><button className="button button-primary" type="submit"><Plus size={15} /> {isEditing ? 'Save changes' : 'Create category'}</button></div></div></form></section></div>
}

function BookingPanel({ bookings, trainers, filter, onFilter, onAction }) {
  function hasConflict(booking) {
    return booking.trainer_id && bookings.some((other) => other.id !== booking.id && other.trainer_id === booking.trainer_id && new Date(booking.starts_at) < new Date(other.ends_at) && new Date(other.starts_at) < new Date(booking.ends_at))
  }
  return <section className="admin-content"><PageIntro eyebrow="Training operations" title="Booking requests" detail="Assign trainers and protect schedules from conflicts." /><div className="admin-toolbar"><select aria-label="Filter bookings" onChange={(event) => onFilter(event.target.value)} value={filter}><option value="all">All statuses</option>{['pending', 'confirmed', 'completed', 'rejected', 'cancelled'].map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}</select></div><div className="admin-booking-grid">{bookings.map((booking) => <article className="admin-booking-row" key={booking.id}><div><StatusBadge value={booking.status} /><h3>{booking.training_services?.name || 'Training service'}</h3><p>{booking.profiles?.full_name || 'Customer'} · {booking.profiles?.phone || 'No phone'}<br />{date(booking.starts_at)} · {booking.training_services?.duration_minutes || '—'} minutes</p>{booking.customer_notes && <small>Note: {booking.customer_notes}</small>}{hasConflict(booking) && <span className="conflict-warning">⚠ Schedule conflict with another booking for this trainer.</span>}</div><div className="admin-booking-actions"><select aria-label="Assign trainer" disabled={['completed', 'cancelled'].includes(booking.status) || hasConflict(booking)} onChange={(event) => { if (hasConflict(booking)) { if (window.confirm('This trainer has a scheduling conflict. Assign anyway?')) { onAction(booking.id, { trainerId: event.target.value }); } } else { onAction(booking.id, { trainerId: event.target.value }); } }} value={booking.trainer_id || ''}><option value="">Unassigned</option>{trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name}</option>)}</select>{booking.status === 'pending' && <div><button className="button button-primary" onClick={() => onAction(booking.id, { status: 'confirmed' })} type="button">Confirm</button><button className="button button-outline" onClick={() => onAction(booking.id, { status: 'rejected' })} type="button">Reject</button></div>}{booking.status === 'confirmed' && <button className="button button-primary" onClick={() => onAction(booking.id, { status: 'completed' })} type="button">Mark completed</button>}</div></article>)}{!bookings.length && <EmptyState>No booking requests match this filter.</EmptyState>}</div></section>
}

function CampaignPanel({ campaigns, form, onChange, onSave, onStatus }) {
  const update = (key, value) => onChange({ ...form, [key]: value })

  function validateDates() {
    if (form.status !== 'draft' && form.status !== 'cancelled') {
      if (!form.startsAt || !form.endsAt) {
        alert('Start date and end date are required for this status.')
        return false
      }
      if (new Date(form.endsAt) <= new Date(form.startsAt)) {
        alert('End date must be after the start date.')
        return false
      }
      if (form.registrationDeadline && new Date(form.registrationDeadline) > new Date(form.startsAt)) {
        alert('Registration deadline must be on or before the start date.')
        return false
      }
    }
    return true
  }

  return <section className="admin-content"><PageIntro eyebrow="Marketing" title="Campaigns" detail="Publish announcements and manage campaign dates." action={<Link className="button button-outline" to="/admin/announcements">Open full campaign editor <ChevronRight size={14} /></Link>} /><form className="admin-inline-form" onSubmit={(event) => { event.preventDefault(); if (!validateDates()) return; onSave() }}><input aria-label="Campaign title" placeholder="Campaign title" required value={form.title} onChange={(event) => update('title', event.target.value)} /><input aria-label="Description" placeholder="Description" required value={form.description} onChange={(event) => update('description', event.target.value)} /><input aria-label="Location" placeholder="Location" value={form.location} onChange={(event) => update('location', event.target.value)} /><input aria-label="Start date" required type="datetime-local" value={form.startsAt} onChange={(event) => update('startsAt', event.target.value)} /><input aria-label="End date" required type="datetime-local" value={form.endsAt} onChange={(event) => update('endsAt', event.target.value)} /><input aria-label="Registration deadline" type="datetime-local" value={form.registrationDeadline} onChange={(event) => update('registrationDeadline', event.target.value)} /><select aria-label="Campaign status" value={form.status} onChange={(event) => update('status', event.target.value)}><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><button className="button button-primary" type="submit"><Plus size={15} /> {form.id ? 'Save changes' : 'Create'}</button>{form.id && <button className="button button-outline" onClick={() => onChange({ title: '', description: '', location: '', startsAt: '', endsAt: '', registrationDeadline: '', availableSlots: '', status: 'draft', imageUrl: '' })} type="button">Cancel</button>}</form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Campaign</th><th>Dates</th><th>Status</th><th /></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.title}</strong><small>{campaign.is_archived ? 'Archived' : campaign.location || 'No location'}</small></td><td>{date(campaign.starts_at)}<small>to {date(campaign.ends_at)}</small></td><td><StatusBadge value={campaign.is_archived ? 'archived' : campaign.status} /></td><td>{!campaign.is_archived && campaign.status === 'draft' && <button className="text-button" onClick={() => onStatus(campaign.id, 'upcoming')} type="button">Publish</button>}{!campaign.is_archived && campaign.status === 'upcoming' && <button className="text-button" onClick={() => onStatus(campaign.id, 'active')} type="button">Activate</button>}{!campaign.is_archived && campaign.status === 'active' && <button className="text-button" onClick={() => onStatus(campaign.id, 'completed')} type="button">Mark completed</button>}{!campaign.is_archived && !['completed', 'cancelled'].includes(campaign.status) && <button className="text-button danger" onClick={() => onStatus(campaign.id, 'cancelled')} type="button">Cancel</button>}{!campaign.is_archived && <button className="text-button" onClick={() => { if (window.confirm('Archive this campaign? It will no longer be visible publicly.')) { onStatus(campaign.id, 'archived'); } }} type="button">Archive</button>}</td></tr>)}</tbody></table></div></section>
}

function ShippingPanel({ rates, form, onChange, onEdit, onSave, onToggle }) {
  const update = (key, value) => onChange({ ...form, [key]: value })
  return <section className="admin-content"><PageIntro eyebrow="Fulfillment" title="Shipping rates" detail="Configure regional, province and city-specific COD rates." /><form className="admin-editor shipping-editor"><div className="admin-form-grid"><label>Rate name<input required value={form.name} onChange={(event) => update('name', event.target.value)} /></label><label>Region<input placeholder="Optional" value={form.region} onChange={(event) => update('region', event.target.value)} /></label><label>Province<input placeholder="Optional" value={form.province} onChange={(event) => update('province', event.target.value)} /></label><label>City<input placeholder="Optional" value={form.city} onChange={(event) => update('city', event.target.value)} /></label><label>Minimum order<input min="0" step="0.01" type="number" value={form.minOrderTotal} onChange={(event) => update('minOrderTotal', event.target.value)} /></label><label>Rate<input required min="0" step="0.01" type="number" value={form.rate} onChange={(event) => update('rate', event.target.value)} /></label></div><div className="admin-form-actions"><button className="button button-primary" onClick={(event) => { event.preventDefault(); onSave() }} type="submit">{form.id ? 'Update rate' : 'Create rate'}</button>{form.id && <button className="button button-outline" onClick={() => onChange(emptyShipping)} type="button">Cancel</button>}</div></form><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rate</th><th>Coverage</th><th>Minimum</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{rates.map((rate) => <tr key={rate.id}><td><strong>{rate.name}</strong></td><td>{[rate.region, rate.province, rate.city].filter(Boolean).join(' / ') || 'All regions'}</td><td>{money(rate.min_order_total)}</td><td><strong>{money(rate.rate)}</strong></td><td><button className={`admin-toggle ${rate.is_active ? 'is-on' : ''}`} onClick={() => onToggle(rate.id, !rate.is_active)} type="button">{rate.is_active ? 'Active' : 'Inactive'}</button></td><td><button className="icon-action" onClick={() => onEdit(rate)} title="Edit rate" type="button"><Pencil size={15} /></button></td></tr>)}</tbody></table></div>{!rates.length && <EmptyState>No shipping rates configured.</EmptyState>}</section>
}


