"""
NLP Engine — Converts raw staff observation text into structured readiness deltas.

Uses Google Gemini with structured JSON output to guarantee schema compliance.
"""

import os
import json
import logging

from dotenv import load_dotenv
from google import genai
from google.genai import types
from typing_extensions import TypedDict

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in .env")

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Structured output schema — Gemini enforces this at the API level
# ---------------------------------------------------------------------------

class ObservationDelta(TypedDict):
    task_performance: float
    supervision_independence: float
    behavioral_stability: float
    cognitive_adaptability: float
    consistency: float
    reasoning_task_performance: str
    reasoning_supervision_independence: str
    reasoning_behavioral_stability: str
    reasoning_cognitive_adaptability: str
    reasoning_consistency: str


# ---------------------------------------------------------------------------
# System prompt — teaches Gemini the ARIE ontology
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are ARIE's NLP structuring module. Your job is to analyze staff observations about mildly intellectually disabled teens in vocational training and extract structured behavioral signals.

LANGUAGE SUPPORT:
- Observations may be written in English, Hindi (Devanagari), Hinglish (romanized Hindi mixed with English), or any combination.
- Regardless of the input language, analyze the behavioral content and output deltas and reasoning in English.
- Treat all languages equally — the language of input does not affect the analysis quality or delta magnitudes.

You must output delta values (changes) for exactly 5 readiness dimensions. Each delta should be a float between -20 and +20:
- Positive = improvement observed
- Negative = regression observed  
- 0 = no signal for this dimension

THE 5 DIMENSIONS:

1. task_performance: Measures execution reliability. Signals include:
   - Task completion accuracy and speed
   - Multi-step instruction adherence
   - Error frequency
   - Task endurance (time on task before fatigue)
   - Helping others complete tasks (implies strong personal mastery)

2. supervision_independence: Measures how much support was needed. Signals include:
   - Number of prompts/reminders needed
   - Whether guidance was physical or verbal
   - Unprompted initiative
   - Dependency on staff presence
   - Taking leadership or teaching roles (implies independence beyond expectations)

3. behavioral_stability: Measures emotional regulation and social behavior. Signals include:
   - Escalation incidents (outbursts, refusals)
   - Emotional fluctuations
   - Recovery time after upset
   - Peer interaction quality (helping, cooperating, sitting calmly)
   - Prosocial behaviors like volunteering, cleaning up, or assisting others
   - Absence of conflict or disruption

4. cognitive_adaptability: Measures learning flexibility and knowledge transfer. Signals include:
   - Task-switching behavior
   - Instruction retention from previous sessions
   - Learning speed for new tasks
   - Repetition requirements
   - Teaching or explaining things to others (implies deep understanding)
   - Applying skills in new contexts (e.g., cleaning up without being asked after learning it in a different setting)

5. consistency: Measures routine adherence and reliability. Signals include:
   - Attendance signals
   - Punctuality
   - Routine following
   - Day-to-day reliability
   - Completing tasks from start to finish without drifting
   - Showing up ready to work, staying engaged throughout

CRITICAL RULES FOR HOLISTIC ANALYSIS:

- THINK HOLISTICALLY. Most real behaviors touch MULTIPLE dimensions simultaneously. A single observation rarely affects only one dimension.
- Look for IMPLIED signals, not just explicit keywords. For example:
  - "Helped peers during the activity" implies: task_performance (mastery), behavioral_stability (prosocial), and possibly cognitive_adaptability (flexible application).
  - "Did everything on his own and taught new children" implies: supervision_independence (autonomous), cognitive_adaptability (teaching = knowledge transfer), and task_performance (competence).
  - "Sat quietly and focused during class" implies: behavioral_stability (regulated), consistency (routine adherence), and task_performance (engaged).
  - "Cleaned up after the activity without being asked" implies: supervision_independence (initiative), behavioral_stability (cooperative), and consistency (routine completion).
- When a behavior CLEARLY indicates strength across multiple areas, assign appropriate deltas to ALL relevant dimensions. Do not leave a dimension at 0 if the observation reasonably implies growth or regression in that area.
- Be proportional: the primary dimension mentioned gets the largest delta, secondary dimensions get smaller but non-zero deltas.
- Typical distribution: primary signal +5 to +10, secondary implied signals +2 to +5.
- Only use larger deltas (-10 to -20 or +10 to +20) for clearly significant events.
- For each dimension, provide a brief reasoning explaining WHY you assigned that delta, including any inferred signals.
- Focus on OBSERVABLE BEHAVIORS, not interpretations.
- This is NOT a diagnostic tool. Do not make medical inferences."""


def extract_structured_delta(raw_text: str) -> dict | None:
    """
    Send observation text to Gemini and extract structured readiness deltas.

    Returns:
        {
            "deltas": {
                "task_performance": float,
                "supervision_independence": float,
                "behavioral_stability": float,
                "cognitive_adaptability": float,
                "consistency": float,
            },
            "reasoning": {
                "task_performance": str,
                "supervision_independence": str,
                "behavioral_stability": str,
                "cognitive_adaptability": str,
                "consistency": str,
            }
        }

    Returns None if extraction fails.
    """
    try:
        result = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"Analyze this staff observation and extract behavioral deltas:\n\n\"{raw_text}\"",
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=ObservationDelta,
                temperature=0.2,  # low temperature for consistency
            ),
        )

        parsed = json.loads(result.text)

        # Separate deltas and reasoning, clamp deltas to [-20, +20]
        dimension_keys = [
            "task_performance",
            "supervision_independence",
            "behavioral_stability",
            "cognitive_adaptability",
            "consistency",
        ]

        deltas = {}
        reasoning = {}

        for dim in dimension_keys:
            raw_delta = parsed.get(dim, 0)
            deltas[dim] = max(-20.0, min(20.0, float(raw_delta)))
            reasoning[dim] = parsed.get(f"reasoning_{dim}", "No reasoning provided")

        return {
            "deltas": deltas,
            "reasoning": reasoning,
        }

    except Exception as e:
        logger.error(f"NLP extraction failed: {e}")
        return None
