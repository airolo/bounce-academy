import { supabase } from '../lib/supabase'

export async function loadCart(userId) {
  const { data: cart, error: cartError } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle()
  if (cartError) throw cartError
  if (!cart) return []

  const { data, error } = await supabase
    .from('cart_items')
    .select('id, variant_id, quantity, product_variants(id, name, sku, price, stock_quantity, products(id, name, slug, product_images(storage_path, alt_text, sort_order)))')
    .eq('cart_id', cart.id)
  if (error) throw error

  return (data || []).map((item) => {
    const variant = item.product_variants
    const product = variant.products
    const image = (product.product_images || []).sort((a, b) => a.sort_order - b.sort_order)[0]
    return {
      id: item.variant_id,
      variantId: item.variant_id,
      cartItemId: item.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: variant.name,
      sku: variant.sku,
      price: Number(variant.price),
      stockQuantity: variant.stock_quantity,
      quantity: item.quantity,
      imageUrl: image ? `${supabase.storage.from('product-images').getPublicUrl(image.storage_path).data.publicUrl}` : '',
    }
  })
}

export async function saveCart(userId, items) {
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id')
    .single()
  if (cartError) throw cartError

  const { error: deleteError } = await supabase.from('cart_items').delete().eq('cart_id', cart.id)
  if (deleteError) throw deleteError
  if (!items.length) return

  const { error } = await supabase.from('cart_items').insert(items.map((item) => ({
    cart_id: cart.id,
    variant_id: item.variantId,
    quantity: item.quantity,
  })))
  if (error) throw error
}

