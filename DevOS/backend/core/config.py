from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:1.5b"

    CHROMA_PATH: str = "./memory/chroma_db"

    WHISPER_MODEL: str = "base"

    # TTS: "edge" (online, high quality) or "pyttsx3" (offline)
    TTS_PROVIDER: str = "pyttsx3"
    TTS_VOICE: str = "en-US-AriaNeural"

    MAX_TOKENS: int = 2048

    TEMPERATURE: float = 0.7

    class Config:
        env_file = ".env"


settings = Settings()