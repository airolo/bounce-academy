import { useEffect, useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CampaignCard } from '../components/campaigns/CampaignCard'
import { listCampaigns } from '../services/campaignService'

export function AnnouncementsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    listCampaigns().then(setCampaigns).catch((loadError) => setError(loadError.message || 'Unable to load campaigns.'))
  }, [])

  const activeAndUpcoming = useMemo(() => campaigns
    .filter((campaign) => ['active', 'upcoming'].includes(campaign.status))
    .sort((first, second) => Number(second.status === 'active') - Number(first.status === 'active') || new Date(first.starts_at) - new Date(second.starts_at)), [campaigns])
  return (
    <div className="campaigns-page">
      <section className="campaigns-hero"><span className="eyebrow orange">Bounce Academy events</span><h1>Show up.<br />Stand out.</h1><p>Clinics, camps, and community runs built for the next generation of Filipino basketball.</p></section>
      {error && <p className="form-error section">{error}</p>}
      <CampaignGroup title="Active & upcoming campaigns." eyebrow="On court and coming soon" campaigns={activeAndUpcoming} />
      {!activeAndUpcoming.length && !error && <p className="section empty-state">No campaigns are available right now. Check back soon.</p>}
    </div>
  )
}

function CampaignGroup({ title, eyebrow, campaigns }) {
  if (!campaigns.length) return null
  return <section className="section campaign-list-section"><div className="section-heading"><div><span className="eyebrow orange">{eyebrow}</span><h2>{title}</h2></div><Link className="text-link" to="/announcements">All announcements <ArrowRight size={14} /></Link></div><div className="campaign-feature-grid">{campaigns.map((campaign) => <CampaignCard campaign={campaign} key={campaign.id} />)}</div></section>
}
