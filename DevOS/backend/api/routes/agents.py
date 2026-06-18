from fastapi import APIRouter

router = APIRouter()

@router.get("/list")
async def list_agents():
    return {
        "agents": [
            {"id": "chat", "name": "Chat Agent", "description": "General conversation and Q&A", "icon": "💬"},
            {"id": "system", "name": "System Agent", "description": "Open/close desktop applications", "icon": "🖥️"},
            {"id": "browser", "name": "Browser Agent", "description": "Web search and navigation", "icon": "🌐"},
            {"id": "github", "name": "GitHub Agent", "description": "Repository analysis and code review", "icon": "🐙"},
            {"id": "coding", "name": "Coding Agent", "description": "Generate code and projects", "icon": "💻"},
            {"id": "debug", "name": "Debug Agent", "description": "Fix errors and bugs", "icon": "🐛"},
            {"id": "resume", "name": "Resume Agent", "description": "Resume analysis and ATS", "icon": "📄"},
            {"id": "interview", "name": "Interview Agent", "description": "Conduct mock interviews", "icon": "🎤"},
        ]
    }
