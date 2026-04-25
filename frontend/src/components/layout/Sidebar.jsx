import { useState } from 'react'
import { useHealth } from '../../hooks/useHealth'
import { LayoutDashboard, ShoppingCart, Users, UserCircle, CreditCard, Package, Truck, Bot, Building, ChevronDown, ChevronRight } from 'lucide-react'

const NAV = [
  { id: 'overview',   label: 'Overview',       icon: LayoutDashboard },
  { isHeader: true,   label: 'Sales' },
  { id: 'crm',        label: 'CRM',            icon: Users },
  { id: 'sales',      label: 'Sales',          icon: ShoppingCart },
  { id: 'customers',  label: 'Customers',      icon: UserCircle },
  { isHeader: true,   label: 'Accounting' },
  { id: 'invoicing',  label: 'Invoicing',      icon: CreditCard },
  { isHeader: true,   label: 'Procurement' },
  { id: 'purchases',  label: 'Purchases',      icon: CreditCard },
  { id: 'suppliers',  label: 'Suppliers',      icon: Truck },
  { isHeader: true,   label: 'Inventory' },
  { id: 'inventory',  label: 'Inventory',      icon: Package },
  { isHeader: true,   label: 'Organization' },
  { id: 'companies',  label: 'Companies',      icon: Building },
  { isHeader: true,   label: 'Tools' },
  { id: 'assistant',  label: 'AI Assistant',   icon: Bot },
]

function StatusRow({ label, addr, status }) {
  return (
    <div className="status-row">
      <span className={`status-dot ${status}`} />
      <span className="status-label">{label}</span>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{addr}</span>
      <span className="status-icon">{status === 'ok' ? '✓' : status === 'checking' ? '···' : '✗'}</span>
    </div>
  )
}

export default function Sidebar({ active, setActive, onLogout }) {
  const { backend, ollama, odoo } = useHealth()
  const username = localStorage.getItem('odoo_user') || 'Admin'
  const [collapsed, setCollapsed] = useState({})

  const toggleSection = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <svg width="22" height="22" viewBox="0 0 16 16" fill="var(--accent)">
          <rect x="1" y="1" width="6" height="6" rx="1.5"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5"/>
        </svg>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">OdooAI</span>
          <span className="sidebar-logo-sub">Dashboard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav-section">
        {(() => {
          let currentHeader = null;
          return NAV.map((item, index) => {
            if (item.isHeader) {
              currentHeader = item.label;
              const isCollapsed = collapsed[currentHeader];
              return (
                <div 
                  key={`header-${index}`} 
                  onClick={() => toggleSection(item.label)}
                  style={{ 
                    fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', 
                    marginTop: '16px', marginBottom: '8px', paddingLeft: '8px', 
                    fontWeight: '600', letterSpacing: '0.05em', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                  {item.label}
                  <span style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </span>
                </div>
              )
            }
            
            if (currentHeader && collapsed[currentHeader]) {
              return null;
            }

            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={`nav-item${active === item.id ? ' active' : ''}`}
                onClick={() => setActive(item.id)}
              >
                <Icon size={15} />
                {item.label}
              </div>
            )
          })
        })()}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</div>
          <div className="user-role">Administrator</div>
        </div>
        <button 
          onClick={onLogout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
          }}
          title="Sign Out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>
    </aside>
  )
}
