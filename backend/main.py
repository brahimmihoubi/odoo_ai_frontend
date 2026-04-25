from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import datetime

app = FastAPI(title="OdooAI Backend")

# Enable CORS so the React frontend can talk to it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "odoo-assistant" # Using your custom installed model!

import xmlrpc.client

from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel

ODOO_URL = "http://localhost:8069"
ODOO_DB = "odoo18_db" # You can also make this dynamic if you have multiple DBs

def get_odoo_connection(username: str, password: str):
    try:
        common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(ODOO_URL))
        uid = common.authenticate(ODOO_DB, username, password, {})
        if not uid:
            return None, None
        models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(ODOO_URL))
        return uid, models
    except Exception as e:
        print(f"Odoo Connection Error: {e}")
        return None, None

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/health")
def health_check():
    # Check Ollama status
    ollama_ok = False
    try:
        res = requests.get(OLLAMA_URL, timeout=2)
        if res.status_code == 200:
            ollama_ok = True
    except requests.RequestException:
        pass

    # Check Odoo status (just check if server is up)
    odoo_ok = False
    try:
        common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(ODOO_URL))
        if common.version():
            odoo_ok = True
    except Exception:
        pass

    return {
        "status": "ok",
        "backend_status": "ok",
        "ollama_status": "ok" if ollama_ok else "error",
        "ollama": ollama_ok,
        "odoo_status": "ok" if odoo_ok else "error"
    }

from fastapi.responses import StreamingResponse
import json

@app.post("/ai/chat")
def chat(message: str):
    prompt = f"""You are OdooAI, a helpful business intelligence assistant for an ERP system. 
    Answer the following user query professionally and concisely.
    User Query: {message}"""
    
    def generate():
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": True
        }
        try:
            with requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True) as r:
                r.raise_for_status()
                for line in r.iter_lines():
                    if line:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
        except requests.RequestException as e:
            yield f"\n[Error: Unable to connect to local Ollama. Make sure it is running. Detail: {e}]"
            
    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/api/login")
def login(req: LoginRequest):
    uid, models = get_odoo_connection(req.username, req.password)
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid Odoo credentials")
    return {"status": "success", "uid": uid, "username": req.username}

@app.get("/api/dashboard")
def get_dashboard_data(
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        # Fetch Sales KPIs
        sales = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'sale.order', 'search_read',
            [[('state', 'in', ['sale', 'done'])]],
            {'fields': ['amount_total', 'name', 'partner_id', 'state', 'date_order'], 'limit': 10, 'order': 'date_order desc'}
        )
        
        total_revenue = sum(s['amount_total'] for s in sales)
        total_orders = len(sales)

        # Fetch Customers Count
        customers_count = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_count', [[('customer_rank', '>', 0)]])
        
        # Fetch Suppliers Count
        suppliers_count = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_count', [[('supplier_rank', '>', 0)]])

        # Fetch Products Count
        products_count = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'product.product', 'search_count', [[('type', '=', 'product')]])

        # Format recent activity from sales
        recent_activity = []
        for s in sales[:5]:
            recent_activity.append({
                "type": "Sale",
                "ref": s['name'],
                "partner": s['partner_id'][1] if s['partner_id'] else "Unknown",
                "amount": f"${s['amount_total']:,.0f}",
                "status": "CONFIRMED" if s['state'] == 'sale' else "DONE",
                "date": s['date_order'].split(' ')[0] if s['date_order'] else "N/A"
            })

        return {
            "kpi": {
                "revenue": total_revenue,
                "orders": total_orders,
                "customers": customers_count,
                "suppliers": suppliers_count,
                "products": products_count,
                "stockValue": 0, # Requires complex stock valuation query
                "lowStockAlerts": 0,
                "avgOrder": (total_revenue / total_orders) if total_orders > 0 else 0
            },
            "recentActivity": recent_activity
        }
    except Exception as e:
        print(f"Error fetching Odoo data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/crm")
def get_crm_data(
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        try:
            leads = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'crm.lead', 'search_read',
                [],
                {'fields': ['id', 'name', 'expected_revenue', 'probability', 'stage_id', 'type', 'partner_id'], 'limit': 20, 'order': 'create_date desc'}
            )
        except Exception:
            leads = []

        total_revenue = sum(l.get('expected_revenue', 0) for l in leads)
        won_leads = [l for l in leads if l.get('probability') == 100]

        formatted_leads = []
        for l in leads:
            formatted_leads.append({
                "id": l.get('id'),
                "name": l.get('name', 'Unknown'),
                "customer": l.get('partner_id')[1] if l.get('partner_id') else "-",
                "type": "Opportunity" if l.get('type') == 'opportunity' else "Lead",
                "revenue": f"${l.get('expected_revenue', 0):,.0f}",
                "probability": f"{l.get('probability', 0)}%",
                "stage": l.get('stage_id')[1] if l.get('stage_id') else "New"
            })

        return {
            "crmKpi": {
                "totalLeads": len(leads),
                "wonLeads": len(won_leads),
                "expectedRevenue": f"${total_revenue:,.0f}",
                "winRate": f"{int((len(won_leads)/len(leads))*100)}%" if leads else "0%"
            },
            "leads": formatted_leads
        }
    except Exception as e:
        print(f"Error fetching Odoo CRM data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class LeadCreate(BaseModel):
    name: str
    expected_revenue: float
    partner_id: int

@app.post("/api/crm")
def create_crm_lead(req: LeadCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'crm.lead', 'create', [{
            'name': req.name, 'expected_revenue': req.expected_revenue, 'partner_id': req.partner_id, 'type': 'opportunity'
        }])
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/crm/{lead_id}")
def update_crm_lead(lead_id: int, req: LeadCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'crm.lead', 'write', [[lead_id], {
            'name': req.name, 'expected_revenue': req.expected_revenue, 'partner_id': req.partner_id
        }])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/crm/{lead_id}")
def delete_crm_lead(lead_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'crm.lead', 'unlink', [[lead_id]])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers")
def get_customers_data(
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        partners = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_read',
            [[('customer_rank', '>', 0)]],
            {'fields': ['id', 'name', 'company_type', 'email', 'phone', 'create_date'], 'limit': 50, 'order': 'create_date desc'}
        )
        if not partners:
            partners = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_read',
                [[('is_company', '=', True)]],
                {'fields': ['id', 'name', 'company_type', 'email', 'phone', 'create_date'], 'limit': 20, 'order': 'create_date desc'}
            )

        formatted_customers = []
        for p in partners:
            formatted_customers.append({
                "id": p.get('id'),
                "name": p.get('name', 'Unknown'),
                "type": "Company" if p.get('company_type') == 'company' else "Individual",
                "email": p.get('email') or "-",
                "phone": p.get('phone') or "-",
                "loyalty": 0,
                "since": str(p.get('create_date')).split(' ')[0] if p.get('create_date') else "N/A"
            })

        return {
            "customers": formatted_customers
        }
    except Exception as e:
        print(f"Error fetching Odoo Customers data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CustomerCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    type: str = "person" # 'person' or 'company'

@app.post("/api/customers")
def create_customer(
    req: CustomerCreate,
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'create', [{
            'name': req.name,
            'email': req.email,
            'phone': req.phone,
            'company_type': 'company' if req.type == 'Company' else 'person',
            'customer_rank': 1
        }])
        return {"status": "success", "id": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customers/{customer_id}")
def update_customer(
    customer_id: int,
    req: CustomerCreate,
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'write', [[customer_id], {
            'name': req.name,
            'email': req.email,
            'phone': req.phone,
            'company_type': 'company' if req.type == 'Company' else 'person'
        }])
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'unlink', [[customer_id]])
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/companies")
def get_companies_data(
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        companies = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.company', 'search_read',
            [],
            {'fields': ['id', 'name', 'email', 'phone', 'vat', 'currency_id', 'country_id']}
        )

        formatted_companies = []
        for c in companies:
            formatted_companies.append({
                "id": c.get('id'),
                "name": c.get('name', 'Unknown'),
                "email": c.get('email') or "-",
                "phone": c.get('phone') or "-",
                "vat": c.get('vat') or "-",
                "currency": c.get('currency_id')[1] if c.get('currency_id') else "-",
                "country": c.get('country_id')[1] if c.get('country_id') else "-"
            })

        return {
            "companies": formatted_companies
        }
    except Exception as e:
        print(f"Error fetching Odoo Companies data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers")
def get_suppliers_data(x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        partners = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_read',
            [[('supplier_rank', '>', 0)]],
            {'fields': ['id', 'name', 'company_type', 'email', 'phone', 'create_date'], 'limit': 50, 'order': 'create_date desc'}
        )
        if not partners:
            partners = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'search_read',
                [[('is_company', '=', True)]],
                {'fields': ['id', 'name', 'company_type', 'email', 'phone', 'create_date'], 'limit': 20, 'order': 'create_date desc'}
            )
        formatted_suppliers = []
        for p in partners:
            formatted_suppliers.append({
                "id": p.get('id'),
                "name": p.get('name', 'Unknown'),
                "type": "Company" if p.get('company_type') == 'company' else "Individual",
                "email": p.get('email') or "-",
                "phone": p.get('phone') or "-",
                "since": str(p.get('create_date')).split(' ')[0] if p.get('create_date') else "N/A"
            })
        return {"suppliers": formatted_suppliers, "supplierKpi": {"activeSuppliers": len(formatted_suppliers), "avgLeadTime": 5}}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/suppliers")
def create_supplier(req: CustomerCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'create', [{
            'name': req.name, 'email': req.email, 'phone': req.phone,
            'company_type': 'company' if req.type == 'Company' else 'person',
            'supplier_rank': 1
        }])
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, req: CustomerCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'write', [[supplier_id], {
            'name': req.name, 'email': req.email, 'phone': req.phone,
            'company_type': 'company' if req.type == 'Company' else 'person'
        }])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.partner', 'unlink', [[supplier_id]])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

class CompanyCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    vat: str = ""

@app.post("/api/companies")
def create_company(req: CompanyCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.company', 'create', [{
            'name': req.name, 'email': req.email, 'phone': req.phone, 'vat': req.vat
        }])
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/companies/{company_id}")
def update_company(company_id: int, req: CompanyCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.company', 'write', [[company_id], {
            'name': req.name, 'email': req.email, 'phone': req.phone, 'vat': req.vat
        }])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/companies/{company_id}")
def delete_company(company_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'res.company', 'unlink', [[company_id]])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/purchases")
def get_purchases_data(
    x_odoo_user: str = Header(...),
    x_odoo_password: str = Header(...)
):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        po_records = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'purchase.order', 'search_read',
            [],
            {'fields': ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_approve', 'invoice_status'], 'limit': 20, 'order': 'id desc'}
        )
        
        total_purchases = sum(p['amount_total'] for p in po_records if p['state'] in ['purchase', 'done'])
        
        formatted_pos = []
        for p in po_records:
            date_val = p.get('date_approve') or "Draft"
            if isinstance(date_val, str) and ' ' in date_val:
                date_val = date_val.split(' ')[0]

            formatted_pos.append({
                "id": p.get('id'),
                "ref": p['name'],
                "vendor": p['partner_id'][1] if p['partner_id'] else "Unknown",
                "product": "Various", 
                "qty": "-",
                "total": f"${p['amount_total']:,.0f}",
                "receipt": "Pending" if p['state'] not in ['done'] else "Received",
                "status": "DONE" if p['state'] in ['purchase', 'done'] else "DRAFT",
                "date": date_val
            })

        return {
            "purchaseKpi": {
                "totalPurchases": total_purchases,
                "activeSuppliers": len(set([p['partner_id'][0] for p in po_records if p['partner_id']])),
                "avgLeadTime": 5,
                "pendingBills": len([p for p in po_records if p.get('invoice_status') == 'to invoice'])
            },
            "purchaseOrders": formatted_pos
        }
    except Exception as e:
        print(f"Error fetching Odoo Purchases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class PurchaseCreate(BaseModel):
    partner_id: int

@app.post("/api/purchases")
def create_purchase(req: PurchaseCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'purchase.order', 'create', [{
            'partner_id': req.partner_id
        }])
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/purchases/{po_id}")
def update_purchase(po_id: int, req: PurchaseCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'purchase.order', 'write', [[po_id], {
            'partner_id': req.partner_id
        }])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/purchases/{po_id}")
def delete_purchase(po_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'purchase.order', 'unlink', [[po_id]])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sales")
def get_sales_data(x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        so_records = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'sale.order', 'search_read',
            [],
            {'fields': ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order', 'invoice_status'], 'limit': 20, 'order': 'id desc'}
        )
        total_sales = sum(s['amount_total'] for s in so_records if s['state'] in ['sale', 'done'])
        formatted_sos = []
        for s in so_records:
            date_val = s.get('date_order') or "Draft"
            if isinstance(date_val, str) and ' ' in date_val: date_val = date_val.split(' ')[0]
            formatted_sos.append({
                "id": s.get('id'),
                "ref": s['name'],
                "customer": s['partner_id'][1] if s['partner_id'] else "Unknown",
                "product": "Various", 
                "total": f"${s['amount_total']:,.0f}",
                "status": "CONFIRMED" if s['state'] in ['sale', 'done'] else "DRAFT",
                "date": date_val
            })
        return {
            "salesKpi": {
                "totalSales": total_sales,
                "activeCustomers": len(set([s['partner_id'][0] for s in so_records if s['partner_id']])),
                "pendingInvoices": len([s for s in so_records if s.get('invoice_status') == 'to invoice'])
            },
            "salesOrders": formatted_sos
        }
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

class SaleCreate(BaseModel):
    partner_id: int

@app.post("/api/sales")
def create_sale(req: SaleCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        new_id = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'sale.order', 'create', [{'partner_id': req.partner_id}])
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/sales/{so_id}")
def update_sale(so_id: int, req: SaleCreate, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'sale.order', 'write', [[so_id], {'partner_id': req.partner_id}])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/sales/{so_id}")
def delete_sale(so_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'sale.order', 'unlink', [[so_id]])
        return {"status": "success"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/invoices")
def get_invoices_data(x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        moves = models.execute_kw(ODOO_DB, uid, x_odoo_password, 'account.move', 'search_read',
            [[('move_type', '=', 'out_invoice')]],
            {'fields': ['id', 'name', 'partner_id', 'amount_total', 'amount_residual', 'state', 'payment_state', 'invoice_date'], 'limit': 50, 'order': 'id desc'}
        )
        formatted_invoices = []
        for m in moves:
            formatted_invoices.append({
                "id": m.get('id'),
                "ref": m.get('name'),
                "customer": m.get('partner_id')[1] if m.get('partner_id') else "Unknown",
                "total": m.get('amount_total', 0),
                "due": m.get('amount_residual', 0),
                "state": m.get('state'),
                "payment_state": m.get('payment_state') or 'not_paid',
                "date": m.get('invoice_date') or "Draft"
            })
        return {"invoices": formatted_invoices}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/invoices/{invoice_id}/pay")
def pay_invoice(invoice_id: int, x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    # To truly pay an invoice in Odoo via XML-RPC requires registering a payment on the account.payment model.
    # For this endpoint, we'll try to action_post it if it's draft, as an example of a state change operation.
    uid, models = get_odoo_connection(x_odoo_user, x_odoo_password)
    if not uid: raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        models.execute_kw(ODOO_DB, uid, x_odoo_password, 'account.move', 'action_post', [[invoice_id]])
        return {"status": "success", "message": "Invoice posted successfully"}
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/generate-report")
def generate_report():
    # Here you would typically fetch live Odoo data first, then pass it to Ollama
    # For now, we simulate sending context to Ollama to generate a summary report.
    
    date_str = datetime.datetime.now().strftime("%B %d, %Y %H:%M")
    
    prompt = f"""You are OdooAI. Generate a brief, professional daily business report formatted EXACTLY like this:
    
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAILY BUSINESS REPORT
Generated: {date_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SALES OVERVIEW
...

INVENTORY STATUS
...

RECOMMENDATIONS
...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Make up realistic numbers for Sales ($97k), Orders (1), Inventory (4 items), etc. Keep it under 200 words.
"""

    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        res = requests.post(f"{OLLAMA_URL}/api/generate", json=payload)
        res.raise_for_status()
        data = res.json()
        
        return {"report": data.get("response", "Could not generate report.")}
    except requests.RequestException as e:
        # Fallback if Ollama isn't running
        fallback_report = f"""━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DAILY BUSINESS REPORT
Generated: {date_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SALES OVERVIEW
Revenue:        $97,750
Orders:         1 confirmed
Avg Order:      $97,750
Status:         Growing

INVENTORY STATUS
Products:       4 total
Alert:          Laptop DZ Pro LOW
Stock Value:    $86,650
Action:         Reorder needed

RECOMMENDATIONS
1. Ensure Ollama is running locally
2. Pull the {OLLAMA_MODEL} model
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"""
        return {"report": fallback_report}
