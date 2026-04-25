import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './CrmTab.css';

export default function CrmTab() {
  const [leads, setLeads] = useState([
    { id: 1, title: 'Software Upgrade', revenue: 15000, client: 'TechDZ', stage: 'New' },
    { id: 2, title: 'Server Setup', revenue: 5000, client: 'Client B', stage: 'New' },
    { id: 3, title: 'Cloud Migration', revenue: 20000, client: 'Corp C', stage: 'Qualified' },
    { id: 4, title: 'Consulting Retainer', revenue: 10000, client: 'Acme Inc', stage: 'Won' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', revenue: 0, client: '', stage: 'New' });

  const openModal = (lead = null) => {
    if (lead) {
      setEditingId(lead.id);
      setFormData(lead);
    } else {
      setEditingId(null);
      setFormData({ title: '', revenue: 0, client: '', stage: 'New' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setLeads(leads.map(l => l.id === editingId ? { ...formData, id: editingId } : l));
    } else {
      setLeads([...leads, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setLeads(leads.filter(l => l.id !== id));
  };

  const renderColumn = (stageName, color) => {
    const colLeads = leads.filter(l => l.stage === stageName);
    return (
      <div className="kanban-col">
        <div className="kanban-header">
          {stageName} 
          <span className={`pill ${color}`} style={color === 'gray' ? {backgroundColor: '#f3f4f6'} : {}}>{colLeads.length}</span>
        </div>
        {colLeads.map(l => (
          <div key={l.id} className="kanban-card" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
              <button className="icon-btn" style={{padding: '2px'}} onClick={() => openModal(l)}><Edit2 size={12} /></button>
              <button className="icon-btn" style={{padding: '2px'}} onClick={() => handleDelete(l.id)}><Trash2 size={12} color="#991b1b" /></button>
            </div>
            <div className="lead-title" style={{ paddingRight: '40px' }}>{l.title}</div>
            <div className="lead-meta mono">${l.revenue.toLocaleString()}</div>
            <span className="badge blue" style={stageName === 'Won' ? {backgroundColor: '#d1fae5', color: '#065f46'} : stageName === 'Qualified' ? {backgroundColor: '#fef3c7', color: '#92400e'} : {}}>{l.client}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>CRM Pipeline</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add Lead
          </button>
        </div>
        <div className="kanban-board">
          {renderColumn('New', 'gray')}
          {renderColumn('Qualified', 'amber')}
          {renderColumn('Won', 'green')}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Lead" : "New Lead"}>
        <div className="form-group">
          <label>Title</label>
          <input className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Client</label>
          <input className="form-input" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Expected Revenue ($)</label>
            <input type="number" className="form-input" value={formData.revenue} onChange={e => setFormData({...formData, revenue: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label>Stage</label>
            <select className="form-input" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Lead</button>
        </div>
      </Modal>
    </div>
  );
}
