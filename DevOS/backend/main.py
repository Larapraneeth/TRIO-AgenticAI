import sys
import asyncio

# Playwright spawns its browser via a subprocess. On Windows, subprocess
# spawning only works on the Proactor event loop -- the default Selector loop
# raises NotImplementedError. This MUST run before uvicorn/asyncio init.
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chat, voice, agents, system, conversations
from core.config import settings

app = FastAPI(title="DevOS", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(system.router, prefix="/api/system", tags=["system"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])


@app.get("/health")
async def health():
    return {"status": "online", "version": "2.0.0"}


if __name__ == "__main__":
    # reload=False on purpose: the reload worker runs on the Selector loop and
    # re-breaks Playwright with NotImplementedError. Pass the app object
    # directly so this file's event-loop policy is honored.
    uvicorn.run(app, host="0.0.0.0", port=8000)