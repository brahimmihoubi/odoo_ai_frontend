# Odoo AI Frontend Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Directory Structure](#project-directory-structure)
5. [Key Features](#key-features)
6. [Setup and Installation](#setup-and-installation)
7. [Configuration](#configuration)
8. [Responsive Design & UI](#responsive-design--ui)
9. [Deployment](#deployment)

---

## Introduction

The **Odoo AI Frontend** is a modern, high-performance Single Page Application (SPA) designed to serve as the user interface for our Odoo ERP integration. Built with **React** and **Vite**, it completely replaces the traditional Odoo QWeb views with a fast, dynamic, and fully responsive dashboard. It connects securely to the Odoo FastAPI backend middleware to read and write ERP data in real-time, and integrates an AI Assistant powered by Ollama.

---

## Architecture Overview

The frontend operates as an independent, decoupled client:
- **Routing & State:** Managed internally within React, allowing seamless page transitions without browser reloads.
- **Data Fetching:** API calls are organized within the `src/lib/api.js` service layer, which communicates directly with the FastAPI backend using standard HTTP requests and JWT/Basic Auth headers.
- **Component Design:** The UI is modular. Reusable components (buttons, headers, modals) are separated from the main Page components (CRM, Sales, Inventory), ensuring a scalable codebase.

---

## Technology Stack

- **Core Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) for extremely fast Hot Module Replacement (HMR) and optimized builds.
- **Styling:** Vanilla CSS (`globals.css`) leveraging CSS Variables for consistent theming and dark/light modes.
- **Icons:** SVG-based icons for scalable, lightweight visuals.

---

## Project Directory Structure

```text
odoo_ai_frontend/
├── index.html              # Main HTML entry point
├── package.json            # NPM dependencies and scripts
├── vite.config.js          # Vite bundler configuration
├── start.sh                # Concurrent startup script
└── src/                    # Source code root
    ├── main.jsx            # React DOM mounting point
    ├── App.jsx             # Root component and application routing
    ├── hooks/              # Custom React hooks
    │   └── useClock.js     # Live clock hook for the PageHeader
    ├── lib/                # Utility and service layers
    │   └── api.js          # Centralized API fetch methods
    ├── styles/             # Global stylesheets
    │   └── globals.css     # CSS Variables, resets, utility classes, media queries
    └── components/         # React component library
        ├── layout/         # Structural components
        │   ├── Sidebar.jsx # Navigation menu
        │   └── PageHeader.jsx # Reusable page title bar
        ├── shared/         # Reusable UI elements
        │   └── KpiCard.jsx # Standardized KPI widget
        └── pages/          # Full page views matching the sidebar routes
            ├── AIAssistant.jsx
            ├── Companies.jsx
            ├── CRM.jsx
            ├── Customers.jsx
            ├── Inventory.jsx
            ├── Invoicing.jsx
            ├── Login.jsx
            ├── Overview.jsx
            ├── Purchases.jsx
            ├── Sales.jsx
            └── Suppliers.jsx
```

---

## Key Features

1. **Live ERP Integration:** The UI does not use mock data. Every table, dropdown, and KPI card fetches real-time records (Sales, Purchases, CRM leads) from the Odoo database via the backend API.
2. **Relational Dropdowns:** When creating a new CRM Lead or Sales Order, the UI fetches and populates actual Odoo Customers/Suppliers into the selection menus.
3. **AI Assistant Integration:** A dedicated chat interface communicates with a local Ollama instance to provide dynamic ERP insights and generate executive daily business reports based purely on live metrics.
4. **Export & Print Capabilities:** The Invoicing and Reporting modules feature native client-side functions to export tables to CSV or trigger PDF print views.

---

## Setup and Installation

### 1. Prerequisites
- **Node.js:** v16.0.0 or higher.
- **Backend:** The Odoo FastAPI backend must be running simultaneously to provide data.

### 2. Installation
Navigate to the frontend directory and install the necessary NPM packages:
```bash
cd odoo_ai_frontend/frontend
npm install
```

### 3. Running the Development Server
You can start the frontend independently via NPM:
```bash
npm run dev
```
Alternatively, you can run the provided shell script from the project root which starts both the frontend and backend concurrently:
```bash
./start.sh
```
The application will be accessible at `http://localhost:3000`.

---

## Configuration

### API Endpoints
Currently, the backend URL is configured within `src/lib/api.js`. If your backend is hosted on a different port or remote server, update the `BACKEND` constant:

```javascript
// src/lib/api.js
const BACKEND = "http://localhost:8000"
```

### Vite Configuration
The Vite bundler is configured in `vite.config.js`. It includes configurations to run the server on port `3000` and disables the HMR error overlay to prevent crash screens during background execution.

---

## Responsive Design & UI

The frontend is built with a **Modern Mobile-First** approach:
- **Mobile Topbar:** On mobile devices (`<768px`), the standard persistent sidebar is hidden. Instead, a sleek top navigation bar appears containing a hamburger menu toggle.
- **Glassmorphism Overlays:** Opening the sidebar on mobile blurs the background content for a premium aesthetic.
- **Adaptive KPI Grids:** Grids automatically collapse from 4 columns on desktop, to 2 on tablets, and 1 on mobile screens.
- **Swipeable Tables:** Data-heavy tables are wrapped in an `overflow-x` container, allowing horizontal swiping on mobile devices without breaking the page layout.

---

## Deployment

To prepare the frontend for a production environment, generate a static build using Vite:

```bash
npm run build
```

This command will bundle the React application, minify the CSS/JS, and output the optimized static files into the `dist/` directory. These files can then be served by any standard web server, such as **Nginx**, **Apache**, or a static hosting platform (e.g., Vercel, Netlify).
