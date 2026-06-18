from core.llm import stream_ollama

SYSTEM_PROMPT = """You are DevOS, an intelligent AI assistant like ChatGPT but running fully locally.
You are helpful, precise, and technical. You assist with coding, debugging, explanations, and general questions.
Keep responses clear and well-formatted using markdown."""

class ChatAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        messages = []
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})
        response = await stream_ollama(messages, SYSTEM_PROMPT)
        return response
