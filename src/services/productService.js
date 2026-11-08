import { supabase } from '../lib/supabase'

export async function listProducts({ search = '', category = '', minPrice = '', maxPrice = '', sort = 'newest', page = 1, pageSize = 8 } = {}) {
  let query = supabase
    .from('products')
    .select('id, name, slug, description, created_at, categories!inner(id, name, slug), product_variants!inner(id, name, sku, price, stock_quantity, is_active), product_images(id, storage_path, alt_text, sort_order)')
    .eq('is_active', true)
    .eq('product_variants.is_active', true)

  if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
  if (category) query = query.eq('categories.slug', category)

  const { data, error } = await query
  if (error) throw error

  // Price and name sorting are applied client-side because the effective price is
  // the minimum across variants (a derived value), and price-range filtering
  // cannot be expressed cleanly against the joined product_variants table.
  const products = (data || []).map(normalizeProduct).filter((product) => {
    const price = product.price
    return (minPrice === '' || price >= Number(minPrice)) && (maxPrice === '' || price <= Number(maxPrice))
  })

  products.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    if (sort === 'name') return a.name.localeCompare(b.name)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const start = (page - 1) * pageSize
  return { products: products.slice(start, start + pageSize), count: products.length }
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, description, created_at, categories(id, name, slug), product_variants(id, name, sku, price, stock_quantity, is_active), product_images(id, storage_path, alt_text, sort_order)')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('product_variants.is_active', true)
    .maybeSingle()

  if (error) throw error
  return data ? normalizeProduct(data) : null
}

export function productImageUrl(storagePath) {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  return supabase.storage.from('product-images').getPublicUrl(storagePath).data.publicUrl
}

function normalizeProduct(product) {
  const variants = (product.product_variants || []).map((variant) => ({
    ...variant,
    price: Number(variant.price),
    stockQuantity: variant.stock_quantity,
    available: variant.stock_quantity > 0,
  }))
  const images = (product.product_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((image) => ({ ...image, url: productImageUrl(image.storage_path) }))

  return {
    ...product,
    category: product.categories?.name || 'Basketball',
    categorySlug: product.categories?.slug || '',
    variants,
    images,
    price: variants.length ? Math.min(...variants.map((variant) => variant.price)) : 0,
    inStock: variants.some((variant) => variant.available),
    image: images[0]?.url || '',
    createdAt: product.created_at,
  }
}

