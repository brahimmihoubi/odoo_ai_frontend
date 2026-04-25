import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './MyCustomersTab.css'; 

export default function SaleTab() {
  const [sales, setSales] = useState([
    { id: 1, ref: 'SO-3001', customer: 'Customer A', date: '2024-03-11', total: 850, status: 'Invoiced' },
    { id: 2, ref: 'SO-3002', customer: 'Customer B', date: '2024-03-12', total: 1700, status: 'Draft' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ref: '', customer: '', date: '', total: 0, status: 'Draft' });

  const openModal = (so = null) => {
    if (so) {
      setEditingId(so.id);
      setFormData(so);
    } else {
      setEditingId(null);
      setFormData({ ref: `SO-${Math.floor(Math.random() * 9000) + 1000}`, customer: '', date: '', total: 0, status: 'Draft' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setSales(sales.map(s => s.id === editingId ? { ...formData, id: editingId } : s));
    } else {
      setSales([...sales, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setSales(sales.filter(s => s.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Sales Orders</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add SO
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>SO Ref</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{width: '80px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td><span className="mono" style={{ fontSize: '13px' }}>{s.ref}</span></td>
                  <td>{s.customer}</td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{s.date}</span></td>
                  <td><span className="mono" style={{ fontSize: '13px' }}>${s.total}</span></td>
                  <td><span className={`pill ${s.status === 'Invoiced' ? 'green' : 'gray'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => openModal(s)}><Edit2 size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(s.id)}><Trash2 size={14} color="#991b1b" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit SO" : "New SO"}>
        <div className="form-group">
          <label>Customer</label>
          <input className="form-input" value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Total ($)</label>
            <input type="number" className="form-input" value={formData.total} onChange={e => setFormData({...formData, total: Number(e.target.value)})} />
          </div>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
            <option value="Draft">Draft</option>
            <option value="Invoiced">Invoiced</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save SO</button>
        </div>
      </Modal>
    </div>
  );
}
