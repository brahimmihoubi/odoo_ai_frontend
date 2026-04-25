import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import './ContactsTab.css';

export default function ContactsTab() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe 1', role: 'CEO, Company 1', email: 'john1@example.com' },
    { id: 2, name: 'Jane Smith', role: 'CTO, Tech Inc', email: 'jane@tech.inc' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', email: '' });

  const openModal = (contact = null) => {
    if (contact) {
      setEditingId(contact.id);
      setFormData(contact);
    } else {
      setEditingId(null);
      setFormData({ name: '', role: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      setContacts(contacts.map(c => c.id === editingId ? { ...formData, id: editingId } : c));
    } else {
      setContacts([...contacts, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="tab-panel active">
      <div className="card">
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Contacts</span>
          <button className="btn dark" onClick={() => openModal()}>
            <Plus size={14} style={{marginRight: '4px'}}/> Add Contact
          </button>
        </div>
        <div className="contacts-grid">
          {contacts.map(c => (
            <div key={c.id} className="contact-card">
              <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '8px', marginBottom: '-20px', zIndex: 10 }}>
                <button className="icon-btn" onClick={() => openModal(c)}><Edit2 size={14} /></button>
                <button className="icon-btn" onClick={() => handleDelete(c.id)}><Trash2 size={14} color="#991b1b" /></button>
              </div>
              <div className="contact-avatar"></div>
              <div className="contact-info">
                <div className="contact-name">{c.name}</div>
                <div className="contact-role">{c.role}</div>
                <div className="contact-email mono">{c.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Contact" : "New Contact"}>
        <div className="form-group">
          <label>Name</label>
          <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Role & Company</label>
          <input className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn dark" onClick={handleSave}>Save Contact</button>
        </div>
      </Modal>
    </div>
  );
}
