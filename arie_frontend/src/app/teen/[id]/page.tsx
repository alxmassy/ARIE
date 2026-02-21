"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    getTeenDetail,
    getObservations,
    createSnapshot,
    deleteTeen,
    type TeenDetail,
    type Observation,
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
    task_performance: "Task Perf.",
    supervision_independence: "Super. Indep.",
    behavioral_stability: "Behav. Stab.",
    cognitive_adaptability: "Cog. Adapt.",
    consistency: "Consistency",
};

export default function TeenDetailPage() {
    const params = useParams();
    const router = useRouter();
    const teenId = params.id as string;

    const [detail, setDetail] = useState<TeenDetail | null>(null);
    const [observations, setObservations] = useState<Observation[]>([]);
    const [loading, setLoading] = useState(true);
    const [snapshotting, setSnapshotting] = useState(false);

    const fetchData = async () => {
        try {
            const [d, obs] = await Promise.all([
                getTeenDetail(teenId),
                getObservations(teenId),
            ]);
            setDetail(d);
            setObservations(obs);
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
        if (!confirm("Delete this teen and all their data?")) return;
        try {
            await deleteTeen(teenId);
            router.push("/");
        } catch (e) {
            console.error("Failed to delete teen:", e);
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
            dimension: DIMENSION_LABELS[key] || key,
            value: value as number,
            fullMark: 100,
        })
    );

    // Timeline data
    const timelineData = detail.timeline.map((s) => ({
        week: `W${s.week_number}`,
        score: s.readiness_score,
    }));

    const riskClass = (risk: string) => {
        switch (risk) {
            case "High":
                return "badge-high";
            case "Medium":
                return "badge-medium";
            default:
                return "badge-low";
        }
    };

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 32,
                }}
            >
                <div>
                    <button
                        onClick={() => router.push("/")}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-text-secondary)",
                            cursor: "pointer",
                            fontSize: "0.8125rem",
                            marginBottom: 8,
                            padding: 0,
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                    <h1
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {detail.name}
                    </h1>
                    <p
                        style={{
                            color: "var(--color-text-secondary)",
                            fontSize: "0.875rem",
                        }}
                    >
                        Age {detail.age}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        className="btn-primary"
                        onClick={handleSnapshot}
                        disabled={snapshotting}
                    >
                        {snapshotting ? "Saving..." : "📸 Take Snapshot"}
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={handleDelete}
                        style={{ color: "var(--color-danger)" }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Score + Risk Row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                <div className="card" style={{ textAlign: "center" }}>
                    <div className="section-title">Readiness Score</div>
                    <div
                        className="score-display"
                        style={{
                            fontSize: "2.5rem",
                            color:
                                detail.score_breakdown.total >= 70
                                    ? "var(--color-positive)"
                                    : detail.score_breakdown.total >= 40
                                        ? "var(--color-warning)"
                                        : "var(--color-danger)",
                        }}
                    >
                        {detail.score_breakdown.total.toFixed(1)}
                    </div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <div className="section-title">Regression Risk</div>
                    <span
                        className={`badge ${riskClass(detail.regression.risk_level)}`}
                        style={{ fontSize: "0.875rem", padding: "4px 16px" }}
                    >
                        {detail.regression.risk_level}
                    </span>
                    <div
                        style={{
                            marginTop: 8,
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        {detail.regression.reasons[0]}
                    </div>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                    <div className="section-title">Trend</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                        {detail.trend === "growth" && (
                            <span className="trend-growth">↑ Growth</span>
                        )}
                        {detail.trend === "plateau" && (
                            <span className="trend-plateau">→ Plateau</span>
                        )}
                        {detail.trend === "decline" && (
                            <span className="trend-decline">↓ Decline</span>
                        )}
                    </div>
                    {detail.rolling_average !== null && (
                        <div
                            className="data-mono"
                            style={{
                                marginTop: 4,
                                fontSize: "0.75rem",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            Rolling avg: {Number(detail.rolling_average).toFixed(1)}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {/* Radar */}
                <div className="card">
                    <div className="section-title">Readiness Dimensions</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
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
                                tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }}
                            />
                            <Radar
                                name="Readiness"
                                dataKey="value"
                                stroke="#C2613A"
                                fill="#C2613A"
                                fillOpacity={0.15}
                                strokeWidth={2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Timeline */}
                <div className="card">
                    <div className="section-title">Score Timeline</div>
                    {timelineData.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 300,
                                color: "var(--color-text-secondary)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No snapshots yet — take one to start tracking
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timelineData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
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
                                        borderRadius: 8,
                                        fontSize: "0.8125rem",
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#C2613A"
                                    strokeWidth={2}
                                    dot={{
                                        fill: "#C2613A",
                                        r: 4,
                                    }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Score Breakdown */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="section-title">Score Breakdown</div>
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
                                padding: "12px 0",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.75rem",
                                    color: "var(--color-text-secondary)",
                                    marginBottom: 4,
                                }}
                            >
                                {DIMENSION_LABELS[dim] || dim}
                            </div>
                            <div
                                className="score-display"
                                style={{ fontSize: "1.5rem", marginBottom: 2 }}
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

            {/* Bottom Row: Job Matches + Observations */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                }}
            >
                {/* Job Matches */}
                <div className="card">
                    <div className="section-title">Vocational Alignment</div>
                    {detail.job_matches.length === 0 ? (
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No job profiles available
                        </p>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Role
                                    </th>
                                    <th
                                        style={{
                                            textAlign: "right",
                                            padding: "8px 0",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Match
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {detail.job_matches.map((job) => (
                                    <tr
                                        key={job.job_name}
                                        style={{
                                            borderBottom: "1px solid var(--color-border)",
                                        }}
                                    >
                                        <td style={{ padding: "10px 0", fontSize: "0.875rem" }}>
                                            {job.job_name}
                                        </td>
                                        <td
                                            className="data-mono"
                                            style={{
                                                textAlign: "right",
                                                padding: "10px 0",
                                                fontSize: "0.875rem",
                                                fontWeight: 600,
                                                color:
                                                    job.similarity_percent >= 80
                                                        ? "var(--color-positive)"
                                                        : job.similarity_percent >= 60
                                                            ? "var(--color-warning)"
                                                            : "var(--color-danger)",
                                            }}
                                        >
                                            {job.similarity_percent.toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Observations */}
                <div className="card">
                    <div className="section-title">
                        Recent Observations ({observations.length})
                    </div>
                    {observations.length === 0 ? (
                        <p
                            style={{
                                color: "var(--color-text-secondary)",
                                fontSize: "0.875rem",
                            }}
                        >
                            No observations logged yet
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
                                        padding: 12,
                                        borderRadius: 8,
                                        background: "var(--color-bg)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    <p style={{ fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: 6 }}>
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
                                                fontSize: "0.6875rem",
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
                                                    gap: 6,
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
                                                                {DIMENSION_LABELS[key]?.split(".")[0] || key}:{" "}
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
