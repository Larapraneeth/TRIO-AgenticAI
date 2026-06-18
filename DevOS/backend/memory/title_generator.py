from core.llm import generate_ollama

TITLE_PROMPT = """Generate a short conversation title (3-5 words max) based on the user's first message.

Rules:
- Title Case
- No quotes, no punctuation at end
- Be specific and descriptive
- Examples:
  "Find AI internships" → AI Internship Search
  "Review my GitHub repository" → GitHub Repository Review
  "Generate FastAPI CRUD APIs" → FastAPI CRUD Generator
  "Debug my Python error" → Python Error Debugging
  "Conduct a software engineer interview" → Software Engineer Interview
  "Open Chrome and search YouTube" → Chrome Browser Automation
  "Analyze my resume" → Resume Analysis

Return ONLY the title, nothing else."""

async def generate_title(first_message: str) -> str:
    try:
        title = await generate_ollama(
            prompt=f"User message: {first_message}",
            system_prompt=TITLE_PROMPT
        )
        title = title.strip().strip('"').strip("'").strip()
        if len(title) > 60:
            title = title[:57] + "..."
        return title or "New Chat"
    except Exception:
        words = first_message.strip().split()[:5]
        return " ".join(words).title() or "New Chat"
