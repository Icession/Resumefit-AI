"""ResumeFit AI - FastAPI entry point."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze

app = FastAPI(
    title="ResuMatch",
    description="Analyze a resume against a job description.",
    version="0.1.0",
)

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "ResumeFit AI", "docs": "/docs"}