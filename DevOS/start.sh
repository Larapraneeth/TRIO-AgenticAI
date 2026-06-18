#!/bin/bash

echo "⚡ Starting DevOS..."

if ! pgrep -x "ollama" > /dev/null; then
  echo "Starting Ollama..."
  ollama serve &
  sleep 3
fi

echo "Starting Backend (port 8000)..."
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
deactivate
cd ..

sleep 2

echo "Starting Frontend (port 3000)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  DevOS is running!                       ║"
echo "║  Frontend → http://localhost:3000        ║"
echo "║  Backend  → http://localhost:8000        ║"
echo "║  API Docs → http://localhost:8000/docs   ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM
wait
