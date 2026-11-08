import { create } from 'zustand'

export const useCartStore = create((set) => ({
  items: [],
  hydrated: false,
  hydrate: (items) => set({ items, hydrated: true }),
  addItem: (item) => set((state) => {
    const existing = state.items.find((entry) => entry.variantId === item.variantId)
    if (existing) {
      return { items: state.items.map((entry) => entry.variantId === item.variantId
        ? { ...entry, quantity: Math.min(entry.quantity + item.quantity, entry.stockQuantity) }
        : entry) }
    }
    return { items: [...state.items, item] }
  }),
  updateQuantity: (variantId, quantity) => set((state) => ({
    items: quantity <= 0
      ? state.items.filter((item) => item.variantId !== variantId)
      : state.items.map((item) => item.variantId === variantId ? { ...item, quantity: Math.min(quantity, item.stockQuantity) } : item),
  })),
  removeItem: (variantId) => set((state) => ({ items: state.items.filter((item) => item.variantId !== variantId) })),
  clearCart: () => set({ items: [] }),
}))

export const selectItemCount = (state) => state.items.reduce((total, item) => total + item.quantity, 0)
export const selectSubtotal = (state) => state.items.reduce((total, item) => total + item.price * item.quantity, 0)
