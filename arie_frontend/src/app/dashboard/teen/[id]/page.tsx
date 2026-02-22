"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getTeenDetail,
    getObservations,
    createSnapshot,
    deleteTeen,
    getGrowthPlan,
    type TeenDetail,
    type Observation,
    type GrowthPlan,
    type Trajectory,
    type EarlySupport,
    type SupportSensitivityItem,
} from "@/lib/api";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const DIMENSION_LABELS: Record<string, string> = {
    task_performance: "Task Performance",
    supervision_independence: "Supervision Independence",
    behavioral_stability: "Behavioral Stability",
    cognitive_adaptability: "Cognitive Adaptability",
    consistency: "Consistency",
};

const DIMENSION_SHORT: Record<string, string> = {
    task_performance: "Task Perf.",
    supervision_independence: "Supervision",
    behavioral_stability: "Stability",
    cognitive_adaptability: "Adaptability",
    consistency: "Consistency",
};

const statusLabel = (risk: string) => {
    switch (risk) {
        case "High":
            return { text: "Needs Attention", cls: "badge-attention" };
        case "Medium":
            return { text: "Steady", cls: "badge-steady" };
        default:
            return { text: "Stable", cls: "badge-stable" };
    }
};

const trendDescription = (trend: string, score: number, rollingAvg: number | null | undefined) => {
    const formatted = score.toFixed(1);
    if (trend === "growth") {
        return `Readiness is improving — currently at ${formatted}.`;
    }
    if (trend === "decline") {
        return `Readiness has been declining — currently at ${formatted}. Review recent observations.`;
    }
    if (rollingAvg !== null && rollingAvg !== undefined && !isNaN(rollingAvg)) {
        return `Readiness is holding steady around ${Number(rollingAvg).toFixed(1)}.`;
    }
    return `Current readiness score is ${formatted}.`;
};

const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export default function TeenDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teenId = params.id as string;

    const [detail, setDetail] = useState<TeenDetail | null>(null);
    const [observations, setObservations] = useState<Observation[]>([]);
    const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [snapshotting, setSnapshotting] = useState(false);

    const fetchData = async () => {
        try {
            const [d, obs, plan] = await Promise.all([
                getTeenDetail(teenId),
                getObservations(teenId),
                getGrowthPlan(teenId),
            ]);
            setDetail(d);
            setObservations(obs);
            setGrowthPlan(plan);
        } catch (e) {
            console.error("Failed to load teen detail:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [teenId]);

    const handleSnapshot = async () => {
        setSnapshotting(true);
        try {
            await createSnapshot(teenId);
            await fetchData();
        } catch (e) {
            console.error("Failed to create snapshot:", e);
        } finally {
            setSnapshotting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Remove this participant and all their data?")) return;
        try {
            await deleteTeen(teenId);
            router.push("/");
        } catch (e) {
            console.error("Failed to delete:", e);
        }
    };

    if (loading || !detail) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                }}
            >
                <div className="spinner" />
            </div>
        );
    }

    // Radar data
    const radarData = Object.entries(detail.current_vector).map(
        ([key, value]) => ({
            dimension: DIMENSION_SHORT[key] || key,
            value: value as number,
            fullMark: 100,
        })
    );

    // Timeline data
    const timelineData = detail.timeline.map((s) => ({
        week: `W${s.week_number}`,
        score: s.readiness_score,
    }));

    const status = statusLabel(detail.regression.risk_level);
    const scoreVal = detail.score_breakdown.total;
    const scoreClr =
        scoreVal >= 55
            ? "var(--color-positive)"
            : scoreVal >= 35
                ? "var(--color-warning)"
                : "var(--color-danger)";

    return (
        <div>
            {/* Back */}
            <button
                onClick={() => router.push("/dashboard")}
                style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    marginBottom: 16,
                    padding: 0,
                }}
            >
                ← Back to Overview
            </button>

            {/* ── Hero Section ── */}
            <div
                className="card"
                style={{
                    marginBottom: 28,
                    padding: "32px 36px",
                }}
            >
                {/* Top row: identity + actions */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 24,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div className="avatar" style={{ width: 56, height: 56, fontSize: "1.3rem" }}>
                            {getInitials(detail.name)}
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: "1.75rem",
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                    marginBottom: 2,
                                }}
                            >
                                {detail.name}
                            </h1>
                            <span
                                style={{
                                    fontSize: "0.875rem",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Age {detail.age}
                            </span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            className="btn-primary"
                            onClick={handleSnapshot}
                            disabled={snapshotting}
                        >
                            {snapshotting ? "Saving..." : "Take Snapshot"}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={handleDelete}
                            style={{ color: "var(--color-danger)" }}
                        >
                            Remove
                        </button>
                    </div>
                </div>

                {/* Hero stats row: big score + status/confidence + narrative */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 36,
                    }}
                >
                    {/* Big score — emotional anchor */}
                    <div style={{ textAlign: "center", minWidth: 140 }}>
                        <div
                            className="score-display"
                            style={{ fontSize: "4rem", color: scoreClr, lineHeight: 1, letterSpacing: "-0.03em" }}
                        >
                            {scoreVal.toFixed(1)}
                        </div>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-secondary)",
                                marginTop: 6,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Readiness Score
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 1, height: 64, background: "var(--color-border)" }} />

                    {/* Status + Confidence + narrative */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                            <span className={`badge ${status.cls}`}>{status.text}</span>
                            {detail.confidence && (
                                <span className="badge-confidence">
                                    {detail.confidence.confidence === "High" ? "●" :
                                        detail.confidence.confidence === "Medium" ? "◐" : "○"}
                                    {" "}{detail.confidence.confidence} Confidence
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: "1rem", lineHeight: 1.6, marginBottom: 4 }}>
                            {trendDescription(detail.trend, scoreVal, detail.rolling_average)}
                        </p>
                        {detail.confidence && (
                            <p
                                style={{
                                    fontSize: "0.8125rem",
                                    color: "var(--color-text-secondary)",
                                    marginTop: 4,
                                }}
                            >
                                {detail.confidence.confidence_reason}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Section: Recommended Focus Areas (Growth Plan) ── */}
            {growthPlan && growthPlan.recommendations.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div className="section-title">
                        {detail.early_support?.active
                            ? "Priority Focus This Week"
                            : detail.trajectory?.direction === "Stable"
                                ? "Sustained Growth Plan"
                                : "Recommended Focus Areas (This Week)"}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {growthPlan.recommendations.map((rec) => (
                            <div
                                key={rec.rank}
                                className="card"
                                style={{
                                    padding: "20px 24px",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    borderTop: "4px solid var(--color-accent)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        marginBottom: 12,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.06em",
                                            fontWeight: 700,
                                            color: "var(--color-accent)",
                                        }}
                                    >
                                        Priority {rec.rank}
                                    </span>
                                    <span
                                        className="data-mono"
                                        style={{
                                            fontSize: "0.875rem",
                                            color: "var(--color-positive)",
                                            fontWeight: 700,
                                        }}
                                    >
                                        +{rec.expected_readiness_gain.toFixed(1)} Pts
                                    </span>
                                </div>
                                
                                <h3 style={{ fontSize: "1rem", lineHeight: 1.4, marginBottom: 8 }}>
                                    {rec.action}
                                </h3>

                                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: 16 }}>
                                    Targets <strong>{DIMENSION_LABELS[rec.dimension] || rec.dimension}</strong>
                                </div>

                                <div style={{ marginTop: "auto" }}>
                                    <div
                                        style={{
                                            background: "rgba(91, 138, 114, 0.08)",
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            fontSize: "0.8125rem",
                                            lineHeight: 1.5,
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        <strong>Why:</strong> {rec.reason}
                                    </div>
                                    
                                    {rec.secondary_impact && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: rec.secondary_impact.includes("unlock") ? "var(--color-positive)" : "var(--color-text-secondary)",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6,
                                            }}
                                        >
                                            <span style={{ fontSize: "1rem" }}>✨</span> {rec.secondary_impact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            

            {/* ── Support Trajectory (ESTE) ── */}
            {detail.trajectory && (
                <div className="card" style={{ marginBottom: 28, padding: "28px 32px" }}>
                    <div className="section-title">Support Trajectory</div>

                    {/* Badges row */}
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                        {/* Direction badge */}
                        <span
                            style={{
                                padding: "4px 14px",
                                borderRadius: 20,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "white",
                                background:
                                    detail.trajectory.direction === "Improving"
                                        ? "var(--color-positive)"
                                        : detail.trajectory.direction === "Needs Attention"
                                            ? "var(--color-warning)"
                                            : "var(--color-text-secondary)",
                            }}
                        >
                            {detail.trajectory.direction === "Improving" ? "↑" : detail.trajectory.direction === "Needs Attention" ? "↓" : "→"}{" "}
                            {detail.trajectory.direction}
                        </span>

                        {/* Stability badge */}
                        <span
                            style={{
                                padding: "4px 14px",
                                borderRadius: 20,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                color: detail.trajectory.stability === "Unstable" ? "var(--color-warning)" : "var(--color-text-secondary)",
                            }}
                        >
                            {detail.trajectory.direction === "Needs Attention" && detail.trajectory.stability === "High"
                                ? "Consistent Pattern"
                                : detail.trajectory.direction === "Improving" && detail.trajectory.stability === "High"
                                    ? "Steady Progress"
                                    : `${detail.trajectory.stability} Stability`}
                        </span>

                        {/* Confidence badge */}
                        <span
                            style={{
                                padding: "4px 14px",
                                borderRadius: 20,
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                border: "1px solid var(--color-border)",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {detail.trajectory.confidence} Confidence · {detail.trajectory.weeks_analyzed}w data
                        </span>
                    </div>

                    {/* Narrative */}
                    <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: 16, color: "var(--color-text)" }}>
                        {detail.trajectory.narrative}
                    </p>

                    {/* Early Support Window banner */}
                    {detail.early_support?.active && (
                        <div
                            style={{
                                padding: "14px 18px",
                                borderRadius: 12,
                                background: "rgba(245, 158, 11, 0.08)",
                                border: "1px solid rgba(245, 158, 11, 0.25)",
                                marginBottom: 20,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                            }}
                        >
                            <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>⚡</span>
                            <div>
                                <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-warning)", marginBottom: 4 }}>
                                    Early Support Window Active
                                </div>
                                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                                    {detail.early_support.trigger_reason}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support Sensitivity */}
                    {detail.support_sensitivity && detail.support_sensitivity.length > 0 && (
                        <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-accent)", marginBottom: 12 }}>
                                Support Effectiveness by Dimension
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {detail.support_sensitivity.map((item) => {
                                    const maxImpact = detail.support_sensitivity[0]?.delta_impact || 1;
                                    const pct = Math.round((item.delta_impact / maxImpact) * 100);
                                    const dimLabel = ({
                                        task_performance: "Task Performance",
                                        supervision_independence: "Supervision Independence",
                                        behavioral_stability: "Behavioral Stability",
                                        cognitive_adaptability: "Cognitive Adaptability",
                                        consistency: "Consistency",
                                    } as Record<string, string>)[item.dimension] || item.dimension;

                                    return (
                                        <div key={item.dimension}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{dimLabel}</span>
                                                <span className="data-mono" style={{ fontSize: "0.75rem", color: "var(--color-accent)" }}>
                                                    +{item.delta_impact.toFixed(2)} pts
                                                </span>
                                            </div>
                                            <div style={{ height: 6, borderRadius: 3, background: "var(--color-bg)" }}>
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        borderRadius: 3,
                                                        width: `${pct}%`,
                                                        background: "var(--color-accent)",
                                                        transition: "width 0.4s ease",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Section 2: Current Strength Profile + Timeline ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    marginBottom: 24,
                }}
            >
                <div className="card" style={{ padding: "16px 20px" }}>
                    <div className="section-title">Current Strength Profile</div>
                    <ResponsiveContainer width="100%" height={360}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                            <PolarGrid stroke="var(--color-border)" />
                            <PolarAngleAxis
                                dataKey="dimension"
                                tick={{
                                    fontSize: 11,
                                    fill: "var(--color-text-secondary)",
                                }}
                            />
                            <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={false} // Removed inner tick numbers completely to avoid overlap 
                                axisLine={false}
                            />
                            <Radar
                                name="Readiness"
                                dataKey="value"
                                stroke="#5B8A72"
                                fill="#5B8A72"
                                fillOpacity={0.12}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Score Timeline */}
                <div className="card" style={{ padding: "16px 20px" }}>
                    <div className="section-title">Progress Over Time</div>
                    {timelineData.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 360,
                                color: "var(--color-text-secondary)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No snapshots yet — take one to begin tracking progress
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={360}>
                            <LineChart data={timelineData}>
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="var(--color-border)"
                                />
                                <XAxis
                                    dataKey="week"
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--color-text-secondary)",
                                    }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{
                                        fontSize: 11,
                                        fill: "var(--color-text-secondary)",
                                    }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--color-surface)",
                                        border: "1px solid var(--color-border)",
                                        borderRadius: 12,
                                        fontSize: "0.8125rem",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#5B8A72"
                                    strokeWidth={2.5}
                                    dot={{
                                        fill: "#5B8A72",
                                        r: 4,
                                        strokeWidth: 0,
                                    }}
                                    activeDot={{ r: 6, fill: "#5B8A72" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Dimension Breakdown ── */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="section-title">Areas Showing Growth</div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: 16,
                    }}
                >
                    {Object.entries(
                        detail.score_breakdown.contributions
                    ).map(([dim, contrib]) => (
                        <div
                            key={dim}
                            style={{
                                textAlign: "center",
                                padding: "16px 8px",
                                borderRadius: 14,
                                background: "var(--color-bg)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-text-secondary)",
                                    marginBottom: 6,
                                }}
                            >
                                {DIMENSION_SHORT[dim] || dim}
                            </div>
                            <div
                                className="score-display"
                                style={{ fontSize: "1.5rem", marginBottom: 4 }}
                            >
                                {(contrib.raw as number).toFixed(0)}
                            </div>
                            <div
                                className="data-mono"
                                style={{
                                    fontSize: "0.6875rem",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                ×{(contrib.weight as number).toFixed(2)} ={" "}
                                {(contrib.weighted as number).toFixed(1)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Section 3: Suitable Training Pathways ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                }}
            >
                <div className="card">
                    <div className="section-title">Suitable Training Pathways</div>
                    {detail.job_matches.length === 0 ? (
                        <p className="status-line">
                            No training profiles available yet.
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {detail.job_matches.map((job) => {
                                const pct = job.effective_percent ?? job.similarity_percent;
                                const isDisqualified = job.disqualified;
                                const matchClr =
                                    pct >= 80
                                        ? "var(--color-positive)"
                                        : pct >= 60
                                            ? "var(--color-warning)"
                                            : "var(--color-danger)";

                                return (
                                    <div
                                        key={job.job_name}
                                        className={isDisqualified ? "row-disqualified" : ""}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "12px 16px",
                                            borderRadius: 14,
                                            background: "var(--color-bg)",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                {job.job_name}
                                            </div>
                                            {isDisqualified && (
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-danger)",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    Requires further development
                                                </div>
                                            )}
                                            {!isDisqualified && job.penalty > 0 && (
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "var(--color-warning)",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    Some skill gaps identified
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className="data-mono"
                                            style={{
                                                fontSize: "1rem",
                                                fontWeight: 700,
                                                color: matchClr,
                                            }}
                                        >
                                            {pct.toFixed(0)}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Observations ── */}
                <div className="card">
                    <div className="section-title">
                        Recent Observations ({observations.length})
                    </div>
                    {observations.length === 0 ? (
                        <p className="status-line">
                            No observations recorded yet.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                                maxHeight: 400,
                                overflowY: "auto",
                            }}
                        >
                            {observations.map((obs) => (
                                <div
                                    key={obs.id}
                                    style={{
                                        padding: 14,
                                        borderRadius: 14,
                                        background: "var(--color-bg)",
                                    }}
                                >
                                    <p
                                        style={{
                                            fontSize: "0.8125rem",
                                            lineHeight: 1.6,
                                            marginBottom: 8,
                                        }}
                                    >
                                        {obs.raw_text}
                                    </p>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {new Date(obs.created_at).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {obs.structured_delta && (
                                            <div
                                                className="data-mono"
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    fontSize: "0.6875rem",
                                                }}
                                            >
                                                {Object.entries(obs.structured_delta).map(
                                                    ([key, val]) => {
                                                        if (val === 0) return null;
                                                        const num = val as number;
                                                        return (
                                                            <span
                                                                key={key}
                                                                className={
                                                                    num > 0
                                                                        ? "delta-positive"
                                                                        : "delta-negative"
                                                                }
                                                            >
                                                                {DIMENSION_SHORT[key] || key}:{" "}
                                                                {num > 0 ? "+" : ""}
                                                                {num}
                                                            </span>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
