import { Link } from 'react-router-dom'

export function CategoryCard({ category }) {
  return (
    <Link className="category-card" to="/shop">
      <img alt="" loading="lazy" src={category.image} />
      <div className="category-card-content">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
      </div>
    </Link>
  )
}
