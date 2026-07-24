export default function QuantityControl({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300">
      <button type="button" aria-label="Decrease quantity" className="px-3 py-1 text-lg" onClick={onDecrease}>
        -
      </button>
      <span className="min-w-10 border-x border-gray-300 px-3 py-1 text-center text-sm" aria-live="polite" aria-atomic="true">{quantity}</span>
      <button type="button" aria-label="Increase quantity" className="px-3 py-1 text-lg" onClick={onIncrease}>
        +
      </button>
    </div>
  )
}