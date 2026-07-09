export function formatCurrency(value) {
  const amount = Number(value ?? 0)

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

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
