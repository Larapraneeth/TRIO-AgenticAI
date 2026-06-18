import httpx
from core.config import settings


class OllamaError(Exception):
    """Raised when Ollama is unreachable, returns an error, or replies in an
    unexpected shape. Carries a human-readable message so it never surfaces
    to the API layer as a bare KeyError."""
    pass


def _check_for_ollama_error(data: dict, endpoint: str) -> None:
    """Ollama returns HTTP 200 with an {'error': ...} body for problems like
    an unpulled model, so a non-2xx status code alone is not enough to detect
    failure. Check the payload itself before indexing into it."""
    if not isinstance(data, dict):
        raise OllamaError(f"Ollama {endpoint} returned an unexpected payload type: {type(data)}")
    if "error" in data:
        raise OllamaError(
            f"Ollama reported an error on {endpoint}: {data['error']}. "
            f"If this mentions a missing model, run: ollama pull {settings.OLLAMA_MODEL}"
        )


async def stream_ollama(messages: list, system_prompt: str = "", max_tokens: int = None) -> str:
    # /api/chat has no top-level "system" field (it's silently ignored by
    # Ollama's JSON decoder) -- the system prompt must be injected as a
    # leading message with role "system" instead.
    full_messages = list(messages)
    if system_prompt:
        full_messages = [{"role": "system", "content": system_prompt}] + full_messages

    payload = {
        "model": settings.OLLAMA_MODEL,
        "messages": full_messages,
        "stream": False,
        "options": {
            "temperature": settings.TEMPERATURE,
            "num_predict": max_tokens if max_tokens is not None else settings.MAX_TOKENS
        }
    }

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json=payload
            )
    except httpx.ConnectError:
        raise OllamaError(
            f"Could not connect to Ollama at {settings.OLLAMA_BASE_URL}. "
            f"Is `ollama serve` running?"
        )
    except httpx.TimeoutException:
        raise OllamaError("Ollama took too long to respond (timed out after 120s).")

    try:
        data = response.json()
    except ValueError:
        raise OllamaError(f"Ollama /api/chat returned non-JSON content (HTTP {response.status_code}).")

    _check_for_ollama_error(data, "/api/chat")

    if "message" not in data or "content" not in data.get("message", {}):
        raise OllamaError(f"Ollama /api/chat response missing 'message.content'. Got keys: {list(data.keys())}")

    return data["message"]["content"]


async def generate_ollama(prompt: str, system_prompt: str = "", max_tokens: int = None) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "system": system_prompt,
        "options": {
            "temperature": settings.TEMPERATURE,
            "num_predict": max_tokens if max_tokens is not None else settings.MAX_TOKENS
        }
    }

    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload
            )
    except httpx.ConnectError:
        raise OllamaError(
            f"Could not connect to Ollama at {settings.OLLAMA_BASE_URL}. "
            f"Is `ollama serve` running?"
        )
    except httpx.TimeoutException:
        raise OllamaError("Ollama took too long to respond (timed out after 120s).")

    try:
        data = response.json()
    except ValueError:
        raise OllamaError(f"Ollama /api/generate returned non-JSON content (HTTP {response.status_code}).")

    _check_for_ollama_error(data, "/api/generate")

    if "response" not in data:
        raise OllamaError(f"Ollama /api/generate response missing 'response' key. Got keys: {list(data.keys())}")

    return data["response"]