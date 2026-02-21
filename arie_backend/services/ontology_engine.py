"""
Ontology Engine — Normalization layer for ARIE.

Converts raw observation subcomponent values into normalized dimension scores
using the lookup tables and weights defined in config.py.

All functions are pure — no DB, no side effects.
"""

from utils.config import (
    BEHAVIORAL_STABILITY_WEIGHTS,
    COGNITIVE_ADAPTABILITY_WEIGHTS,
    CONSISTENCY_WEIGHTS,
    ENDURANCE_DEFAULT,
    ENDURANCE_TABLE,
    ERROR_FREQUENCY_DEFAULT,
    ERROR_FREQUENCY_TABLE,
    ESCALATION_DEFAULT,
    ESCALATION_TABLE,
    RECOVERY_DEFAULT,
    RECOVERY_TABLE,
    SUPERVISION_MAX_LEVEL,
    TASK_PERFORMANCE_WEIGHTS,
    TASK_SWITCH_DEFAULT,
    TASK_SWITCH_TABLE,
)


# ---------------------------------------------------------------------------
# Generic bracket normalizer
# ---------------------------------------------------------------------------

def _normalize_bracket(value: float, table: list[tuple], default: float) -> float:
    """
    Normalize a raw value using a bracket lookup table.

    Table format: list of (upper_bound_exclusive, score).
    If value is below a bracket's upper bound, return that score.
    If no bracket matches, return the default.
    """
    for threshold, score in table:
        if value < threshold:
            return float(score)
    return float(default)


def _normalize_bracket_exact(value: int, table: list[tuple], default: float) -> float:
    """
    Normalize using exact-match lookup (for discrete counts like errors).

    Table format: list of (exact_value, score).
    Falls back to default if no match.
    """
    for exact, score in table:
        if value == exact:
            return float(score)
    return float(default)


# ---------------------------------------------------------------------------
# Individual normalization functions
# ---------------------------------------------------------------------------

def normalize_error_frequency(errors: int) -> float:
    """Errors per session → score (0-100). 0 errors = 100, 4+ = 40."""
    return _normalize_bracket_exact(errors, ERROR_FREQUENCY_TABLE, ERROR_FREQUENCY_DEFAULT)


def normalize_endurance(minutes: float) -> float:
    """Minutes sustained on task → score (0-100). <10 = 30, 40+ = 100."""
    return _normalize_bracket(minutes, ENDURANCE_TABLE, ENDURANCE_DEFAULT)


def normalize_escalation(incidents: int) -> float:
    """Escalation incidents per week → score (0-100). 0 = 100, 3+ = 40."""
    return _normalize_bracket_exact(incidents, ESCALATION_TABLE, ESCALATION_DEFAULT)


def normalize_recovery(minutes: float) -> float:
    """Minutes to recover from escalation → score (0-100). <5 = 100, >20 = 40."""
    return _normalize_bracket(minutes, RECOVERY_TABLE, RECOVERY_DEFAULT)


def normalize_task_switch(seconds: float) -> float:
    """Seconds to switch task → score (0-100). <10 = 100, >60 = 40."""
    return _normalize_bracket(seconds, TASK_SWITCH_TABLE, TASK_SWITCH_DEFAULT)


def normalize_supervision(level: int) -> float:
    """
    Supervision independence level (0-4) → score (0-100).

    0 = fully dependent (0), 4 = fully independent (100).
    """
    clamped = max(0, min(SUPERVISION_MAX_LEVEL, level))
    return (clamped / SUPERVISION_MAX_LEVEL) * 100.0


# ---------------------------------------------------------------------------
# Composite dimension score computation
# ---------------------------------------------------------------------------

def _weighted_sum(subcomponents: dict, weights: dict) -> float:
    """
    Compute a weighted sum of subcomponent scores.

    Subcomponents not present in the input default to 0.
    All subcomponent values are expected to be 0-100.
    """
    total = 0.0
    for key, weight in weights.items():
        total += subcomponents.get(key, 0.0) * weight
    return total


def compute_task_performance(subcomponents: dict) -> float:
    """
    Compute Task Performance dimension score.

    Expected subcomponents:
        completion_accuracy, multi_step_adherence, error_frequency, task_endurance
    All should be pre-normalized to 0-100.
    """
    return _weighted_sum(subcomponents, TASK_PERFORMANCE_WEIGHTS)


def compute_behavioral_stability(subcomponents: dict) -> float:
    """
    Compute Behavioral Stability dimension score.

    Expected subcomponents:
        escalation_frequency, recovery_speed, emotional_volatility, peer_interaction
    All should be pre-normalized to 0-100.
    """
    return _weighted_sum(subcomponents, BEHAVIORAL_STABILITY_WEIGHTS)


def compute_cognitive_adaptability(subcomponents: dict) -> float:
    """
    Compute Cognitive Adaptability dimension score.

    Expected subcomponents:
        task_switch_latency, instruction_retention, learning_velocity, repetition_requirement
    All should be pre-normalized to 0-100.
    """
    return _weighted_sum(subcomponents, COGNITIVE_ADAPTABILITY_WEIGHTS)


def compute_consistency(subcomponents: dict) -> float:
    """
    Compute Consistency & Reliability dimension score.

    Expected subcomponents:
        attendance, on_time, routine_stability
    All should be pre-normalized to 0-100.
    """
    return _weighted_sum(subcomponents, CONSISTENCY_WEIGHTS)


# ---------------------------------------------------------------------------
# Dimension dispatcher
# ---------------------------------------------------------------------------

_DIMENSION_COMPUTERS = {
    "task_performance": compute_task_performance,
    "behavioral_stability": compute_behavioral_stability,
    "cognitive_adaptability": compute_cognitive_adaptability,
    "consistency": compute_consistency,
}


def compute_dimension_score(dimension: str, subcomponents: dict) -> float:
    """
    Compute a dimension score by name.

    For supervision_independence, pass the raw level (0-4) as
    subcomponents={"level": N} — it uses normalize_supervision directly.

    For all other dimensions, subcomponents should contain pre-normalized
    values for each sub-axis.
    """
    if dimension == "supervision_independence":
        return normalize_supervision(subcomponents.get("level", 0))

    computer = _DIMENSION_COMPUTERS.get(dimension)
    if computer is None:
        raise ValueError(f"Unknown dimension: {dimension}")

    return computer(subcomponents)
