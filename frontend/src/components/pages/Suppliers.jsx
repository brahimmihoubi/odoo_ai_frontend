import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { KpiCard } from '../shared/KpiCard'
import { getSuppliersData, createSupplier, updateSupplier, deleteSupplier } from '../../lib/api'

export default function Suppliers() {
  const [data, setData] = useState({ supplierKpi: null, suppliers: [] })
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', type: 'Company' })

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getSuppliersData()
      setData(liveData)
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
    setFormData({ name: '', email: '', phone: '', type: 'Company' })
    setShowModal(true)
  }

  const handleOpenEdit = (s) => {
    setEditingId(s.id)
    setFormData({ name: s.name, email: s.email !== '-' ? s.email : '', phone: s.phone !== '-' ? s.phone : '', type: s.type })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return
    try {
      await deleteSupplier(id)
      loadData()
    } catch (err) {
      alert('Failed to delete supplier')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateSupplier(editingId, formData)
      } else {
        await createSupplier(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Suppliers / Fournisseurs" subtitle="Manage your vendor accounts and supply chain" />

      {/* Row 1 — KPIs */}
      {data.supplierKpi && (
        <div className="kpi-grid section">
          <KpiCard label="Active Suppliers" labelSub="/ Fournisseurs" value={data.supplierKpi.activeSuppliers} />
          <KpiCard label="New Partners" labelSub="/ Nouveaux" value={1} sub="Added this month" />
          <KpiCard label="Avg Rating" labelSub="/ Note moyenne" value="4.5/5" />
          <KpiCard label="Avg Lead Time" labelSub="/ Délai moyen" value={`${data.supplierKpi.avgLeadTime} days`} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create Supplier</button>
      </div>

      {/* Row 2 — Supplier Directory */}
      <div className="card section">
        <div className="card-title">Vendor Directory / Répertoire</div>
        <div className="card-subtitle">All active supplier accounts</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Supplier Name</th><th>Type</th><th>Email</th><th>Phone</th><th>Since</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : data.suppliers.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No suppliers found.</td></tr>
              ) : (
                data.suppliers.map((s, i) => (
                  <tr key={s.id || i}>
                    <td>{s.name}</td>
                    <td>{s.type}</td>
                    <td className="mono">{s.email}</td>
                    <td className="mono">{s.phone}</td>
                    <td className="mono">{s.since}</td>
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
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Supplier' : 'New Supplier'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Name</label>
                <input required className="chat-input" style={{ width: '100%' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Email</label>
                <input type="email" className="chat-input" style={{ width: '100%' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Phone</label>
                <input className="chat-input" style={{ width: '100%' }} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Type</label>
                <select className="chat-input" style={{ width: '100%' }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="Company">Company</option>
                  <option value="Individual">Individual</option>
                </select>
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
