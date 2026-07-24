import { supabase } from './supabaseClient.js'

async function adjustProductStock(productId, delta) {
  const parsedDelta = Number(delta)
  if (!Number.isFinite(parsedDelta) || parsedDelta === 0) return null

  const { data, error } = await supabase.rpc('adjust_product_stock', {
    p_product_id: Number(productId),
    p_delta: parsedDelta,
  })

  if (error) throw error
  return data
}

export async function reserveProductStock(productId, quantity) {
  const parsedQuantity = Number(quantity)
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return
  return adjustProductStock(productId, -parsedQuantity)
}

export async function releaseProductStock(productId, quantity) {
  const parsedQuantity = Number(quantity)
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return
  return adjustProductStock(productId, parsedQuantity)
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('id', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getProductReviews(productId) {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createProductReview(payload) {
  const { data, error } = await supabase
    .from('product_reviews')
    .upsert(payload, { onConflict: 'product_id,user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createProduct(payload) {
  const { data, error } = await supabase.from('products').insert(payload).select().single()

  if (error) throw error
  return data
}

export async function updateProduct(id, payload) {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function getWishlist(userId) {
  const { data, error } = await supabase
    .from('wishlist')
    .select('id, product_id, products(*)')
    .eq('user_id', userId)

  if (error) throw error
  return data ?? []
}

export async function toggleWishlistItem({ userId, productId, exists }) {
  if (exists) {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) throw error
    return
  }

  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, product_id: productId })

  if (error) throw error
}

export async function createOrder({ userId, totalPrice, shipping, items }) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: userId, total_price: totalPrice, status: 'pending', shipping_details: shipping })
    .select()
    .single()

  if (orderError) throw orderError

  const orderItemsPayload = items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    size: item.size ?? null,
    color: item.color ?? null,
    quantity: item.quantity,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload)

  if (itemsError) throw itemsError
  return order
}

export async function getOrdersByUser(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .order('created_at', { ascending: false })

  if (error) throw error

  const orders = data ?? []
  const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))]

  if (userIds.length === 0) return orders

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  if (profilesError) throw profilesError

  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]))

  return orders.map((order) => ({
    ...order,
    profile: profileById.get(order.user_id) ?? null,
  }))
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('full_name')
  if (error) throw error
  return data ?? []
}

export async function updateUserRole(id, role) {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}
