import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCampaignDate } from './campaignFormatting'

export function CampaignCard({ campaign }) {
  return (
    <Link className="campaign-feature-card" to={`/announcements/${campaign.id}`}>
      <div className="campaign-feature-image" style={{ backgroundImage: `url(${campaign.image_url || 'https://images.unsplash.com/photo-1518407613690-d9fc990e795f?auto=format&fit=crop&w=1200&q=85'})` }}>
        <span className={`campaign-status campaign-status-${campaign.status}`}>{campaign.status}</span>
      </div>
      <div className="campaign-feature-copy">
        <h3>{campaign.title}</h3>
        <p>{campaign.description}</p>
        <div className="campaign-feature-meta">
          <span><CalendarDays size={14} />{formatCampaignDate(campaign.starts_at)}</span>
          <span><MapPin size={14} />{campaign.location || 'Location to be announced'}</span>
          {campaign.available_slots !== null && <span><Users size={14} />{campaign.available_slots} slots</span>}
        </div>
      </div>
    </Link>
  )
}
