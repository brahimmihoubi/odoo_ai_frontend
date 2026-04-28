#!/bin/bash

echo "Starting OdooAI Dashboard..."

# 1. Start the FastAPI Backend
echo "➔ Starting FastAPI backend on port 8000..."
cd ~/odoo_ia_backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
BACKEND_PID=$!
cd /home/barhoum/odoo_ai_frontend

# 2. Start the React Frontend
echo "➔ Starting React frontend on port 3000..."
cd frontend
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "All systems go!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Ollama Model: odoo-assistant"
echo ""
echo "Press [CTRL+C] to stop all servers."

# Trap Ctrl+C to kill both background processes gracefully
trap "echo -e '\nStopping servers...'; kill $BACKEND_PID; kill $FRONTEND_PID; exit 0" SIGINT SIGTERM

# Wait indefinitely until interrupted
wait
