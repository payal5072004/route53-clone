"""
Database setup for the Route53 Clone backend.

Uses SQLite for simple, file-based persistent storage as required by the
assignment. The database file (route53.db) is created automatically in the
backend/ directory the first time the app runs.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./route53.db"

# check_same_thread=False is required because FastAPI can use the same
# session across different threads for a single request.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
