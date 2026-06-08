"""ResuMatch - FastAPI entry point."""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import create_db_and_tables
from app.routers import analyze, auth, profile


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: create any missing database tables.
    create_db_and_tables()
    yield


app = FastAPI(
    title="ResuMatch",
    description="Analyze a resume against a job description.",
    version="0.1.0",
    lifespan=lifespan,
)

# Allowed browser origins. Defaults to local dev; in production we set
# ALLOWED_ORIGINS (comma-separated) to include the deployed frontend URL.
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
app.include_router(auth.router)
app.include_router(profile.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "ResumeFit AI", "docs": "/docs"}