"""Database models (tables) for users and saved analyses."""
from datetime import datetime, timezone

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=_utcnow)


class Analysis(SQLModel, table=True):
    __tablename__ = "analyses"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    job_description: str
    resume_text: str
    match_score: int
    missing_keywords: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    suggestions: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    summary: str
    created_at: datetime = Field(default_factory=_utcnow)


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, unique=True)
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    links: list[dict] = Field(default_factory=list, sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=_utcnow)