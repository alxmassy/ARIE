"""
Vector math utilities for ARIE.

Pure functions for cosine similarity, clamping, delta application, and
dict ↔ list vector conversions.
"""

import numpy as np

from utils.config import DIMENSION_KEYS


def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Clamp a value to [min_val, max_val]."""
    return max(min_val, min(max_val, float(value)))


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two numeric vectors.

    Returns a float in [0, 1] (negative values clamped to 0 since
    readiness dimensions are always non-negative).

    Returns 0.0 if either vector is all zeros.
    """
    a = np.array(vec_a, dtype=np.float64)
    b = np.array(vec_b, dtype=np.float64)

    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    similarity = float(np.dot(a, b) / (norm_a * norm_b))
    return max(0.0, similarity)


def apply_delta(vector: dict, delta: dict) -> dict:
    """
    Apply a delta update to a readiness vector.

    Returns a NEW dict (immutable pattern). Each dimension value is
    clamped to [0, 100] after applying the delta.

    Only dimensions present in the delta are modified.
    """
    new_vector = dict(vector)
    for key, change in delta.items():
        if key in new_vector:
            new_vector[key] = clamp(new_vector[key] + change)
    return new_vector


def vector_to_list(vector: dict, keys: list[str] | None = None) -> list[float]:
    """
    Convert a keyed dict vector to an ordered list.

    Uses DIMENSION_KEYS as default ordering to ensure consistency
    across all cosine similarity computations.
    """
    if keys is None:
        keys = DIMENSION_KEYS
    return [float(vector.get(k, 0.0)) for k in keys]
