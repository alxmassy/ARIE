"""
Readiness Engine — Computes final readiness scores with full explainability.

Operates on readiness vectors (dict with 5 dimension keys, each 0-100).
All weights sourced from config.py.
"""

from utils.config import DIMENSION_KEYS, READINESS_WEIGHTS
from utils.vector_math import apply_delta


def compute_readiness_score(vector: dict) -> float:
    """
    Compute the final weighted readiness score from a readiness vector.

    Returns a float in [0, 100].
    """
    score = 0.0
    for dim in DIMENSION_KEYS:
        score += vector.get(dim, 0.0) * READINESS_WEIGHTS[dim]
    return round(score, 2)


def compute_score_breakdown(vector: dict) -> dict:
    """
    Return per-dimension weighted contributions to the readiness score.

    Useful for explainability — shows exactly how much each dimension
    contributes to the final number.

    Returns:
        {
            "total": float,
            "contributions": {
                "task_performance": {"raw": float, "weight": float, "weighted": float},
                ...
            }
        }
    """
    contributions = {}
    total = 0.0

    for dim in DIMENSION_KEYS:
        raw = vector.get(dim, 0.0)
        weight = READINESS_WEIGHTS[dim]
        weighted = round(raw * weight, 2)
        total += weighted
        contributions[dim] = {
            "raw": raw,
            "weight": weight,
            "weighted": weighted,
        }

    return {
        "total": round(total, 2),
        "contributions": contributions,
    }


def apply_observation_delta(
    current_vector: dict,
    delta: dict,
) -> tuple[dict, dict]:
    """
    Apply a structured delta to the current readiness vector.

    Returns:
        (new_vector, change_report)

    change_report contains per-dimension before/after/change and
    the overall readiness score change. This is the core explainability
    payload sent to the frontend.
    """
    new_vector = apply_delta(current_vector, delta)

    old_score = compute_readiness_score(current_vector)
    new_score = compute_readiness_score(new_vector)

    dimension_changes = {}
    for dim in DIMENSION_KEYS:
        old_val = current_vector.get(dim, 0.0)
        new_val = new_vector.get(dim, 0.0)
        change = round(new_val - old_val, 2)
        if change != 0.0:
            dimension_changes[dim] = {
                "before": old_val,
                "after": new_val,
                "change": change,
            }

    change_report = {
        "readiness_score_before": old_score,
        "readiness_score_after": new_score,
        "readiness_score_change": round(new_score - old_score, 2),
        "dimension_changes": dimension_changes,
    }

    return new_vector, change_report


def compute_confidence(
    snapshots: list[dict],
    observation_count: int,
) -> dict:
    """
    Compute a deterministic confidence score for a teen's readiness assessment.

    Three factors (each 0-1, weighted equally):
      1. Temporal maturity:      weeks / mature_weeks (capped at 1.0)
      2. Score stability:        1 - (std_dev / volatility_threshold), clamped [0, 1]
      3. Observation frequency:  (obs_per_week / min_required), clamped [0, 1]

    Returns:
        {
            "confidence": "Low" | "Medium" | "High",
            "confidence_score": float (0-1),
            "confidence_reason": str,
            "factors": {
                "temporal": float,
                "stability": float,
                "observation_frequency": float,
            }
        }
    """
    from utils.config import CONFIDENCE_SETTINGS

    cfg = CONFIDENCE_SETTINGS
    weeks = len(snapshots)
    reasons = []

    # Factor 1: Temporal maturity
    temporal = min(1.0, weeks / cfg["mature_weeks"])
    if weeks < cfg["mature_weeks"]:
        reasons.append(f"Only {weeks} of {cfg['mature_weeks']} weeks of longitudinal data")

    # Factor 2: Score stability (variance across snapshot scores)
    if weeks >= 2:
        scores = [s.get("readiness_score", 0.0) for s in snapshots]
        mean = sum(scores) / len(scores)
        variance = sum((s - mean) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5
        stability = max(0.0, min(1.0, 1.0 - (std_dev / cfg["volatility_threshold"])))
        if std_dev > cfg["volatility_threshold"]:
            reasons.append(f"High score volatility (σ={std_dev:.1f})")
    else:
        stability = 0.5  # unknown — neutral
        if weeks < 2:
            reasons.append("Insufficient data to assess stability")

    # Factor 3: Observation frequency
    if weeks > 0:
        obs_per_week = observation_count / weeks
        freq = min(1.0, obs_per_week / cfg["min_observations_per_week"])
        if obs_per_week < cfg["min_observations_per_week"]:
            reasons.append(
                f"Sparse observations ({obs_per_week:.1f}/week, "
                f"need ≥{cfg['min_observations_per_week']}/week)"
            )
    else:
        freq = 0.0
        reasons.append("No weekly data or observations recorded")

    # Composite score (equal weight)
    composite = round((temporal + stability + freq) / 3, 4)

    # Map to level
    if composite >= cfg["high_threshold"]:
        level = "High"
    elif composite >= cfg["medium_threshold"]:
        level = "Medium"
    else:
        level = "Low"

    if not reasons:
        reasons.append("Sufficient data, stable scores, adequate observation frequency")

    return {
        "confidence": level,
        "confidence_score": composite,
        "confidence_reason": reasons[0],  # primary reason
        "factors": {
            "temporal": round(temporal, 4),
            "stability": round(stability, 4),
            "observation_frequency": round(freq, 4),
        },
    }
