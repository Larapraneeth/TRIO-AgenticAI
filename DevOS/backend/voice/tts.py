import subprocess
import tempfile
import os
from core.config import settings

class TextToSpeech:
    def synthesize(self, text: str) -> bytes:
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                out_path = f.name

            clean_text = self._clean_text(text)

            result = subprocess.run(
                ["piper", "--model", settings.PIPER_MODEL, "--output_file", out_path],
                input=clean_text.encode(),
                capture_output=True,
                timeout=30
            )

            if result.returncode != 0:
                raise RuntimeError(f"Piper failed: {result.stderr.decode()}")

            with open(out_path, "rb") as f:
                audio_bytes = f.read()

            os.unlink(out_path)
            return audio_bytes

        except FileNotFoundError:
            return self._fallback_tts(text)

    def _clean_text(self, text: str) -> str:
        import re
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'#+\s', '', text)
        text = re.sub(r'`(.+?)`', r'\1', text)
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        return text[:500]

    def _fallback_tts(self, text: str) -> bytes:
        try:
            import pyttsx3
            engine = pyttsx3.init()
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                out_path = f.name
            engine.save_to_file(self._clean_text(text), out_path)
            engine.runAndWait()
            with open(out_path, "rb") as f:
                audio_bytes = f.read()
            os.unlink(out_path)
            return audio_bytes
        except Exception:
            return b""

tts = TextToSpeech()
