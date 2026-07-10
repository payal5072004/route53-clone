"""
Route53 Clone - FastAPI backend entrypoint.

Run with:
    uvicorn app.main:app --reload --port 8000

On startup this:
1. Creates all SQLite tables if they don't already exist (route53.db)
2. Seeds one demo user (admin / admin123) so login works out of the box
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine, SessionLocal
from .routers import auth_router, zones, records

models.Base.metadata.create_all(bind=engine)


def seed_demo_user():
    db = SessionLocal()
    try:
        existing = db.query(models.User).filter(models.User.username == "admin").first()
        if not existing:
            db.add(models.User(username="admin", password="admin123"))
            db.commit()
    finally:
        db.close()


seed_demo_user()

app = FastAPI(
    title="Route53 Clone API",
    description="A mocked clone of the AWS Route53 API - manages Hosted Zones and DNS Records.",
    version="1.0.0",
)

# CORS: allow the Next.js dev server (and any deployed frontend origin) to
# call this API. In a real deployment, tighten this to your actual domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://route53-clone.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(zones.router)
app.include_router(records.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
