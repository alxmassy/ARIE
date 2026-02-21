"""
Teen CRUD router.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Teen
from schemas import TeenCreate, TeenResponse
from utils.config import DEFAULT_BASELINE_VECTOR

router = APIRouter(prefix="/teens", tags=["Teens"])


@router.post("", response_model=TeenResponse, status_code=201)
def create_teen(payload: TeenCreate, db: Session = Depends(get_db)):
    """Create a new teen profile. Baseline vector defaults to 50s if omitted."""
    baseline = (
        payload.baseline_vector.model_dump()
        if payload.baseline_vector
        else dict(DEFAULT_BASELINE_VECTOR)
    )

    teen = Teen(
        name=payload.name,
        age=payload.age,
        baseline_vector=baseline,
    )
    db.add(teen)
    db.commit()
    db.refresh(teen)
    return teen


@router.get("", response_model=list[TeenResponse])
def list_teens(db: Session = Depends(get_db)):
    """List all teens."""
    return db.query(Teen).order_by(Teen.created_at.desc()).all()


@router.get("/{teen_id}", response_model=TeenResponse)
def get_teen(teen_id: UUID, db: Session = Depends(get_db)):
    """Get a single teen by ID."""
    teen = db.query(Teen).filter(Teen.id == teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")
    return teen


@router.delete("/{teen_id}", status_code=204)
def delete_teen(teen_id: UUID, db: Session = Depends(get_db)):
    """Delete a teen and all related observations/snapshots (cascaded)."""
    teen = db.query(Teen).filter(Teen.id == teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")
    db.delete(teen)
    db.commit()
