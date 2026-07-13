import os
import re
import stat
import shutil
import asyncio
import tempfile
from core.llm import stream_ollama

GITHUB_URL_RE = re.compile(r'https?://github\.com/[\w.\-]+/[\w.\-]+', re.IGNORECASE)


class GitHubAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        # Extract the repo URL with a regex -- never trust the small model for this.
        url = self._extract_url(message)

        if not url:
            return (
                "I need a GitHub repository URL to review. "
                "Paste one like `https://github.com/user/repo` and I'll analyze it."
            )

        return await self._analyze_from_url(url)

    def _extract_url(self, message: str) -> str:
        match = GITHUB_URL_RE.search(message or "")
        if not match:
            return ""
        url = match.group(0).rstrip("/.,)")
        return url[:-4] if url.endswith(".git") else url

    @staticmethod
    def _force_rmtree(path: str):
        # Windows: git writes read-only files in .git/objects, which defeat a
        # naive rmtree. Clear the read-only bit and retry on each failure.
        def on_rm_error(func, p, exc_info):
            try:
                os.chmod(p, stat.S_IWRITE)
                func(p)
            except Exception:
                pass
        if os.path.exists(path):
            shutil.rmtree(path, onerror=on_rm_error)

    async def _analyze_from_url(self, url: str) -> str:
        try:
            import git
        except ImportError:
            return "GitPython not installed. Run: `pip install gitpython`"

        repo_name = url.split("/")[-1].replace(".git", "")
        dest = os.path.join(tempfile.gettempdir(), f"trio_review_{repo_name}")

        # Clone with a hard timeout so a slow network can't hang the request.
        try:
            self._force_rmtree(dest)  # clear any leftover from a prior run
            await asyncio.wait_for(
                asyncio.to_thread(
                    git.Repo.clone_from, url, dest, multi_options=["--depth", "1"]
                ),
                timeout=45,
            )
        except asyncio.TimeoutError:
            return f"Clone timed out after 45s — the repo may be large or the network slow.\nURL: {url}"
        except Exception as e:
            msg = str(e) or e.__class__.__name__
            return f"Clone failed ({e.__class__.__name__}): {msg}\nURL: {url}"

        # Gather a SMALL, relevant sample so the local model gets signal
        # without a giant prompt it can't process in time.
        try:
            readme = self._read_readme(dest)
            file_list = self._list_files(dest)
            code_samples = self._pick_code_samples(dest, file_list)

            analysis_prompt = self._build_prompt(repo_name, readme, file_list, code_samples)

            response = await asyncio.wait_for(
                stream_ollama(
                    messages=[{"role": "user", "content": analysis_prompt}],
                    system_prompt="You are an expert code reviewer. Be specific, concise, and actionable.",
                    max_tokens=400,
                ),
                timeout=150,
            )
            return response
        except asyncio.TimeoutError:
            return (
                f"Cloned **{repo_name}** successfully, but the local model timed out generating the review. "
                f"On this hardware, repo review is the heaviest task — try a smaller repo, "
                f"or switch to a hosted model for this feature."
            )
        except Exception as e:
            msg = str(e) or e.__class__.__name__
            return f"Analysis failed ({e.__class__.__name__}): {msg}"
        finally:
            self._force_rmtree(dest)

    def _read_readme(self, dest: str) -> str:
        for name in ("README.md", "README.rst", "README.txt", "readme.md", "README"):
            path = os.path.join(dest, name)
            if os.path.exists(path):
                try:
                    with open(path, "r", errors="ignore") as fh:
                        return fh.read(2500)
                except Exception:
                    return ""
        return ""

    def _list_files(self, dest: str) -> list:
        ignore_dirs = {".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build", ".next"}
        code_exts = {".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".rs", ".cpp", ".c", ".rb"}
        files = []
        for root, dirs, filenames in os.walk(dest):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for f in filenames:
                if os.path.splitext(f)[1] in code_exts:
                    rel = os.path.relpath(os.path.join(root, f), dest)
                    files.append(rel)
                    if len(files) >= 40:
                        return files
        return files

    def _pick_code_samples(self, dest: str, file_list: list) -> list:
        priority = ("main.", "app.", "index.", "server.", "__init__.")
        ranked = sorted(
            file_list,
            key=lambda f: 0 if os.path.basename(f).startswith(priority) else 1,
        )
        samples = []
        for f in ranked[:3]:
            try:
                with open(os.path.join(dest, f), "r", errors="ignore") as fh:
                    content = fh.read(1200)
                samples.append(f"### {f}\n```\n{content}\n```")
            except Exception:
                pass
        return samples

    def _build_prompt(self, repo_name, readme, file_list, code_samples) -> str:
        parts = [f"Review the GitHub repository **{repo_name}**.\n"]
        if readme:
            parts.append(f"README (excerpt):\n{readme}\n")
        parts.append(f"Code files ({len(file_list)} found): {', '.join(file_list[:20])}\n")
        if code_samples:
            parts.append("Key file excerpts:\n" + "\n".join(code_samples))
        parts.append(
            "\nProvide: (1) what the project does, (2) tech stack, "
            "(3) code quality, (4) likely bugs or risks, (5) top improvement suggestions. "
            "Keep it concise and specific."
        )
        return "\n".join(parts)