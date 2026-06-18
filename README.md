# 🚀 TRIO-AgenticAI

### A Local Multi-Agent AI Operating System

TRIO-AgenticAI is a local-first AI operating system that combines conversational AI, voice interaction, intelligent agent routing, browser automation, system control, coding assistance, resume analysis, GitHub repository review, and interview preparation into a single platform.

Built using FastAPI, React, Ollama, ChromaDB, and a multi-agent orchestration architecture.

---

## ✨ Features

- 🤖 Intelligent Multi-Agent Routing
- 🎤 Voice + Text Interaction
- 🧠 Local LLM Support via Ollama
- 🌐 Browser Automation
- 💻 Code Generation & Debugging
- 📄 Resume Analysis
- 🎯 Interview Preparation
- 🗂 Persistent Conversation History
- 🔍 GitHub Repository Review
- ⚡ Privacy-Focused Local Execution

---

## 📸 Screenshots

### Main Dashboard

The central workspace where users can interact with TRIO through text commands, quick actions, and conversation history.

![Main Dashboard](home.png)

---

### Voice Interaction Mode

Voice-first interface with activation mode, speech recognition, and AI response generation.

![Voice Mode](voice-mode.png)

---

### Debug Assistant

Example of the Debug Agent identifying issues in code and providing corrected solutions with explanations.

![Debug Agent](debug-agent.png)

---

## 🏗 System Architecture

```text
User Input (Voice/Text)
          │
          ▼
    Manager Agent
          │
          ▼
   Intent Detection
          │
 ┌────────┼─────────┐
 │        │         │
 ▼        ▼         ▼
Chat   Browser   Coding
Agent   Agent     Agent
 │
 ▼
Ollama Local LLM
 │
 ▼
Response Generation
```

---

## 🧩 Available Agents

### Chat Agent
Handles general conversation, explanations, and reasoning.

### System Agent
Controls desktop applications and approved system actions.

### Browser Agent
Performs searches, opens websites, finds internships, and handles YouTube interactions.

### Coding Agent
Generates FastAPI applications, React projects, APIs, scripts, and algorithms.

### Debug Agent
Analyzes errors, stack traces, and provides fixes.

### Resume Agent
Performs ATS analysis, skill extraction, and career guidance.

### Interview Agent
Conducts mock interviews and evaluates responses.

### GitHub Agent
Reviews repositories and provides development insights.

---

## ⚙️ Tech Stack

### Frontend

- React
- JavaScript
- Axios
- React Markdown
- Zustand

### Backend

- FastAPI
- Python
- Uvicorn
- Pydantic

### AI & Automation

- Ollama
- Qwen Models
- ChromaDB
- Faster Whisper
- Playwright

---

## 🚀 Getting Started

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python -m uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm start
```

### Ollama

```bash
ollama pull qwen2.5:3b
```

---

## 🎯 Project Goal

The objective of TRIO-AgenticAI is to explore agentic AI systems capable of intelligently routing tasks between specialized agents while operating primarily on local models for privacy, efficiency, and control.

---

## 👨‍💻 Author

**Lara Praneeth Kondeti**

B.Tech Computer Science & Engineering

Indian Institute of Information Technology Surat
