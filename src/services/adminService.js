import { supabase } from '../lib/supabase'

export async function verifyAdminAccess() {
  const { data, error } = await supabase.rpc('is_admin')
  if (error) throw error
  if (!data) throw new Error('Administrator access is required.')
  return true
}

export async function loadAdminData() {
  await verifyAdminAccess()
  const [
    ordersResult,
    customersResult,
    productsResult,
    bookingsResult,
    campaignsResult,
    categoriesResult,
    shippingResult,
    trainersResult,
  ] = await Promise.all([
    supabase.from('orders').select('id, order_number, status, payment_method, payment_status, shipping_address, subtotal, shipping_total, total, created_at, user_id, order_items(product_name, variant_name, sku, quantity, unit_price, line_total)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, phone, created_at').eq('role', 'customer').order('created_at', { ascending: false }),
    supabase.from('products').select('id, name, slug, description, category_id, is_active, created_at, categories(id, name), product_variants(id, name, sku, price, stock_quantity, is_active), product_images(id, storage_path, alt_text, sort_order)').order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, user_id, starts_at, ends_at, status, customer_notes, admin_notes, trainer_id, training_services(name, duration_minutes), trainers(name)').order('starts_at', { ascending: true }),
    supabase.from('announcements').select('id, title, status, starts_at, ends_at, is_archived, image_url').order('starts_at', { ascending: true, nullsFirst: false }),
    supabase.from('categories').select('id, name, slug, description, is_active').order('name'),
    supabase.from('shipping_rates').select('id, name, region, province, city, min_order_total, rate, is_active').order('name'),
    supabase.from('trainers').select('id, name').eq('is_active', true).order('name'),
  ])
  const failed = [ordersResult, customersResult, productsResult, bookingsResult, campaignsResult, categoriesResult, shippingResult, trainersResult].find((result) => result.error)
  if (failed?.error) throw failed.error
  return {
    orders: ordersResult.data || [],
    customers: customersResult.data || [],
    products: productsResult.data || [],
    bookings: (bookingsResult.data || []).map((booking) => ({
      ...booking,
      profiles: customersResult.data?.find((customer) => customer.id === booking.user_id) || null,
    })),
    campaigns: campaignsResult.data || [],
    categories: categoriesResult.data || [],
    shippingRates: shippingResult.data || [],
    trainers: trainersResult.data || [],
  }
}

export async function changeOrderStatus(orderId, status) {
  const { error } = await supabase.rpc('change_order_status', { p_order_id: orderId, p_status: status })
  if (error) throw error
}

export async function saveProduct(values) {
  const productPayload = {
    name: values.name.trim(),
    slug: values.slug.trim().toLowerCase(),
    description: values.description.trim() || null,
    category_id: values.categoryId || null,
    is_active: values.isActive,
  }
  const productQuery = values.id
    ? supabase.from('products').update(productPayload).eq('id', values.id).select('id').single()
    : supabase.from('products').insert(productPayload).select('id').single()
  const { data: product, error: productError } = await productQuery
  if (productError) throw productError

  // Handle product image upload. On edit, replace existing images when a new
  // file is selected; otherwise existing images are left untouched.
  if (values.file) {
    if (values.id) {
      await supabase.from('product_images').delete().eq('product_id', product.id)
    }
    await uploadProductImage(values.file, product.id, values.imageAlt || '')
  }

  const variantPayload = {
    product_id: product.id,
    name: values.variantName.trim(),
    sku: values.sku.trim(),
    price: Number(values.price),
    stock_quantity: Number(values.stockQuantity),
    is_active: values.isActive,
  }
  const variantQuery = values.variantId
    ? supabase.from('product_variants').update(variantPayload).eq('id', values.variantId)
    : supabase.from('product_variants').insert(variantPayload)
  const { error: variantError } = await variantQuery
  if (variantError) throw variantError
  return product.id
}

export async function archiveProduct(id) {
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

export async function saveCategory(values) {
  const payload = { name: values.name.trim(), slug: values.slug.trim().toLowerCase(), description: values.description.trim() || null, is_active: values.isActive }
  const query = values.id
    ? supabase.from('categories').update(payload).eq('id', values.id)
    : supabase.from('categories').insert(payload)
  const { error } = await query
  if (error) throw error
}

export async function uploadProductImage(file, productId, altText = '') {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${productId}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError
  const { error } = await supabase.from('product_images').insert({ product_id: productId, storage_path: path, alt_text: altText || file.name })
  if (error) throw error
  return path
}

export async function saveShippingRate(values) {
  const payload = {
    name: values.name.trim(),
    region: values.region.trim() || null,
    province: values.province.trim() || null,
    city: values.city.trim() || null,
    min_order_total: Number(values.minOrderTotal || 0),
    rate: Number(values.rate),
    is_active: values.isActive,
  }
  const query = values.id
    ? supabase.from('shipping_rates').update(payload).eq('id', values.id)
    : supabase.from('shipping_rates').insert(payload)
  const { error } = await query
  if (error) throw error
}

export async function updateShippingRateStatus(id, isActive) {
  const { error } = await supabase.from('shipping_rates').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
}
