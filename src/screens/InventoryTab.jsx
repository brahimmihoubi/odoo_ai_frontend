import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js';
import './InventoryTab.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const gridConfig = { color: '#e8e6e1', lineWidth: 0.5 };
const tickConfig = { color: '#6b6860', font: { size: 11, family: "'DM Mono', monospace" } };

export default function InventoryTab() {
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop DZ Pro', category: 'Electronics', incoming: 5, outgoing: 9, current: 1, max: 10 },
    { id: 2, name: 'Office Chair X', category: 'Furniture', incoming: 8, outgoing: 3, current: 5, max: 10 },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'Electronics', incoming: 0, outgoing: 0, current: 0, max: 10 });

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'Electronics', incoming: 0, outgoing: 0, current: 0, max: 10 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setItems(items.map(i => i.id === editingId ? { ...formData, id: editingId } : i));
    } else {
      setItems([...items, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const stockData = {
    labels: items.map(i => i.name),
    datasets: [
      {
        label: 'Incoming',
        data: items.map(i => i.incoming),
        backgroundColor: '#2d6a4f',
        borderRadius: 4,
        borderSkipped: false
      },
      {
        label: 'Outgoing',
        data: items.map(i => i.outgoing),
        backgroundColor: '#991b1b',
        borderRadius: 4,
        borderSkipped: false
      }
    ]
  };

  const stockOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: gridConfig, ticks: { ...tickConfig, maxRotation: 0 }, border: { color: '#e8e6e1' } },
      y: { grid: gridConfig, ticks: tickConfig, border: { color: '#e8e6e1' } }
    }
  };

  return (
    <div className="tab-panel active">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{fontSize: '18px', fontWeight: 600, margin: 0}}>Inventory Tracking</h2>
        <button className="btn dark" onClick={() => openModal()}>
          <Plus size={14} style={{marginRight: '4px'}}/> Add Item
        </button>
      </div>
      <div className="inv-grid">
        {items.map(i => (
          <div key={i.id} className="card inv-card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
              <button className="icon-btn" onClick={() => openModal(i)}><Edit2 size={14} /></button>
              <button className="icon-btn" onClick={() => handleDelete(i.id)}><Trash2 size={14} color="#991b1b" /></button>
            </div>
            <div className="inv-header" style={{ paddingRight: '60px' }}>
              <span className="inv-name">{i.name}</span>
              <span className={`badge ${i.category === 'Electronics' ? 'blue' : i.category === 'Furniture' ? 'amber' : 'gray'}`}>{i.category}</span>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${i.current/i.max < 0.3 ? 'bg-red' : i.current/i.max < 0.7 ? 'bg-amber' : 'bg-green'}`} style={{ width: `${Math.min(100, (i.current/i.max)*100)}%` }}></div>
            </div>
            <div className="inv-meta">
              <span className="inv-units mono">{i.current} / {i.max} units</span>
              <span className={`pill ${i.current/i.max < 0.3 ? 'red' : i.current/i.max < 0.7 ? 'amber' : 'green'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                {i.current/i.max < 0.3 ? 'Low stock' : i.current/i.max < 0.7 ? 'Medium' : 'Full stock'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Stock Movement / Mouvement de stock</div>
        <div className="chart-wrap" style={{ height: '220px' }}>
          <Bar data={stockData} options={stockOptions} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Item" : "New Item"}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Max Units</label>
            <input type="number" className="form-input" value={formData.max} onChange={e => setFormData({...formData, max: Number(e.target.value)})} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Current Stock</label>
            <input type="number" className="form-input" value={formData.current} onChange={e => setFormData({...formData, current: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Incoming</label>
            <input type="number" className="form-input" value={formData.incoming} onChange={e => setFormData({...formData, incoming: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Outgoing</label>
            <input type="number" className="form-input" value={formData.outgoing} onChange={e => setFormData({...formData, outgoing: Number(e.target.value)})} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Item</button>
        </div>
      </Modal>
    </div>
  );
}
