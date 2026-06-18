import json
from core.llm import generate_ollama, OllamaError
from agents.chat_agent import ChatAgent
from agents.system_agent import SystemAgent
from agents.browser_agent import BrowserAgent
from agents.github_agent import GitHubAgent
from agents.coding_agent import CodingAgent
from agents.debug_agent import DebugAgent
from agents.resume_agent import ResumeAgent
from agents.interview_agent import InterviewAgent

ROUTER_PROMPT = """You are DevOS, an intelligent AI operating system. Analyze the user request and return ONLY a JSON object to route it to the correct agent(s).

Available agents:
- chat: general conversation, Q&A, explanations, greetings, opinions
- system: open/close/launch desktop apps (chrome, spotify, vscode, notepad, calculator, explorer, terminal)
- browser: search web, open websites, find jobs/internships, YouTube, LinkedIn, news
- github: clone repos, analyze code, review repositories, git operations
- coding: generate code projects, APIs, React apps, FastAPI, scripts, algorithms
- debug: fix errors, explain bugs, analyze stack traces, troubleshoot code
- resume: analyze resume, extract skills, ATS check, career advice
- interview: conduct mock interviews, ask technical questions, evaluate answers

Return ONLY this JSON with no extra text:
{
  "agents": ["agent_name"],
  "intent": "brief description of what the user wants",
  "params": {}
}

Use multiple agents when the task genuinely needs them:
- "find internships matching my resume" → ["browser", "resume"]
- "analyze resume and conduct interview" → ["resume", "interview"]
- "open chrome and search AI news" → ["system", "browser"]
For simple tasks use one agent only."""

class ManagerAgent:
    def __init__(self):
        self.agents = {
            "chat": ChatAgent(),
            "system": SystemAgent(),
            "browser": BrowserAgent(),
            "github": GitHubAgent(),
            "coding": CodingAgent(),
            "debug": DebugAgent(),
            "resume": ResumeAgent(),
            "interview": InterviewAgent(),
        }

    async def route(self, user_message: str, history: list = []) -> dict:
        execution_steps = []

        execution_steps.append("Intent detected")
        try:
            routing_response = await generate_ollama(
                prompt=f"User request: {user_message}",
                system_prompt=ROUTER_PROMPT,
                max_tokens=80
            )
            raw = routing_response.strip()
            start = raw.find("{")
            end = raw.rfind("}") + 1
            route_data = json.loads(raw[start:end])
        except OllamaError as e:
            # Ollama itself is unreachable/misconfigured (e.g. wrong model name,
            # server not running). Surface this clearly instead of crashing the
            # whole request, and fall back to the chat agent so the user still
            # gets a response explaining what's wrong.
            execution_steps.append(f"Routing failed: {e}")
            return {
                "response": f"⚠️ Couldn't reach the local AI model: {e}",
                "agents_used": [],
                "agent_statuses": [],
                "intent": user_message,
                "execution_steps": execution_steps,
            }
        except Exception:
            # Routing call succeeded but the JSON it returned was unparseable.
            # Default to the chat agent rather than failing the request.
            route_data = {"agents": ["chat"], "intent": user_message, "params": {}}

        selected_agents = route_data.get("agents", ["chat"])
        intent = route_data.get("intent", user_message)
        params = route_data.get("params", {})

        execution_steps.append(f"Routing to {', '.join(selected_agents)}")

        results = []
        agent_statuses = []

        for agent_name in selected_agents:
            agent = self.agents.get(agent_name)
            if agent:
                execution_steps.append(f"{agent_name.capitalize()} agent running")
                agent_statuses.append({"agent": agent_name, "status": "running"})
                try:
                    result = await agent.execute(user_message, history, params)
                    results.append({"agent": agent_name, "result": result})
                    agent_statuses[-1]["status"] = "done"
                    execution_steps.append(f"{agent_name.capitalize()} agent completed")
                except Exception as e:
                    results.append({"agent": agent_name, "result": f"Error: {str(e)}"})
                    agent_statuses[-1]["status"] = "error"
                    execution_steps.append(f"{agent_name.capitalize()} agent failed")

        if len(results) > 1:
            execution_steps.append("Combining results")

        final_response = self._merge_results(results, user_message)
        execution_steps.append("Response ready")

        return {
            "response": final_response,
            "agents_used": selected_agents,
            "agent_statuses": agent_statuses,
            "intent": intent,
            "execution_steps": execution_steps,
        }

    def _merge_results(self, results: list, original_query: str) -> str:
        if len(results) == 1:
            return results[0]["result"]
        merged = ""
        for r in results:
            merged += f"\n\n{r['result']}"
        return merged.strip()

manager_agent = ManagerAgent()