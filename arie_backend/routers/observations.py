"""
Observation router — the core intelligence pipeline entry point.

POST /observations:
  1. Stores raw observation text
  2. If structured_delta provided → uses it directly
  3. If no delta → calls NLP engine (Gemini) to extract one
  4. Applies delta to teen's vector → generates change report
  5. Returns observation + NLP result + change report
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Observation, Teen
from schemas import ObservationCreate, ObservationResponse
from services.nlp_engine import extract_structured_delta
from services.readiness_engine import apply_observation_delta

router = APIRouter(prefix="/observations", tags=["Observations"])


@router.post("", status_code=201)
def create_observation(payload: ObservationCreate, db: Session = Depends(get_db)):
    """
    Log a staff observation for a teen.

    Pipeline:
    1. If structured_delta is provided in payload → use it directly (manual override)
    2. If not → call NLP engine to extract delta from raw_text
    3. Apply delta to teen's readiness vector
    4. Return observation, NLP reasoning (if applicable), and change report
    """
    teen = db.query(Teen).filter(Teen.id == payload.teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")

    structured_delta = payload.structured_delta
    nlp_result = None
    change_report = None

    # Step 1: Determine delta source
    if structured_delta:
        # Manual delta provided — use as-is
        delta_source = "manual"
    else:
        # No delta — call NLP engine
        nlp_result = extract_structured_delta(payload.raw_text)
        if nlp_result:
            structured_delta = nlp_result["deltas"]
            delta_source = "nlp"
        else:
            delta_source = "none"

    # Step 2: Create observation record
    observation = Observation(
        teen_id=payload.teen_id,
        raw_text=payload.raw_text,
        structured_delta=structured_delta,
    )
    db.add(observation)

    # Step 3: Apply delta to teen's vector if we have one
    if structured_delta:
        current_vector = dict(teen.baseline_vector)
        new_vector, change_report = apply_observation_delta(
            current_vector, structured_delta
        )
        teen.baseline_vector = new_vector
        db.add(teen)

    db.commit()
    db.refresh(observation)

    response = {
        "observation": ObservationResponse.model_validate(observation).model_dump(),
        "delta_source": delta_source,
        "nlp_reasoning": nlp_result.get("reasoning") if nlp_result else None,
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
