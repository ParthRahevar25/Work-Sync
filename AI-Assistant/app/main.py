from fastapi import FastAPI
from app.websocket import router as ws_router

app = FastAPI(title="WorkSync AI Assistant")

app.include_router(ws_router)

@app.get("/")
def root():
    return {"status": "AI Assistant running"}
