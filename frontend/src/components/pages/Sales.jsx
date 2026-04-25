import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { StatusBadge } from '../shared/StatusBadge'
import { formatCurrency } from '../../lib/utils'
import { getSalesData, createSale, updateSale, deleteSale } from '../../lib/api'

export default function Sales() {
  const [data, setData] = useState({ salesKpi: null, salesOrders: [] })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ partner_id: '' })

  const [customersList, setCustomersList] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getSalesData()
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
    setFormData({ partner_id: customersList.length > 0 ? customersList[0].id : '' })
    setShowModal(true)
  }

  const handleOpenEdit = (o) => {
    setEditingId(o.id)
    setFormData({ partner_id: customersList.length > 0 ? customersList[0].id : '' }) 
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return
    try {
      await deleteSale(id)
      loadData()
    } catch (err) {
      alert('Failed to delete sales order')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { partner_id: parseInt(formData.partner_id) || 1 }
      if (editingId) {
        await updateSale(editingId, payload)
      } else {
        await createSale(payload)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Sales / Ventes" subtitle="Manage your sales orders and revenue" />

      {/* Row 1 — KPIs */}
      {data.salesKpi && (
        <div className="kpi-grid section">
          <KpiCard label="Total Sales" labelSub="/ Ventes" value={formatCurrency(data.salesKpi.totalSales)} delta="+8%" deltaColor="green" />
          <KpiCard label="Active Customers" labelSub="/ Clients actifs" value={data.salesKpi.activeCustomers} sub="Purchased this month" />
          <KpiCard label="Avg Order Value" labelSub="/ Panier moyen" value="$1,250" delta="+2%" deltaColor="green" />
          <KpiCard label="Pending Invoices" labelSub="/ Factures en attente" value={data.salesKpi.pendingInvoices} valueColor="red" />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create Sales Order</button>
      </div>

      {/* Row 2 — Sales Orders */}
      <div className="card section">
        <div className="card-title">Recent Sales / Ventes Récentes</div>
        <div className="card-subtitle">Last 30 days transactions</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order Ref</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : data.salesOrders.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No sales orders found.</td></tr>
              ) : (
                data.salesOrders.map((s, i) => (
                  <tr key={s.id || i}>
                    <td className="mono">{s.ref}</td>
                    <td>{s.customer}</td>
                    <td>{s.product}</td>
                    <td className="mono">{s.total}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="mono">{s.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: '12px' }}>Edit</button>
                      <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Sales Order' : 'New Sales Order'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
