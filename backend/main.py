from clients import app
from pydantic import BaseModel

from services import chat


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=chat(request.message))
