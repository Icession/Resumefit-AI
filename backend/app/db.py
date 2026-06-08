"""Database engine, session, and table creation."""
import os

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to backend/.env "
        "(get the connection string from your Neon dashboard)."
    )

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# pool_pre_ping avoids "connection closed" errors after Neon idles the DB.
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)


def create_db_and_tables() -> None:
    """Create any missing tables. Imports models so they register first."""
    from app import models

    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency that yields a database session per request."""
    with Session(engine) as session:
        yield session