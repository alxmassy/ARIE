"""
Dashboard router — intelligence presentation layer.

Provides overview, detailed teen view, and manual snapshot creation.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import JobProfile, Observation, Teen, WeeklySnapshot
from schemas import JobMatch, WeeklySnapshotResponse
from services.readiness_engine import compute_readiness_score, compute_score_breakdown, compute_confidence
from services.regression_engine import detect_regression_risk
from services.temporal_engine import compute_rolling_average, detect_trend
from services.vocational_engine import match_jobs

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview(db: Session = Depends(get_db)):
    """
    All teens with latest readiness score, regression risk, and trend.

    Returns a list of teen summaries for the main dashboard view.
    """
    teens = db.query(Teen).order_by(Teen.created_at.desc()).all()
    results = []

    for teen in teens:
        snapshots = (
            db.query(WeeklySnapshot)
            .filter(WeeklySnapshot.teen_id == teen.id)
            .order_by(WeeklySnapshot.week_number.asc())
            .all()
        )

        current_score = compute_readiness_score(teen.baseline_vector)

        if snapshots:
            snapshot_dicts = [
                {
                    "readiness_score": s.readiness_score,
                    "readiness_vector": s.readiness_vector,
                    "week_number": s.week_number,
                }
                for s in snapshots
            ]
            regression = detect_regression_risk(snapshot_dicts)
            trend = detect_trend(snapshot_dicts)
            sparkline = [current_score] + [s.readiness_score for s in snapshots]
        else:
            regression = {"risk_level": "Low", "reasons": ["No snapshot history"]}
            trend = "plateau"
            sparkline = [current_score]

        results.append({
            "id": str(teen.id),
            "name": teen.name,
            "age": teen.age,
            "readiness_score": current_score,
            "regression_risk": regression["risk_level"],
            "trend": trend,
            "sparkline": sparkline,
        })

    return results


@router.get("/teen/{teen_id}")
def teen_detail(teen_id: UUID, db: Session = Depends(get_db)):
    """
    Full intelligence detail for a single teen.

    Returns: current vector, score breakdown, snapshot history,
    job matches, regression risk with reasons.
    """
    teen = db.query(Teen).filter(Teen.id == teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")

    current_vector = dict(teen.baseline_vector)
    score_breakdown = compute_score_breakdown(current_vector)

    # Snapshots
    snapshots = (
        db.query(WeeklySnapshot)
        .filter(WeeklySnapshot.teen_id == teen_id)
        .order_by(WeeklySnapshot.week_number.asc())
        .all()
    )

    snapshot_dicts = [
        {
            "readiness_score": s.readiness_score,
            "readiness_vector": s.readiness_vector,
            "week_number": s.week_number,
        }
        for s in snapshots
    ]

    # Regression
    regression = detect_regression_risk(snapshot_dicts) if snapshot_dicts else {
        "risk_level": "Low",
        "reasons": ["No snapshot history"],
    }

    # Trend
    trend = detect_trend(snapshot_dicts) if snapshot_dicts else "plateau"

    # Rolling average
    rolling_avg = compute_rolling_average(snapshot_dicts) if snapshot_dicts else None

    # Job matching
    job_profiles_db = db.query(JobProfile).all()
    if job_profiles_db:
        profiles = [
            {"job_name": jp.job_name, "job_vector": jp.job_vector}
            for jp in job_profiles_db
        ]
        job_matches = match_jobs(current_vector, profiles)
    else:
        job_matches = match_jobs(current_vector)  # uses defaults from config

    # Observation count for confidence scoring
    observation_count = (
        db.query(Observation)
        .filter(Observation.teen_id == teen_id)
        .count()
    )

    # Confidence scoring
    confidence = compute_confidence(snapshot_dicts, observation_count)

    # Snapshot timeline for frontend charts
    timeline = [
        {
            "week_number": s.week_number,
            "readiness_score": s.readiness_score,
            "readiness_vector": s.readiness_vector,
            "regression_risk": s.regression_risk,
        }
        for s in snapshots
    ]

    return {
        "id": str(teen.id),
        "name": teen.name,
        "age": teen.age,
        "current_vector": current_vector,
        "score_breakdown": score_breakdown,
        "regression": regression,
        "confidence": confidence,
        "trend": trend,
        "rolling_average": rolling_avg,
        "job_matches": job_matches,
        "timeline": timeline,
    }


@router.post("/snapshot/{teen_id}", status_code=201)
def create_snapshot(teen_id: UUID, db: Session = Depends(get_db)):
    """
    Manually trigger a weekly snapshot for a teen.

    Takes the teen's current baseline_vector, computes readiness score,
    runs regression detection against existing snapshots, and stores
    a new snapshot row.
    """
    teen = db.query(Teen).filter(Teen.id == teen_id).first()
    if not teen:
        raise HTTPException(status_code=404, detail="Teen not found")

    # Determine week number
    last_snapshot = (
        db.query(WeeklySnapshot)
        .filter(WeeklySnapshot.teen_id == teen_id)
        .order_by(WeeklySnapshot.week_number.desc())
        .first()
    )
    week_number = (last_snapshot.week_number + 1) if last_snapshot else 1

    current_vector = dict(teen.baseline_vector)
    readiness_score = compute_readiness_score(current_vector)

    # Get all existing snapshots for regression detection
    existing_snapshots = (
        db.query(WeeklySnapshot)
        .filter(WeeklySnapshot.teen_id == teen_id)
        .order_by(WeeklySnapshot.week_number.asc())
        .all()
    )

    snapshot_dicts = [
        {
            "readiness_score": s.readiness_score,
            "readiness_vector": s.readiness_vector,
            "week_number": s.week_number,
        }
        for s in existing_snapshots
    ]

    # Add current as the latest for regression check
    snapshot_dicts.append({
        "readiness_score": readiness_score,
        "readiness_vector": current_vector,
        "week_number": week_number,
    })

    regression = detect_regression_risk(snapshot_dicts)

    # Save snapshot
    snapshot = WeeklySnapshot(
        teen_id=teen_id,
        week_number=week_number,
        readiness_vector=current_vector,
        readiness_score=readiness_score,
        regression_risk=regression["risk_level"],
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return {
        "snapshot": WeeklySnapshotResponse.model_validate(snapshot).model_dump(),
        "regression": regression,
    }
