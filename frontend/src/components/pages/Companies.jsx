import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { getCompaniesData, createCompany, updateCompany, deleteCompany } from '../../lib/api'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', vat: '' })

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getCompaniesData()
      setCompanies(liveData.companies)
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
    setFormData({ name: '', email: '', phone: '', vat: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (c) => {
    setEditingId(c.id)
    setFormData({ name: c.name, email: c.email !== '-' ? c.email : '', phone: c.phone !== '-' ? c.phone : '', vat: c.vat !== '-' ? c.vat : '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return
    try {
      await deleteCompany(id)
      loadData()
    } catch (err) {
      alert('Failed to delete company')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCompany(editingId, formData)
      } else {
        await createCompany(formData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      alert('Operation failed')
    }
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Companies / Sociétés" subtitle="Manage your Odoo instance companies" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={handleOpenCreate}>+ Create Company</button>
      </div>

      <div className="card section">
        <div className="card-title">Registered Companies</div>
        <div className="card-subtitle">Multi-company environment data</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>VAT</th><th>Currency</th><th>Country</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No companies found.</td></tr>
              ) : (
                companies.map((c, i) => (
                  <tr key={c.id || i}>
                    <td>{c.name}</td>
                    <td className="mono">{c.email}</td>
                    <td className="mono">{c.phone}</td>
                    <td className="mono">{c.vat}</td>
                    <td><span className="badge">{c.currency}</span></td>
                    <td>{c.country}</td>
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
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingId ? 'Edit Company' : 'New Company'}</h2>
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
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>VAT</label>
                <input className="chat-input" style={{ width: '100%' }} value={formData.vat} onChange={e => setFormData({...formData, vat: e.target.value})} />
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
