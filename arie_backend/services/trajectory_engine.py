"""
Early Support Trajectory Engine (ESTE) — Deterministic trajectory analysis.

Computes trend slope, volatility, stability classification, and early
support window flags from weekly readiness snapshots. All outputs are
fully explainable and support-oriented.

Design principles:
  - Never predicts outcomes or employability
  - Never compares across students
  - All messaging focuses on support timing and effectiveness
"""

from utils.config import (
    TRAJECTORY_SETTINGS,
    DIMENSION_KEYS,
    READINESS_WEIGHTS,
    TREND_WINDOW,
)


# ---------------------------------------------------------------------------
# 1. Trajectory Monitoring
# ---------------------------------------------------------------------------

def compute_trajectory(snapshots: list[dict]) -> dict | None:
    """
    Compute trajectory analysis over recent weekly snapshots.

    Requires at least `min_weeks` snapshots (default 3).

    Returns:
        {
            "direction": "Improving" | "Stable" | "Needs Attention",
            "slope": float,
            "volatility": float,
            "stability": "High" | "Moderate" | "Unstable",
            "confidence": "Low" | "Medium" | "High",
            "weeks_analyzed": int,
            "narrative": str,
        }
    """
    cfg = TRAJECTORY_SETTINGS
    min_weeks = cfg["min_weeks"]

    if len(snapshots) < min_weeks:
        return None

    all_scores = [s.get("readiness_score", 0.0) for s in snapshots]
    n_total = len(all_scores)

    # Use recent window for slope (matches temporal engine's TREND_WINDOW)
    recent_scores = all_scores[-TREND_WINDOW:] if n_total > TREND_WINDOW else all_scores
    n = len(recent_scores)
    weeks = list(range(n))

    # --- Linear regression (least squares) on recent window ---
    mean_x = sum(weeks) / n
    mean_y = sum(recent_scores) / n

    numerator = sum((x - mean_x) * (y - mean_y) for x, y in zip(weeks, recent_scores))
    denominator = sum((x - mean_x) ** 2 for x in weeks)

    slope = numerator / denominator if denominator != 0 else 0.0
    intercept = mean_y - slope * mean_x

    # --- Residuals → volatility (computed over ALL data) ---
    full_weeks = list(range(n_total))
    full_mean_x = sum(full_weeks) / n_total
    full_mean_y = sum(all_scores) / n_total
    full_num = sum((x - full_mean_x) * (y - full_mean_y) for x, y in zip(full_weeks, all_scores))
    full_den = sum((x - full_mean_x) ** 2 for x in full_weeks)
    full_slope = full_num / full_den if full_den != 0 else 0.0
    full_intercept = full_mean_y - full_slope * full_mean_x

    predicted = [full_slope * x + full_intercept for x in full_weeks]
    residuals = [actual - pred for actual, pred in zip(all_scores, predicted)]
    variance = sum(r ** 2 for r in residuals) / n_total
    volatility = variance ** 0.5

    # --- Direction classification ---
    if slope > cfg["slope_improving_threshold"]:
        direction = "Improving"
    elif slope < cfg["slope_attention_threshold"]:
        direction = "Needs Attention"
    else:
        direction = "Stable"

    # --- Stability classification ---
    if volatility < cfg["volatility_low_band"]:
        stability = "High"
    elif volatility < cfg["volatility_mid_band"]:
        stability = "Moderate"
    else:
        stability = "Unstable"

    # --- Confidence based on data volume ---
    if n_total >= 8:
        confidence = "High"
    elif n_total >= 5:
        confidence = "Medium"
    else:
        confidence = "Low"

    # --- Human-readable narrative ---
    narrative = _build_trajectory_narrative(direction, stability, n_total, all_scores[-1])

    return {
        "direction": direction,
        "slope": round(slope, 4),
        "volatility": round(volatility, 4),
        "stability": stability,
        "confidence": confidence,
        "weeks_analyzed": n_total,
        "narrative": narrative,
    }


def _build_trajectory_narrative(
    direction: str,
    stability: str,
    weeks: int,
    current_score: float,
) -> str:
    """Build a calm, supportive narrative about trajectory."""
    score_str = f"{current_score:.1f}"

    if direction == "Improving":
        base = f"Readiness shows gradual improvement over the last {weeks} weeks, currently at {score_str}."
    elif direction == "Needs Attention":
        base = f"Readiness shows a mild downward trend over the last {weeks} weeks, currently at {score_str}."
    else:
        base = f"Readiness is holding steady over the last {weeks} weeks at {score_str}."

    if stability == "Unstable":
        base += " Stability has increased variability — consider structured support adjustments this week."
    elif stability == "Moderate":
        base += " Stability is moderate."
    else:
        base += " Stability is high."

    return base


# ---------------------------------------------------------------------------
# 2. Early Support Window
# ---------------------------------------------------------------------------

def detect_early_support_window(
    snapshots: list[dict],
    regression_risk: str,
) -> dict:
    """
    Determine whether the Early Support Window should be active.

    Triggers when:
      1. slope < 0 AND volatility is increasing, OR
      2. Two or more consecutive weekly declines, OR
      3. Regression engine flagged Medium risk

    Returns:
        {
            "active": bool,
            "trigger_reason": str,
        }
    """
    cfg = TRAJECTORY_SETTINGS

    if len(snapshots) < cfg["min_weeks"]:
        return {"active": False, "trigger_reason": "Insufficient data"}

    scores = [s.get("readiness_score", 0.0) for s in snapshots]

    # --- Check 1: Slope negative + volatility increasing ---
    trajectory = compute_trajectory(snapshots)
    if trajectory and trajectory["slope"] < 0 and trajectory["stability"] != "High":
        return {
            "active": True,
            "trigger_reason": "Downward trend detected with variable stability, a small shift now may prevent deeper regression later.",
        }

    # --- Check 2: Consecutive weekly declines ---
    consecutive_target = cfg["consecutive_decline_weeks"]
    consecutive_declines = 0
    for i in range(len(scores) - 1, 0, -1):
        if scores[i] < scores[i - 1]:
            consecutive_declines += 1
            if consecutive_declines >= consecutive_target:
                return {
                    "active": True,
                    "trigger_reason": f"{consecutive_declines} consecutive weekly declines detected, consider reviewing support strategies.",
                }
        else:
            break

    # --- Check 3: Regression engine flagged Medium ---
    if regression_risk == "Medium":
        return {
            "active": True,
            "trigger_reason": "Moderate regression risk identified, proactive support may help stabilize progress.",
        }

    return {"active": False, "trigger_reason": "No early support triggers detected"}


# ---------------------------------------------------------------------------
# 3. Support Sensitivity Indicator
# ---------------------------------------------------------------------------

def compute_support_sensitivity(current_vector: dict) -> list[dict]:
    """
    Compute how a structured support adjustment (+delta points) in
    each dimension would affect the overall readiness score.

    This is NOT about scoring the child — it's about understanding
    which areas of support have the highest impact on transition readiness.

    Returns a list sorted by delta_impact (descending):
        [
            {
                "dimension": str,
                "current": float,
                "delta_impact": float,  # readiness score change from +delta
                "insight": str,         # human-readable support framing
            },
            ...
        ]
    """
    cfg = TRAJECTORY_SETTINGS
    delta = cfg["sensitivity_delta"]

    results = []
    for dim in DIMENSION_KEYS:
        current = current_vector.get(dim, 50.0)
        weight = READINESS_WEIGHTS[dim]

        # Clamp to 100 ceiling
        effective_delta = min(delta, 100.0 - current)
        impact = round(effective_delta * weight, 4)

        # Human-readable insight
        dim_label = dim.replace("_", " ").title()
        if impact >= 1.0:
            insight = f"Structured {dim_label.lower()} support could meaningfully improve transition readiness."
        elif impact >= 0.5:
            insight = f"Moderate gains possible through focused {dim_label.lower()} development."
        else:
            insight = f"{dim_label} is already strong, maintain current support level."

        results.append({
            "dimension": dim,
            "current": round(current, 2),
            "delta_impact": impact,
            "insight": insight,
        })

    # Sort by impact descending
    results.sort(key=lambda x: x["delta_impact"], reverse=True)
    return results
