"""
ARIE Analysis Stress Test — Engine Behavioral Verification

Covers all 6 layers from testing.md:
  1. Mathematical integrity (weight normalization, delta sensitivity)
  2. Stability under repeated updates
  3. Regression logic validation
  4. Dimension cross-impact audit
  5. Vocational alignment robustness
  6. Explainability stress test

Run:  python analysis_stress_test.py
"""

import random
import sys

from utils.config import (
    DIMENSION_KEYS,
    READINESS_WEIGHTS,
    DEFAULT_BASELINE_VECTOR,
    REGRESSION_THRESHOLDS,
)
from services.readiness_engine import (
    compute_readiness_score,
    compute_score_breakdown,
    apply_observation_delta,
)
from services.regression_engine import detect_regression_risk
from services.vocational_engine import match_jobs

# ──────────────────────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────────────────────

PASS = "✅ PASS"
FAIL = "❌ FAIL"
results: list[tuple[str, str, bool]] = []


def log(layer: str, test: str, passed: bool, detail: str = ""):
    status = PASS if passed else FAIL
    results.append((layer, test, passed))
    print(f"  {status}  {test}")
    if detail:
        print(f"         → {detail}")


def make_vector(**overrides) -> dict:
    """Build a vector from defaults with optional overrides."""
    v = {k: 50.0 for k in DIMENSION_KEYS}
    v.update(overrides)
    return v


def make_snapshot(vector: dict, week: int) -> dict:
    return {
        "week_number": week,
        "readiness_score": compute_readiness_score(vector),
        "readiness_vector": dict(vector),
    }


# ──────────────────────────────────────────────────────────────
#  Layer 1: Mathematical Integrity
# ──────────────────────────────────────────────────────────────

def test_weight_normalization():
    print("\n━━━ Layer 1: Mathematical Integrity ━━━")

    # 1a. Weights sum to 1.0
    total = sum(READINESS_WEIGHTS.values())
    log("L1", "Weights sum to 1.0", abs(total - 1.0) < 1e-9,
        f"sum = {total}")

    # 1b. All dimensions accounted for
    missing = set(DIMENSION_KEYS) - set(READINESS_WEIGHTS.keys())
    log("L1", "All dimensions have weights", len(missing) == 0,
        f"missing: {missing}" if missing else "")

    # 1c. Delta sensitivity — +5 on each dimension individually
    baseline = {k: 70.0 for k in DIMENSION_KEYS}
    base_score = compute_readiness_score(baseline)
    print(f"\n  Delta sensitivity (baseline=70 all, score={base_score}):")

    shifts = {}
    for dim in DIMENSION_KEYS:
        delta = {dim: 5}
        new_vec, report = apply_observation_delta(baseline, delta)
        shift = report["readiness_score_change"]
        expected_shift = round(5 * READINESS_WEIGHTS[dim], 2)
        shifts[dim] = shift
        match = abs(shift - expected_shift) < 0.01
        log("L1", f"  +5 {dim}", match,
            f"shift={shift}, expected={expected_shift} (weight={READINESS_WEIGHTS[dim]})")

    # Verify task_performance moves score more than consistency
    tp_shift = shifts["task_performance"]
    c_shift = shifts["consistency"]
    log("L1", "task_performance shift > consistency shift",
        tp_shift > c_shift,
        f"TP={tp_shift} vs C={c_shift}")


# ──────────────────────────────────────────────────────────────
#  Layer 2: Stability Under Repeated Updates
# ──────────────────────────────────────────────────────────────

def simulate_progression():
    """
    20 weeks of mild positive deltas (progression scenario).
    Checks: score doesn't saturate prematurely, stays in [0,100].
    """
    print("\n━━━ Layer 2a: Progression Simulation (20 weeks) ━━━")

    vector = dict(DEFAULT_BASELINE_VECTOR)  # all 50s
    scores = [compute_readiness_score(vector)]

    for week in range(1, 21):
        delta = {dim: random.uniform(1, 4) for dim in DIMENSION_KEYS}
        vector, report = apply_observation_delta(vector, delta)
        score = compute_readiness_score(vector)
        scores.append(score)
        print(f"  Week {week:2d}: score={score:6.2f}  Δ={report['readiness_score_change']:+.2f}")

    # Checks
    final = scores[-1]
    monotonic_violations = sum(
        1 for i in range(1, len(scores)) if scores[i] < scores[i - 1]
    )
    log("L2", "Final score > baseline (50)", final > 50,
        f"final={final:.2f}")
    log("L2", "Score stays in [0, 100]",
        all(0 <= s <= 100 for s in scores))
    log("L2", "Mostly monotonic progression",
        monotonic_violations <= 2,
        f"violations={monotonic_violations}/20")
    log("L2", "Doesn't saturate to 100 too fast",
        scores[5] < 95,
        f"week 5 score={scores[5]:.2f}")

    return scores


def simulate_regression():
    """
    Start at [70,70,70,70,70]. Apply consistent negative deltas.
    Checks: score declines, doesn't go below 0, regression triggers.
    """
    print("\n━━━ Layer 2b: Regression Simulation (15 weeks) ━━━")

    vector = {k: 70.0 for k in DIMENSION_KEYS}
    snapshots = [make_snapshot(vector, 0)]
    scores = [compute_readiness_score(vector)]

    for week in range(1, 16):
        delta = {dim: random.uniform(-5, -2) for dim in DIMENSION_KEYS}
        vector, report = apply_observation_delta(vector, delta)
        score = compute_readiness_score(vector)
        scores.append(score)
        snapshots.append(make_snapshot(vector, week))
        regression = detect_regression_risk(snapshots)
        print(f"  Week {week:2d}: score={score:6.2f}  Δ={report['readiness_score_change']:+.2f}"
              f"  risk={regression['risk_level']}")

    final = scores[-1]
    log("L2", "Final score < baseline (70)", final < 70,
        f"final={final:.2f}")
    log("L2", "Score stays in [0, 100]",
        all(0 <= s <= 100 for s in scores))
    log("L2", "Regression detected at some point",
        any(
            detect_regression_risk(snapshots[:i+1])["risk_level"] != "Low"
            for i in range(2, len(snapshots))
        ))

    return scores


def simulate_recovery():
    """
    Drop sharply for 3 weeks, then recover for 5 weeks.
    Checks: regression escalates, then de-escalates after recovery.
    """
    print("\n━━━ Layer 2c: Recovery Simulation (8 weeks) ━━━")

    vector = {k: 70.0 for k in DIMENSION_KEYS}
    snapshots = [make_snapshot(vector, 0)]
    risk_history = []

    # Phase 1: Sharp decline (3 weeks)
    for week in range(1, 4):
        delta = {dim: -8 for dim in DIMENSION_KEYS}
        vector, report = apply_observation_delta(vector, delta)
        snapshots.append(make_snapshot(vector, week))
        risk = detect_regression_risk(snapshots)
        risk_history.append(risk["risk_level"])
        score = compute_readiness_score(vector)
        print(f"  Week {week} (decline): score={score:6.2f}  risk={risk['risk_level']}")
        for r in risk["reasons"]:
            print(f"                       reason: {r}")

    # Phase 2: Recovery (5 weeks)
    for week in range(4, 9):
        delta = {dim: 6 for dim in DIMENSION_KEYS}
        vector, report = apply_observation_delta(vector, delta)
        snapshots.append(make_snapshot(vector, week))
        risk = detect_regression_risk(snapshots)
        risk_history.append(risk["risk_level"])
        score = compute_readiness_score(vector)
        print(f"  Week {week} (recovery): score={score:6.2f}  risk={risk['risk_level']}")

    print(f"\n  Risk trajectory: {' → '.join(risk_history)}")

    # Checks
    log("L2", "Regression triggered during decline",
        "High" in risk_history[:3] or "Medium" in risk_history[:3])
    log("L2", "Risk de-escalates after recovery",
        risk_history[-1] in ("Low", "Medium"),
        f"final risk={risk_history[-1]}")
    log("L2", "No permanent escalation after full recovery",
        risk_history[-1] != "High" or risk_history[-2] != "High",
        f"last 2: {risk_history[-2:]}")


# ──────────────────────────────────────────────────────────────
#  Layer 3: Regression Logic Validation
# ──────────────────────────────────────────────────────────────

def test_regression_scenarios():
    print("\n━━━ Layer 3: Regression Logic Validation ━━━")

    # Scenario A — Slow gradual drop: -3% per week for 4 weeks
    print("\n  Scenario A: Slow gradual drop (-3%/week × 4)")
    vector = {k: 70.0 for k in DIMENSION_KEYS}
    snapshots = [make_snapshot(vector, 0)]

    saw_medium = False
    saw_high = False
    medium_before_high = True

    for week in range(1, 5):
        pct_drop = 0.03
        delta = {dim: -(vector[dim] * pct_drop) for dim in DIMENSION_KEYS}
        vector, _ = apply_observation_delta(vector, delta)
        snapshots.append(make_snapshot(vector, week))
        risk = detect_regression_risk(snapshots)
        print(f"    Week {week}: score={compute_readiness_score(vector):.2f}  risk={risk['risk_level']}")

        if risk["risk_level"] == "Medium":
            saw_medium = True
        if risk["risk_level"] == "High":
            if not saw_medium:
                medium_before_high = False
            saw_high = True

    log("L3", "Scenario A: detects regression", saw_medium or saw_high)
    log("L3", "Scenario A: medium triggers before high (if both)",
        medium_before_high or not saw_high,
        "gradual drop should escalate progressively")

    # Scenario B — Sudden sharp drop: -15% in 1 week
    print("\n  Scenario B: Sudden sharp drop (-15% in 1 week)")
    vector = {k: 70.0 for k in DIMENSION_KEYS}
    snap0 = make_snapshot(vector, 0)
    delta = {dim: -(vector[dim] * 0.15) for dim in DIMENSION_KEYS}
    vector, _ = apply_observation_delta(vector, delta)
    snap1 = make_snapshot(vector, 1)
    risk = detect_regression_risk([snap0, snap1])
    print(f"    After drop: score={compute_readiness_score(vector):.2f}  risk={risk['risk_level']}")
    for r in risk["reasons"]:
        print(f"    reason: {r}")

    log("L3", "Scenario B: triggers Medium or High on sharp drop",
        risk["risk_level"] in ("Medium", "High"),
        f"got: {risk['risk_level']}")

    # Scenario C — Temporary dip: -8% week 1, +9% week 2
    print("\n  Scenario C: Temporary dip (-8% W1, +9% W2)")
    vector = {k: 70.0 for k in DIMENSION_KEYS}
    snap0 = make_snapshot(vector, 0)

    delta_down = {dim: -(vector[dim] * 0.08) for dim in DIMENSION_KEYS}
    vector, _ = apply_observation_delta(vector, delta_down)
    snap1 = make_snapshot(vector, 1)
    risk_w1 = detect_regression_risk([snap0, snap1])
    print(f"    Week 1 (dip):     score={compute_readiness_score(vector):.2f}  risk={risk_w1['risk_level']}")

    delta_up = {dim: (vector[dim] * 0.09) for dim in DIMENSION_KEYS}
    vector, _ = apply_observation_delta(vector, delta_up)
    snap2 = make_snapshot(vector, 2)
    risk_w2 = detect_regression_risk([snap0, snap1, snap2])
    print(f"    Week 2 (recover): score={compute_readiness_score(vector):.2f}  risk={risk_w2['risk_level']}")

    log("L3", "Scenario C: no permanent escalation after recovery",
        risk_w2["risk_level"] != "High",
        f"W1={risk_w1['risk_level']}, W2={risk_w2['risk_level']}")


# ──────────────────────────────────────────────────────────────
#  Layer 4: Dimension Cross-Impact Audit
# ──────────────────────────────────────────────────────────────

def test_cross_impact():
    print("\n━━━ Layer 4: Dimension Cross-Impact Audit ━━━")

    baseline = make_vector()
    base_score = compute_readiness_score(baseline)

    # Supervision independence up, task performance down
    delta = {"supervision_independence": +10, "task_performance": -10}
    new_vec, report = apply_observation_delta(baseline, delta)
    new_score = compute_readiness_score(new_vec)
    net_change = report["readiness_score_change"]

    # TP weight=0.30, SI weight=0.15 → net should be negative
    expected_sign = -10 * 0.30 + 10 * 0.15  # = -1.5
    print(f"  SI +10, TP -10: net score change = {net_change:+.2f} (expected ~{expected_sign:+.2f})")

    log("L4", "Net change is negative when higher-weight dim drops",
        net_change < 0,
        f"net={net_change:.2f}")
    log("L4", "Net change magnitude matches weight difference",
        abs(net_change - expected_sign) < 0.1,
        f"actual={net_change:.2f}, expected={expected_sign:.2f}")

    # All dims independent — changing one shouldn't affect another
    delta2 = {"consistency": +20}
    new_vec2, _ = apply_observation_delta(baseline, delta2)
    for dim in DIMENSION_KEYS:
        if dim != "consistency":
            log("L4", f"  +20 consistency doesn't move {dim}",
                new_vec2[dim] == baseline[dim],
                f"before={baseline[dim]}, after={new_vec2[dim]}")


# ──────────────────────────────────────────────────────────────
#  Layer 5: Vocational Alignment Robustness
# ──────────────────────────────────────────────────────────────

def test_vocational_alignment():
    print("\n━━━ Layer 5: Vocational Alignment Robustness ━━━")

    # Perfect match should have similarity ≈ 1.0
    teen = {k: 80.0 for k in DIMENSION_KEYS}
    job_perfect = [{"job_name": "Perfect", "job_vector": {k: 80.0 for k in DIMENSION_KEYS}}]
    result = match_jobs(teen, job_perfect)
    log("L5", "Perfect match similarity ≈ 1.0",
        result[0]["similarity"] > 0.999,
        f"sim={result[0]['similarity']}")

    # Mismatch on one dimension should reduce similarity
    job_a = {"job_name": "Job A", "job_vector": {k: 80.0 for k in DIMENSION_KEYS}}
    job_b = {"job_name": "Job B",
             "job_vector": {**{k: 80.0 for k in DIMENSION_KEYS}, "consistency": 20}}
    job_c = {"job_name": "Job C",
             "job_vector": {**{k: 80.0 for k in DIMENSION_KEYS}, "supervision_independence": 20}}

    results = match_jobs(teen, [job_a, job_b, job_c])
    sims = {r["job_name"]: r["similarity"] for r in results}
    print(f"  Similarities: A={sims['Job A']:.4f}, B={sims['Job B']:.4f}, C={sims['Job C']:.4f}")

    log("L5", "Perfect match ranks #1",
        sims["Job A"] > sims["Job B"] and sims["Job A"] > sims["Job C"])
    log("L5", "Single dimension mismatch is penalized",
        sims["Job B"] < sims["Job A"],
        f"A={sims['Job A']:.4f} > B={sims['Job B']:.4f}")

    # Gap analysis correctness
    gap = results[0]["gap_analysis"]
    for dim in DIMENSION_KEYS:
        expected_gap = 0.0  # teen=80, job=80
        actual_gap = gap[dim]["gap"]
        log("L5", f"  Gap {dim} = 0 for perfect match",
            abs(actual_gap - expected_gap) < 0.01,
            f"gap={actual_gap}")

    # Zero vector edge case
    zero_teen = {k: 0.0 for k in DIMENSION_KEYS}
    zero_result = match_jobs(zero_teen, job_perfect)
    log("L5", "Zero vector → similarity = 0 (no crash)",
        zero_result[0]["similarity"] == 0.0,
        f"sim={zero_result[0]['similarity']}")


# ──────────────────────────────────────────────────────────────
#  Layer 6: Explainability Stress Test
# ──────────────────────────────────────────────────────────────

def test_explainability():
    print("\n━━━ Layer 6: Explainability Stress Test ━━━")

    baseline = make_vector()
    delta = {"task_performance": +8, "behavioral_stability": -5, "consistency": +3}
    new_vec, report = apply_observation_delta(baseline, delta)

    # Change report must include all changed dimensions
    changes = report["dimension_changes"]
    print(f"  Delta applied: {delta}")
    print(f"  Score: {report['readiness_score_before']} → {report['readiness_score_after']}"
          f" ({report['readiness_score_change']:+.2f})")

    for dim, ch in changes.items():
        print(f"    {dim}: {ch['before']} → {ch['after']} ({ch['change']:+.1f})")

    log("L6", "Change report includes all modified dimensions",
        set(delta.keys()) == set(changes.keys()),
        f"expected={set(delta.keys())}, got={set(changes.keys())}")

    log("L6", "Change magnitudes match deltas",
        all(abs(changes[d]["change"] - delta[d]) < 0.01 for d in delta),
        "each dimension change matches applied delta")

    log("L6", "Unchanged dimensions not in report",
        "cognitive_adaptability" not in changes and
        "supervision_independence" not in changes)

    # Score breakdown adds up
    breakdown = compute_score_breakdown(new_vec)
    contrib_sum = sum(c["weighted"] for c in breakdown["contributions"].values())
    log("L6", "Breakdown contributions sum to total",
        abs(contrib_sum - breakdown["total"]) < 0.01,
        f"sum={contrib_sum:.2f}, total={breakdown['total']:.2f}")

    # Regression report always has reasons
    snapshots = [make_snapshot(baseline, 0)]
    risk = detect_regression_risk(snapshots)
    log("L6", "Single snapshot → Low risk with reason",
        risk["risk_level"] == "Low" and len(risk["reasons"]) > 0,
        f"reasons={risk['reasons']}")


# ──────────────────────────────────────────────────────────────
#  Summary
# ──────────────────────────────────────────────────────────────

def print_summary():
    print("\n" + "═" * 60)
    total = len(results)
    passed = sum(1 for _, _, p in results if p)
    failed = total - passed

    print(f"  TOTAL: {total}   PASS: {passed}   FAIL: {failed}")

    if failed > 0:
        print(f"\n  ❌ FAILED TESTS:")
        for layer, test, p in results:
            if not p:
                print(f"    [{layer}] {test}")

    print("═" * 60)
    return failed == 0


# ──────────────────────────────────────────────────────────────
#  Main
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    random.seed(42)  # reproducible

    print("=" * 60)
    print("  ARIE — Analysis Stress Test")
    print("=" * 60)

    # Layer 1
    test_weight_normalization()

    # Layer 2
    simulate_progression()
    simulate_regression()
    simulate_recovery()

    # Layer 3
    test_regression_scenarios()

    # Layer 4
    test_cross_impact()

    # Layer 5
    test_vocational_alignment()

    # Layer 6
    test_explainability()

    # Summary
    all_passed = print_summary()
    sys.exit(0 if all_passed else 1)
