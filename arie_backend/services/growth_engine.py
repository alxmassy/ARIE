"""
Growth Engine — Prescriptive intelligence layer.

Prioritizes interventions from the Intervention Library based on:
1. Potential dimension gain (distance from 100)
2. Negative trend slopes (bonus for declining dimensions)
3. Job unlock potential (if increasing a dimension bridges a deficit)
4. Regression mitigation
"""

from typing import List
from pydantic import BaseModel, Field

from utils.config import get_gemini_client, GEMINI_MODEL

class GrowthRecommendationSchema(BaseModel):
    rank: int = Field(description="The priority rank (1, 2, or 3).")
    dimension: str = Field(description="The exact dimension name being targeted (e.g. 'task_performance', 'consistency').")
    action: str = Field(description="The personalized, specific action step the staff should take this week.")
    reason: str = Field(description="Why this action helps, tying back to the numeric data or recent observations.")
    expected_dimension_gain: int = Field(description="Estimated point gain on this dimension (1 to 10).")
    expected_readiness_gain: float = Field(description="Estimated point gain on overall readiness (dimension gain * 0.20).")
    secondary_impact: str | None = Field(description="Optional note on secondary benefits, especially if it unlocks a job role.")

class GrowthPlanSchema(BaseModel):
    recommendations: list[GrowthRecommendationSchema]


def generate_growth_plan(
    current_vector: dict[str, int],
    trend_slopes: dict[str, float] | None,
    regression_risk: str,
    job_matches: list[dict],
    confidence_level: str,
    recent_observations: list[str]
) -> dict:
    """
    Generate prioritized interventions for a teen using a hybrid rule-based + AI approach.
    """
    if confidence_level == "Low":
        return {"recommendations": [], "message": "Insufficient data to generate a reliable growth plan."}

    # 1. MATHEMATICAL SCORING: Find "Unlock Targets"
    unlock_targets = {}
    if job_matches:
        for match in job_matches:
            if match.get("status") == "disqualified" and match.get("disqualification_reasons"):
                for reason in match["disqualification_reasons"]:
                    try:
                        dim = reason.split(" deficit")[0]
                        parts = reason.split("<")
                        current_val = int(parts[0].split("(")[1].strip())
                        required_val = int(parts[1].split(")")[0].strip())
                        deficit = required_val - current_val
                        
                        if 0 < deficit <= 10:
                            unlock_targets[dim] = match["job_name"]
                    except Exception:
                        continue

    # 2. MATHEMATICAL SCORING: Rank dimensions by need
    dimension_scores = []
    for dimension, score in current_vector.items():
        priority_score = float(100 - score)
        reasons = []
        secondary_impacts = []

        if trend_slopes and dimension in trend_slopes:
            slope = trend_slopes[dimension]
            if slope < -2.0:
                priority_score += abs(slope) * 2
                reasons.append(f"Declining trend ({slope:.1f} pts/wk)")

        if regression_risk == "High" and score < 50:
            priority_score += 15
            secondary_impacts.append("Mitigates acute regression risk")

        if dimension in unlock_targets:
            priority_score += 20
            secondary_impacts.append(f"May unlock {unlock_targets[dimension]} role")

        if not reasons:
            reasons.append(f"High potential for growth (current score: {score})")

        dimension_scores.append({
            "dimension": dimension,
            "current_score": score,
            "priority_score": priority_score,
            "math_reason": " + ".join(reasons),
            "math_secondary": " | ".join(secondary_impacts) if secondary_impacts else None
        })

    dimension_scores.sort(key=lambda x: x["priority_score"], reverse=True)
    top_3_targets = dimension_scores[:3]

    # 3. AI GENERATION: Use Gemini to write the prescriptive advice based on the math targets + observations
    client = get_gemini_client()
    if not client:
        return {"recommendations": [], "message": "Growth Engine AI unavailable."}

    prompt = f"""
You are the Personalized Growth Intelligence Engine (PGIE) for ARIE. 
Your job is to write EXACTLY 3 actionable, highly personalized intervention strategies for a teen.

We have already mathematically determined the top 3 priority dimensions you MUST focus on. 
They are:
1. Target Dimension: {top_3_targets[0]['dimension']} (Current Score: {top_3_targets[0]['current_score']})
   - Mathematical Reason: {top_3_targets[0]['math_reason']}
   - Secondary Impact: {top_3_targets[0]['math_secondary'] or "None"}
2. Target Dimension: {top_3_targets[1]['dimension']} (Current Score: {top_3_targets[1]['current_score']})
   - Mathematical Reason: {top_3_targets[1]['math_reason']}
   - Secondary Impact: {top_3_targets[1]['math_secondary'] or "None"}
3. Target Dimension: {top_3_targets[2]['dimension']} (Current Score: {top_3_targets[2]['current_score']})
   - Mathematical Reason: {top_3_targets[2]['math_reason']}
   - Secondary Impact: {top_3_targets[2]['math_secondary'] or "None"}

To personalize the advice, here are the recent observations made by staff about this teen:
{str(recent_observations) if recent_observations else "No recent observations available."}

INSTRUCTIONS:
- Generate 1 actionable recommendation per target dimension above (3 total).
- The `action` must be highly specific and actionable this week by a caregiver/trainer. Base it on the tone of the observations if available.
- The `reason` should combine the mathematical reason with context from the observations.
- The `expected_dimension_gain` should be a realistic estimate from 1 to 10.
- The `expected_readiness_gain` MUST equal `expected_dimension_gain * 0.20`.
- If a Secondary Impact is listed above (like unlocking a job), include it in `secondary_impact`. Otherwise, set it to null.
- CRITICAL: NO MATTER WHAT LANGUAGE THE OBSERVATIONS ARE WRITTEN IN, YOU MUST WRITE YOUR ENTIRE JSON RESPONSE IN ENGLISH.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": GrowthPlanSchema,
            "temperature": 0.2,
        },
    )

    if not response.text:
        return {"recommendations": [], "message": "Failed to generate growth plan."}

    # Load JSON and return directly (the schema ensures it matches what the frontend wants)
    import json
    return json.loads(response.text)

