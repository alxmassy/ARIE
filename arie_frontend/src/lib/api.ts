/**
 * ARIE API client — typed fetch wrapper for the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`API error ${res.status}: ${error}`);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;
    return res.json();
}

/* ================================================================
   Types
   ================================================================ */

export interface ReadinessVector {
    task_performance: number;
    supervision_independence: number;
    behavioral_stability: number;
    cognitive_adaptability: number;
    consistency: number;
}

export interface Teen {
    id: string;
    name: string;
    age: number;
    baseline_vector: ReadinessVector;
    created_at: string;
}

export interface Observation {
    id: string;
    teen_id: string;
    raw_text: string;
    structured_delta: Record<string, number> | null;
    created_at: string;
}

export interface DimensionChange {
    before: number;
    after: number;
    change: number;
}

export interface ChangeReport {
    readiness_score_before: number;
    readiness_score_after: number;
    readiness_score_change: number;
    dimension_changes: Record<string, DimensionChange>;
}

export interface ObservationResult {
    observation: Observation;
    delta_source: "manual" | "nlp" | "none";
    nlp_reasoning: Record<string, string> | null;
    change_report: ChangeReport | null;
}

export interface DashboardTeen {
    id: string;
    name: string;
    age: number;
    readiness_score: number;
    regression_risk: "Low" | "Medium" | "High";
    trend: string;
    sparkline: number[];
}

export interface GapDetail {
    teen: number;
    required: number;
    gap: number;
}

export interface PenalizedDimension {
    deficit: number;
    excess: number;
    penalty: number;
}

export interface JobMatch {
    job_name: string;
    similarity: number;
    similarity_percent: number;
    effective_similarity: number;
    effective_percent: number;
    penalty: number;
    disqualified: boolean;
    disqualified_dimensions: string[];
    penalized_dimensions: Record<string, PenalizedDimension>;
    gap_analysis: Record<string, GapDetail>;
}

export interface ScoreBreakdown {
    total: number;
    contributions: Record<
        string,
        { raw: number; weight: number; weighted: number }
    >;
}

export interface Confidence {
    confidence: "Low" | "Medium" | "High";
    confidence_score: number;
    confidence_reason: string;
    factors: {
        temporal: number;
        stability: number;
        observation_frequency: number;
    };
}

export interface TeenDetail {
    id: string;
    name: string;
    age: number;
    current_vector: ReadinessVector;
    score_breakdown: ScoreBreakdown;
    regression: { risk_level: string; reasons: string[] };
    confidence: Confidence;
    trend: string;
    rolling_average: number | null;
    job_matches: JobMatch[];
    timeline: {
        week_number: number;
        readiness_score: number;
        readiness_vector: ReadinessVector;
        regression_risk: string;
    }[];
}

export interface SnapshotResult {
    snapshot: {
        id: string;
        teen_id: string;
        week_number: number;
        readiness_vector: ReadinessVector;
        readiness_score: number;
        regression_risk: string;
        created_at: string;
    };
    regression: { risk_level: string; reasons: string[] };
}

export interface GrowthRecommendation {
    rank: number;
    dimension: string;
    action: string;
    reason: string;
    expected_dimension_gain: number;
    expected_readiness_gain: number;
    secondary_impact: string | null;
}

export interface GrowthPlan {
    recommendations: GrowthRecommendation[];
    message?: string;
}

/* ================================================================
   API Methods
   ================================================================ */

// Teens
export const getTeens = () => apiFetch<Teen[]>("/teens");

export const createTeen = (data: {
    name: string;
    age: number;
    baseline_vector?: ReadinessVector;
}) => apiFetch<Teen>("/teens", { method: "POST", body: JSON.stringify(data) });

export const deleteTeen = (id: string) =>
    apiFetch<void>(`/teens/${id}`, { method: "DELETE" });

// Observations
export const createObservation = (data: {
    teen_id: string;
    raw_text: string;
    structured_delta?: Record<string, number>;
}) =>
    apiFetch<ObservationResult>("/observations", {
        method: "POST",
        body: JSON.stringify(data),
    });

export const getObservations = (teenId: string) =>
    apiFetch<Observation[]>(`/observations/${teenId}`);

// Dashboard
export const getDashboardOverview = () =>
    apiFetch<DashboardTeen[]>("/dashboard/overview");

export const getTeenDetail = (id: string) =>
    apiFetch<TeenDetail>(`/dashboard/teen/${id}`);

export const createSnapshot = (teenId: string) =>
    apiFetch<SnapshotResult>(`/dashboard/snapshot/${teenId}`, {
        method: "POST",
    });

export const getGrowthPlan = (teenId: string) => 
    apiFetch<GrowthPlan>(`/dashboard/teen/${teenId}/growth-plan`);

// Transcription (audio upload — cannot use apiFetch since it's multipart)
export async function transcribeAudio(
    audioBlob: Blob,
    lang: "en" | "hi"
): Promise<{ text: string; error?: string }> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const res = await fetch(`${API_BASE}/api/transcribe?lang=${lang}`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Transcription failed: ${error}`);
    }

    return res.json();
}
