"""
Database connection setup for ARIE.

Reads SUPABASE_URL from .env, creates SQLAlchemy engine and session factory.
"""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("SUPABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("SUPABASE_URL not set in .env")

engine = create_engine(DATABASE_URL, echo=False)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


def get_db():
    """
    Yield a DB session. Designed for FastAPI dependency injection.

    Usage in routers:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
