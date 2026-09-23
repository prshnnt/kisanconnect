from pydantic import BaseModel, Field

from app.schemas.common import ORM


class ChatAsk(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    thread_id: str | None = None  # omit to start a new temp chat thread


class ChatMessageOut(ORM):
    role: str
    content: str


class ChatReplyOut(BaseModel):
    thread_id: str
    reply: str
    history: list[ChatMessageOut]


class ChatHistoryOut(BaseModel):
    thread_id: str
    history: list[ChatMessageOut]
