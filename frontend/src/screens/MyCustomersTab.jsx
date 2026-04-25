import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './MyCustomersTab.css';

export default function MyCustomersTab() {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'TechDZ Corp', email: 'contact@techdz.dz', status: 'Active', orders: 12, spent: 15000 },
    { id: 2, name: 'Acme Inc', email: 'hello@acme.com', status: 'Inactive', orders: 2, spent: 250 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', status: 'Active', orders: 0, spent: 0 });

  const openModal = (customer = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', status: 'Active', orders: 0, spent: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setCustomers(customers.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
    } else {
      setCustomers([...customers, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>My Customers</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add Customer
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th style={{width: '80px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="sup-name">{c.name}</div>
                    <div className="sup-email">{c.email}</div>
                  </td>
                  <td><span className={`pill ${c.status === 'Active' ? 'green' : 'gray'}`}>{c.status}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{c.orders}</span></td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>${c.spent}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => openModal(c)}><Edit2 size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(c.id)}><Trash2 size={14} color="#991b1b" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Customer" : "New Customer"}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select className="form-input" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Orders</label>
            <input type="number" className="form-input" value={formData.orders} onChange={e => setFormData({...formData, orders: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Total Spent ($)</label>
            <input type="number" className="form-input" value={formData.spent} onChange={e => setFormData({...formData, spent: Number(e.target.value)})} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Customer</button>
        </div>
      </Modal>
    </div>
  );
}
