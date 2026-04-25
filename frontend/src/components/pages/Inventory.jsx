import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { StatusBadge } from '../shared/StatusBadge'
import { CategoryBadge } from '../shared/CategoryBadge'
import { MOCK_DATA, CHART_COLORS } from '../../lib/data'
import { formatCurrency, getStockStatus, getStockColor, getStockPct } from '../../lib/utils'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.fill, fontWeight: 500 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  const pct = getStockPct(product.qty, product.maxQty)
  const status = getStockStatus(product.qty, product.maxQty)
  const color = getStockColor(status)
  const statusLabel = status === 'low' ? 'LOW STOCK' : status === 'medium' ? 'MEDIUM' : 'IN STOCK'

  return (
    <div className="product-card">
      <div className="product-card-header">
        <div>
          <div className="product-name">{product.name}</div>
          <div className="product-price">{formatCurrency(product.price)} per unit</div>
        </div>
        <CategoryBadge category={product.category} />
      </div>

      <div className="progress-wrap">
        <div className="progress-label">
          <span>{product.qty} / {product.maxQty} units</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="product-card-footer">
        <StatusBadge status={statusLabel} />
      </div>
    </div>
  )
}

export default function Inventory() {
  const { inventoryKpi, products, stockMovement } = MOCK_DATA

  const maxVal = 85150
  const categoryValues = [
    { label: 'Electronics', value: 85150 },
    { label: 'Furniture',   value: 1600  },
    { label: 'Other',       value: 1500  },
  ]

  const statusLabel = (p) => {
    const s = getStockStatus(p.qty, p.maxQty)
    return s === 'low' ? 'LOW STOCK' : s === 'medium' ? 'MEDIUM' : 'IN STOCK'
  }

  return (
    <div className="page">
      <PageHeader title="Inventory / Inventaire" subtitle="Stock levels and product management" />

      {/* Row 1 — KPIs */}
      <div className="kpi-grid-3 section">
        <KpiCard label="Total Products" labelSub="/ Produits" value={inventoryKpi.totalProducts} />
        <KpiCard label="Total Stock Value" labelSub="/ Valeur" value={formatCurrency(inventoryKpi.totalStockValue)} />
        <KpiCard label="Low Stock Alerts" labelSub="/ Alertes" value={inventoryKpi.lowStockAlerts} valueColor="red" sub="Laptop DZ Pro critical" />
      </div>

      {/* Row 2 — Product Cards */}
      <div className="product-grid section">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>

      {/* Row 3 — Charts */}
      <div className="charts-row charts-row-5050 section">
        <div className="card">
          <div className="card-title">Stock Movement / Mouvement de stock</div>
          <div className="card-subtitle">Incoming vs outgoing units</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stockMovement} barSize={16}>
              <CartesianGrid vertical={false} stroke="#e8e6e1" strokeWidth={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b6860' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b6860' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="incoming" name="Incoming" fill={CHART_COLORS.incoming} radius={[4, 4, 0, 0]} />
              <Bar dataKey="outgoing" name="Outgoing" fill={CHART_COLORS.outgoing} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: CHART_COLORS.incoming }} />Incoming / Entrant</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: CHART_COLORS.outgoing }} />Outgoing / Sortant</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Value by Category / Valeur par catégorie</div>
          <div className="card-subtitle">Stock value breakdown</div>
          <div className="horiz-bar-list" style={{ marginTop: 16 }}>
            {categoryValues.map(item => (
              <div key={item.label} className="horiz-bar-item">
                <div className="horiz-bar-label">
                  <span>{item.label}</span>
                  <span className="horiz-bar-val">{formatCurrency(item.value)}</span>
                </div>
                <div className="horiz-bar-track">
                  <div className="horiz-bar-fill" style={{ width: `${Math.round((item.value / maxVal) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 — Full Products Table */}
      <div className="card section">
        <div className="card-title">All Products / Tous les produits</div>
        <div className="card-subtitle">Complete product catalog</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Category</th><th>Price</th><th>Quantity</th><th>Date Added</th><th>Status</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><CategoryBadge category={p.category} /></td>
                  <td className="mono">{formatCurrency(p.price)}</td>
                  <td className="mono">{p.qty}</td>
                  <td className="mono">{p.added}</td>
                  <td><StatusBadge status={statusLabel(p)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
