#!/bin/bash
set -e

echo "╔══════════════════════════════════════╗"
echo "║       DevOS Setup Script             ║"
echo "╚══════════════════════════════════════╝"

if ! command -v ollama &> /dev/null; then
  echo "[1/5] Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "[1/5] Ollama already installed"
fi

echo "[2/5] Pulling Qwen2.5:7b model (this may take a while)..."
ollama pull qwen2.5:7b

echo "[3/5] Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
playwright install chromium
deactivate
cd ..

echo "[4/5] Setting up React frontend..."
cd frontend
npm install --silent
cd ..

echo "[5/5] Creating .env file..."
cat > backend/.env << 'EOF'
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
CHROMA_PATH=./memory/chroma_db
WHISPER_MODEL=base
PIPER_MODEL=en_US-lessac-medium
MAX_TOKENS=2048
TEMPERATURE=0.7
EOF

echo ""
echo "✅ DevOS setup complete!"
echo ""
echo "To start DevOS, run: ./start.sh"
