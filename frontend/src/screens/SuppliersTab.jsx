import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './SuppliersTab.css';

export default function SuppliersTab() {
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'TechDZ Company', email: 'tech@techdz.dz', category: 'Electronics', leadTime: '5 days', rating: 5, status: 'Active' },
    { id: 2, name: 'Furniture Plus', email: 'info@furnitureplus.dz', category: 'Furniture', leadTime: '10 days', rating: 4, status: 'Active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', category: 'Electronics', leadTime: '', rating: 5, status: 'Active' });

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingId(supplier.id);
      setFormData(supplier);
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', category: 'Electronics', leadTime: '', rating: 5, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setSuppliers(suppliers.map(s => s.id === editingId ? { ...formData, id: editingId } : s));
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Suppliers / Fournisseurs</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add Supplier
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier / Fournisseur</th>
                <th>Category / Catégorie</th>
                <th>Lead Time / Délai</th>
                <th>Rating / Note</th>
                <th>Status</th>
                <th style={{width: '80px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="sup-name">{s.name}</div>
                    <div className="sup-email">{s.email}</div>
                  </td>
                  <td><span className={`badge ${s.category === 'Electronics' ? 'blue' : s.category === 'Furniture' ? 'amber' : 'gray'}`}>{s.category}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{s.leadTime}</span></td>
                  <td><span className="stars">{'★'.repeat(s.rating)}{'☆'.repeat(5-s.rating)}</span></td>
                  <td><span className={`pill ${s.status === 'Active' ? 'green' : 'amber'}`}>{s.status}</span></td>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Supplier" : "New Supplier"}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Internal">Internal</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Lead Time</label>
            <input type="text" className="form-input" value={formData.leadTime} onChange={e => setFormData({...formData, leadTime: e.target.value})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rating (1-5)</label>
            <input type="number" min="1" max="5" className="form-input" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Active">Active</option>
              <option value="Review">Review</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Supplier</button>
        </div>
      </Modal>
    </div>
  );
}
