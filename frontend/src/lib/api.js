const BACKEND = 'http://localhost:5000'

// ─── Auth helper ─────────────────────────────────────────────────────────────
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json'
  }
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...(options.headers || {}) }
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function many2one(field) {
  // Odoo many2one fields come as [id, "Name"] or false
  if (!field) return '—'
  return Array.isArray(field) ? field[1] : field
}

function formatCurrency(amount, symbol = '') {
  if (!amount && amount !== 0) return '—'
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Authentication ───────────────────────────────────────────────────────────
export async function loginOdoo(username, password) {
  const res = await fetch(`${BACKEND}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  return data  // { access_token, token_type }
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function getDashboardData() {
  const data = await apiFetch('/api/dashboard/')
  const kpis = data.kpis || {}

  return {
    kpi: {
      revenue:           kpis.total_revenue        || 0,
      orders:            kpis.total_sales          || 0,
      confirmedSales:    kpis.confirmed_sales       || 0,
      customers:         kpis.total_customers      || 0,
      suppliers:         kpis.total_suppliers      || 0,
      totalLeads:        kpis.total_leads          || 0,
      totalInvoices:     kpis.total_invoices       || 0,
      unpaidInvoices:    kpis.unpaid_invoices      || 0,
      totalBills:        kpis.total_bills          || 0,
      totalPurchases:    kpis.total_purchases      || 0,
      confirmedPurchases:kpis.confirmed_purchases  || 0,
      totalOutstanding:  kpis.total_outstanding    || 0,
    },
    recentSales: (data.recent_sales || []).map(s => ({
      id:       s.id,
      ref:      s.name || `SO${s.id}`,
      customer: many2one(s.partner_id),
      total:    formatCurrency(s.amount_total),
      state:    s.state || '—',
      date:     s.date_order ? s.date_order.substring(0, 10) : '—',
    })),
    recentInvoices: (data.recent_invoices || []).map(inv => ({
      id:           inv.id,
      ref:          inv.name || `INV${inv.id}`,
      customer:     many2one(inv.partner_id),
      total:        formatCurrency(inv.amount_total),
      paymentState: inv.payment_state || '—',
      date:         inv.invoice_date || '—',
    })),
    recentLeads: (data.recent_leads || []).map(l => ({
      id:       l.id,
      name:     l.name,
      customer: many2one(l.partner_id),
      revenue:  formatCurrency(l.expected_revenue),
      stage:    many2one(l.stage_id),
      date:     l.create_date ? l.create_date.substring(0, 10) : '—',
    })),
    // recentActivity maps the most recent sales into the format Overview.jsx expects
    recentActivity: (data.recent_sales || []).map(s => ({
      type:    'Sale',
      ref:     s.name || `SO${s.id}`,
      partner: many2one(s.partner_id),
      amount:  formatCurrency(s.amount_total),
      status:  s.state === 'sale' ? 'DONE' : s.state === 'draft' ? 'DRAFT' : 'PENDING',
      date:    s.date_order ? s.date_order.substring(0, 10) : '—',
    })),
  }
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export async function getSalesData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/sales/${qs ? '?' + qs : ''}`)
  const salesList = data.sales || []
  const totalRevenue = salesList.reduce((acc, s) => acc + (s.amount_total || 0), 0)

  return {
    total: data.total || salesList.length,
    salesKpi: {
      totalSales:      totalRevenue,
      confirmedOrders: salesList.filter(s => ['sale','done'].includes(s.state)).length,
      draftOrders:     salesList.filter(s => s.state === 'draft').length,
      growth:          '—'
    },
    salesOrders: salesList.map(s => ({
      id:       s.id,
      ref:      s.name || `SO${s.id}`,
      customer: many2one(s.partner_id),
      total:    formatCurrency(s.amount_total),
      untaxed:  formatCurrency(s.amount_untaxed),
      currency: many2one(s.currency_id),
      state:    s.state || '—',
      invoiceStatus: s.invoice_status || '—',
      salesperson:   many2one(s.user_id),
      date:          s.date_order ? s.date_order.substring(0, 10) : '—',
    }))
  }
}

export async function createSale(data) {
  return apiFetch('/api/sales/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSale(id, data) {
  return apiFetch(`/api/sales/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSale(id) {
  return apiFetch(`/api/sales/${id}`, { method: 'DELETE' })
}

// ─── Purchases ────────────────────────────────────────────────────────────────
export async function getPurchasesData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/purchases/${qs ? '?' + qs : ''}`)
  const list = data.purchases || []
  const total = list.reduce((acc, p) => acc + (p.amount_total || 0), 0)

  return {
    total: data.total || list.length,
    purchaseKpi: {
      totalPurchases:    total,
      confirmedOrders:   list.filter(p => ['purchase','done'].includes(p.state)).length,
      pendingOrders:     list.filter(p => p.state === 'draft').length,
      avgLeadTime:       '—'
    },
    purchaseOrders: list.map(p => ({
      id:       p.id,
      ref:      p.name || `PO${p.id}`,
      supplier: many2one(p.partner_id),
      total:    formatCurrency(p.amount_total),
      untaxed:  formatCurrency(p.amount_untaxed),
      currency: many2one(p.currency_id),
      state:    p.state || '—',
      invoiceStatus: p.invoice_status || '—',
      date:          p.date_order ? p.date_order.substring(0, 10) : '—',
      datePlanned:   p.date_planned ? p.date_planned.substring(0, 10) : '—',
    }))
  }
}

export async function createPurchase(data) {
  return apiFetch('/api/purchases/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updatePurchase(id, data) {
  return apiFetch(`/api/purchases/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deletePurchase(id) {
  return apiFetch(`/api/purchases/${id}`, { method: 'DELETE' })
}

// ─── CRM ─────────────────────────────────────────────────────────────────────
export async function getCrmData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/crm/${qs ? '?' + qs : ''}`)
  const leads = data.leads || []
  const totalRevenue = leads.reduce((acc, l) => acc + (l.expected_revenue || 0), 0)

  return {
    total: data.total || leads.length,
    crmKpi: {
      totalLeads:      leads.length,
      expectedRevenue: totalRevenue,
      wonLeads:        leads.filter(l => l.probability >= 100).length,
      winRate:         leads.length
                         ? ((leads.filter(l => l.probability >= 100).length / leads.length) * 100).toFixed(1) + '%'
                         : '0%'
    },
    leads: leads.map(l => ({
      id:          l.id,
      name:        l.name,
      customer:    many2one(l.partner_id),
      stage:       many2one(l.stage_id),
      revenue:     formatCurrency(l.expected_revenue),
      expected_revenue: l.expected_revenue || 0,
      probability: l.probability || 0,
      priority:    l.priority || '0',
      salesperson: many2one(l.user_id),
      email:       l.email_from || '—',
      phone:       l.phone || '—',
      type:        l.type || '—',
      deadline:    l.date_deadline || '—',
      date:        l.create_date ? l.create_date.substring(0, 10) : '—',
    }))
  }
}

export async function createLead(data) {
  return apiFetch('/api/crm/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateLead(id, data) {
  return apiFetch(`/api/crm/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteLead(id) {
  return apiFetch(`/api/crm/${id}`, { method: 'DELETE' })
}

// ─── Customers ────────────────────────────────────────────────────────────────
export async function getCustomersData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/customers/${qs ? '?' + qs : ''}`)
  const list = data.customers || []

  return {
    total: data.total || list.length,
    customers: list.map(c => ({
      id:           c.id,
      name:         c.name   || '—',
      email:        c.email  || '—',
      phone:        c.phone  || '—',
      mobile:       c.mobile || '—',
      city:         c.city   || '—',
      country:      many2one(c.country_id),
      vat:          c.vat    || '—',
      website:      c.website|| '—',
      salesOrders:  c.sale_order_count     || 0,
      purchases:    c.purchase_order_count || 0,
      since:        c.create_date ? c.create_date.substring(0, 10) : '—',
    }))
  }
}

export async function createCustomer(data) {
  return apiFetch('/api/customers/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateCustomer(id, data) {
  return apiFetch(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteCustomer(id) {
  return apiFetch(`/api/customers/${id}`, { method: 'DELETE' })
}

// ─── Suppliers ────────────────────────────────────────────────────────────────
export async function getSuppliersData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/suppliers/${qs ? '?' + qs : ''}`)
  const list = data.suppliers || []

  return {
    total: data.total || list.length,
    supplierKpi: {
      activeSuppliers: list.length,
      newPartners:     list.filter(s => {
        if (!s.create_date) return false
        const d = new Date(s.create_date)
        const now = new Date()
        return (now - d) / 86400000 <= 30
      }).length,
      avgRating:  '—',
      avgLeadTime: '—'
    },
    suppliers: list.map(s => ({
      id:       s.id,
      name:     s.name   || '—',
      email:    s.email  || '—',
      phone:    s.phone  || '—',
      mobile:   s.mobile || '—',
      city:     s.city   || '—',
      country:  many2one(s.country_id),
      vat:      s.vat    || '—',
      purchases: s.purchase_order_count || 0,
      since:    s.create_date ? s.create_date.substring(0, 10) : '—',
    }))
  }
}

export async function createSupplier(data) {
  return apiFetch('/api/suppliers/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSupplier(id, data) {
  return apiFetch(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSupplier(id) {
  return apiFetch(`/api/suppliers/${id}`, { method: 'DELETE' })
}

// ─── Companies ────────────────────────────────────────────────────────────────
export async function getCompaniesData() {
  const data = await apiFetch('/api/companies/')
  const list = data.companies || []
  return {
    companies: list.map(c => ({
      id:       c.id,
      name:     c.name     || '—',
      email:    c.email    || '—',
      phone:    c.phone    || '—',
      street:   c.street   || '—',
      city:     c.city     || '—',
      zip:      c.zip      || '—',
      country:  many2one(c.country_id),
      currency: many2one(c.currency_id),
      vat:      c.vat      || '—',
      website:  c.website  || '—',
    }))
  }
}

export async function createCompany(data) {
  return apiFetch('/api/companies/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateCompany(id, data) {
  return apiFetch(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteCompany(id) {
  return apiFetch(`/api/companies/${id}`, { method: 'DELETE' })
}

// ─── Invoices ─────────────────────────────────────────────────────────────────
export async function getInvoicesData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/invoices/${qs ? '?' + qs : ''}`)
  const list = data.invoices || []

  return {
    total: data.total || list.length,
    invoices: list.map(inv => ({
      id:           inv.id,
      ref:          inv.name || `INV${inv.id}`,
      customer:     many2one(inv.partner_id),
      date:         inv.invoice_date     || '—',
      due:          inv.invoice_date_due || '—',
      total:        inv.amount_total     || 0,
      residual:     inv.amount_residual  || 0,
      currency:     many2one(inv.currency_id),
      state:        inv.state            || '—',
      paymentState: inv.payment_state    || '—',
      journal:      many2one(inv.journal_id),
    }))
  }
}

export async function getVendorBillsData(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const data = await apiFetch(`/api/invoices/vendor${qs ? '?' + qs : ''}`)
  const list = data.bills || []
  return {
    total: data.total || list.length,
    bills: list.map(b => ({
      id:           b.id,
      ref:          b.name || `BILL${b.id}`,
      supplier:     many2one(b.partner_id),
      date:         b.invoice_date     || '—',
      due:          b.invoice_date_due || '—',
      total:        b.amount_total     || 0,
      residual:     b.amount_residual  || 0,
      state:        b.state            || '—',
      paymentState: b.payment_state    || '—',
    }))
  }
}

export async function postInvoice(id) {
  return apiFetch(`/api/invoices/${id}/pay`, { method: 'POST' })
}

// ─── AI / Other ───────────────────────────────────────────────────────────────
export async function sendChat(message, onChunk) {
  const res = await fetch(`${BACKEND}/ai/chat?message=${encodeURIComponent(message)}`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Chat error')

  if (onChunk && res.body) {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
    return null
  }
  return res.json()
}

export async function generateReport() {
  return apiFetch('/ai/generate-report', { method: 'POST' })
}

export async function checkHealth() {
  const res = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) })
  if (!res.ok) throw new Error('Backend error')
  return res.json()
}

export async function getUserPreferences() {
  try {
    const data = await apiFetch('/api/user/preferences')
    return data
  } catch (err) {
    console.error('Failed to fetch preferences', err)
    return { theme: 'light' }
  }
}

export async function updateUserPreferences(prefs) {
  return apiFetch('/api/user/preferences', { 
    method: 'PUT', 
    body: JSON.stringify(prefs) 
  })
}
