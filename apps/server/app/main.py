import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load env BEFORE importing anything that might use it
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"  # -> apps/server/.env
load_dotenv(dotenv_path=ENV_PATH, override=True)

from app.api.import_event_info import router as import_router 
from app.routes.analytics import router as analytics_router

app = FastAPI()

app.include_router(import_router)
app.include_router(analytics_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}