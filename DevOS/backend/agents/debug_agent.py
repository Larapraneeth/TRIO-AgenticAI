from core.llm import stream_ollama

DEBUG_SYSTEM = """You are an expert debugger and software engineer. When given an error or code:
1. Identify the exact root cause
2. Explain why it happens
3. Provide the complete fixed code
4. Suggest prevention strategies
Be specific, technical, and provide working code solutions."""

class DebugAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        messages = []
        for h in history[-6:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})
        response = await stream_ollama(messages, DEBUG_SYSTEM)
        return response
