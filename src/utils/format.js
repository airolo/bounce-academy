export function formatCurrency(value) {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) return '₱0.00'

  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
  }).format(amount)

  return formatted.replace('PHP', '₱')
}

export function formatDate(value) {
  if (!value) return '-'

  const date = new Date(value)
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
