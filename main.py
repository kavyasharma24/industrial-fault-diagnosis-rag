import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.api.health import router as health_router
from app.api.prediction import router as prediction_router
from app.api.knowledge import router as knowledge_router
from app.api.diagnosis import router as diagnosis_router

load_dotenv()

app = FastAPI(
    title="Industrial Fault Diagnosis API",
    description="AI-driven industrial fault diagnosis using ML, RAG and Knowledge Graph",
    version="1.0.0"
)

# Configurable CORS origins
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_origins_env = os.getenv("FRONTEND_ORIGINS", "")
custom_origins = [
    origin.strip()
    for origin in frontend_origins_env.split(",")
    if origin.strip()
]

# Combined unique list of allowed origins (no wildcard with credentials enabled)
allowed_origins = list(dict.fromkeys(DEFAULT_ORIGINS + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(prediction_router)
app.include_router(knowledge_router)
app.include_router(diagnosis_router)


@app.get("/")
def home():
    return {
        "message": "Industrial Fault Diagnosis API is running!",
        "project": "AI-Driven Industrial Knowledge Intelligence",
        "status": "Ready"
    }
