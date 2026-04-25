import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { getCustomersData, createCustomer, updateCustomer, deleteCustomer } from '../../lib/api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', type: 'Company' })

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getCustomersData()
      setCustomers(liveData.customers)
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

  const handleOpenEdit = (c) => {
    setEditingId(c.id)
    setFormData({ name: c.name, email: c.email !== '-' ? c.email : '', phone: c.phone !== '-' ? c.phone : '', type: c.type })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await deleteCustomer(id)
      loadData()
    } catch (err) {
      alert('Failed to delete customer')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCustomer(editingId, formData)
      } else {
        await createCustomer(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Customers / Clients" subtitle="Manage your customer accounts and contacts" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create Customer</button>
      </div>

      <div className="card section">
        <div className="card-title">Customers Directory</div>
        <div className="card-subtitle">All active customer accounts</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Email</th><th>Phone</th><th>Since</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No customers found.</td></tr>
              ) : (
                customers.map((c, i) => (
                  <tr key={c.id || i}>
                    <td>{c.name}</td>
                    <td>{c.type}</td>
                    <td className="mono">{c.email}</td>
                    <td className="mono">{c.phone}</td>
                    <td className="mono">{c.since}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', marginRight: '12px' }}>Edit</button>
                      <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>Delete</button>
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
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Customer' : 'New Customer'}</h2>
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
