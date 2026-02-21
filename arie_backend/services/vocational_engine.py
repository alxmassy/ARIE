"""
Vocational Alignment Engine — Constraint-Aware Job Matching.

Compares a teen's readiness vector against job profile vectors using:
  1. Cosine similarity (directional alignment)
  2. Dimension deficit analysis (gap between teen and requirement)
  3. Constraint penalties (deficits beyond tolerance reduce effective score)
  4. Disqualification flagging (extreme deficits mark a job as unsuitable)

All thresholds sourced from config.py — no magic numbers.
"""

from utils.config import (
    DEFAULT_JOB_PROFILES,
    DIMENSION_KEYS,
    VOCATIONAL_CONSTRAINTS,
)
from utils.vector_math import cosine_similarity, vector_to_list


def compute_gap_analysis(teen_vector: dict, job_vector: dict) -> dict:
    """
    Per-dimension gap between teen's score and job requirement.

    Positive gap = teen exceeds requirement.
    Negative gap = teen falls short (deficit).

    Returns:
        {
            "task_performance": {"teen": 70, "required": 80, "gap": -10},
            ...
        }
    """
    gaps = {}
    for dim in DIMENSION_KEYS:
        teen_val = teen_vector.get(dim, 0.0)
        job_val = job_vector.get(dim, 0.0)
        gaps[dim] = {
            "teen": teen_val,
            "required": job_val,
            "gap": round(teen_val - job_val, 2),
        }
    return gaps


def compute_deficit_penalty(gap_analysis: dict) -> dict:
    """
    Compute constraint penalty from dimension deficits.

    For each dimension where teen falls short beyond the tolerance:
      excess = abs(gap) - tolerance
      dimension_penalty = excess * penalty_per_point

    Total penalty is the sum of all dimension penalties, capped at max_penalty.

    Returns:
        {
            "total_penalty": float (0 to max_penalty),
            "disqualified": bool,
            "disqualified_dimensions": [str, ...],
            "penalized_dimensions": {
                dim: {"deficit": float, "excess": float, "penalty": float},
                ...
            }
        }
    """
    tolerance = VOCATIONAL_CONSTRAINTS["deficit_tolerance"]
    disqualify_thresh = VOCATIONAL_CONSTRAINTS["disqualify_threshold"]
    penalty_per_point = VOCATIONAL_CONSTRAINTS["penalty_per_point"]
    max_penalty = VOCATIONAL_CONSTRAINTS["max_penalty"]

    penalized = {}
    disqualified_dims = []
    total_penalty = 0.0

    for dim, data in gap_analysis.items():
        gap = data["gap"]
        if gap >= 0:
            continue  # teen meets or exceeds requirement

        deficit = abs(gap)

        # Disqualification check
        if deficit >= disqualify_thresh:
            disqualified_dims.append(dim)

        # Penalty for excess beyond tolerance
        if deficit > tolerance:
            excess = deficit - tolerance
            dim_penalty = round(excess * penalty_per_point, 4)
            total_penalty += dim_penalty
            penalized[dim] = {
                "deficit": round(deficit, 2),
                "excess": round(excess, 2),
                "penalty": dim_penalty,
            }

    total_penalty = round(min(total_penalty, max_penalty), 4)

    return {
        "total_penalty": total_penalty,
        "disqualified": len(disqualified_dims) > 0,
        "disqualified_dimensions": disqualified_dims,
        "penalized_dimensions": penalized,
    }


def match_jobs(
    teen_vector: dict,
    job_profiles: list[dict] | None = None,
) -> list[dict]:
    """
    Rank job profiles by constraint-aware similarity.

    Pipeline per job:
      1. Cosine similarity (raw directional alignment)
      2. Gap analysis (per-dimension deficit)
      3. Deficit penalty (excess beyond tolerance reduces score)
      4. Effective similarity = raw_similarity * (1 - penalty)
      5. Disqualification flag for extreme deficits

    Returns sorted by effective_similarity (descending):
        [
            {
                "job_name": str,
                "similarity": float,         # raw cosine (0-1)
                "similarity_percent": float,  # raw cosine (0-100)
                "effective_similarity": float, # after penalty (0-1)
                "effective_percent": float,    # after penalty (0-100)
                "penalty": float,             # total penalty applied
                "disqualified": bool,
                "disqualified_dimensions": [str, ...],
                "penalized_dimensions": {...},
                "gap_analysis": {dim: {teen, required, gap}, ...}
            },
            ...
        ]
    """
    if job_profiles is None:
        job_profiles = DEFAULT_JOB_PROFILES

    teen_list = vector_to_list(teen_vector)
    results = []

    for profile in job_profiles:
        job_name = profile["job_name"]
        job_vec = profile["job_vector"]
        job_list = vector_to_list(job_vec)

        # Step 1: Raw cosine similarity
        raw_sim = cosine_similarity(teen_list, job_list)

        # Step 2: Gap analysis
        gap = compute_gap_analysis(teen_vector, job_vec)

        # Step 3: Deficit penalty
        penalty_result = compute_deficit_penalty(gap)

        # Step 4: Effective similarity
        effective_sim = raw_sim * (1 - penalty_result["total_penalty"])

        results.append({
            "job_name": job_name,
            "similarity": round(raw_sim, 4),
            "similarity_percent": round(raw_sim * 100, 1),
            "effective_similarity": round(effective_sim, 4),
            "effective_percent": round(effective_sim * 100, 1),
            "penalty": penalty_result["total_penalty"],
            "disqualified": penalty_result["disqualified"],
            "disqualified_dimensions": penalty_result["disqualified_dimensions"],
            "penalized_dimensions": penalty_result["penalized_dimensions"],
            "gap_analysis": gap,
        })

    # Sort by effective similarity, disqualified jobs sink to bottom
    results.sort(
        key=lambda x: (not x["disqualified"], x["effective_similarity"]),
        reverse=True,
    )
    return results
