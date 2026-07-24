import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getWishlist, toggleWishlistItem } from '../lib/db.js'
import ProductCard from '../components/ProductCard.jsx'

export default function WishlistPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWishlist() {
      if (!user) return

      setLoading(true)
      try {
        const data = await getWishlist(user.id)
        setRows(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [user])

  async function handleToggle(productId) {
    if (!user) return

    try {
      await toggleWishlistItem({ userId: user.id, productId, exists: true })
      setRows((prev) => prev.filter((item) => item.product_id !== productId))
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <div className="page-shell">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-600">Saved items stay here until you are ready to shop.</p>
        </div>
        <Link to="/shop" className="button-secondary">
          Continue shopping
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={`wishlist-skeleton-${index}`} className="card space-y-3">
              <div className="h-52 rounded-2xl bg-gray-200" />
              <div className="h-4 w-20 rounded-full bg-gray-200" />
              <div className="h-5 w-3/4 rounded-full bg-gray-200" />
              <div className="h-4 w-1/2 rounded-full bg-gray-200" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-10 rounded-xl bg-gray-200" />
                <div className="h-10 rounded-xl bg-gray-200" />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <div className="card border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          <p className="font-medium text-black">No saved products yet.</p>
          <p className="mt-1">Browse the shop and tap the heart on any product you want to keep for later.</p>
        </div>
      ) : null}

      {!loading && rows.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <ProductCard
              key={row.id}
              product={row.products}
              isWishlisted
              onToggleWishlist={handleToggle}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
