import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { MdStar, MdStarBorder } from 'react-icons/md'
import QuantityControl from '../components/ui/QuantityControl.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { createProductReview, getOrdersByUser, getProductById, getProductReviews } from '../lib/db.js'
import { formatCurrency, formatDate } from '../utils/format.js'

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL']

export default function ProductDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: '5', title: '', comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      try {
        const row = await getProductById(id)
        setProduct(row)
        setSelectedSize(sizeOptions[0])
        setQuantity(1)
        if (Array.isArray(row?.colors) && row.colors.length > 0) {
          setSelectedColor(row.colors[0])
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  useEffect(() => {
    async function loadReviews() {
      setReviewsLoading(true)

      try {
        const rows = await getProductReviews(id)
        setReviews(rows)
      } catch (error) {
        console.error(error)
      } finally {
        setReviewsLoading(false)
      }
    }

    loadReviews()
  }, [id])

  useEffect(() => {
    async function loadEligibility() {
      if (!user) {
        setCanReview(false)
        setReviewEligibilityLoading(false)
        return
      }

      setReviewEligibilityLoading(true)

      try {
        const orders = await getOrdersByUser(user.id)
        const hasDeliveredPurchase = orders.some(
          (order) =>
            String(order.status).toLowerCase() === 'delivered' &&
            Array.isArray(order.order_items) &&
            order.order_items.some((item) => String(item.product_id) === String(id)),
        )

        setCanReview(hasDeliveredPurchase)
      } catch (error) {
        console.error(error)
        setCanReview(false)
      } finally {
        setReviewEligibilityLoading(false)
      }
    }

    loadEligibility()
  }, [id, user])

  function renderStars(rating) {
    const normalizedRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))

    return Array.from({ length: 5 }).map((_, index) => {
      const StarIcon = index < normalizedRating ? MdStar : MdStarBorder

      return <StarIcon key={index} className={index < normalizedRating ? 'text-black' : 'text-gray-300'} aria-hidden="true" />
    })
  }

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0

  async function handleReviewSubmit(event) {
    event.preventDefault()

    if (!user || !canReview || reviewSaving) return

    const trimmedTitle = reviewForm.title.trim()
    const trimmedComment = reviewForm.comment.trim()

    if (!trimmedComment) {
      setReviewError('Please write a short review comment before submitting.')
      return
    }

    setReviewError('')
    setReviewSaving(true)

    try {
      await createProductReview({
        product_id: Number(id),
        user_id: user.id,
        reviewer_name: user?.user_metadata?.full_name?.trim() || user?.email || 'Customer',
        rating: Number(reviewForm.rating),
        title: trimmedTitle,
        comment: trimmedComment,
      })

      const rows = await getProductReviews(id)
      setReviews(rows)
      setReviewForm({ rating: '5', title: '', comment: '' })
    } catch (error) {
      console.error(error)
      setReviewError(error.message)
    } finally {
      setReviewSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="card text-sm text-gray-600">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-shell">
        <div className="card text-sm text-gray-600">Product not found.</div>
      </div>
    )
  }

  return (
    <div className="page-shell py-4 sm:py-5 lg:py-6">
      <div className="card grid gap-4 p-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-5 lg:p-5">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 aspect-[4/5] max-h-[calc(100vh-12rem)]">
            <SmartImage
              src={selectedColor && product.color_images?.[selectedColor] ? product.color_images[selectedColor] : product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-[2rem]">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
              <p className="text-sm text-gray-600">Stock: {product.stock}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-700 lg:text-[15px]">
            {product.description?.trim() || 'No description available for this product yet.'}
          </p>

          <div className="grid gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 sm:grid-cols-3">
            <div>
              <p className="font-medium text-black">Shipping</p>
              <p className="mt-1">3-5 business days</p>
            </div>
            <div>
              <p className="font-medium text-black">Returns</p>
              <p className="mt-1">Eligible items within 14 days</p>
            </div>
            <div>
              <p className="font-medium text-black">Support</p>
              <p className="mt-1">Use the assistant or contact admin</p>
            </div>
          </div>

          {Array.isArray(product.colors) && product.colors.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      selectedColor === color
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-300 bg-white hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Quantity</p>
            <QuantityControl
              quantity={quantity}
              onDecrease={() => setQuantity((prev) => Math.max(1, prev - 1))}
              onIncrease={() => setQuantity((prev) => Math.min(Math.max(1, Number(product.stock || 0)), prev + 1))}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="button-primary"
              onClick={async () => {
                if (!user) {
                  navigate('/auth', { state: { from: location } })
                  return
                }

                try {
                  await addToCart(product, quantity, selectedSize || null, selectedColor || null)
                  setQuantity(1)
                } catch (error) {
                  console.error(error)
                  alert(error.message)
                }
              }}
            >
              Add to cart
            </button>
            <Link to="/shop" className="button-secondary">
              Back to shop
            </Link>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Write a review</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">Customer feedback</h2>
              </div>
              <div className="text-right text-xs text-gray-500">
                {reviewEligibilityLoading ? 'Checking eligibility...' : canReview ? 'You can review this item' : 'Purchase and wait for delivery to review'}
              </div>
            </div>

            {user ? (
              canReview ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    <label className="block text-sm">
                      <span className="mb-1 block text-gray-700">Rating</span>
                      <select
                        value={reviewForm.rating}
                        onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                        className="input"
                      >
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Good</option>
                        <option value="3">3 - Okay</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </label>

                    <label className="block text-sm">
                      <span className="mb-1 block text-gray-700">Title</span>
                      <input
                        value={reviewForm.title}
                        onChange={(event) => setReviewForm((prev) => ({ ...prev, title: event.target.value }))}
                        className="input"
                        placeholder="Short summary"
                      />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <span className="mb-1 block text-gray-700">Comment</span>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                      className="input min-h-24 resize-y"
                      placeholder="Tell other shoppers what you thought about the item."
                    />
                  </label>

                  {reviewError ? <p className="text-sm text-red-700">{reviewError}</p> : null}

                  <button type="submit" className="button-primary" disabled={reviewSaving}>
                    {reviewSaving ? 'Saving review...' : 'Submit review'}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                  Reviews are available after this item is delivered to your account.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                Sign in after purchase to leave a review for this product.
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Customer reviews</p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight">Product Reviews</h2>
                  <span className="text-sm text-gray-500">({reviews.length})</span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-base">{renderStars(averageRating)}</div>
                <p className="text-sm font-semibold text-black">{reviews.length > 0 ? averageRating.toFixed(1) : '0.0'} / 5.0</p>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={`review-skeleton-${index}`} className="rounded-2xl border border-gray-200 p-3">
                    <div className="h-3.5 w-32 rounded-full bg-gray-200" />
                    <div className="mt-2 h-3 w-20 rounded-full bg-gray-200" />
                    <div className="mt-3 h-3 w-full rounded-full bg-gray-200" />
                    <div className="mt-2 h-3 w-5/6 rounded-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {reviews.slice(0, 2).map((review) => (
                  <article key={review.id} className="rounded-2xl border border-gray-200 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-black">{review.title?.trim() || 'Verified customer review'}</h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {review.reviewer_name || 'Customer'} - {formatDate(review.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">{renderStars(review.rating)}</div>
                    </div>

                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-700">
                      {review.comment?.trim() || 'No written feedback was left for this review.'}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                No reviews yet. This product will show customer feedback here once reviews are added.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
