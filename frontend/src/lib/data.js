export const MOCK_DATA = {
  kpi: {
    revenue: 97750,
    orders: 1,
    customers: 2,
    suppliers: 2,
    products: 4,
    stockValue: 86650,
    lowStockAlerts: 1,
    avgOrder: 85000,
  },

  salesKpi: {
    quotations: 0,
    confirmedOrders: 1,
    invoiced: 97750,
    collected: 97750,
  },

  recentActivity: [
    { type: 'Sale',     ref: 'S00001',        partner: 'Mohammed',      amount: '$97,750', amountRaw: 97750, status: 'PAID',      date: '04/22/2026' },
    { type: 'Invoice',  ref: 'INV/2026/001',  partner: 'Mohammed',      amount: '$97,750', amountRaw: 97750, status: 'PAID',      date: '04/22/2026' },
    { type: 'Delivery', ref: 'WH/OUT/00001',  partner: 'Mohammed',      amount: '1 unit',  amountRaw: null,  status: 'DONE',      date: '04/22/2026' },
    { type: 'Purchase', ref: 'P00001',        partner: 'Sales Manager', amount: '$65,000', amountRaw: 65000, status: 'PAID',      date: '04/22/2026' },
    { type: 'Receipt',  ref: 'WH/IN/00001',   partner: 'Sales Manager', amount: '1 unit',  amountRaw: null,  status: 'DONE',      date: '04/22/2026' },
    { type: 'Order',    ref: 'ORD-001',       partner: 'Ahmed Benali',  amount: '$15,000', amountRaw: 15000, status: 'CONFIRMED', date: '04/22/2026' },
    { type: 'Order',    ref: 'ORD-002',       partner: 'Sara Meziani',  amount: '$8,500',  amountRaw: 8500,  status: 'DRAFT',     date: '04/22/2026' },
  ],

  weeklySales: [
    { week: 'W1', revenue: 0 },
    { week: 'W2', revenue: 0 },
    { week: 'W3', revenue: 97750 },
    { week: 'W4', revenue: 0 },
  ],

  salesByCategory: [
    { name: 'Electronics', value: 97750 },
    { name: 'Furniture', value: 1600 },
    { name: 'Other', value: 1500 },
  ],

  salesOrders: [
    { ref: 'S00001', customer: 'Mohammed', product: 'Laptop DZ Pro', qty: 1, total: '$97,750', status: 'PAID', date: '04/22/2026' },
  ],

  customOrders: [
    { ref: 'ORD-001', customer: 'Ahmed Benali', total: '$15,000', delivery: '05/02/2026', status: 'CONFIRMED' },
    { ref: 'ORD-002', customer: 'Sara Meziani', total: '$8,500',  delivery: '—',          status: 'DRAFT' },
  ],

  customers: [
    { name: 'Ahmed Benali', type: 'Company',    email: 'ahmed@benali.dz', phone: '0550123456', loyalty: 100, since: '04/22/2026' },
    { name: 'Sara Meziani', type: 'Individual', email: 'sara@gmail.com',  phone: '0661987654', loyalty: 50,  since: '04/22/2026' },
  ],

  inventoryKpi: {
    totalProducts: 4,
    totalStockValue: 86650,
    lowStockAlerts: 1,
  },

  products: [
    { id: 'p1', name: 'Laptop DZ Pro', category: 'Electronics', price: 85000, qty: 1,  maxQty: 10, added: '04/22/2026' },
    { id: 'p2', name: 'test product',  category: 'Electronics', price: 150,   qty: 10, maxQty: 10, added: '04/22/2026' },
    { id: 'p3', name: 'Office Chair X', category: 'Furniture',  price: 320,   qty: 5,  maxQty: 10, added: '04/22/2026' },
    { id: 'p4', name: 'Desk Lamp Pro', category: 'Other',       price: 75,    qty: 20, maxQty: 20, added: '04/22/2026' },
  ],

  stockMovement: [
    { name: 'Laptop DZ Pro', incoming: 1, outgoing: 1 },
    { name: 'test product',  incoming: 10, outgoing: 0 },
    { name: 'Office Chair X', incoming: 5, outgoing: 0 },
    { name: 'Desk Lamp Pro', incoming: 20, outgoing: 0 },
  ],

  purchaseKpi: {
    totalPurchases: 65000,
    activeSuppliers: 2,
    avgLeadTime: 7.5,
    pendingBills: 0,
  },

  suppliers: [
    { id: 's1', name: 'TechDZ Company',  email: 'tech@techdz.dz',          phone: '0770456789', category: 'Electronics', leadTime: 5,  rating: 5, status: 'ACTIVE', since: '04/22/2026' },
    { id: 's2', name: 'Furniture Plus',  email: 'info@furnitureplus.dz',    phone: '0550789123', category: 'Furniture',   leadTime: 10, rating: 4, status: 'ACTIVE', since: '04/22/2026' },
  ],

  purchaseOrders: [
    { ref: 'P00001', vendor: 'Sales Manager', product: 'Laptop DZ Pro', qty: 1, total: '$65,000', receipt: 'WH/IN/00001', status: 'PAID', date: '04/22/2026' },
  ],
}

export const DONUT_COLORS = ['#1a1916', '#888780', '#d3d1c7']
export const CHART_COLORS = { single: '#1a1916', incoming: '#2d6a4f', outgoing: '#991b1b' }
