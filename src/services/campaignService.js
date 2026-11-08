import { supabase } from '../lib/supabase'

const campaignFields = 'id, title, description, body, image_url, location, starts_at, ends_at, registration_deadline, available_slots, status, is_archived, published_at, created_at, updated_at'

export async function listCampaigns({ includeArchived = false } = {}) {
  let query = supabase.from('announcements').select(campaignFields).order('starts_at', { ascending: true, nullsFirst: false })
  if (!includeArchived) query = query.eq('is_archived', false)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getCampaign(id) {
  const { data, error } = await supabase.from('announcements').select(campaignFields).eq('id', id).single()
  if (error) throw error
  return data
}

export async function saveCampaign(values) {
  const payload = {
    title: values.title.trim(),
    description: values.description.trim(),
    body: values.description.trim(),
    image_url: values.imageUrl || null,
    location: values.location.trim(),
    starts_at: values.startsAt || null,
    ends_at: values.endsAt || null,
    registration_deadline: values.registrationDeadline || null,
    available_slots: values.availableSlots === '' ? null : Number(values.availableSlots),
    status: values.status,
  }
  const query = values.id
    ? supabase.from('announcements').update(payload).eq('id', values.id)
    : supabase.from('announcements').insert(payload)
  const { error } = await query
  if (error) throw error
}

export async function updateCampaignStatus(id, status) {
  const { error } = await supabase.from('announcements').update({ status }).eq('id', id)
  if (error) throw error
}

export async function archiveCampaign(id) {
  const { error } = await supabase.from('announcements').update({ is_archived: true }).eq('id', id)
  if (error) throw error
}

export async function uploadCampaignBanner(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('campaign-banners').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('campaign-banners').getPublicUrl(path)
  return data.publicUrl
}
