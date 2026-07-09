import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiSearch, FiSliders } from 'react-icons/fi'
import ProductCard from '../components/ProductCard.jsx'
import SectionHeading from '../components/ui/SectionHeading.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { getProducts, getWishlist, toggleWishlistItem } from '../lib/db.js'

export default function ShopPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [wishlistIds, setWishlistIds] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      try {
        const [productRows, wishlistRows] = await Promise.all([
          getProducts(),
          user ? getWishlist(user.id) : Promise.resolve([]),
        ])

        setProducts(productRows)
        setWishlistIds(wishlistRows.map((item) => item.product_id))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [user])

  const categories = useMemo(() => ['All', ...new Set(products.map((item) => item.category))], [products])

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filteredProducts = products.filter((item) => {
      const categoryMatches = category === 'All' || item.category === category
      const searchMatches =
        normalizedSearch.length === 0 ||
        [item.name, item.category, item.description]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)

      return categoryMatches && searchMatches
    })

    const sortedProducts = [...filteredProducts].sort((left, right) => {
      if (sortBy === 'price-asc') return Number(left.price) - Number(right.price)
      if (sortBy === 'price-desc') return Number(right.price) - Number(left.price)
      if (sortBy === 'stock') return Number(right.stock) - Number(left.stock)

      const leftFeatured = left.is_featured ? 1 : 0
      const rightFeatured = right.is_featured ? 1 : 0

      if (leftFeatured !== rightFeatured) return rightFeatured - leftFeatured
      return Number(right.id) - Number(left.id)
    })

    return sortedProducts
  }, [products, category, search, sortBy])

  async function handleToggleWishlist(productId) {
    if (!user) return

    const exists = wishlistIds.includes(productId)
    await toggleWishlistItem({ userId: user.id, productId, exists })
    setWishlistIds((prev) => (exists ? prev.filter((id) => id !== productId) : [...prev, productId]))
  }

  async function handleAddToCart(product) {
    if (!user) {
      navigate('/auth', { state: { from: location } })
      return
    }

    try {
      await addToCart(product)
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className="page-shell">
      <SectionHeading title="Shop" subtitle="Explore products by category, search, and price." />

      <div className="mb-5 grid gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus-within:border-black">
          <FiSearch className="h-4 w-4 shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="w-full bg-transparent outline-none placeholder:text-gray-400"
          />
        </label>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <FiSliders className="h-4 w-4 shrink-0" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="bg-transparent outline-none"
            >
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="stock">Stock: high to low</option>
            </select>
          </div>

          {(category !== 'All' || search.trim().length > 0) ? (
            <button
              type="button"
              onClick={() => {
                setCategory('All')
                setSearch('')
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-black transition hover:border-black"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => {
          const count = item === 'All' ? products.length : products.filter((product) => product.category === item).length

          return (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                category === item ? 'border-black bg-black text-white' : 'border-gray-300 bg-white hover:border-black'
              }`}
            >
              {item} <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Showing {visibleProducts.length} product{visibleProducts.length === 1 ? '' : 's'}
        {category !== 'All' ? ` in ${category}` : ''}
        {search.trim().length > 0 ? ` matching "${search.trim()}"` : ''}.
      </p>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={`shop-skeleton-${index}`}
              className="card flex h-full flex-col overflow-hidden p-0 reveal-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="h-52 w-full skeleton-shimmer" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-16 rounded-full bg-gray-200" />
                <div className="h-5 w-3/4 rounded-full bg-gray-200" />
                <div className="h-4 w-1/2 rounded-full bg-gray-200" />
                <div className="h-6 w-1/3 rounded-full bg-gray-200" />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-10 rounded-xl bg-gray-200" />
                  <div className="h-10 rounded-xl bg-gray-200" />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : visibleProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 content-fade-in">
          {visibleProducts.map((product, index) => (
            <div key={product.id} className="reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
              <ProductCard
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-sm text-gray-600 content-fade-in">
          No products found for this category.
        </div>
      )}
    </div>
  )
}
