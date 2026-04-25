import React from 'react';
import { LayoutDashboard, Target, BookUser, Building, Users, ShoppingCart, Package, CreditCard, TrendingUp, Truck, Bot } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: "Overview", icon: <LayoutDashboard size={18} /> },
    { id: 'crm', label: "CRM", icon: <Target size={18} /> },
    { id: 'contacts', label: "Contacts", icon: <BookUser size={18} /> },
    { id: 'my_company', label: "My Company", icon: <Building size={18} /> },
    { id: 'my_customers', label: "My Customers", icon: <Users size={18} /> },
    { id: 'my_orders', label: "My Orders", icon: <ShoppingCart size={18} /> },
    { id: 'inventory', label: "Inventory", icon: <Package size={18} /> },
    { id: 'purchase', label: "Purchase", icon: <CreditCard size={18} /> },
    { id: 'sale', label: "Sale", icon: <TrendingUp size={18} /> },
    { id: 'my_suppliers', label: "My Suppliers", icon: <Truck size={18} /> },
    { id: 'ai', label: "AI Assistant", icon: <Bot size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-dot"></div>
        <span className="logo-text">OdooAI Dashboard</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
