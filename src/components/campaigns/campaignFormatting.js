const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' })

export function formatCampaignDate(value) {
  return value ? dateFormatter.format(new Date(value)) : 'Date to be announced'
}
