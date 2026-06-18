import io
import tempfile
import os
from core.config import settings

class SpeechToText:
    def __init__(self):
        self.model = None

    def _load_model(self):
        if self.model is None:
            try:
                from faster_whisper import WhisperModel
                self.model = WhisperModel(settings.WHISPER_MODEL, device="cpu", compute_type="int8")
            except ImportError:
                raise RuntimeError("faster-whisper not installed. Run: pip install faster-whisper")

    def transcribe(self, audio_bytes: bytes) -> str:
        self._load_model()
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name
        try:
            segments, _ = self.model.transcribe(tmp_path, language="en")
            text = " ".join([seg.text for seg in segments]).strip()
            return text
        finally:
            os.unlink(tmp_path)

stt = SpeechToText()
