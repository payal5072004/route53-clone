"""
Mocked authentication helpers.

This is intentionally simple, per the assignment: no password hashing, no
JWTs, no expiry logic. A "session token" is just a random UUID stored on the
user row when they log in, and the frontend sends it back as a Bearer token
on every request. Good enough to demonstrate login / logout / session
persistence without building real security (which is explicitly out of
scope).
"""

import uuid
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from . import models
from .database import get_db


def create_session_token() -> str:
    return str(uuid.uuid4())


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> models.User:
    """Reads `Authorization: Bearer <token>` and resolves it to a User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.removeprefix("Bearer ").strip()
    user = db.query(models.User).filter(models.User.session_token == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user
