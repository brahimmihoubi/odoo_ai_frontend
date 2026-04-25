import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './MyCustomersTab.css'; 

export default function MyOrdersTab() {
  const [orders, setOrders] = useState([
    { id: 1, ref: 'ORD-1001', customer: 'Customer 1', date: '2024-03-01', total: 450, status: 'Delivered' },
    { id: 2, ref: 'ORD-1002', customer: 'Customer 2', date: '2024-03-02', total: 900, status: 'Pending' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ref: '', customer: '', date: '', total: 0, status: 'Pending' });

  const openModal = (order = null) => {
    if (order) {
      setEditingId(order.id);
      setFormData(order);
    } else {
      setEditingId(null);
      setFormData({ ref: `ORD-${Math.floor(Math.random() * 9000) + 1000}`, customer: '', date: '', total: 0, status: 'Pending' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setOrders(orders.map(o => o.id === editingId ? { ...formData, id: editingId } : o));
    } else {
      setOrders([...orders, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>My Orders</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add Order
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{width: '80px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><span className="mono" style={{ fontSize: '13px' }}>{o.ref}</span></td>
                  <td>{o.customer}</td>
                  <td><span className="mono" style={{ fontSize: '12px' }}>{o.date}</span></td>
                  <td><span className="mono" style={{ fontSize: '13px' }}>${o.total}</span></td>
                  <td><span className={`pill ${o.status === 'Delivered' ? 'green' : 'amber'}`}>{o.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="icon-btn" onClick={() => openModal(o)}><Edit2 size={14} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(o.id)}><Trash2 size={14} color="#991b1b" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Order" : "New Order"}>
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
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Order</button>
        </div>
      </Modal>
    </div>
  );
}
