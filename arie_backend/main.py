"""
ARIE — Adaptive Readiness Intelligence Engine

FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Base, JobProfile
from routers import dashboard, observations, teens
from utils.config import DEFAULT_JOB_PROFILES


def seed_job_profiles(db: Session):
    """Seed default job profiles if the table is empty."""
    count = db.query(JobProfile).count()
    if count == 0:
        for profile in DEFAULT_JOB_PROFILES:
            db.add(JobProfile(
                job_name=profile["job_name"],
                job_vector=profile["job_vector"],
            ))
        db.commit()
        print(f"Seeded {len(DEFAULT_JOB_PROFILES)} default job profiles")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure tables exist and seed defaults."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_job_profiles(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="ARIE — Adaptive Readiness Intelligence Engine",
    description="AI-assisted decision intelligence for NGO employability readiness tracking.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow frontend (Next.js) in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(teens.router)
app.include_router(observations.router)
app.include_router(dashboard.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "ARIE"}
