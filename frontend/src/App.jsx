import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Overview from './components/pages/Overview'
import Sales from './components/pages/Sales'
import CRM from './components/pages/CRM'
import Customers from './components/pages/Customers'
import Invoicing from './components/pages/Invoicing'
import Purchases from './components/pages/Purchases'
import Companies from './components/pages/Companies'
import Inventory from './components/pages/Inventory'
import Suppliers from './components/pages/Suppliers'
import AIAssistant from './components/pages/AIAssistant'
import Login from './components/pages/Login'

const PAGES = {
  overview:  <Overview />,
  sales:     <Sales />,
  crm:       <CRM />,
  customers: <Customers />,
  invoicing: <Invoicing />,
  purchases: <Purchases />,
  companies: <Companies />,
  inventory: <Inventory />,
  suppliers: <Suppliers />,
  assistant: <AIAssistant />,
}

export default function App() {
  const [active, setActive] = useState('overview')
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('odoo_user'))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  const handleNav = (page) => {
    setActive(page)
    setSidebarOpen(false)
  }

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
      
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      <Sidebar 
        active={active} 
        setActive={handleNav} 
        onLogout={() => {
          localStorage.removeItem('odoo_user')
          localStorage.removeItem('odoo_pass')
          setIsAuthenticated(false)
        }} 
      />

      <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="mobile-topbar-title">OdooAI Dashboard</div>
        </div>

        <main className="main-content">
          {PAGES[active]}
        </main>
      </div>
    </div>
  )
}
