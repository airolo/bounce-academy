import { useEffect, useMemo, useState } from 'react'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../lib/db.js'
import { formatCurrency } from '../../utils/format.js'

const categoryOptions = ['Hoodie', 'Shirt', 'Short']

function normalizeCategory(value) {
  const raw = String(value ?? '').trim().toLowerCase()
  if (raw === 'hoodie') return 'Hoodie'
  if (raw === 'shirt') return 'Shirt'
  if (raw === 'short') return 'Short'
  return 'Hoodie'
}

function parseSizes(value) {
  const parsed = String(value ?? '')
    .split(',')
    .map((size) => {
      const normalized = size.trim().toLowerCase()
      if (normalized === 'xs') return 'XS'
      if (normalized === 's') return 'S'
      if (normalized === 'm') return 'M'
      if (normalized === 'l') return 'L'
      if (normalized === 'xl') return 'XL'
      // legacy values: map freesize/oversize to the full set fallback
      if (normalized === 'freesize' || normalized === 'oversize') return ''
      return ''
    })
    .filter(Boolean)

  if (parsed.length === 0) return ['XS', 'S', 'M', 'L', 'XL']
  return [...new Set(parsed)]
}

const initialForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: 'Hoodie',
  sizes: 'XS, S, M, L, XL',
  colors: [],
  color_images: {},
  stock: '',
  is_featured: false,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const [colorImagePreviews, setColorImagePreviews] = useState({})

  async function loadProducts() {
    setIsLoading(true)
    try {
      const rows = await getProducts()
      setProducts(rows)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts().catch(console.error)
  }, [])

  const categoryOptionsWithAll = useMemo(() => ['All', ...categoryOptions], [])

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = products.filter((product) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [product.name, product.description, product.category, Array.isArray(product.colors) ? product.colors.join(' ') : '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter

      const stockValue = Number(product.stock || 0)
      const matchesStock =
        stockFilter === 'All' ||
        (stockFilter === 'Low' && stockValue <= 5) ||
        (stockFilter === 'Out' && stockValue === 0) ||
        (stockFilter === 'In' && stockValue > 0)

      return matchesSearch && matchesCategory && matchesStock
    })

    return [...filtered].sort((left, right) => {
      if (sortBy === 'price-asc') return Number(left.price) - Number(right.price)
      if (sortBy === 'price-desc') return Number(right.price) - Number(left.price)
      if (sortBy === 'stock') return Number(right.stock) - Number(left.stock)
      if (sortBy === 'name') return String(left.name).localeCompare(String(right.name))

      return Number(right.id) - Number(left.id)
    })
  }, [products, search, categoryFilter, stockFilter, sortBy])

  const productStats = useMemo(() => {
    const totalProducts = products.length
    const featuredProducts = products.filter((product) => product.is_featured).length
    const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 5).length
    const outOfStockProducts = products.filter((product) => Number(product.stock || 0) === 0).length

    return { totalProducts, featuredProducts, lowStockProducts, outOfStockProducts }
  }, [products])

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read image file.'))
      reader.readAsDataURL(file)
    })
  }

  function openCreateModal() {
    setEditingId(null)
    setForm(initialForm)
    setImageFile(null)
    setImagePreview('')
    setNewColorName('')
    setColorImagePreviews({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(initialForm)
    setImageFile(null)
    setImagePreview('')
    setNewColorName('')
    setColorImagePreviews({})
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      if (!editingId) setImagePreview('')
      return
    }

    const dataUrl = await fileToDataUrl(file)
    setImageFile(file)
    setImagePreview(dataUrl)
  }

  async function handleColorImageUpload(event, colorName) {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setForm((prev) => ({
      ...prev,
      color_images: {
        ...prev.color_images,
        [colorName]: dataUrl,
      },
    }))
    setColorImagePreviews((prev) => ({
      ...prev,
      [colorName]: dataUrl,
    }))
  }

  function handleAddColor() {
    const trimmedColor = newColorName.trim()
    if (!trimmedColor) {
      alert('Please enter a color name.')
      return
    }

    if (form.colors.includes(trimmedColor)) {
      alert('This color is already added.')
      return
    }

    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, trimmedColor],
    }))
    setNewColorName('')
  }

  function handleRemoveColor(colorName) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== colorName),
      color_images: (() => {
        const updated = { ...prev.color_images }
        delete updated[colorName]
        return updated
      })(),
    }))
    setColorImagePreviews((prev) => {
      const updated = { ...prev }
      delete updated[colorName]
      return updated
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!editingId && !imageFile) {
      alert('Please upload a product image.')
      return
    }

    setIsSubmitting(true)

    try {
      const uploadedImage = imageFile ? await fileToDataUrl(imageFile) : form.image_url

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image_url: uploadedImage,
        category: normalizeCategory(form.category),
        sizes: parseSizes(form.sizes),
        colors: form.colors || [],
        color_images: form.color_images || {},
        stock: Number(form.stock),
        is_featured: Boolean(form.is_featured),
      }

      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }

      closeModal()
      loadProducts().catch(console.error)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function openDeleteModal(product) {
    setProductToDelete(product)
  }

  function closeDeleteModal() {
    setProductToDelete(null)
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return

    setIsDeleteSubmitting(true)
    try {
      await deleteProduct(productToDelete.id)
      closeDeleteModal()
      loadProducts().catch(console.error)
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  function handleEdit(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      image_url: product.image_url,
      category: normalizeCategory(product.category),
      sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes.join(', ') : 'XS, S, M, L, XL',
      colors: Array.isArray(product.colors) ? product.colors : [],
      color_images: product.color_images ?? {},
      stock: String(product.stock),
      is_featured: Boolean(product.is_featured),
    })
    setImageFile(null)
    setImagePreview(product.image_url)
    setNewColorName('')
    setColorImagePreviews(product.color_images ?? {})
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-600">Manage catalog items, variants, stock, and featured placement.</p>
        </div>
        <button type="button" className="button-primary" onClick={openCreateModal}>
          Add Product
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total products</p>
          <p className="mt-2 text-2xl font-semibold">{productStats.totalProducts}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Featured</p>
          <p className="mt-2 text-2xl font-semibold">{productStats.featuredProducts}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Low stock</p>
          <p className="mt-2 text-2xl font-semibold">{productStats.lowStockProducts}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Out of stock</p>
          <p className="mt-2 text-2xl font-semibold">{productStats.outOfStockProducts}</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Search</span>
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, description, or color"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Category</span>
          <select className="input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categoryOptionsWithAll.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Stock</span>
          <select className="input" value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
            <option value="All">All stock levels</option>
            <option value="In">In stock</option>
            <option value="Low">Low stock</option>
            <option value="Out">Out of stock</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-gray-700">Sort</span>
          <select className="input" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="stock">Stock: high to low</option>
          </select>
        </label>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div className="card max-h-[90vh] w-full max-w-xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" className="button-secondary" onClick={closeModal}>
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-gray-700">Product Name</span>
                <input
                  className="input"
                  placeholder="Product Name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-gray-700">Description</span>
                <textarea
                  className="input min-h-24"
                  placeholder="Product description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-gray-700">Price</span>
                <input
                  className="input"
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-gray-700">Stock</span>
                <input
                  className="input"
                  placeholder="Stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-gray-700">Category</span>
                <select
                  className="input"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  required
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-gray-700">Sizes (comma-separated)</span>
                <input
                  className="input"
                  placeholder="XS, S, M, L, XL"
                  value={form.sizes}
                  onChange={(event) => setForm((prev) => ({ ...prev, sizes: event.target.value }))}
                  required
                />
              </label>

              <div className="sm:col-span-2 border-t border-gray-200 pt-3">
                <p className="mb-3 text-sm font-medium text-gray-700">Color Variants</p>

                <div className="mb-3 flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="e.g., Red, Blue, Black"
                    value={newColorName}
                    onChange={(event) => setNewColorName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleAddColor()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="button-secondary px-4 py-1.5 text-sm"
                    onClick={handleAddColor}
                  >
                    Add Color
                  </button>
                </div>

                {form.colors.length > 0 ? (
                  <div className="space-y-2">
                    {form.colors.map((color) => (
                      <div key={color} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{color}</p>
                          <label className="block text-xs text-gray-600">
                            <input
                              className="input mt-1"
                              type="file"
                              accept="image/*"
                              onChange={(event) => handleColorImageUpload(event, color)}
                            />
                          </label>
                          {colorImagePreviews[color] ? (
                            <img
                              src={colorImagePreviews[color]}
                              alt={`${color} preview`}
                              className="mt-2 h-16 w-16 rounded-lg border border-gray-200 object-cover"
                            />
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="button-secondary px-3 py-1.5 text-xs"
                          onClick={() => handleRemoveColor(color)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No colors added yet.</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_featured)}
                  onChange={(event) => setForm((prev) => ({ ...prev, is_featured: event.target.checked }))}
                />
                <span className="text-gray-700">Feature this product on homepage</span>
              </label>

              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-gray-700">{editingId ? 'Replace Image (optional)' : 'Upload Image'}</span>
                <input className="input" type="file" accept="image/*" onChange={handleImageChange} required={!editingId} />
              </label>

              {imagePreview ? (
                <div className="sm:col-span-2">
                  <p className="mb-1 text-xs text-gray-600">Preview</p>
                  <img src={imagePreview} alt="Product preview" className="h-40 w-full rounded-xl border border-gray-200 object-cover" />
                </div>
              ) : null}

              <button type="submit" disabled={isSubmitting} className="button-primary sm:col-span-2 disabled:opacity-60">
                {isSubmitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {productToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md">
            <h2 className="text-xl font-semibold">Delete Product</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-medium text-black">{productToDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="button-secondary" onClick={closeDeleteModal} disabled={isDeleteSubmitting}>
                Cancel
              </button>
              <button type="button" className="button-primary" onClick={handleConfirmDelete} disabled={isDeleteSubmitting}>
                {isDeleteSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`product-skeleton-${index}`} className="card space-y-3">
              <div className="h-4 w-24 rounded-full bg-gray-200" />
              <div className="h-5 w-3/4 rounded-full bg-gray-200" />
              <div className="h-4 w-full rounded-full bg-gray-200" />
              <div className="h-4 w-5/6 rounded-full bg-gray-200" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-gray-200" />
                <div className="h-10 rounded-xl bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="card border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          <p className="font-medium text-black">No products match the current filters.</p>
          <p className="mt-1">Try clearing search, category, or stock filters to see the full catalog.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:hidden">
          {visibleProducts.map((product) => (
            <article key={product.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
                  <h3 className="mt-1 text-lg font-semibold leading-tight">{product.name}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    product.is_featured ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {product.is_featured ? 'Featured' : 'Regular'}
                </span>
              </div>

              <p className="line-clamp-3 text-sm text-gray-600">{product.description || 'No description provided.'}</p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Price</p>
                  <p className="mt-1 font-semibold">{formatCurrency(product.price)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Stock</p>
                  <p className="mt-1 font-semibold">{product.stock}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Sizes</p>
                  <p className="mt-1 text-sm">{Array.isArray(product.sizes) ? product.sizes.join(', ') : '-'}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Colors</p>
                  <p className="mt-1 text-sm">
                    {Array.isArray(product.colors) && product.colors.length > 0 ? product.colors.join(', ') : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" className="button-secondary flex-1" onClick={() => handleEdit(product)}>
                  Edit
                </button>
                <button type="button" className="button-secondary flex-1" onClick={() => openDeleteModal(product)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="card hidden overflow-hidden p-0 lg:block">
        <div className="border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
          Showing {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}
          {search.trim() ? ` matching “${search.trim()}”` : ''}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Sizes</th>
              <th className="px-4 py-3">Colors</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-700">{product.description || '-'}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{Array.isArray(product.sizes) ? product.sizes.join(', ') : '-'}</td>
                  <td className="px-4 py-3">{Array.isArray(product.colors) && product.colors.length > 0 ? product.colors.join(', ') : '-'}</td>
                  <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">{product.is_featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="button-secondary" onClick={() => handleEdit(product)}>
                        Edit
                      </button>
                      <button type="button" className="button-secondary" onClick={() => openDeleteModal(product)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-600" colSpan={9}>
                  No products match the current filters.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
