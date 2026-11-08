import { supabase } from '../lib/supabase'

export async function loadShippingRates() {
  const { data, error } = await supabase
    .from('shipping_rates')
    .select('id, name, region, province, city, min_order_total, rate, is_active')
    .eq('is_active', true)
  if (error) throw error
  return data || []
}

export function selectShippingRate(rates, address, subtotal) {
  return rates
    .filter((rate) => (
      Number(rate.min_order_total) <= subtotal
      && (!rate.region || rate.region.toLowerCase() === (address.region || '').toLowerCase())
      && (!rate.province || rate.province.toLowerCase() === (address.province || '').toLowerCase())
      && (!rate.city || rate.city.toLowerCase() === (address.city || '').toLowerCase())
    ))
    .sort((a, b) => specificity(b) - specificity(a) || Number(b.min_order_total) - Number(a.min_order_total))[0] || null
}

function specificity(rate) {
  return (rate.city ? 4 : 0) + (rate.province ? 2 : 0) + (rate.region ? 1 : 0)
}
