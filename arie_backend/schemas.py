"""
Pydantic schemas for ARIE API request/response validation.

Separated from ORM models to keep concerns clean.
These will be used by FastAPI routers in Phase 3.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Readiness Vector (shared type)
# ---------------------------------------------------------------------------

class ReadinessVector(BaseModel):
    task_performance: float = Field(ge=0, le=100)
    supervision_independence: float = Field(ge=0, le=100)
    behavioral_stability: float = Field(ge=0, le=100)
    cognitive_adaptability: float = Field(ge=0, le=100)
    consistency: float = Field(ge=0, le=100)


# ---------------------------------------------------------------------------
# Teen
# ---------------------------------------------------------------------------

class TeenCreate(BaseModel):
    name: str
    age: int = Field(ge=10, le=25)
    baseline_vector: ReadinessVector | None = None  # defaults to 50s if omitted


class TeenResponse(BaseModel):
    id: UUID
    name: str
    age: int
    baseline_vector: dict
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Observation
# ---------------------------------------------------------------------------

class ObservationCreate(BaseModel):
    teen_id: UUID
    raw_text: str = Field(min_length=10)
    structured_delta: dict | None = None  # optional — NLP engine will fill this later


class ObservationResponse(BaseModel):
    id: UUID
    teen_id: UUID
    raw_text: str
    structured_delta: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Weekly Snapshot
# ---------------------------------------------------------------------------

class WeeklySnapshotResponse(BaseModel):
    id: UUID
    teen_id: UUID
    week_number: int
    readiness_vector: dict
    readiness_score: float
    regression_risk: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Job Profile
# ---------------------------------------------------------------------------

class JobProfileCreate(BaseModel):
    job_name: str
    job_vector: ReadinessVector


class JobProfileResponse(BaseModel):
    id: UUID
    job_name: str
    job_vector: dict
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Explainability / Change Report (returned after observation processing)
# ---------------------------------------------------------------------------

class DimensionChange(BaseModel):
    before: float
    after: float
    change: float


class ChangeReport(BaseModel):
    readiness_score_before: float
    readiness_score_after: float
    readiness_score_change: float
    dimension_changes: dict[str, DimensionChange]


# ---------------------------------------------------------------------------
# Vocational Match Result
# ---------------------------------------------------------------------------

class GapDetail(BaseModel):
    teen: float
    required: float
    gap: float


class JobMatch(BaseModel):
    job_name: str
    similarity: float
    similarity_percent: float
    gap_analysis: dict[str, GapDetail]
