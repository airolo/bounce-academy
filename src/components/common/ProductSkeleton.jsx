export function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="product-skeleton">
      <div className="skeleton-block skeleton-image" />
      <div className="skeleton-line skeleton-category" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-price" />
    </div>
  )
}
