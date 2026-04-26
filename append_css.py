css_to_add = """

/* =========================================
   RESPONSIVE DESIGN (MODERN MOBILE FIRST)
   ========================================= */

.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.mobile-menu-btn:active { transform: scale(0.95); }

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

  .mobile-menu-btn {
    display: flex;
  }

  .main-content {
    padding-bottom: 80px; /* space for the floating action button */
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

with open('frontend/src/styles/globals.css', 'a') as f:
    f.write(css_to_add)

print("CSS appended successfully.")
