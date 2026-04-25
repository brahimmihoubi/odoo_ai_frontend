import React from 'react';
import './MyCompanyTab.css';

export default function MyCompanyTab() {
  return (
    <div className="tab-panel active">
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-title">My Company Settings</div>
        <div className="company-form">
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" className="form-input" defaultValue="TechDZ Company" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" defaultValue="contact@techdz.dz" />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" className="form-input mono" defaultValue="+213 555 123 456" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea className="form-input" rows="3" defaultValue="123 Tech Street, Algiers"></textarea>
          </div>
          <button className="btn dark mt-4">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
