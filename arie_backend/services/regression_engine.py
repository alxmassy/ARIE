"""
Regression Detection Engine — Deterministic risk flagging.

Analyzes weekly readiness snapshots to detect concerning trends.
All thresholds from config.py. Every flag includes an explainability string.
"""

from utils.config import REGRESSION_THRESHOLDS


def compute_percent_change(old: float, new: float) -> float:
    """
    Compute percentage change from old to new.

    Returns negative values for drops. Returns 0.0 if old is 0
    to avoid division by zero.
    """
    if old == 0.0:
        return 0.0
    return round(((new - old) / old) * 100.0, 2)


def _extract_scores(snapshots: list[dict], key: str) -> list[float]:
    """Extract a list of values for a given key from snapshots."""
    results = []
    for snap in snapshots:
        if key == "readiness_score":
            results.append(snap.get("readiness_score", 0.0))
        else:
            vector = snap.get("readiness_vector", {})
            results.append(vector.get(key, 0.0))
    return results


def detect_regression_risk(snapshots: list[dict]) -> dict:
    """
    Analyze a chronological list of weekly snapshots and determine
    regression risk level.

    Each snapshot expected format:
        {
            "readiness_score": float,
            "readiness_vector": {dim: float, ...},
            "week_number": int
        }

    Snapshots must be ordered oldest → newest (most recent last).

    Returns:
        {
            "risk_level": "Low" | "Medium" | "High",
            "reasons": [str, ...]
        }

    Reasons are human-readable explainability strings.
    """
    if len(snapshots) < 2:
        return {"risk_level": "Low", "reasons": ["Insufficient data (< 2 weeks)"]}

    reasons = []
    risk_level = "Low"

    high_cfg = REGRESSION_THRESHOLDS["high"]
    med_cfg = REGRESSION_THRESHOLDS["medium"]

    # --- High Risk Checks ---

    # Check 1: Readiness drops ≥12% over 2 consecutive weeks
    if len(snapshots) >= 3:
        scores = _extract_scores(snapshots, "readiness_score")
        two_weeks_ago = scores[-3]
        current = scores[-1]
        pct_change = compute_percent_change(two_weeks_ago, current)

        if pct_change <= -high_cfg["readiness_drop_percent"]:
            risk_level = "High"
            reasons.append(
                f"Readiness score dropped {abs(pct_change)}% over last 2 weeks "
                f"(from {two_weeks_ago} to {current})"
            )

    # Check 2: Behavioral stability drops ≥15% (single week)
    bs_scores = _extract_scores(snapshots, "behavioral_stability")
    if len(bs_scores) >= 2:
        bs_change = compute_percent_change(bs_scores[-2], bs_scores[-1])
        if bs_change <= -high_cfg["behavioral_stability_drop_percent"]:
            risk_level = "High"
            reasons.append(
                f"Behavioral stability dropped {abs(bs_change)}% in last week "
                f"(from {bs_scores[-2]} to {bs_scores[-1]})"
            )

    # --- Medium Risk Checks (only if not already High) ---
    if risk_level != "High":
        # Check 3: Readiness drops ≥6% in single week
        readiness_scores = _extract_scores(snapshots, "readiness_score")
        if len(readiness_scores) >= 2:
            single_week_change = compute_percent_change(
                readiness_scores[-2], readiness_scores[-1]
            )
            if single_week_change <= -med_cfg["readiness_drop_percent"]:
                risk_level = "Medium"
                reasons.append(
                    f"Readiness score dropped {abs(single_week_change)}% in last week "
                    f"(from {readiness_scores[-2]} to {readiness_scores[-1]})"
                )

        # Check 4: Supervision independence drops ≥15%
        si_scores = _extract_scores(snapshots, "supervision_independence")
        if len(si_scores) >= 2:
            si_change = compute_percent_change(si_scores[-2], si_scores[-1])
            if si_change <= -med_cfg["supervision_independence_drop_percent"]:
                risk_level = "Medium"
                reasons.append(
                    f"Supervision independence dropped {abs(si_change)}% in last week "
                    f"(from {si_scores[-2]} to {si_scores[-1]})"
                )

        # Check 5: Cumulative sliding window — catches slow gradual decline
        cum_weeks = int(med_cfg.get("cumulative_drop_weeks", 4))
        cum_thresh = med_cfg.get("cumulative_drop_percent", 10.0)
        readiness_scores_all = _extract_scores(snapshots, "readiness_score")
        if len(readiness_scores_all) > cum_weeks:
            window_start = readiness_scores_all[-(cum_weeks + 1)]
            window_end = readiness_scores_all[-1]
            cum_change = compute_percent_change(window_start, window_end)
            if cum_change <= -cum_thresh:
                risk_level = "Medium"
                reasons.append(
                    f"Cumulative readiness drop of {abs(cum_change)}% over "
                    f"last {cum_weeks} weeks (from {window_start} to {window_end})"
                )

    # --- Low Risk ---
    if not reasons:
        reasons.append("No regression thresholds breached")

    return {"risk_level": risk_level, "reasons": reasons}
