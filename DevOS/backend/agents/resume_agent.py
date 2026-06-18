from core.llm import stream_ollama

RESUME_SYSTEM = """You are an expert HR analyst and career coach with 10+ years experience in tech hiring.
When analyzing a resume:
1. Extract all technical skills, frameworks, and tools
2. Evaluate experience quality and relevance
3. Identify ATS keyword gaps
4. Score the resume from 1-10
5. Generate 10 tailored interview questions based on the resume
6. Suggest specific improvements with examples
Be actionable and specific."""

class ResumeAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        messages = []
        for h in history[-4:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})
        response = await stream_ollama(messages, RESUME_SYSTEM)
        return response
