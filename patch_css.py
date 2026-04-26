import sys

with open('frontend/src/styles/globals.css', 'r') as f:
    lines = f.readlines()

# Find where the responsive section starts
start_idx = -1
for i, line in enumerate(lines):
    if "RESPONSIVE DESIGN (MODERN MOBILE FIRST)" in line:
        start_idx = i - 1
        break

if start_idx != -1:
    lines = lines[:start_idx]

css_to_add = """
/* =========================================
   RESPONSIVE DESIGN (MODERN MOBILE FIRST)
   ========================================= */

.mobile-topbar {
  display: none;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(2px);
  z-index: 998;
}

@media (max-width: 1024px) {
  .kpi-grid, .kpi-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .charts-row-6040, .charts-row-5050 { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: var(--surface);
    border-bottom: 0.5px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 900;
  }

  .mobile-topbar-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer;
  }

  /* Hide sidebar by default */
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 999;
    width: 260px;
  }
  
  /* Show sidebar when active */
  .app-shell.sidebar-open .sidebar {
    transform: translateX(0);
  }
  .app-shell.sidebar-open .sidebar-overlay {
    display: block;
  }

  .page {
    padding: 16px;
  }
  
  .kpi-grid, .kpi-grid-2, .kpi-grid-3 {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .table-wrap {
    margin: 0 -16px;
    padding: 0 16px;
    width: calc(100% + 32px);
  }
  
  table {
    min-width: 600px; /* Ensure horizontal scroll for complex tables */
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
"""

with open('frontend/src/styles/globals.css', 'w') as f:
    f.writelines(lines)
    f.write(css_to_add)

print("Globals.css updated successfully.")
