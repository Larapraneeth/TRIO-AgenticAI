from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from memory.database import (
    get_conversations, get_conversation, create_conversation,
    get_messages, delete_conversation, update_conversation_title
)

router = APIRouter()

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "New Chat"

class UpdateTitleRequest(BaseModel):
    title: str

@router.get("/")
async def list_conversations():
    convs = get_conversations()
    return {"conversations": convs}

@router.post("/")
async def new_conversation(req: CreateConversationRequest):
    conv = create_conversation(req.title)
    return conv

@router.get("/{cid}")
async def get_conv(cid: str):
    conv = get_conversation(cid)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = get_messages(cid)
    return {"conversation": conv, "messages": messages}

@router.patch("/{cid}/title")
async def set_title(cid: str, req: UpdateTitleRequest):
    update_conversation_title(cid, req.title)
    return {"ok": True}

@router.delete("/{cid}")
async def remove_conversation(cid: str):
    delete_conversation(cid)
    return {"ok": True}
