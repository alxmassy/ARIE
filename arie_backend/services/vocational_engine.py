"""
Vocational Alignment Engine — Job matching via cosine similarity.

Compares a teen's readiness vector against job profile vectors to produce
ranked matches with gap analysis. All job profiles from config.py.
"""

from utils.config import DEFAULT_JOB_PROFILES, DIMENSION_KEYS
from utils.vector_math import cosine_similarity, vector_to_list


def compute_gap_analysis(teen_vector: dict, job_vector: dict) -> dict:
    """
    Per-dimension gap between teen's score and job requirement.

    Positive = teen exceeds requirement.
    Negative = teen falls short.

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


def match_jobs(
    teen_vector: dict,
    job_profiles: list[dict] | None = None,
) -> list[dict]:
    """
    Rank job profiles by cosine similarity to the teen's readiness vector.

    Each job profile expected format:
        {"job_name": str, "job_vector": {dim: float, ...}}

    Returns a list sorted by similarity (descending):
        [
            {
                "job_name": str,
                "similarity": float (0-1, rounded to 4 decimals),
                "similarity_percent": float (0-100, rounded to 1 decimal),
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

        sim = cosine_similarity(teen_list, job_list)
        gap = compute_gap_analysis(teen_vector, job_vec)

        results.append({
            "job_name": job_name,
            "similarity": round(sim, 4),
            "similarity_percent": round(sim * 100, 1),
            "gap_analysis": gap,
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results
