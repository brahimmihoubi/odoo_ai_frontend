import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { StatusBadge } from '../shared/StatusBadge'
import { formatCurrency } from '../../lib/utils'
import { getPurchasesData, createPurchase, updatePurchase, deletePurchase } from '../../lib/api'

export default function Purchases() {
  const [data, setData] = useState({ purchaseKpi: null, purchaseOrders: [] })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ partner_id: '' })

  const [suppliersList, setSuppliersList] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getPurchasesData()
      setData(liveData)
      
      // Fetch suppliers for the dropdown
      import('../../lib/api').then(async (api) => {
        try {
          const supps = await api.getSuppliersData()
          setSuppliersList(supps.suppliers || [])
        } catch(e) { console.error("Error fetching suppliers", e) }
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
    setFormData({ partner_id: suppliersList.length > 0 ? suppliersList[0].id : '' })
    setShowModal(true)
  }

  const handleOpenEdit = (o) => {
    setEditingId(o.id)
    setFormData({ partner_id: suppliersList.length > 0 ? suppliersList[0].id : '' }) 
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return
    try {
      await deletePurchase(id)
      loadData()
    } catch (err) {
      alert('Failed to delete purchase order')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { partner_id: parseInt(formData.partner_id) || 1 }
      if (editingId) {
        await updatePurchase(editingId, payload)
      } else {
        await createPurchase(payload)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Purchases / Achats" subtitle="Manage your purchase orders and vendor bills" />

      {/* Row 1 — KPIs */}
      {data.purchaseKpi && (
        <div className="kpi-grid section">
          <KpiCard label="Total Purchases" labelSub="/ Achats" value={formatCurrency(data.purchaseKpi.totalPurchases)} delta="+12%" deltaColor="red" />
          <KpiCard label="Purchase Orders" labelSub="/ Commandes" value={data.purchaseOrders.length} sub="Pending delivery" />
          <KpiCard label="Pending Bills" labelSub="/ Factures" value={data.purchaseKpi.pendingBills} valueColor="red" />
          <KpiCard label="Avg Lead Time" labelSub="/ Délai moyen" value={`${data.purchaseKpi.avgLeadTime} days`} deltaColor="gray" />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create PO</button>
      </div>

      {/* Row 2 — Purchase Orders */}
      <div className="card section">
        <div className="card-title">Purchase Orders / Bons de commande</div>
        <div className="card-subtitle">All purchase transactions</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>PO Ref</th><th>Vendor</th><th>Product</th><th>Total</th><th>Receipt</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : data.purchaseOrders.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No purchase orders found.</td></tr>
              ) : (
                data.purchaseOrders.map((o, i) => (
                  <tr key={o.id || i}>
                    <td className="mono">{o.ref}</td>
                    <td>{o.vendor}</td>
                    <td>{o.product}</td>
                    <td className="mono">{o.total}</td>
                    <td className="mono">{o.receipt}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="mono">{o.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: '12px' }}>Edit</button>
                      <button onClick={() => handleDelete(o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>Delete</button>
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
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit PO' : 'New Purchase Order'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Select Vendor</label>
                <select required className="chat-input" style={{ width: '100%', cursor: 'pointer' }} value={formData.partner_id} onChange={e => setFormData({...formData, partner_id: e.target.value})}>
                  <option value="" disabled>-- Choose a vendor --</option>
                  {suppliersList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Fetched directly from Odoo Suppliers database.</p>
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
