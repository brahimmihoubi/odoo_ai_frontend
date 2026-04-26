const BACKEND = 'http://localhost:8000'

export async function checkHealth() {
  const res = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error('Backend error')
  return res.json()
}

export async function sendChat(message, onChunk) {
  const res = await fetch(`${BACKEND}/ai/chat?message=${encodeURIComponent(message)}`, { method: 'POST' })
  if (!res.ok) throw new Error('Chat error')

  if (onChunk) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
    return null
  } else {
    return res.json()
  }
}

export async function generateReport() {
  const res = await fetch(`${BACKEND}/ai/generate-report`, { 
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('AI report failed')
  return res.json()
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json'
  }
}

export async function loginOdoo(username, password) {
  const res = await fetch(`${BACKEND}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Login failed')
  return res.json()
}

export async function getDashboardData() {
  const res = await fetch(`${BACKEND}/api/dashboard`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Dashboard data error')
  const data = await res.json()
  
  // Map new backend structure to old frontend structure
  if (data.sales !== undefined && !data.kpi) {
    return {
      kpi: {
        revenue: (data.sales || 0) * 100,
        orders: data.sales || 0,
        customers: data.customers || 0,
        suppliers: 0,
        products: 0,
        stockValue: 0,
        lowStockAlerts: 0,
        avgOrder: 0
      },
      recentActivity: []
    }
  }
  return data
}

export async function getPurchasesData() {
  const res = await fetch(`${BACKEND}/api/purchases`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Purchases data error')
  const data = await res.json()
  if (!data.purchaseKpi) {
    const total = (data.purchases || []).reduce((acc, p) => acc + (p.amount_total || 0), 0)
    data.purchaseKpi = {
      totalPurchases: `$${total}`,
      pendingBills: 0,
      activeSuppliers: 0,
      avgLeadTime: 0
    }
  }
  return data
}
export async function getCrmData() {
  const res = await fetch(`${BACKEND}/api/crm`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('CRM data error')
  const data = await res.json()
  if (!data.crmKpi) {
    const leads = data.leads || []
    const expectedRevenue = leads.reduce((acc, l) => acc + (l.expected_revenue || 0), 0)
    data.crmKpi = {
      totalLeads: leads.length,
      wonLeads: 0,
      expectedRevenue: `$${expectedRevenue}`,
      winRate: '0%'
    }
  }
  return data
}

export async function getCustomersData() {
  const res = await fetch(`${BACKEND}/api/customers`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Customers data error')
  return res.json()
}

export async function getCompaniesData() {
  const res = await fetch(`${BACKEND}/api/companies`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Companies data error')
  return res.json()
}

// CUSTOMERS CRUD
export async function createCustomer(data) {
  const res = await fetch(`${BACKEND}/api/customers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return res.json()
}

export async function updateCustomer(id, data) {
  const res = await fetch(`${BACKEND}/api/customers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update customer')
  return res.json()
}

export async function deleteCustomer(id) {
  const res = await fetch(`${BACKEND}/api/customers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete customer')
  return res.json()
}

// COMPANIES CRUD
export async function createCompany(data) {
  const res = await fetch(`${BACKEND}/api/companies`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create company')
  return res.json()
}

export async function updateCompany(id, data) {
  const res = await fetch(`${BACKEND}/api/companies/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update company')
  return res.json()
}

export async function deleteCompany(id) {
  const res = await fetch(`${BACKEND}/api/companies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete company')
  return res.json()
}

// PURCHASES CRUD
export async function createPurchase(data) {
  const res = await fetch(`${BACKEND}/api/purchases`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create purchase')
  return res.json()
}

export async function updatePurchase(id, data) {
  const res = await fetch(`${BACKEND}/api/purchases/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update purchase')
  return res.json()
}

export async function deletePurchase(id) {
  const res = await fetch(`${BACKEND}/api/purchases/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete purchase')
  return res.json()
}

// SALES CRUD
export async function getSalesData() {
  const res = await fetch(`${BACKEND}/api/sales`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Sales data error')
  const data = await res.json()
  if (!data.salesKpi) {
    const sales = data.sales || []
    const totalSales = sales.reduce((acc, s) => acc + (s.amount_total || 0), 0)
    data.salesKpi = {
      totalSales: `$${totalSales}`,
      activeCustomers: 0,
      pendingInvoices: 0,
      growth: '0%'
    }
  }
  return data
}

export async function createSale(data) {
  const res = await fetch(`${BACKEND}/api/sales`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create sale')
  return res.json()
}

export async function updateSale(id, data) {
  const res = await fetch(`${BACKEND}/api/sales/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update sale')
  return res.json()
}

export async function deleteSale(id) {
  const res = await fetch(`${BACKEND}/api/sales/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete sale')
  return res.json()
}

// SUPPLIERS CRUD
export async function getSuppliersData() {
  const res = await fetch(`${BACKEND}/api/suppliers`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Suppliers data error')
  return res.json()
}

export async function createSupplier(data) {
  const res = await fetch(`${BACKEND}/api/suppliers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create supplier')
  return res.json()
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${BACKEND}/api/suppliers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update supplier')
  return res.json()
}

export async function deleteSupplier(id) {
  const res = await fetch(`${BACKEND}/api/suppliers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete supplier')
  return res.json()
}

// INVOICING CRUD & EXPORT
export async function getInvoicesData() {
  const res = await fetch(`${BACKEND}/api/invoices`, {
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Invoices data error')
  return res.json()
}

export async function postInvoice(id) {
  const res = await fetch(`${BACKEND}/api/invoices/${id}/pay`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to post/pay invoice')
  return res.json()
}

// CRM CRUD
export async function createLead(data) {
  const res = await fetch(`${BACKEND}/api/crm`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to create lead')
  return res.json()
}

export async function updateLead(id, data) {
  const res = await fetch(`${BACKEND}/api/crm/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to update lead')
  return res.json()
}

export async function deleteLead(id) {
  const res = await fetch(`${BACKEND}/api/crm/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Failed to delete lead')
  return res.json()
}
