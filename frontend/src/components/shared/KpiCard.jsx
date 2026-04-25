export function KpiCard({ label, labelSub, value, delta, deltaColor = 'gray', sub, valueColor }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">
        {label}
        {labelSub && <span className="kpi-label-sub">{labelSub}</span>}
      </div>
      <div className={`kpi-value${valueColor ? ` ${valueColor}` : ''}`}>{value}</div>
      {delta && (
        <div className={`kpi-delta ${deltaColor}`}>
          {deltaColor === 'green' ? '↑' : '→'} {delta}
        </div>
      )}
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  )
}
