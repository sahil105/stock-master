"""Database utilities for managing OTP records."""
from typing import Generator

from sqlalchemy import create_engine  # type: ignore[import]
from sqlalchemy.orm import declarative_base, sessionmaker  # type: ignore[import]

from .config import get_settings

settings = get_settings()
Base = declarative_base()

engine = create_engine(
    settings.resolved_database_url,
    future=True,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db() -> Generator:
    """Provide a transactional database session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

