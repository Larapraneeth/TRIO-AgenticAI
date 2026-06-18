# ⚡ DevOS – Voice & Text Multi-Agent AI Assistant

A fully local, production-ready AI assistant combining voice + text with 8 specialized agents.

## Quick Start

```bash
chmod +x setup.sh start.sh
./setup.sh      # one-time setup (installs everything)
./start.sh      # launch all services
```

Then open **http://localhost:3000**

---

## Architecture

```
User Input (Voice / Text)
        ↓
  Manager Agent  ←→  Memory (ChromaDB)
        ↓
  ┌─────────────────────────────────┐
  │  Chat  │ System │ Browser      │
  │ GitHub │ Coding │ Debug        │
  │ Resume │ Interview              │
  └─────────────────────────────────┘
        ↓
   Ollama (Qwen2.5:7b local LLM)
        ↓
  FastAPI Backend → React Frontend
```

## Agents

| Agent | Trigger Examples |
|-------|-----------------|
| 💬 Chat | General Q&A, explanations |
| 🖥️ System | "Open Chrome", "Open VS Code" |
| 🌐 Browser | "Find AI internships", "Search YouTube" |
| 🐙 GitHub | "Review my repo", "Analyze this code" |
| 💻 Coding | "Generate FastAPI CRUD", "Create React app" |
| 🐛 Debug | "Fix this error", "Explain this bug" |
| 📄 Resume | "Analyze my resume", "ATS check" |
| 🎤 Interview | "Conduct AI Engineer interview" |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM | Ollama + Qwen2.5:7b (local) |
| Backend | FastAPI + Python |
| Frontend | React + Zustand |
| Memory | ChromaDB |
| Voice In | Faster Whisper |
| Voice Out | Piper TTS / pyttsx3 |
| Browser | Playwright |
| Git | GitPython |

## API Endpoints

- `POST /api/chat/` – Send a message
- `POST /api/voice/transcribe` – Speech to text
- `POST /api/voice/speak` – Text to speech
- `GET /api/agents/list` – List all agents
- `GET /api/system/info` – System status
- `GET /docs` – Swagger UI

## Voice Usage

1. Click **Voice Off** in the header to enable voice mode
2. Click the 🎤 button in the input bar and speak
3. Release to auto-transcribe and send
4. DevOS will speak responses back via TTS

## Requirements

- Python 3.10+
- Node.js 18+
- 8GB+ RAM (for local LLM)
- Ollama installed
