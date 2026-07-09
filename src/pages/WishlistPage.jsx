import { useEffect, useState } from 'react'
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

    await toggleWishlistItem({ userId: user.id, productId, exists: true })
    setRows((prev) => prev.filter((item) => item.product_id !== productId))
  }

  return (
    <div className="page-shell">
      <h1 className="mb-5 text-3xl font-semibold tracking-tight">Wishlist</h1>

      {loading ? <div className="card text-sm text-gray-600">Loading wishlist...</div> : null}

      {!loading && rows.length === 0 ? <div className="card text-sm text-gray-600">No saved products yet.</div> : null}

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
    </div>
  )
}
