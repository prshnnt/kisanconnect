"""Temp chat: farmers (sellers) and buyers can ask a chatbot questions directly.

Threads are short-lived and kept in memory (see app/services/chatbot.py) -- there is no
chat_threads/chat_messages table on purpose, matching the "temp chat" requirement.
"""

from fastapi import APIRouter, Depends

from app.api.deps import require_roles
from app.models import User
from app.schemas.chat import ChatAsk, ChatHistoryOut, ChatReplyOut
from app.services import chatbot

router = APIRouter(prefix="/chat", tags=["N. Chatbot"])

# Farmers are the "seller" role; admins can also use/debug it via require_roles' admin bypass.
_chat_user = require_roles("seller", "buyer")


@router.post("", response_model=ChatReplyOut)
async def ask_chatbot(body: ChatAsk, user: User = Depends(_chat_user)):
    """Ask the chatbot a question. Send back the returned thread_id to continue the same temp chat."""
    thread_id, reply, history = await chatbot.ask(thread_id=body.thread_id, user_id=user.id, question=body.message)
    return ChatReplyOut(thread_id=thread_id, reply=reply, history=history)


@router.get("/{thread_id}", response_model=ChatHistoryOut)
async def get_chat_history(thread_id: str, user: User = Depends(_chat_user)):
    thread = await chatbot.chat_store.get(thread_id, user.id)
    return ChatHistoryOut(thread_id=thread_id, history=thread.messages)


@router.delete("/{thread_id}", status_code=204)
async def end_chat(thread_id: str, user: User = Depends(_chat_user)):
    """End a temp chat early and forget its history."""
    await chatbot.chat_store.delete(thread_id, user.id)
