"""
ARIE Configuration — Single source of truth for all weights, thresholds, and lookup tables.

All values derived from Ontology.md specification.
No magic numbers should exist outside this file.
"""

# ---------------------------------------------------------------------------
# Dimension Keys (canonical order for vector operations)
# ---------------------------------------------------------------------------
DIMENSION_KEYS = [
    "task_performance",
    "supervision_independence",
    "behavioral_stability",
    "cognitive_adaptability",
    "consistency",
]

# ---------------------------------------------------------------------------
# Final Readiness Score Weights (Section 4 of Ontology)
# ---------------------------------------------------------------------------
READINESS_WEIGHTS = {
    "task_performance": 0.30,
    "supervision_independence": 0.15,
    "behavioral_stability": 0.25,
    "cognitive_adaptability": 0.20,
    "consistency": 0.10,
}

# ---------------------------------------------------------------------------
# Subcomponent Weights (Section 3 of Ontology)
# ---------------------------------------------------------------------------
TASK_PERFORMANCE_WEIGHTS = {
    "completion_accuracy": 0.35,
    "multi_step_adherence": 0.25,
    "error_frequency": 0.20,
    "task_endurance": 0.20,
}

BEHAVIORAL_STABILITY_WEIGHTS = {
    "escalation_frequency": 0.30,
    "recovery_speed": 0.25,
    "emotional_volatility": 0.25,
    "peer_interaction": 0.20,
}

COGNITIVE_ADAPTABILITY_WEIGHTS = {
    "task_switch_latency": 0.30,
    "instruction_retention": 0.30,
    "learning_velocity": 0.20,
    "repetition_requirement": 0.20,
}

CONSISTENCY_WEIGHTS = {
    "attendance": 0.50,
    "on_time": 0.30,
    "routine_stability": 0.20,
}

# ---------------------------------------------------------------------------
# Normalization Lookup Tables (Section 3 of Ontology)
# Defined as sorted list of (threshold, score) tuples.
# Each function checks value against thresholds in order.
# ---------------------------------------------------------------------------

# Error Frequency: errors per session → score
ERROR_FREQUENCY_TABLE = [
    (0, 100),
    (1, 85),
    (2, 70),
    (3, 55),
]
ERROR_FREQUENCY_DEFAULT = 40  # 4+ errors

# Task Endurance: minutes sustained → score
ENDURANCE_TABLE = [
    (10, 30),   # <10
    (20, 50),   # 10-20
    (40, 75),   # 20-40
]
ENDURANCE_DEFAULT = 100  # 40+

# Escalation Frequency: incidents per week → score
ESCALATION_TABLE = [
    (0, 100),
    (1, 80),
    (2, 60),
]
ESCALATION_DEFAULT = 40  # 3+

# Recovery Speed: minutes to recover → score
RECOVERY_TABLE = [
    (5, 100),   # <5
    (10, 80),   # 5-10
    (20, 60),   # 10-20
]
RECOVERY_DEFAULT = 40  # >20

# Task-Switch Latency: seconds to switch → score
TASK_SWITCH_TABLE = [
    (10, 100),  # <10
    (30, 80),   # 10-30
    (60, 60),   # 30-60
]
TASK_SWITCH_DEFAULT = 40  # >60

# Supervision Independence: level 0-4 → (level / 4) * 100
SUPERVISION_MAX_LEVEL = 4

# ---------------------------------------------------------------------------
# Regression Detection Thresholds (Section 7 of Ontology)
# ---------------------------------------------------------------------------
REGRESSION_THRESHOLDS = {
    "high": {
        "readiness_drop_percent": 12.0,   # over 2 consecutive weeks
        "readiness_drop_weeks": 2,
        "behavioral_stability_drop_percent": 15.0,
    },
    "medium": {
        "readiness_drop_percent": 6.0,    # single week
        "supervision_independence_drop_percent": 15.0,
    },
}

# ---------------------------------------------------------------------------
# Temporal Engine Settings
# ---------------------------------------------------------------------------
ROLLING_AVERAGE_WINDOW = 3  # weeks
TREND_WINDOW = 4            # weeks for slope detection

# ---------------------------------------------------------------------------
# Default Job Profiles (Section 8 of Ontology)
# Each profile is a dict matching DIMENSION_KEYS
# ---------------------------------------------------------------------------
DEFAULT_JOB_PROFILES = [
    {
        "job_name": "Packaging Assistant",
        "job_vector": {
            "task_performance": 80,
            "supervision_independence": 75,
            "behavioral_stability": 70,
            "cognitive_adaptability": 50,
            "consistency": 85,
        },
    },
    {
        "job_name": "Data Entry Clerk",
        "job_vector": {
            "task_performance": 70,
            "supervision_independence": 60,
            "behavioral_stability": 85,
            "cognitive_adaptability": 80,
            "consistency": 95,
        },
    },
    {
        "job_name": "Cleaning & Maintenance",
        "job_vector": {
            "task_performance": 75,
            "supervision_independence": 70,
            "behavioral_stability": 65,
            "cognitive_adaptability": 40,
            "consistency": 90,
        },
    },
    {
        "job_name": "Sorting & Inventory",
        "job_vector": {
            "task_performance": 85,
            "supervision_independence": 65,
            "behavioral_stability": 60,
            "cognitive_adaptability": 70,
            "consistency": 80,
        },
    },
]

# ---------------------------------------------------------------------------
# Default Baseline Vector (for new teens with no prior data)
# ---------------------------------------------------------------------------
DEFAULT_BASELINE_VECTOR = {
    "task_performance": 50.0,
    "supervision_independence": 50.0,
    "behavioral_stability": 50.0,
    "cognitive_adaptability": 50.0,
    "consistency": 50.0,
}
