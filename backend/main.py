"""ResumeFit AI - FastAPI entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze

app = FastAPI(
    title="ResumeFit AI",
    description="Analyze a resume against a job description.",
    version="0.1.0",
)

# Allow the React dev server (and later, the deployed frontend) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "ResumeFit AI", "docs": "/docs"}
