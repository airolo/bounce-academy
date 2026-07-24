const statusStyle = {
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  processing: 'bg-black text-white border-black',
  shipped: 'bg-white text-black border-black',
  delivered: 'bg-gray-800 text-white border-gray-800',
}

export default function StatusBadge({ status = 'pending' }) {
  const key = String(status).toLowerCase()
  const style = statusStyle[key] ?? statusStyle.pending

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${style}`} aria-label={`Status: ${key}`}>
      {key}
    </span>
  )
}
