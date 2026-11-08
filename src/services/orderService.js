import { supabase } from '../lib/supabase'

export async function createCodOrder(address, items, shippingRateId) {
  if (!address || !items.length || !shippingRateId) throw new Error('Complete your address and shipping selection.')
  const { data, error } = await supabase.rpc('create_order', {
    p_shipping_address: { ...address, payment_method: 'cod' },
    p_shipping_rate_id: shippingRateId,
    p_items: items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
  })
  if (error) throw error
  return data
}

export async function loadOrder(orderId, userId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, payment_method, payment_status, shipping_address, subtotal, shipping_total, total, created_at, order_items(product_name, variant_name, sku, unit_price, quantity, line_total)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data
}
