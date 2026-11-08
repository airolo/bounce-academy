import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { formatCampaignDate } from '../components/campaigns/campaignFormatting'
import { getCampaign } from '../services/campaignService'

export function CampaignDetailsPage() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { getCampaign(id).then(setCampaign).catch((loadError) => setError(loadError.message || 'Unable to load this campaign.')) }, [id])
  if (error) return <section className="section"><p className="form-error">{error}</p><Link className="text-link" to="/announcements">Back to announcements</Link></section>
  if (!campaign) return <section className="section"><p className="empty-state">Loading campaign...</p></section>
  return <article className="campaign-detail">
    <div className="campaign-detail-image" style={{ backgroundImage: `url(${campaign.image_url || 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f?auto=format&fit=crop&w=1800&q=85'})` }} />
    <div className="campaign-detail-copy"><Link className="back-link" to="/announcements"><ArrowLeft size={14} /> All announcements</Link><span className={`campaign-status campaign-status-${campaign.status}`}>{campaign.status}</span><h1>{campaign.title}</h1><p className="campaign-detail-description">{campaign.description}</p><div className="campaign-detail-meta"><span><CalendarDays size={17} /><strong>When</strong>{formatCampaignDate(campaign.starts_at)} — {formatCampaignDate(campaign.ends_at)}</span><span><MapPin size={17} /><strong>Where</strong>{campaign.location || 'Location to be announced'}</span>{campaign.available_slots !== null && <span><Users size={17} /><strong>Availability</strong>{campaign.available_slots} spots remaining</span>}</div>{campaign.registration_deadline && <p className="campaign-deadline">Registration closes {formatCampaignDate(campaign.registration_deadline)}.</p>}<Link className="button button-primary" to="/training">Explore training <ArrowLeft size={14} /></Link></div>
  </article>
}
