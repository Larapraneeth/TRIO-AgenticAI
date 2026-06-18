import os
import json
from core.llm import generate_ollama, stream_ollama

CODING_PROMPT = """Analyze this coding request and return ONLY JSON:
{
  "type": "fastapi | react | fullstack | script | component | algorithm",
  "language": "python | javascript | typescript",
  "description": "what to build"
}"""

class CodingAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        raw = await generate_ollama(
            prompt=f"Coding request: {message}",
            system_prompt=CODING_PROMPT,
            max_tokens=120
        )
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            data = json.loads(raw[start:end])
        except Exception:
            data = {"type": "script", "language": "python", "description": message}

        project_type = data.get("type", "script")
        language = data.get("language", "python")

        system_prompt = self._get_system_prompt(project_type, language)

        response = await stream_ollama(
            messages=[{"role": "user", "content": message}],
            system_prompt=system_prompt
        )
        return response

    def _get_system_prompt(self, project_type: str, language: str) -> str:
        base = "You are an expert software engineer. Generate clean, production-ready code with no placeholder comments. Include all imports, error handling, and complete implementations."

        if project_type == "fastapi":
            return base + " Generate complete FastAPI applications with models, routes, database integration using SQLAlchemy, and proper error handling."
        elif project_type == "react":
            return base + " Generate complete React components with hooks, TypeScript types, Tailwind CSS styling, and proper state management."
        elif project_type == "fullstack":
            return base + " Generate complete fullstack applications with FastAPI backend and React frontend, including database models, API routes, and UI components."
        else:
            return base + f" Generate clean {language} code that works without modification."