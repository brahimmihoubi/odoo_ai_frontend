import { useClock } from '../../hooks/useClock'

export default function PageHeader({ title, subtitle }) {
  const clock = useClock()
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      <div className="page-clock">{clock}</div>
    </div>
  )
}
