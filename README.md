# 🚀 TRIO-AgenticAI

### A Local Multi-Agent AI Operating System

TRIO-AgenticAI is a local-first AI operating system that combines conversational AI, voice interaction, intelligent task routing, browser automation, system control, coding assistance, resume analysis, GitHub repository review, and interview preparation into a single platform.

The system uses a multi-agent architecture where a central manager agent analyzes each request and routes it to the most suitable specialized agent. Routing is **deterministic for clear signals** (e.g. a GitHub URL, an internship search) and falls back to a local LLM only for ambiguous requests — so the system stays reliable even on a small local model. By running on local LLMs through Ollama and local speech models, TRIO prioritizes privacy, zero API cost, and full user control.

---

## ✨ Features

### 🤖 Multi-Agent Architecture

A central **Manager Agent** analyzes the request and selects the right agent. It uses fast keyword-based routing for obvious cases and the LLM only when the request is genuinely ambiguous.

Available agents:

* Chat Agent
* System Agent
* Browser Agent
* Coding Agent
* Debug Agent
* Resume Agent
* Interview Agent
* GitHub Agent

---

### 💬 Conversational AI

* Natural, context-aware, multi-turn conversations
* Local LLM integration through Ollama (Qwen models)

---

### 🎤 Voice Assistant

Full two-way voice loop, running entirely on local models:

* **Speech-to-text** via Faster-Whisper (offline)
* **Text-to-speech** with a two-tier engine: edge-tts (high quality, when online) with an automatic offline **pyttsx3** fallback for restricted networks
* Animated voice-activation overlay wired directly to the microphone
* Voice and text commands supported interchangeably

---

### 🖥️ System Automation

Launch desktop applications such as Chrome, VS Code, Calculator, Notepad, and File Explorer.

---

### 🌐 Browser Automation

Live web automation using **Playwright + headless Chromium**:

* Web search and internship/job search via DuckDuckGo's no-JS HTML endpoint (no login walls, no bot blocking)
* Results returned as clean, clickable links with sponsored/ad results filtered out
* Open websites and YouTube searches
* Hard timeouts so a slow page can never hang the app

> **Note:** The browser agent deliberately uses DuckDuckGo rather than scraping LinkedIn directly. LinkedIn aggressively blocks automation and requires login, which makes direct scraping unreliable and risky. DuckDuckGo returns the same job listings (LinkedIn, Indeed, Internshala, etc.) as stable, clickable links.

---

### 💻 Coding Assistant

Generate FastAPI apps, React components, full-stack scaffolds, Python scripts, algorithms, and APIs.

---

### 🐞 Debug Assistant

Analyze errors, explain stack traces, suggest fixes, and troubleshoot code.

---

### 📄 Resume Assistant

ATS analysis, resume feedback, skill extraction, and career guidance.

---

### 🎯 Interview Assistant

Mock interviews, technical and behavioral questions, and answer evaluation.

---

### 🧠 Memory System

Conversation history, persistent memory, and context retrieval backed by ChromaDB and SQLite.

---

## 📸 Screenshots

### Main Dashboard

The central workspace for text commands, quick actions, and conversation history.

![Main Dashboard](screenshots/Home.png)

---

### Voice Interaction Mode

Voice-first interface with activation overlay, speech recognition, and spoken AI responses.

![Voice Interaction](screenshots/trio_Voice.png)

---

### Chat & Agents

Example of an agent handling a request and returning a structured response.

![Chat Log](screenshots/ChatLog.png)

---

## 🏗️ System Architecture

```text
User Input (Voice / Text)
            │
            ▼
      Manager Agent
            │
            ▼
   Keyword Routing ──── clear signal ──► Specialized Agent
            │
        ambiguous
            │
            ▼
   LLM Routing (Ollama)
            │
 ┌──────────┼───────────┬───────────┐
 ▼          ▼           ▼           ▼
Chat     Browser     GitHub      Coding  ...
Agent     Agent      Agent       Agent
            │
            ▼
   Local LLM (Ollama)  /  Whisper (voice)  /  Playwright (web)
            │
            ▼
     Response Generation
```

---

## 🧩 Agent Responsibilities

| Agent | Responsibility |
|-------|----------------|
| **Manager** | Detects intent, routes to agent(s), coordinates execution, merges responses |
| **Chat** | Conversation, explanations, general reasoning |
| **System** | Launches desktop applications |
| **Browser** | Web/internship/YouTube search and site automation via Playwright |
| **Coding** | Generates code, APIs, and components |
| **Debug** | Analyzes errors and provides fixes |
| **Resume** | Evaluates resumes and gives career insights |
| **Interview** | Conducts interview sessions and evaluates responses |
| **GitHub** | Clones and reviews repositories with a code-quality summary |

---

## ⚙️ Tech Stack

**Frontend:** React, JavaScript, Axios, React Markdown, Zustand

**Backend:** FastAPI, Python, Uvicorn, Pydantic

**AI & ML:** Ollama, Qwen models, Faster-Whisper, ChromaDB

**Voice:** Faster-Whisper (STT), edge-tts + pyttsx3 (TTS)

**Automation:** Playwright (Chromium), desktop automation

**Storage:** SQLite, ChromaDB

---

## 📁 Project Structure

```text
TRIO-AgenticAI
│
├── DevOS
│   ├── backend
│   │   ├── agents          # manager + specialized agents
│   │   ├── api             # FastAPI routes
│   │   ├── core            # config, LLM client
│   │   ├── memory          # database, title generation
│   │   ├── voice           # stt.py, tts.py
│   │   ├── main.py
│   │   └── requirements.txt
│   │
│   └── frontend
│       ├── src
│       ├── public
│       └── package.json
│
├── screenshots
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Larapraneeth/TRIO-AgenticAI.git
cd TRIO-AgenticAI/DevOS
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
python main.py
```

> **Important:** Start the backend with `python main.py`, **not** `uvicorn main:app --reload`.
> `main.py` sets the Windows **Proactor event loop policy** required by Playwright. The `--reload` worker runs on the Selector loop and will crash the browser agent with `NotImplementedError`.

Backend runs at `http://127.0.0.1:8000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

### 4. Ollama setup

Install [Ollama](https://ollama.com), then pull a model:

```bash
ollama pull qwen2.5:1.5b   # recommended for 8 GB RAM machines
# or
ollama pull qwen2.5:3b     # better quality, needs more free RAM
```

Set your choice in `backend/core/config.py`:

```python
OLLAMA_MODEL: str = "qwen2.5:1.5b"
```

Verify:

```bash
ollama list
```

> **Model choice matters.** On CPU-only machines with ~8 GB RAM, `qwen2.5:1.5b` loads reliably and responds quickly. `qwen2.5:3b` gives better answers but can be slow or fail to load when free RAM is low.

---

## ⚙️ Configuration

Key settings in `backend/core/config.py`:

| Setting | Purpose | Default |
|---------|---------|---------|
| `OLLAMA_MODEL` | Local LLM used by all agents | `qwen2.5:1.5b` |
| `OLLAMA_KEEP_ALIVE` | How long the model stays loaded in RAM | `30s` |
| `OLLAMA_NUM_CTX` | Context window (smaller = less RAM) | `2048` |
| `WHISPER_MODEL` | Speech-to-text model size (`tiny`/`base`) | `base` |
| `TTS_PROVIDER` | `edge` (online, high quality) or `pyttsx3` (offline) | `pyttsx3` |
| `TTS_VOICE` | edge-tts voice | `en-US-AriaNeural` |

Secrets (API keys, if you enable any hosted providers) go in `backend/.env`, which is git-ignored.

---

## 🩹 Troubleshooting

**Backend crashes with `NotImplementedError` when the browser agent runs**
You started with `uvicorn --reload`. Use `python main.py` instead (see setup note above).

**Ollama: `failed to allocate CPU_REPACK buffer` / model won't load**
Out of RAM. Free memory (close browser tabs, quit Docker), or switch `OLLAMA_MODEL` to `qwen2.5:1.5b`.

**Voice transcription crashes with a NumPy error**
Faster-Whisper needs NumPy < 2. Run `pip install "numpy<2"` inside the venv.

**TTS produces no sound / edge-tts fails with a 403**
Some networks block edge-tts. Set `TTS_PROVIDER = "pyttsx3"` in config to use the offline engine.

**Chat request times out**
The local model is too slow for the task on this hardware. Use `qwen2.5:1.5b`, and pre-warm the model with one message before demoing.

---

## 🔮 Future Improvements

* Agent permission system
* Workflow automation and agent chaining
* True voice-activity detection (auto-stop on silence)
* File management agent
* Optional hosted-model support for heavier tasks
* Enhanced long-term memory

---

## 🎯 Project Goal

TRIO-AgenticAI explores agentic AI systems that intelligently route tasks between specialized agents while running primarily on local models — for privacy, efficiency, and user control.

---

## 👨‍💻 Author

**Lara Praneeth Kondeti**
B.Tech Computer Science & Engineering
Indian Institute of Information Technology, Surat

---

## 📜 License

Intended for educational, research, and learning purposes.
