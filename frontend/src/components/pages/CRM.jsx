import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { getCrmData } from '../../lib/api'

export default function CRM() {
  const [data, setData] = useState({
    leads: [],
    crmKpi: { totalLeads: 0, wonLeads: 0, expectedRevenue: 0, winRate: "0%" }
  })

  useEffect(() => {
    async function loadData() {
      try {
        const liveData = await getCrmData()
        setData(liveData)
      } catch (err) {
        console.error("Using fallback mock data due to Odoo fetch error:", err)
      }
    }
    loadData()
  }, [])

  const { leads, crmKpi } = data

  return (
    <div className="page">
      <PageHeader title="CRM / Pipeline" subtitle="Manage your leads, opportunities, and sales funnel" />

      {/* KPIs */}
      <div className="kpi-grid section">
        <KpiCard label="Total Leads" labelSub="/ Pistes" value={crmKpi.totalLeads} />
        <KpiCard label="Won Leads" labelSub="/ Gagnées" value={crmKpi.wonLeads} deltaColor="green" />
        <KpiCard label="Expected Revenue" labelSub="/ Revenu attendu" value={crmKpi.expectedRevenue} deltaColor="green" />
        <KpiCard label="Win Rate" labelSub="/ Taux de victoire" value={crmKpi.winRate} deltaColor="green" />
      </div>

      {/* Leads Table */}
      <div className="card section">
        <div className="card-title">Pipeline</div>
        <div className="card-subtitle">Active leads and opportunities</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Stage</th><th>Probability</th><th>Expected Revenue</th></tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.name + i}>
                  <td>{l.name}</td>
                  <td>{l.type}</td>
                  <td><span className="badge">{l.stage}</span></td>
                  <td className="mono">{l.probability}</td>
                  <td className="mono">{l.revenue}</td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No CRM leads found. Are you sure the CRM module is installed?</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
