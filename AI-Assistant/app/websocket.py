from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.auth import verify_token
from app.nlp.intent_model import predict
from app.nlp.faq_matcher import find_best_match
from app.nlp.rule_engine import is_authorized

from app.llm.inference import generate_reply
from app.memory.session_memory import add_message, get_context

import requests

router = APIRouter()

def has_internet():
    try:
        requests.get("https://www.google.com", timeout=2)
        return True
    except:
        return False


@router.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()

            token = data.get("token")
            message = data.get("message")

            user = verify_token(token)

            if not user:
                await websocket.send_json({"error": "Invalid token"})
                continue

            user_id = user.get("user_id")
            role = user.get("role")

            # ---- Conversation memory ----
            add_message(user_id, f"User: {message}")
            context = get_context(user_id)

            # ---- AI decision ----
            if has_internet():
                reply = generate_reply(message, role, context)
                source = "llm"
            else:
                intent = predict(message)

                if not is_authorized(intent, role):
                    reply = "You are not authorized to perform this action."
                else:
                    reply = find_best_match(message, role)

                source = "offline_nlp"

            add_message(user_id, f"Assistant: {reply}")

            await websocket.send_json({
                "reply": reply,
                "source": source
            })

    except WebSocketDisconnect:
        print("Client disconnected")
