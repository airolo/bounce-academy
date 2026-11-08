import { useEffect, useState } from 'react'
import { Archive, ImagePlus, Pencil, Plus } from 'lucide-react'
import { CampaignCard } from '../components/campaigns/CampaignCard'
import { archiveCampaign, listCampaigns, saveCampaign, updateCampaignStatus, uploadCampaignBanner } from '../services/campaignService'

const emptyForm = { title: '', description: '', location: '', startsAt: '', endsAt: '', registrationDeadline: '', availableSlots: '', status: 'draft', imageUrl: '' }
const statuses = ['draft', 'upcoming', 'active', 'completed', 'cancelled']

function toInputDate(value) {
  return value ? new Date(value).toISOString().slice(0, 16) : ''
}

export function AdminAnnouncementsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    try { setCampaigns(await listCampaigns({ includeArchived: true })) } catch (loadError) { setError(loadError.message || 'Unable to load campaigns.') }
  }
  // eslint-disable-next-line react/set-state-in-effect -- Async data fetch requires setState in an effect; campaign list cannot be derived during render.
  useEffect(() => { load() }, [])

  function editCampaign(campaign) {
    setForm({ id: campaign.id, title: campaign.title, description: campaign.description, location: campaign.location || '', startsAt: toInputDate(campaign.starts_at), endsAt: toInputDate(campaign.ends_at), registrationDeadline: toInputDate(campaign.registration_deadline), availableSlots: campaign.available_slots ?? '', status: campaign.status, imageUrl: campaign.image_url || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try { await saveCampaign(form); setForm(emptyForm); await load() } catch (saveError) { setError(saveError.message || 'Unable to save campaign.') } finally { setSaving(false) }
  }

  async function handleBanner(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { const imageUrl = await uploadCampaignBanner(file); setForm((current) => ({ ...current, imageUrl })) } catch (uploadError) { setError(uploadError.message || 'Unable to upload banner.') }
  }

  async function action(callback) {
    setError('')
    try { await callback(); await load() } catch (actionError) { setError(actionError.message || 'Unable to update campaign.') }
  }

  return <section className="section admin-campaigns">
    <div className="admin-page-header"><div><span className="eyebrow orange">Campaign operations</span><h1>{form.id ? 'Edit campaign.' : 'Create campaign.'}</h1></div><button className="button button-outline" onClick={() => setForm(emptyForm)} type="button"><Plus size={15} /> New campaign</button></div>
    {error && <p className="form-error">{error}</p>}
    <form className="campaign-admin-form" onSubmit={handleSubmit}>
      <div className="form-columns"><label>Title<input required onChange={(event) => setForm({ ...form, title: event.target.value })} value={form.title} /></label><label>Location<input onChange={(event) => setForm({ ...form, location: event.target.value })} value={form.location} /></label></div>
      <label>Description<textarea required onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" value={form.description} /></label>
      <div className="form-columns"><label>Starts<input required={form.status !== 'draft' && form.status !== 'cancelled'} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} type="datetime-local" value={form.startsAt} /></label><label>Ends<input required={form.status !== 'draft' && form.status !== 'cancelled'} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} type="datetime-local" value={form.endsAt} /></label><label>Registration deadline<input onChange={(event) => setForm({ ...form, registrationDeadline: event.target.value })} type="datetime-local" value={form.registrationDeadline} /></label><label>Available slots<input min="0" onChange={(event) => setForm({ ...form, availableSlots: event.target.value })} type="number" value={form.availableSlots} /></label></div>
      <div className="form-columns campaign-admin-actions"><label>Status<select onChange={(event) => setForm({ ...form, status: event.target.value })} value={form.status}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label>Banner<input accept="image/*" onChange={handleBanner} type="file" /><span className="upload-hint"><ImagePlus size={14} /> {form.imageUrl ? 'Banner uploaded' : 'JPG or PNG, up to your storage limit'}</span></label><button className="button button-primary" disabled={saving} type="submit">{saving ? 'Saving...' : form.id ? 'Save changes' : 'Create campaign'}</button></div>
    </form>
    <div className="admin-campaign-list">{campaigns.map((campaign) => <div className={`admin-campaign-row ${campaign.is_archived ? 'is-archived' : ''}`} key={campaign.id}><CampaignCard campaign={campaign} /><div className="admin-campaign-row-actions"><button className="button button-outline" onClick={() => editCampaign(campaign)} type="button"><Pencil size={14} /> Edit</button>{!campaign.is_archived && campaign.status === 'draft' && <button className="button button-primary" onClick={() => action(() => updateCampaignStatus(campaign.id, 'upcoming'))} type="button">Publish / schedule</button>}{!campaign.is_archived && campaign.status === 'active' && <button className="button button-primary" onClick={() => action(() => updateCampaignStatus(campaign.id, 'completed'))} type="button">Mark completed</button>}{!campaign.is_archived && !['completed', 'cancelled'].includes(campaign.status) && <button className="text-button danger" onClick={() => action(() => updateCampaignStatus(campaign.id, 'cancelled'))} type="button">Cancel</button>}{!campaign.is_archived && <button className="text-button" onClick={() => action(() => archiveCampaign(campaign.id))} type="button"><Archive size={13} /> Archive</button>}</div></div>)}</div>
  </section>
}
