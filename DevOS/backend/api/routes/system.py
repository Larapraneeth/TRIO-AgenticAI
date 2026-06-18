import platform
import httpx
from fastapi import APIRouter
from core.config import settings

router = APIRouter()

@router.get("/info")
async def system_info():
    ollama_status = "offline"
    models = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            if r.status_code == 200:
                ollama_status = "online"
                models = [m["name"] for m in r.json().get("models", [])]
    except Exception:
        pass

    return {
        "os": platform.system(),
        "python": platform.python_version(),
        "ollama": ollama_status,
        "models": models,
        "active_model": settings.OLLAMA_MODEL
    }
