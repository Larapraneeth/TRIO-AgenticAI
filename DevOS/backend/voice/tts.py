import asyncio
import subprocess
import sys
import tempfile
import os
import re
from core.config import settings


class TextToSpeech:
    """
    Async TTS. Returns (audio_bytes, media_type).
    Primary: edge-tts (online, high quality, MP3).
    Fallback: pyttsx3 in a fresh subprocess (offline, WAV) to dodge the
    long-lived-process 'runAndWait works only once / 0-byte WAV' bug.
    """

    async def synthesize(self, text: str):
        clean = self._clean_text(text)
        if not clean:
            return b"", "audio/wav"

        if settings.TTS_PROVIDER == "edge":
            audio = await self._edge_tts(clean)
            if audio:
                return audio, "audio/mpeg"
            # edge failed (offline?) -> fall through to offline engine

        audio = await asyncio.to_thread(self._pyttsx3_tts, clean)
        return audio, "audio/wav"

    async def _edge_tts(self, text: str) -> bytes:
        try:
            import edge_tts
        except ImportError:
            return b""
        try:
            communicate = edge_tts.Communicate(text, settings.TTS_VOICE)
            buf = bytearray()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buf.extend(chunk["data"])
            return bytes(buf)
        except Exception:
            return b""

    def _pyttsx3_tts(self, text: str) -> bytes:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            out_path = f.name
        try:
            result = subprocess.run(
                [sys.executable, "-m", "voice._pyttsx3_worker", out_path],
                input=text.encode(),
                capture_output=True,
                timeout=30,
            )
            if result.returncode != 0 or not os.path.exists(out_path):
                return b""
            with open(out_path, "rb") as f:
                return f.read()
        except Exception:
            return b""
        finally:
            if os.path.exists(out_path):
                os.unlink(out_path)

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'#+\s', '', text)
        text = re.sub(r'`(.+?)`', r'\1', text)
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        return text.strip()[:500]


tts = TextToSpeech()