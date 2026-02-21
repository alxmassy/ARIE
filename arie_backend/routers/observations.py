"""
Observation router — the core intelligence pipeline entry point.

POST /observations:
  1. Stores raw observation text
  2. If structured_delta provided → applies to teen's vector → updates readiness
  3. Returns observation + change report
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Observation, Teen
from schemas import ObservationCreate, ObservationResponse
from services.readiness_engine import apply_observation_delta, compute_readiness_score
from utils.vector_math import apply_delta

router = APIRouter(prefix="/observations", tags=["Observations"])


@router.post("", status_code=201)
def create_observation(payload: ObservationCreate, db: Session = Depends(get_db)):
    """
    Log a staff observation for a teen.

    If structured_delta is provided, the teen's baseline_vector is updated
    immediately and a change report is returned.

    If structured_delta is omitted, the observation is stored with null delta
    (to be processed by the NLP engine later).
    """
    teen = db.query(Teen).filter(Teen.id == payload.teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")

    observation = Observation(
        teen_id=payload.teen_id,
        raw_text=payload.raw_text,
        structured_delta=payload.structured_delta,
    )
    db.add(observation)

    change_report = None

    if payload.structured_delta:
        # Apply delta to the teen's current vector
        current_vector = dict(teen.baseline_vector)
        new_vector, change_report = apply_observation_delta(
            current_vector, payload.structured_delta
        )

        # Update teen's baseline vector in DB
        teen.baseline_vector = new_vector
        db.add(teen)

    db.commit()
    db.refresh(observation)

    response = {
        "observation": ObservationResponse.model_validate(observation).model_dump(),
        "change_report": change_report,
    }

    return response


@router.get("/{teen_id}", response_model=list[ObservationResponse])
def list_observations(teen_id: UUID, db: Session = Depends(get_db)):
    """List all observations for a teen, newest first."""
    teen = db.query(Teen).filter(Teen.id == teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")

    return (
        db.query(Observation)
        .filter(Observation.teen_id == teen_id)
        .order_by(Observation.created_at.desc())
        .all()
    )
