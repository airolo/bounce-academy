import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag } from 'react-icons/fi'
import QuantityControl from '../components/ui/QuantityControl.jsx'
import SmartImage from '../components/ui/SmartImage.jsx'
import { useCart } from '../contexts/CartContext.jsx'
import { getProductById } from '../lib/db.js'
import { formatCurrency } from '../utils/format.js'

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL']

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, updateItemVariant } = useCart()
  const [selectedCartKeys, setSelectedCartKeys] = useState([])
  const [productColors, setProductColors] = useState({})
  const [itemVariants, setItemVariants] = useState({})

  useEffect(() => {
    setSelectedCartKeys((prev) => {
      const available = new Set(items.map((item) => item.cartKey))
      const next = prev.filter((key) => available.has(key))

      if (next.length > 0) {
        return next
      }

      return items.map((item) => item.cartKey)
    })
  }, [items])

  useEffect(() => {
    const fetchProductColors = async () => {
      const colors = {}
      for (const item of items) {
        if (!productColors[item.id]) {
          try {
            const product = await getProductById(item.id)
            colors[item.id] = Array.isArray(product?.colors) ? product.colors : []
          } catch (error) {
            console.error(`Failed to fetch product ${item.id}:`, error)
            colors[item.id] = []
          }
        }
      }
      if (Object.keys(colors).length > 0) {
        setProductColors((prev) => ({ ...prev, ...colors }))
      }
    }

    if (items.length > 0) {
      fetchProductColors()
    }
  }, [items, productColors])

  const selectedItems = useMemo(
    () => items.filter((item) => selectedCartKeys.includes(item.cartKey)),
    [items, selectedCartKeys],
  )
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
    [selectedItems],
  )
  const selectedShipping = selectedItems.length > 0 ? 10 : 0

  function toggleItemSelection(cartKey) {
    setSelectedCartKeys((prev) =>
      prev.includes(cartKey) ? prev.filter((key) => key !== cartKey) : [...prev, cartKey],
    )
  }

  function toggleSelectAll() {
    if (selectedCartKeys.length === items.length) {
      setSelectedCartKeys([])
      return
    }

    setSelectedCartKeys(items.map((item) => item.cartKey))
  }

  function handleSizeChange(cartKey, newSize) {
    const item = items.find((i) => i.cartKey === cartKey)
    if (item) {
      setItemVariants((prev) => ({ ...prev, [cartKey]: { ...prev[cartKey], size: newSize } }))
      updateItemVariant(cartKey, newSize, item.color || null)
    }
  }

  function handleColorChange(cartKey, newColor) {
    const item = items.find((i) => i.cartKey === cartKey)
    if (item) {
      setItemVariants((prev) => ({ ...prev, [cartKey]: { ...prev[cartKey], color: newColor } }))
      updateItemVariant(cartKey, item.size || null, newColor)
    }
  }

  return (
    <div className="page-shell space-y-5">
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>

      {items.length === 0 ? (
        <div className="card border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white p-3 text-black shadow-sm">
              <FiShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-black">Your cart is empty.</p>
              <p className="mt-1">Add a few pieces from the shop to start building your order.</p>
              <Link to="/shop" className="button-secondary mt-4 inline-flex">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedCartKeys.length === items.length}
                onChange={toggleSelectAll}
              />
              Select all items
            </label>

            {items.map((item) => {
              const colors = productColors[item.id] || []
              const currentSize = itemVariants[item.cartKey]?.size || item.size || sizeOptions[0]
              const currentColor = itemVariants[item.cartKey]?.color || item.color || ''

              return (
                <article key={item.cartKey} className="card space-y-2">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCartKeys.includes(item.cartKey)}
                      onChange={() => toggleItemSelection(item.cartKey)}
                      aria-label={`Select ${item.name}`}
                    />
                    <SmartImage
                      src={item.image_url}
                      alt={item.name}
                      className="h-20 w-20 rounded-xl border border-gray-200 object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">{item.category}</p>
                      <h2 className="text-base font-semibold">{item.name}</h2>
                      <p className="text-sm">{formatCurrency(item.price)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-gray-200 pt-2">
                    <div>
                      <label htmlFor={`size-${item.cartKey}`} className="block text-xs text-gray-600 mb-0.5">
                        Size
                      </label>
                      <select
                        id={`size-${item.cartKey}`}
                        value={currentSize}
                        onChange={(event) => handleSizeChange(item.cartKey, event.target.value)}
                        className="input w-full text-xs py-1"
                      >
                        {sizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {colors.length > 0 ? (
                      <div>
                        <label htmlFor={`color-${item.cartKey}`} className="block text-xs text-gray-600 mb-0.5">
                          Color
                        </label>
                        <select
                          id={`color-${item.cartKey}`}
                          value={currentColor}
                          onChange={(event) => handleColorChange(item.cartKey, event.target.value)}
                          className="input w-full text-xs py-1"
                        >
                          {colors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2">
                    <QuantityControl
                      quantity={item.quantity}
                      onDecrease={async () => {
                        try {
                          await updateQuantity(item.cartKey, item.quantity - 1)
                        } catch (error) {
                          console.error(error)
                          alert(error.message)
                        }
                      }}
                      onIncrease={async () => {
                        try {
                          await updateQuantity(item.cartKey, item.quantity + 1)
                        } catch (error) {
                          console.error(error)
                          alert(error.message)
                        }
                      }}
                    />

                    <button
                      type="button"
                      className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:border-black"
                      onClick={async () => {
                        try {
                          await removeFromCart(item.cartKey)
                        } catch (error) {
                          console.error(error)
                          alert(error.message)
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <aside className="card h-fit">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(selectedSubtotal)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm">
              <span>Shipping</span>
              <span>{formatCurrency(selectedShipping)}</span>
            </div>
            <div className="mt-3 border-t border-gray-200 pt-3 text-sm font-semibold">
              Total: {formatCurrency(selectedSubtotal + selectedShipping)}
            </div>

            <Link
              to="/checkout"
              state={{ selectedCartKeys }}
              className={`button-primary mt-4 block w-full text-center ${selectedItems.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
            >
              Proceed to checkout
            </Link>
            {selectedItems.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">Select at least one item to continue checkout.</p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  )
}
