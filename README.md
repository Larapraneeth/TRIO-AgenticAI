# 🚀 TRIO-AgenticAI

TRIO-AgenticAI is a local multi-agent AI operating system that combines conversational AI, voice interaction, browser automation, system automation, coding assistance, resume analysis, GitHub repository review, and interview preparation into a single platform.

The project is designed to run primarily on local models through Ollama, allowing users to interact with multiple AI agents using either text or voice commands.

---

## Features

### 🤖 Multi-Agent Architecture

The system automatically analyzes user requests and routes them to the most suitable agent.

Available agents include:

* Chat Agent
* System Agent
* Browser Agent
* Coding Agent
* Debug Agent
* Resume Agent
* GitHub Agent
* Interview Agent

---

### 💬 Conversational AI

* Natural language conversations
* Context-aware responses
* Multi-turn chat history
* Local LLM support through Ollama

---

### 🎤 Voice Assistant

* Voice input support
* Text-to-speech responses
* Hands-free interaction
* Voice and text commands supported simultaneously

---

### 🖥️ System Automation

Perform desktop operations such as:

* Open VS Code
* Open Chrome
* Open Calculator
* Open Notepad
* Open File Explorer
* Launch other approved applications

---

### 🌐 Browser Automation

* Open websites
* Search Google
* Search YouTube
* Internship search
* LinkedIn searches
* News searches

---

### 💻 Coding Assistant

Generate:

* FastAPI projects
* React components
* Full-stack applications
* Python scripts
* Algorithms
* API implementations

---

### 🐞 Debug Assistant

* Analyze stack traces
* Explain errors
* Suggest fixes
* Troubleshoot code issues

---

### 📄 Resume Assistant

* Resume analysis
* Skill extraction
* ATS feedback
* Career suggestions

---

### 🎯 Interview Assistant

* Mock interviews
* Technical questions
* Behavioral questions
* Feedback on responses

---

### 🧠 Memory System

* Conversation history
* Persistent storage
* Context retrieval
* ChromaDB integration

---

## System Architecture

User Input (Text / Voice)

↓

Manager Agent

↓

Intent Detection & Routing

↓

Specialized Agents

↓

Response Generation

↓

Frontend Interface

The Manager Agent acts as the orchestrator and decides which agent should handle a particular request.

---

## Tech Stack

### Frontend

* React
* JavaScript
* Axios
* React Markdown
* Zustand

### Backend

* FastAPI
* Python
* Uvicorn
* Pydantic

### AI & ML

* Ollama
* Qwen Models
* Faster-Whisper
* ChromaDB

### Automation

* Playwright
* Browser Automation
* Desktop Automation

### Database

* SQLite
* ChromaDB

---

## Project Structure

```text
DevOS
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── agents
│   ├── api
│   ├── core
│   ├── memory
│   ├── voice
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

## Running the Project

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

### Frontend

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

### Ollama

Install Ollama and download a supported model:

```bash
ollama pull qwen2.5:3b
```

or

```bash
ollama pull qwen2.5:7b
```

---

## Future Improvements

* Agent permission system
* Better browser automation
* File management agent
* Workflow automation
* Mobile deployment
* Agent memory optimization
* Multi-model support

---



---

## Note

This project was developed as an exploration of agentic AI systems, local LLM deployment, intelligent task routing, and AI-powered desktop assistance.
