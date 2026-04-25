import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell
} from 'recharts'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { StatusBadge } from '../shared/StatusBadge'
import { MOCK_DATA, DONUT_COLORS } from '../../lib/data'
import { formatCurrency } from '../../lib/utils'
import { getDashboardData } from '../../lib/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
      <div style={{ color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  )
}

export default function Overview() {
  const [data, setData] = useState({
    kpi: MOCK_DATA.kpi,
    recentActivity: MOCK_DATA.recentActivity,
  });

  const { weeklySales, salesByCategory } = MOCK_DATA

  useEffect(() => {
    async function loadData() {
      try {
        const liveData = await getDashboardData();
        setData(liveData);
      } catch (err) {
        console.error("Using fallback mock data due to Odoo fetch error:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="page">
      <PageHeader title="Overview / Vue d'ensemble" subtitle="Business snapshot — Aperçu de l'activité" />

      {/* Row 1 */}
      <div className="kpi-grid section">
        <KpiCard label="Revenue" labelSub="/ Chiffre d'affaires" value={formatCurrency(data.kpi.revenue)} delta="+∞% vs last period" deltaColor="green" />
        <KpiCard label="Orders" labelSub="/ Commandes" value={data.kpi.orders} delta="+∞%" deltaColor="green" sub={`${data.kpi.orders} confirmed`} />
        <KpiCard label="Customers" labelSub="/ Clients" value={data.kpi.customers} sub={`${data.kpi.customers} active accounts`} deltaColor="gray" />
        <KpiCard label="Suppliers" labelSub="/ Fournisseurs" value={data.kpi.suppliers} sub="Avg lead: 7.5 days" deltaColor="gray" />
      </div>

      {/* Row 2 */}
      <div className="kpi-grid section">
        <KpiCard label="Products" labelSub="/ Produits" value={data.kpi.products} sub="Across multiple categories" />
        <KpiCard label="Stock Value" labelSub="/ Valeur du stock" value={formatCurrency(data.kpi.stockValue || 86650)} sub="Electronics dominant" />
        <KpiCard label="Low Stock Alerts" labelSub="/ Alertes stock" value={data.kpi.lowStockAlerts || 1} sub="Laptop DZ Pro critical" valueColor="red" />
        <KpiCard label="Avg Order" labelSub="/ Commande moyenne" value={formatCurrency(data.kpi.avgOrder)} sub="Per confirmed order" />
      </div>

      {/* Row 3 — Charts */}
      <div className="charts-row charts-row-6040 section">
        <div className="card">
          <div className="card-title">Monthly Sales / Ventes mensuelles</div>
          <div className="card-subtitle">Revenue by week — Revenus par semaine</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySales} barSize={32}>
              <CartesianGrid vertical={false} stroke="#e8e6e1" strokeWidth={0.5} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b6860' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#6b6860' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#1a1916" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Sales by Category / Par catégorie</div>
          <div className="card-subtitle">Revenue distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={salesByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                {salesByCategory.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {salesByCategory.map((item, i) => (
              <span key={item.name} className="legend-item">
                <span className="legend-dot" style={{ background: DONUT_COLORS[i] }} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 — Recent Activity */}
      <div className="card section">
        <div className="card-title">Recent Activity / Activité récente</div>
        <div className="card-subtitle">Last transactions across all modules</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th><th>Reference</th><th>Partner</th>
                <th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((row, i) => (
                <tr key={row.ref + i}>
                  <td>{row.type}</td>
                  <td className="mono">{row.ref}</td>
                  <td>{row.partner}</td>
                  <td className="mono">{row.amount}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td className="mono">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
