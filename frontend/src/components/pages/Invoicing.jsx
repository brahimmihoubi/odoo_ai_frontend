import { useState, useEffect } from 'react'
import PageHeader from '../layout/PageHeader'
import { StatusBadge } from '../shared/StatusBadge'
import { getInvoicesData, postInvoice } from '../../lib/api'

export default function Invoicing() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const liveData = await getInvoicesData()
      setInvoices(liveData.invoices)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handlePost = async (id) => {
    if (!confirm('Are you sure you want to post/pay this invoice?')) return
    try {
      await postInvoice(id)
      loadData()
    } catch (err) {
      alert('Failed to post invoice')
    }
  }

  const exportCSV = () => {
    const header = ["Ref", "Customer", "Total", "Due", "State", "Payment State", "Date"]
    const rows = invoices.map(i => [
      i.ref || 'Draft', 
      i.customer, 
      i.total, 
      i.due, 
      i.state, 
      i.payment_state, 
      i.date
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "invoices_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    // A simple professional way to export PDF is to trigger the browser's print dialog 
    // which can save to PDF perfectly.
    window.print()
  }

  return (
    <div className="page" style={{ position: 'relative' }}>
      <PageHeader title="Invoicing / Facturation" subtitle="Manage customer invoices, payments, and exports" />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '16px' }} className="no-print">
        <button className="btn" style={{ border: '1px solid var(--border)', background: 'transparent' }} onClick={exportCSV}>
          Export CSV / Excel
        </button>
        <button className="btn btn-primary" onClick={exportPDF}>
          Export PDF
        </button>
      </div>

      <div className="card section print-area">
        <div className="card-title">Customer Invoices</div>
        <div className="card-subtitle">All active billing documents</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Invoice Ref</th><th>Customer</th><th>Date</th><th>Total</th><th>Due</th><th>State</th><th>Payment Status</th><th className="no-print" style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No invoices found.</td></tr>
              ) : (
                invoices.map((inv, i) => (
                  <tr key={inv.id || i}>
                    <td className="mono">{inv.ref || 'Draft'}</td>
                    <td>{inv.customer}</td>
                    <td className="mono">{inv.date}</td>
                    <td className="mono">${inv.total.toLocaleString()}</td>
                    <td className="mono" style={{ color: inv.due > 0 ? 'var(--red)' : 'inherit' }}>${inv.due.toLocaleString()}</td>
                    <td><span className="badge">{inv.state}</span></td>
                    <td><StatusBadge status={inv.payment_state === 'paid' ? 'DONE' : inv.payment_state === 'not_paid' ? 'DRAFT' : 'PENDING'} /></td>
                    <td className="no-print" style={{ textAlign: 'right' }}>
                      {inv.state === 'draft' && (
                        <button onClick={() => handlePost(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>Post / Pay</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Print-only CSS injected here for clean PDF generation */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  )
}
