export function formatCurrency(n) {
  if (n == null) return '—'
  return '$' + Number(n).toLocaleString('en-US')
}

export function formatDate(d) {
  return d
}

export function getStockStatus(qty, max) {
  const pct = max > 0 ? qty / max : 0
  if (pct < 0.2) return 'low'
  if (pct < 0.65) return 'medium'
  return 'full'
}

export function getStockColor(status) {
  if (status === 'low') return 'red'
  if (status === 'medium') return 'amber'
  return 'green'
}

export function getStockPct(qty, max) {
  return max > 0 ? Math.round((qty / max) * 100) : 0
}

export function stars(rating, max = 5) {
  return '★'.repeat(rating) + '☆'.repeat(max - rating)
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function formatLongDate(d) {
  const day = DAYS[d.getDay()]
  const month = MONTHS[d.getMonth()]
  const date = d.getDate()
  const year = d.getFullYear()
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${day}, ${month} ${date}, ${year} — ${String(h).padStart(2,'0')}:${m}:${s} ${ampm}`
}
