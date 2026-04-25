import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { getCrmData, createLead, updateLead, deleteLead } from '../../lib/api'

export default function CRM() {
  const [data, setData] = useState({
    leads: [],
    crmKpi: { totalLeads: 0, wonLeads: 0, expectedRevenue: 0, winRate: "0%" }
  })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', expected_revenue: 0, partner_id: '' })
  const [customersList, setCustomersList] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getCrmData()
      setData(liveData)

      // Fetch customers for the dropdown
      import('../../lib/api').then(async (api) => {
        try {
          const custs = await api.getCustomersData()
          setCustomersList(custs.customers || [])
        } catch(e) { console.error("Error fetching customers", e) }
      })
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({ name: '', expected_revenue: 0, partner_id: customersList.length > 0 ? customersList[0].id : '' })
    setShowModal(true)
  }

  const handleOpenEdit = (l) => {
    setEditingId(l.id)
    setFormData({ 
      name: l.name, 
      expected_revenue: typeof l.revenue === 'string' ? parseFloat(l.revenue.replace(/[^0-9.-]+/g,"")) : l.revenue, 
      partner_id: customersList.length > 0 ? customersList[0].id : '' 
    }) 
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lead/opportunity?')) return
    try {
      await deleteLead(id)
      loadData()
    } catch (err) {
      alert('Failed to delete lead')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { 
        name: formData.name,
        expected_revenue: parseFloat(formData.expected_revenue) || 0,
        partner_id: parseInt(formData.partner_id) || 1 
      }
      if (editingId) {
        await updateLead(editingId, payload)
      } else {
        await createLead(payload)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  const { leads, crmKpi } = data

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="CRM / Pipeline" subtitle="Manage your leads, opportunities, and sales funnel" />

      {/* KPIs */}
      <div className="kpi-grid section">
        <KpiCard label="Total Leads" labelSub="/ Pistes" value={crmKpi.totalLeads} />
        <KpiCard label="Won Leads" labelSub="/ Gagnées" value={crmKpi.wonLeads} deltaColor="green" />
        <KpiCard label="Expected Revenue" labelSub="/ Revenu attendu" value={crmKpi.expectedRevenue} deltaColor="green" />
        <KpiCard label="Win Rate" labelSub="/ Taux de victoire" value={crmKpi.winRate} deltaColor="green" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create Opportunity</button>
      </div>

      {/* Leads Table */}
      <div className="card section">
        <div className="card-title">Pipeline</div>
        <div className="card-subtitle">Active leads and opportunities</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Customer</th><th>Type</th><th>Stage</th><th>Probability</th><th>Expected Revenue</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : leads.map((l, i) => (
                <tr key={l.id || i}>
                  <td>{l.name}</td>
                  <td>{l.customer}</td>
                  <td>{l.type}</td>
                  <td><span className="badge">{l.stage}</span></td>
                  <td className="mono">{l.probability}</td>
                  <td className="mono">{l.revenue}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(l)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: '12px' }}>Edit</button>
                    <button onClick={() => handleDelete(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && leads.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No CRM leads found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Opportunity' : 'New Opportunity'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Opportunity Name</label>
                <input required className="chat-input" style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Server Upgrade Project" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Expected Revenue ($)</label>
                <input required type="number" step="0.01" className="chat-input" style={{ width: '100%' }} value={formData.expected_revenue} onChange={e => setFormData({...formData, expected_revenue: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Select Customer</label>
                <select required className="chat-input" style={{ width: '100%', cursor: 'pointer' }} value={formData.partner_id} onChange={e => setFormData({...formData, partner_id: e.target.value})}>
                  <option value="" disabled>-- Choose a customer --</option>
                  {customersList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Fetched directly from Odoo Customers database.</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
