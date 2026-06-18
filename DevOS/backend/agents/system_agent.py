import subprocess
import platform
import os
from core.llm import generate_ollama

APP_MAP = {
    "chrome": {
        "windows": "start chrome",
        "linux": "google-chrome",
        "darwin": "open -a 'Google Chrome'"
    },
    "firefox": {
        "windows": "start firefox",
        "linux": "firefox",
        "darwin": "open -a Firefox"
    },
    "vscode": {
        "windows": "code",
        "linux": "code",
        "darwin": "code"
    },
    "spotify": {
        "windows": "start spotify",
        "linux": "spotify",
        "darwin": "open -a Spotify"
    },
    "notepad": {
        "windows": "notepad",
        "linux": "gedit",
        "darwin": "open -a TextEdit"
    },
    "calculator": {
        "windows": "calc",
        "linux": "gnome-calculator",
        "darwin": "open -a Calculator"
    },
    "explorer": {
        "windows": "explorer",
        "linux": "nautilus",
        "darwin": "open ."
    },
    "terminal": {
        "windows": "start cmd",
        "linux": "x-terminal-emulator",
        "darwin": "open -a Terminal"
    }
}

SYSTEM_PROMPT = """Extract the application name from the user request.
Return ONLY the app name in lowercase from this list: chrome, firefox, vscode, spotify, notepad, calculator, explorer, terminal.
If not found, return: unknown"""

class SystemAgent:
    def __init__(self):
        self.os = platform.system().lower()

    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        app_name = await generate_ollama(
            prompt=f"Request: {message}",
            system_prompt=SYSTEM_PROMPT,
            max_tokens=10
        )
        app_name = app_name.strip().lower().replace('"', '').replace("'", "")

        if app_name == "unknown" or app_name not in APP_MAP:
            return f"I couldn't identify which application to open from: '{message}'. Try: chrome, firefox, vscode, spotify, notepad, calculator."

        cmd_map = APP_MAP.get(app_name, {})
        cmd = cmd_map.get(self.os, cmd_map.get("linux", ""))

        if not cmd:
            return f"Application '{app_name}' is not supported on {self.os}."

        try:
            subprocess.Popen(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return f"✅ Launched **{app_name.capitalize()}** successfully."
        except Exception as e:
            return f"Failed to open {app_name}: {str(e)}"