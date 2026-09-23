"""Temp chat system for farmers/buyers to ask a chatbot questions directly.

Talks to an Ollama-compatible /api/chat endpoint (local Ollama, or Ollama Cloud
if OLLAMA_API_KEY is set). Threads are kept in memory only, per process, and
expire after a period of inactivity -- this is intentionally NOT persisted to
Postgres/Redis, matching the "temp chat" requirement. If you later want chat
history to survive restarts or to work across multiple API workers, swap
_ChatStore's dict for Redis (the app already depends on redis-py).
"""

import time
import uuid
from asyncio import Lock
from dataclasses import dataclass, field

import httpx

from app.core.config import get_settings
from app.core.errors import DomainError, Forbidden, NotFound


@dataclass
class _Thread:
    user_id: int
    messages: list[dict[str, str]] = field(default_factory=list)  # role/content, no system prompt
    expires_at: float = 0.0


class _ChatStore:
    """Tiny in-memory TTL store for temp chat threads. Single-process only."""

    def __init__(self) -> None:
        self._threads: dict[str, _Thread] = {}
        self._lock = Lock()

    def _sweep(self) -> None:
        now = time.time()
        dead = [tid for tid, t in self._threads.items() if t.expires_at < now]
        for tid in dead:
            self._threads.pop(tid, None)

    async def get_or_create(self, thread_id: str | None, user_id: int) -> tuple[str, _Thread]:
        settings = get_settings()
        async with self._lock:
            self._sweep()
            if thread_id:
                thread = self._threads.get(thread_id)
                if not thread:
                    raise NotFound("Chat thread")
                if thread.user_id != user_id:
                    raise Forbidden("This chat thread belongs to someone else")
                return thread_id, thread

            new_id = uuid.uuid4().hex
            thread = _Thread(user_id=user_id, expires_at=time.time() + settings.chat_ttl_minutes * 60)
            self._threads[new_id] = thread
            return new_id, thread

    async def touch_and_trim(self, thread_id: str, thread: _Thread) -> None:
        settings = get_settings()
        max_messages = settings.chat_max_turns * 2  # each turn = 1 user + 1 assistant message
        async with self._lock:
            thread.expires_at = time.time() + settings.chat_ttl_minutes * 60
            if len(thread.messages) > max_messages:
                thread.messages = thread.messages[-max_messages:]

    async def get(self, thread_id: str, user_id: int) -> _Thread:
        async with self._lock:
            self._sweep()
            thread = self._threads.get(thread_id)
            if not thread:
                raise NotFound("Chat thread")
            if thread.user_id != user_id:
                raise Forbidden("This chat thread belongs to someone else")
            return thread

    async def delete(self, thread_id: str, user_id: int) -> None:
        async with self._lock:
            thread = self._threads.get(thread_id)
            if not thread:
                raise NotFound("Chat thread")
            if thread.user_id != user_id:
                raise Forbidden("This chat thread belongs to someone else")
            self._threads.pop(thread_id, None)


chat_store = _ChatStore()


async def call_ollama(messages: list[dict[str, str]]) -> str:
    """Send a full message list (including system prompt) to Ollama's /api/chat and return the reply text."""
    settings = get_settings()
    headers = {}
    if settings.ollama_api_key:
        headers["Authorization"] = f"Bearer {settings.ollama_api_key}"

    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    payload = {"model": settings.ollama_model, "messages": messages, "stream": False}

    try:
        async with httpx.AsyncClient(timeout=settings.ollama_timeout_seconds) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException as e:
        raise DomainError("CHATBOT_TIMEOUT", "The chatbot took too long to respond. Please try again.", 504) from e
    except httpx.HTTPStatusError as e:
        raise DomainError("CHATBOT_UPSTREAM_ERROR", f"Chatbot server returned an error: {e.response.status_code}", 502) from e
    except httpx.HTTPError as e:
        raise DomainError(
            "CHATBOT_UNAVAILABLE",
            "Could not reach the chatbot server. Check OLLAMA_BASE_URL and that Ollama is running.",
            503,
        ) from e

    reply = (data.get("message") or {}).get("content")
    if not reply:
        raise DomainError("CHATBOT_EMPTY_RESPONSE", "Chatbot returned an empty response", 502)
    return reply


async def ask(*, thread_id: str | None, user_id: int, question: str) -> tuple[str, str, list[dict[str, str]]]:
    """Handle one chat turn. Returns (thread_id, reply, full_visible_history)."""
    settings = get_settings()
    tid, thread = await chat_store.get_or_create(thread_id, user_id)

    outgoing = [{"role": "system", "content": settings.chat_system_prompt}, *thread.messages, {"role": "user", "content": question}]
    reply = await call_ollama(outgoing)

    thread.messages.append({"role": "user", "content": question})
    thread.messages.append({"role": "assistant", "content": reply})
    await chat_store.touch_and_trim(tid, thread)

    return tid, reply, thread.messages
