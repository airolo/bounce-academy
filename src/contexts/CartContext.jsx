import { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { releaseProductStock, reserveProductStock } from '../lib/db.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  const storageKey = useMemo(() => `bounce_cart_${user?.id ?? 'guest'}`, [user?.id])
  const prevUserId = useRef(user?.id)

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    setItems(raw ? JSON.parse(raw) : [])
  }, [storageKey])

  useEffect(() => {
    if (!user?.id || prevUserId.current) {
      prevUserId.current = user?.id
      return
    }

    prevUserId.current = user?.id

    const guestKey = 'bounce_cart_guest'
    const guestRaw = localStorage.getItem(guestKey)
    if (!guestRaw) return

    try {
      const guestItems = JSON.parse(guestRaw)
      if (!Array.isArray(guestItems) || guestItems.length === 0) return

      const userRaw = localStorage.getItem(storageKey)
      const userItems = userRaw ? JSON.parse(userRaw) : []
      const existingKeys = new Set(userItems.map((i) => i.cartKey))

      const merged = [...userItems, ...guestItems.filter((i) => !existingKeys.has(i.cartKey))]
      localStorage.setItem(storageKey, JSON.stringify(merged))
      localStorage.removeItem(guestKey)
      setItems(merged)
    } catch {
      // ignore parse errors
    }
  }, [user?.id, storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey])

  const safeReserveStock = useCallback(async (productId, quantity) => {
    try {
      await reserveProductStock(productId, quantity)
      return true
    } catch (error) {
      console.warn('Stock reserve failed:', error?.message ?? error)
      return false
    }
  }, [])

  const safeReleaseStock = useCallback(async (productId, quantity) => {
    try {
      await releaseProductStock(productId, quantity)
      return true
    } catch (error) {
      console.warn('Stock release failed:', error?.message ?? error)
      return false
    }
  }, [])

  const addToCart = useCallback(
    async (product, quantity = 1, size = null, color = null) => {
      const reserved = await safeReserveStock(product.id, quantity)
      if (!reserved) {
        throw new Error('Not enough stock available for this product.')
      }

      const cartKey = `${product.id}::${size ?? 'NOSIZE'}::${color ?? 'NOCOLOR'}`

      setItems((prev) => {
        const existing = prev.find((item) => item.cartKey === cartKey)
        if (existing) {
          return prev.map((item) =>
            item.cartKey === cartKey ? { ...item, quantity: item.quantity + quantity } : item,
          )
        }

        return [...prev, { ...product, cartKey, size, color, quantity }]
      })
    },
    [safeReserveStock],
  )

  const updateQuantity = useCallback(
    async (cartKey, quantity) => {
      const targetItem = items.find((item) => item.cartKey === cartKey)
      if (!targetItem) return

      const nextQuantity = Number(quantity)
      const currentQuantity = Number(targetItem.quantity)

      if (!Number.isFinite(nextQuantity)) return

      const delta = nextQuantity - currentQuantity

      if (delta > 0) {
        const reserved = await safeReserveStock(targetItem.id, delta)
        if (!reserved) {
          throw new Error('Not enough stock available for this product.')
        }
      }

      if (delta < 0) {
        const released = await safeReleaseStock(targetItem.id, Math.abs(delta))
        if (!released) {
          throw new Error('Unable to update stock for this cart item.')
        }
      }

      setItems((prev) =>
        prev
          .map((item) => (item.cartKey === cartKey ? { ...item, quantity: nextQuantity } : item))
          .filter((item) => item.quantity > 0),
      )
    },
    [items, safeReserveStock, safeReleaseStock],
  )

  const removeFromCart = useCallback(
    async (cartKey) => {
      const targetItem = items.find((item) => item.cartKey === cartKey)
      if (targetItem) {
        const released = await safeReleaseStock(targetItem.id, targetItem.quantity)
        if (!released) {
          throw new Error('Unable to update stock for this cart item.')
        }
      }

      setItems((prev) => prev.filter((item) => item.cartKey !== cartKey))
    },
    [items, safeReleaseStock],
  )

  const removeItemsByKeys = useCallback(
    async (cartKeys) => {
      const keySet = new Set(cartKeys)
      const removed = items.filter((item) => keySet.has(item.cartKey))

      const releaseResults = await Promise.all(
        removed.map((item) => safeReleaseStock(item.id, item.quantity)),
      )
      if (releaseResults.some((released) => !released)) {
        throw new Error('Unable to release stock for removed items.')
      }

      setItems((prev) => prev.filter((item) => !keySet.has(item.cartKey)))
    },
    [items, safeReleaseStock],
  )

  const updateItemVariant = useCallback(
    async (oldCartKey, newSize, newColor) => {
      const targetItem = items.find((item) => item.cartKey === oldCartKey)
      if (!targetItem) return

      const newCartKey = `${targetItem.id}::${newSize ?? 'NOSIZE'}::${newColor ?? 'NOCOLOR'}`
      if (newCartKey === oldCartKey) return

      const released = await safeReleaseStock(targetItem.id, targetItem.quantity)
      if (!released) {
        throw new Error('Unable to release stock for the old variant.')
      }

      const reserved = await safeReserveStock(targetItem.id, targetItem.quantity)
      if (!reserved) {
        await safeReserveStock(targetItem.id, targetItem.quantity)
        throw new Error('Not enough stock available for this variant.')
      }

      setItems((prev) => {
        const filtered = prev.filter((item) => item.cartKey !== oldCartKey)
        const existing = filtered.find((item) => item.cartKey === newCartKey)

        if (existing) {
          return filtered.map((item) =>
            item.cartKey === newCartKey
              ? { ...item, quantity: item.quantity + targetItem.quantity }
              : item,
          )
        }

        return [...filtered, { ...targetItem, cartKey: newCartKey, size: newSize, color: newColor }]
      })
    },
    [items, safeReleaseStock, safeReserveStock],
  )

  const clearCart = useCallback(async () => {
    const releaseResults = await Promise.all(items.map((item) => safeReleaseStock(item.id, item.quantity)))
    if (releaseResults.some((released) => !released)) {
      throw new Error('Unable to clear cart stock reservations.')
    }
    setItems([])
  }, [items, safeReleaseStock])

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      removeItemsByKeys,
      updateItemVariant,
      clearCart,
    }),
    [
      items,
      totalItems,
      subtotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      removeItemsByKeys,
      updateItemVariant,
      clearCart,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
