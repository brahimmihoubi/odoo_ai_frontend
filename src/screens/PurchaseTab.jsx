import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './MyCustomersTab.css'; 

export default function PurchaseTab() {
  const [purchases, setPurchases] = useState([
    { id: 1, ref: 'PO-2001', supplier: 'TechDZ Company', date: '2024-04-11', total: 2100, status: 'Ordered' },
    { id: 2, ref: 'PO-2002', supplier: 'Furniture Plus', date: '2024-04-12', total: 4200, status: 'Received' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ref: '', supplier: '', date: '', total: 0, status: 'Ordered' });

  const openModal = (po = null) => {
    if (po) {
      setEditingId(po.id);
      setFormData(po);
    } else {
      setEditingId(null);
      setFormData({ ref: `PO-${Math.floor(Math.random() * 9000) + 1000}`, supplier: '', date: '', total: 0, status: 'Ordered' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setPurchases(purchases.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      setPurchases([...purchases, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Purchase Orders</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add PO
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Ref</th>
                <th>Supplier</th>
                <th>Expected Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{width: '80px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td><span className="mono" style={{ fontSize: '13px' }}>{p.ref}</span></td>
                  <td>{p.supplier}</td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{p.date}</span></td>
                  <td><span className="mono" style={{ fontSize: '13px' }}>${p.total}</span></td>
                  <td><span className={`pill ${p.status === 'Ordered' ? 'blue' : 'green'}`} style={p.status === 'Ordered' ? {backgroundColor: '#e0f2fe', color: '#0369a1'} : {}}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => openModal(p)}><Edit2 size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(p.id)}><Trash2 size={14} color="#991b1b" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit PO" : "New PO"}>
        <div className="form-group">
          <label>Supplier</label>
          <input className="form-input" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Expected Date</label>
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
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save PO</button>
        </div>
      </Modal>
    </div>
  );
}
