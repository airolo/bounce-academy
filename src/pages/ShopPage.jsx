import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../components/storefront/ProductCard'
import { ProductSkeleton } from '../components/common/ProductSkeleton'
import { listProducts } from '../services/productService'

const categories = [
  { label: 'All products', value: '' },
  { label: 'Shirts', value: 'shirts' },
  { label: 'Shorts', value: 'shorts' },
  { label: 'Socks', value: 'socks' },
  { label: 'Basketball Shoes', value: 'basketball-shoes' },
]

export function ShopPage() {
  const [filters, setFilters] = useState({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })
  const [result, setResult] = useState({ products: [], count: 0 })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const pageSize = 8
  const debounceTimer = useRef(null)

  const loadProducts = (nextFilters) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      // eslint-disable-next-line react/set-state-in-effect -- Async data fetch requires setState in an effect; loading state cannot be derived during render.
      setStatus('loading')
      listProducts({ ...nextFilters, pageSize }).then((nextResult) => {
        setResult(nextResult)
        setStatus('ready')
      }).catch((loadError) => {
        console.error('Unable to load products.', loadError)
        setError('We could not load the collection. Please try again.')
        setStatus('error')
      })
    }, 300)
  }

  useEffect(() => {
    loadProducts(filters)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [filters])

  const pageCount = Math.max(1, Math.ceil(result.count / pageSize))
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }))

  return (
    <div className="storefront shop-page">
      <section className="shop-hero"><span className="eyebrow orange">The collection</span><h1>Made for your<br />next move.</h1><p>Premium essentials engineered for the court, the streets, and everywhere in between.</p></section>
      <section className="section shop-content">
        <div className="shop-toolbar">
          <div className="category-tabs">{categories.map((item) => <button className={filters.category === item.value ? 'active' : ''} key={item.value} onClick={() => updateFilter('category', item.value)} type="button">{item.label}</button>)}</div>
          <div className="shop-controls">
            <label className="search-field"><Search size={16} /><input aria-label="Search products" onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search products" value={filters.search} /></label>
            <select aria-label="Sort products" onChange={(event) => updateFilter('sort', event.target.value)} value={filters.sort}><option value="newest">Newest</option><option value="name">Name</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select>
          </div>
        </div>
        <details className="price-filter"><summary><SlidersHorizontal size={15} /> Filter by price</summary><div><input aria-label="Minimum price" min="0" onChange={(event) => updateFilter('minPrice', event.target.value)} placeholder="Min ₱" type="number" value={filters.minPrice} /><input aria-label="Maximum price" min="0" onChange={(event) => updateFilter('maxPrice', event.target.value)} placeholder="Max ₱" type="number" value={filters.maxPrice} /></div></details>
        {status === 'loading' && <div className="product-grid shop-grid">{Array.from({ length: pageSize }, (_, index) => <ProductSkeleton key={index} />)}</div>}
        {status === 'error' && <div className="shop-state"><p>{error}</p><button className="button button-outline" onClick={() => updateFilter('page', filters.page)} type="button">Try again</button></div>}
        {status === 'ready' && !result.products.length && <div className="shop-state"><h2>No products found</h2><p>Try a different search or category.</p><Link className="button button-outline" to="/shop">Clear filters</Link></div>}
        {status === 'ready' && result.products.length > 0 && <><div className="product-grid shop-grid">{result.products.map((product) => <ProductCard key={product.id} product={product} />)}</div><div className="pagination"><button disabled={filters.page === 1} onClick={() => updateFilter('page', filters.page - 1)} type="button">Previous</button><span>Page {filters.page} of {pageCount}</span><button disabled={filters.page >= pageCount} onClick={() => updateFilter('page', filters.page + 1)} type="button">Next</button></div></>}
      </section>
    </div>
  )
}
