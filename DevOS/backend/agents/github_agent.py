import os
import json
import tempfile
from core.llm import generate_ollama, stream_ollama

GITHUB_PROMPT = """Analyze this GitHub request and return ONLY JSON:
{
  "action": "clone | analyze | review",
  "repo_url": "full github URL or empty",
  "repo_path": "local path if analyzing local repo or empty"
}"""

class GitHubAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        raw = await generate_ollama(
            prompt=f"GitHub request: {message}",
            system_prompt=GITHUB_PROMPT,
            max_tokens=120
        )
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            action_data = json.loads(raw[start:end])
        except Exception:
            action_data = {"action": "review", "repo_url": "", "repo_path": ""}

        action = action_data.get("action", "review")
        repo_url = action_data.get("repo_url", "")

        if action == "clone" and repo_url:
            return await self._clone_repo(repo_url)
        elif action in ["analyze", "review"] and repo_url:
            return await self._analyze_from_url(repo_url, message)
        else:
            return await self._analyze_description(message)

    async def _clone_repo(self, url: str) -> str:
        try:
            import git
            dest = os.path.join(tempfile.gettempdir(), url.split("/")[-1].replace(".git", ""))
            repo = git.Repo.clone_from(url, dest)
            return f"✅ Cloned **{url}** to `{dest}`\n\nBranches: {[b.name for b in repo.branches]}"
        except ImportError:
            return "GitPython not installed. Run: `pip install gitpython`"
        except Exception as e:
            return f"Clone failed: {str(e)}"

    async def _analyze_from_url(self, url: str, message: str) -> str:
        try:
            import git
            dest = os.path.join(tempfile.gettempdir(), url.split("/")[-1].replace(".git", ""))
            if not os.path.exists(dest):
                git.Repo.clone_from(url, dest)

            file_list = []
            for root, dirs, files in os.walk(dest):
                dirs[:] = [d for d in dirs if d not in [".git", "node_modules", "__pycache__", ".venv"]]
                for f in files[:30]:
                    rel = os.path.relpath(os.path.join(root, f), dest)
                    file_list.append(rel)

            code_samples = []
            for f in file_list[:5]:
                try:
                    full_path = os.path.join(dest, f)
                    with open(full_path, "r", errors="ignore") as fh:
                        content = fh.read(2000)
                    code_samples.append(f"### {f}\n```\n{content}\n```")
                except Exception:
                    pass

            analysis_prompt = f"""Analyze this GitHub repository and provide:
1. Project overview and purpose
2. Tech stack and architecture
3. Code quality assessment
4. Potential bugs or issues
5. Improvement suggestions

Files: {file_list[:20]}

Code samples:
{chr(10).join(code_samples)}"""

            response = await stream_ollama(
                messages=[{"role": "user", "content": analysis_prompt}],
                system_prompt="You are an expert code reviewer. Be specific and actionable."
            )
            return response
        except Exception as e:
            return f"Analysis failed: {str(e)}"

    async def _analyze_description(self, message: str) -> str:
        response = await stream_ollama(
            messages=[{"role": "user", "content": message}],
            system_prompt="You are an expert GitHub and code review assistant. Help with repository analysis, code quality, and best practices."
        )
        return response