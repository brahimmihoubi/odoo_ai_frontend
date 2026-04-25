export function CategoryBadge({ category }) {
  const map = {
    Electronics: 'badge-electronics',
    Furniture: 'badge-furniture',
    Food: 'badge-food',
    Other: 'badge-other-cat',
    Internal: 'badge-internal',
  }
  return <span className={`badge ${map[category] || 'badge-other-cat'}`}>{category}</span>
}
