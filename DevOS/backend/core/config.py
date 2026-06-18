from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:3b"

    CHROMA_PATH: str = "./memory/chroma_db"

    WHISPER_MODEL: str = "base"

    PIPER_MODEL: str = "en_US-lessac-medium"

    MAX_TOKENS: int = 2048

    TEMPERATURE: float = 0.7

    class Config:
        env_file = ".env"


settings = Settings()