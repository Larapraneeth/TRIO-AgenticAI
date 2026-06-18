import json
from core.llm import generate_ollama, stream_ollama

INTERVIEW_SYSTEM = """You are a senior technical interviewer at a top tech company. Conduct professional, realistic interviews.
- Ask ONE question at a time
- Evaluate the candidate's answer critically but fairly
- Follow up with deeper questions based on their response
- After 5+ exchanges, provide a detailed evaluation with scores
- Be encouraging but honest about weaknesses
Format evaluations as: Score: X/10, Strengths: ..., Areas to improve: ..."""

ROLE_PROMPT = """Extract the job role for this interview from the user message. Return ONLY the role name.
Example: "AI Engineer", "Software Engineer", "Data Scientist", "Frontend Developer"."""

class InterviewAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        is_start = len(history) == 0 or not any("interview" in str(h).lower() for h in history[-3:])

        if is_start:
            role = await generate_ollama(
                prompt=f"Message: {message}",
                system_prompt=ROLE_PROMPT,
                max_tokens=10
            )
            role = role.strip()
            intro = f"**Starting {role} Interview**\n\nHello! I'm your interviewer today. We'll conduct a technical interview for the **{role}** position. This will take about 20-30 minutes.\n\nLet's begin.\n\n"
            first_q = await stream_ollama(
                messages=[{"role": "user", "content": f"Start a {role} interview. Ask the first question."}],
                system_prompt=INTERVIEW_SYSTEM
            )
            return intro + first_q

        messages = []
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})
        response = await stream_ollama(messages, INTERVIEW_SYSTEM)
        return response