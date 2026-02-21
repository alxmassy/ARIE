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
