import re

with open('backend/main.py', 'r') as f:
    content = f.read()

new_func = '''@app.post("/ai/generate-report")
def generate_report(x_odoo_user: str = Header(...), x_odoo_password: str = Header(...)):
    try:
        sales_data = get_sales_data(x_odoo_user, x_odoo_password)
        sales_kpi = sales_data.get('salesKpi', {})
        purchases_data = get_purchases_data(x_odoo_user, x_odoo_password)
        purchases_kpi = purchases_data.get('purchaseKpi', {})
        crm_data = get_crm_data(x_odoo_user, x_odoo_password)
        crm_kpi = crm_data.get('crmKpi', {})
        
        data_context = f"REAL DATA: Sales: {sales_kpi.get('totalSales', '$0')}. Purchases: {purchases_kpi.get('totalPurchases', '$0')}. CRM Pipeline: {crm_kpi.get('totalLeads', 0)} leads, Win Rate {crm_kpi.get('winRate', '0%')}."
    except Exception as e:
        data_context = "Could not fetch live data from Odoo."

    date_str = datetime.datetime.now().strftime("%B %d, %Y %H:%M")
    prompt = f"""You are OdooAI, an expert ERP analyst. Generate a professional daily report based ONLY on this real data:

{data_context}

Do NOT invent numbers. Keep it concise."""
'''

# Find everything from @app.post("/ai/generate-report") up to the line right before `    try:` where ollama is called.
pattern = re.compile(r'@app\.post\("/ai/generate-report"\).*?prompt = f"[^"]*"\n', re.DOTALL)
content = pattern.sub(new_func + '\n', content)

with open('backend/main.py', 'w') as f:
    f.write(content)
print("Patched main.py")
