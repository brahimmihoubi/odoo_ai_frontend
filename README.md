# Odoo AI Dashboard

A professional, decoupled frontend and backend ecosystem designed to extend the capabilities of Odoo ERP. This system provides a dynamic, responsive dashboard featuring comprehensive CRUD capabilities linked directly to live Odoo data, powered by a FastAPI backend and a React frontend, with integrated local artificial intelligence through Ollama.

## Architecture Overview

The system operates on a modernized, separated architecture rather than traditional Odoo QWeb views:

1.  **Frontend (React & Vite):** A high-performance single-page application that provides an intuitive interface for business modules. It handles session management, routing, and renders data fetched from the backend.
2.  **Backend (FastAPI):** A fast, asynchronous Python web server that acts as a secure middleware. It receives HTTP requests from the frontend, translates them into Odoo XML-RPC protocols, and manages the AI orchestration.
3.  **ERP Core (Odoo 18):** The central database and logic engine (`odoo18_db`). The backend connects to Odoo via secure XML-RPC `execute_kw` calls to fetch, create, update, and delete real records.
4.  **AI Engine (Ollama):** A locally hosted language model server used for generating dynamic business reports and providing a streaming chatbot assistant capable of analyzing Odoo data.

## Key Features

### Live ERP Integration (XML-RPC)
The system does not use mock data. All business modules perform real-time interactions with the Odoo database. The backend authenticates sessions and leverages Odoo's `search_read`, `create`, `write`, and `unlink` methods on native models (e.g., `res.partner`, `sale.order`, `purchase.order`, `res.company`).

### Comprehensive Business Modules
Full CRUD (Create, Read, Update, Delete) operations are implemented for the following sectors:
*   **CRM (Pipeline):** Manage sales pipelines, expected revenues, and lead stages (`crm.lead`).
*   **Sales:** Track recent transactions and generate new sales orders (`sale.order`).
*   **Customers:** Maintain the central address book and individual client profiles (`res.partner`).
*   **Purchases:** Oversee vendor bills, PO tracking, and procurement execution (`purchase.order`).
*   **Suppliers:** Manage vendor relationships and supply chain contact data (`res.partner` with `supplier_rank`).
*   **Companies:** Administer multi-company environments and organizational structures (`res.company`).
*   **Dynamic Navigation:** A categorized, collapsible sidebar allowing users to toggle visibility of business domains.

### Secure Authentication
The system mandates user authentication. The frontend login portal requests Odoo credentials, which are verified by the backend against the Odoo database. Validated credentials are encrypted in local storage and passed securely via headers for all subsequent API requests.

### Artificial Intelligence Capabilities
The integrated AI assistant operates via an Ollama instance running locally. The backend streams responses to the frontend in real-time, providing word-by-word generation without latency. The system leverages local models (e.g., `llama3.2:1b`) to generate daily business reports and interact directly with users regarding their ERP data, ensuring data privacy by keeping computations on-premise.

## Technical Stack

*   **Frontend Environment:** React 18, Vite, Vanilla CSS
*   **Backend Environment:** Python 3.10+, FastAPI, Uvicorn, XML-RPC
*   **Database/ERP:** Odoo 18
*   **AI Engine:** Ollama

## Startup Instructions

### Prerequisites
*   Node.js (v12.22.9 or compatible LTS required for build consistency)
*   Python 3.10 or higher
*   A running instance of Odoo 18 (defaulting to `odoo18_db` on port 8069)
*   A running instance of Ollama (defaulting to port 11434)

### Execution

The project includes a bash script that handles the concurrent initialization of both the backend and frontend servers.

1.  Navigate to the project root directory.
2.  Ensure the script is executable:
    `chmod +x start.sh`
3.  Execute the startup script:
    `./start.sh`

The script will automatically activate the Python virtual environment, install missing backend dependencies via pip, launch the FastAPI server on port 8000, and start the React Vite development server.

Access the dashboard by navigating to the local address provided in the terminal (typically `http://localhost:5173`). You will be required to authenticate using your active Odoo database credentials.
