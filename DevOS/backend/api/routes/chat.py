from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from agents.manager_agent import manager_agent
from core.llm import OllamaError
from memory.database import (
    add_message, get_messages, get_conversation,
    create_conversation, update_conversation_title
)
from memory.title_generator import generate_title

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    agents_used: List[str]
    agent_statuses: List[dict]
    intent: str
    execution_steps: List[str]
    conversation_id: str
    message_id: str

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        cid = request.conversation_id
        if not cid:
            conv = create_conversation("New Chat")
            cid = conv["id"]
        else:
            conv = get_conversation(cid)
            if not conv:
                conv = create_conversation("New Chat")
                cid = conv["id"]

        add_message(cid, "user", request.message)

        existing = get_messages(cid)
        history = [{"role": m["role"], "content": m["content"]} for m in existing[:-1]]

        result = await manager_agent.route(request.message, history)

        execution_steps = result.get("execution_steps", [])

        saved = add_message(
            cid, "assistant", result["response"],
            agents_used=result.get("agents_used", []),
            agent_statuses=result.get("agent_statuses", []),
            intent=result.get("intent", ""),
            execution_steps=execution_steps
        )

        all_msgs = get_messages(cid)
        if len(all_msgs) <= 2:
            title = await generate_title(request.message)
            update_conversation_title(cid, title)

        return ChatResponse(
            response=result["response"],
            agents_used=result.get("agents_used", []),
            agent_statuses=result.get("agent_statuses", []),
            intent=result.get("intent", ""),
            execution_steps=execution_steps,
            conversation_id=cid,
            message_id=saved["id"]
        )

    except OllamaError as e:
        raise HTTPException(status_code=503, detail=f"Local AI model unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))