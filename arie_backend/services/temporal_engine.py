"""
Temporal Modeling Engine — Weekly snapshot analysis and trend detection.

Handles rolling averages, per-dimension weekly deltas, and
growth/plateau/decline classification via linear slope.
"""

from utils.config import DIMENSION_KEYS, ROLLING_AVERAGE_WINDOW, TREND_WINDOW


def compute_rolling_average(
    snapshots: list[dict],
    window: int | None = None,
) -> dict:
    """
    Compute rolling average readiness vector over the last `window` weeks.

    Each snapshot expected to have a "readiness_vector" key.
    Returns a dict with the same dimension keys, values averaged.

    If fewer snapshots than window, averages all available.
    """
    if window is None:
        window = ROLLING_AVERAGE_WINDOW

    if not snapshots:
        return {dim: 0.0 for dim in DIMENSION_KEYS}

    recent = snapshots[-window:]
    n = len(recent)

    avg = {}
    for dim in DIMENSION_KEYS:
        total = sum(
            snap.get("readiness_vector", {}).get(dim, 0.0) for snap in recent
        )
        avg[dim] = round(total / n, 2)

    return avg


def compute_weekly_change(current: dict, previous: dict) -> dict:
    """
    Compute per-dimension percent change between two readiness vectors.

    Returns:
        {
            "task_performance": {"previous": 70, "current": 65, "change_percent": -7.14},
            ...
        }
    """
    changes = {}
    for dim in DIMENSION_KEYS:
        prev_val = previous.get(dim, 0.0)
        curr_val = current.get(dim, 0.0)

        if prev_val == 0.0:
            pct = 0.0
        else:
            pct = round(((curr_val - prev_val) / prev_val) * 100.0, 2)

        changes[dim] = {
            "previous": prev_val,
            "current": curr_val,
            "change_percent": pct,
        }

    return changes


def detect_trend(
    snapshots: list[dict],
    window: int | None = None,
) -> str:
    """
    Classify the readiness score trend as "growth", "plateau", or "decline".

    Uses simple linear slope over the last `window` readiness scores.

    Slope thresholds:
        > +1.0  → "growth"
        < -1.0  → "decline"
        else    → "plateau"

    Returns one of: "growth", "plateau", "decline"
    """
    if window is None:
        window = TREND_WINDOW

    if len(snapshots) < 2:
        return "plateau"

    recent = snapshots[-window:]
    scores = [snap.get("readiness_score", 0.0) for snap in recent]

    n = len(scores)
    if n < 2:
        return "plateau"

    # Simple linear regression slope: Σ(xi - x̄)(yi - ȳ) / Σ(xi - x̄)²
    x_vals = list(range(n))
    x_mean = sum(x_vals) / n
    y_mean = sum(scores) / n

    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, scores))
    denominator = sum((x - x_mean) ** 2 for x in x_vals)

    if denominator == 0:
        return "plateau"

    slope = numerator / denominator

    if slope > 1.0:
        return "growth"
    elif slope < -1.0:
        return "decline"
    else:
        return "plateau"


def detect_all_trends(
    snapshots: list[dict],
    window: int | None = None,
) -> dict[str, float]:
    """
    Calculate the linear regression slope for each individual dimension 
    over the given window of snapshots.

    Returns:
        {"task_performance": 1.5, "consistency": -2.1, ...}
    """
    if window is None:
        window = TREND_WINDOW

    if len(snapshots) < 2:
        return {dim: 0.0 for dim in DIMENSION_KEYS}

    recent = snapshots[-window:]
    n = len(recent)
    if n < 2:
        return {dim: 0.0 for dim in DIMENSION_KEYS}

    x_vals = list(range(n))
    x_mean = sum(x_vals) / n

    denominator = sum((x - x_mean) ** 2 for x in x_vals)
    if denominator == 0:
        return {dim: 0.0 for dim in DIMENSION_KEYS}

    slopes = {}
    for dim in DIMENSION_KEYS:
        y_vals = [snap.get("readiness_vector", {}).get(dim, 0.0) for snap in recent]
        y_mean = sum(y_vals) / n
        numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_vals, y_vals))
        slopes[dim] = round(numerator / denominator, 3)

    return slopes
