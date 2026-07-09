import { Link } from 'react-router-dom'
import { FiHeart, FiStar } from 'react-icons/fi'
import SmartImage from './ui/SmartImage.jsx'
import { formatCurrency } from '../utils/format.js'

export default function ProductCard({ product, isWishlisted, onToggleWishlist, onAddToCart }) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']
  const isLowStock = Number(product.stock || 0) <= 5

  return (
    <article className="group card flex h-full flex-col">
      <div className="relative mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
        <SmartImage
          src={product.image_url}
          alt={product.name}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.is_featured ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">
            <FiStar className="h-3 w-3" /> Featured
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onToggleWishlist?.(product.id)}
          className="absolute right-3 top-3 rounded-full border border-gray-300 bg-white p-2"
        >
          <FiHeart className={`h-4 w-4 ${isWishlisted ? 'fill-black text-black' : 'text-black'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">{product.category}</p>
        <h3 className="text-base font-semibold leading-tight text-black">{product.name}</h3>
        <p className={`text-sm ${isLowStock ? 'font-medium text-amber-700' : 'text-gray-600'}`}>
          {isLowStock ? `Low stock: ${product.stock}` : `In stock: ${product.stock}`}
        </p>
        <p className="text-xs text-gray-600">Sizes: {sizes.length > 0 ? sizes.join(', ') : 'N/A'}</p>
        <p className="mt-auto text-lg font-semibold">{formatCurrency(product.price)}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="button-primary" onClick={() => onAddToCart(product)}>
          Add
        </button>
        <Link to={`/product/${product.id}`} className="button-secondary text-center">
          View
        </Link>
      </div>
    </article>
  )
}
