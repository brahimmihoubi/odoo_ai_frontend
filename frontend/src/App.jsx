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

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="app-shell">
      <Sidebar 
        active={active} 
        setActive={setActive} 
        onLogout={() => {
          localStorage.removeItem('odoo_user')
          localStorage.removeItem('odoo_pass')
          setIsAuthenticated(false)
        }} 
      />
      <main className="main-content">
        {PAGES[active]}
      </main>
    </div>
  )
}
