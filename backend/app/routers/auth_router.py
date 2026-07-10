from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..auth import create_session_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()

    # Mocked auth: any of the seeded demo users, password must match.
    if not user or user.password != payload.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user.session_token = create_session_token()
    db.commit()
    db.refresh(user)

    return schemas.LoginResponse(token=user.session_token, username=user.username)


@router.post("/logout")
def logout(user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.session_token = None
    db.commit()
    return {"message": "Logged out"}


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user
