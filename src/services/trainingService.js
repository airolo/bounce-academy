import { supabase } from '../lib/supabase'

export async function listTrainingServices() {
  const { data, error } = await supabase
    .from('training_services')
    .select('id, name, slug, description, duration_minutes, price')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function requestBooking({ serviceId, startsAt, customerNotes }) {
  const { data, error } = await supabase.rpc('request_booking', {
    p_service_id: serviceId,
    p_starts_at: startsAt,
    p_customer_notes: customerNotes || null,
  })
  if (error) throw error
  return data
}

export async function updateCustomerProfile({ userId, fullName, phone }) {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName.trim(), phone: phone.trim() })
    .eq('id', userId)
  if (error) throw error
}

export async function listCustomerBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, starts_at, ends_at, status, customer_notes, admin_notes, training_services(name, duration_minutes), trainers(name)')
    .eq('user_id', userId)
    .order('starts_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listAdminBookings() {
  const [bookingsResult, profilesResult] = await Promise.all([
    supabase
    .from('bookings')
    .select('id, user_id, starts_at, ends_at, status, customer_notes, admin_notes, service_id, trainer_id, training_services(name, duration_minutes), trainers(name)')
    .order('starts_at', { ascending: true }),
    supabase.from('profiles').select('id, full_name, phone'),
  ])
  if (bookingsResult.error) throw bookingsResult.error
  if (profilesResult.error) throw profilesResult.error
  const profiles = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]))
  return (bookingsResult.data || []).map((booking) => ({ ...booking, profiles: profiles.get(booking.user_id) || null }))
}

export async function listTrainers() {
  const { data, error } = await supabase
    .from('trainers')
    .select('id, name')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function manageBooking({ bookingId, status, trainerId, adminNotes }) {
  const { error } = await supabase.rpc('manage_booking', {
    p_booking_id: bookingId,
    p_status: status || null,
    p_trainer_id: trainerId || null,
    p_admin_notes: adminNotes || null,
  })
  if (error) throw error
}
