import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OverviewTab from './screens/OverviewTab';
import InventoryTab from './screens/InventoryTab';
import SuppliersTab from './screens/SuppliersTab';
import AiAssistantTab from './screens/AiAssistantTab';
import CrmTab from './screens/CrmTab';
import ContactsTab from './screens/ContactsTab';
import MyCompanyTab from './screens/MyCompanyTab';
import MyCustomersTab from './screens/MyCustomersTab';
import MyOrdersTab from './screens/MyOrdersTab';
import PurchaseTab from './screens/PurchaseTab';
import SaleTab from './screens/SaleTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="main-wrapper">
        <Header />
        <main className="content">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'crm' && <CrmTab />}
            {activeTab === 'contacts' && <ContactsTab />}
            {activeTab === 'my_company' && <MyCompanyTab />}
            {activeTab === 'my_customers' && <MyCustomersTab />}
            {activeTab === 'my_orders' && <MyOrdersTab />}
            {activeTab === 'inventory' && <InventoryTab />}
            {activeTab === 'purchase' && <PurchaseTab />}
            {activeTab === 'sale' && <SaleTab />}
            {activeTab === 'my_suppliers' && <SuppliersTab />}
            {activeTab === 'ai' && <AiAssistantTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
