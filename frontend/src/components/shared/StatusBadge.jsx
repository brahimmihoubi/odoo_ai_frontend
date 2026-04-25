export function StatusBadge({ status }) {
  const map = {
    PAID: 'badge-paid', DONE: 'badge-done', ACTIVE: 'badge-active',
    'IN STOCK': 'badge-in-stock', CONFIRMED: 'badge-confirmed',
    MEDIUM: 'badge-medium', REVIEW: 'badge-review',
    DRAFT: 'badge-draft', 'LOW STOCK': 'badge-low-stock',
    ERROR: 'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-draft'}`}>{status}</span>
}
