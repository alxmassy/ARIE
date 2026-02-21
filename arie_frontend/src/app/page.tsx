"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import {
  getDashboardOverview,
  createTeen,
  type DashboardTeen,
} from "@/lib/api";

const TREND_LABELS: Record<string, { label: string; className: string }> = {
  growth: { label: "Improving", className: "trend-growth" },
  plateau: { label: "Holding", className: "trend-plateau" },
  decline: { label: "Declining", className: "trend-decline" },
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

const scoreColor = (score: number) => {
  if (score >= 65) return "var(--color-positive)";
  if (score >= 40) return "var(--color-warning)";
  return "var(--color-danger)";
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  return { text: "Good evening", emoji: "🌙" };
};

/* Calculate top summary band stats */
function calculateSummaryStats(teens: DashboardTeen[]) {
  const improving = teens.filter((t) => t.trend === "growth").length;
  const needsAttention = teens.filter((t) => t.regression_risk === "High").length;
  const avgScore =
    teens.length > 0
      ? teens.reduce((s, t) => s + t.readiness_score, 0) / teens.length
      : 0;

  return {
    total: teens.length,
    avgScore: avgScore.toFixed(1),
    improving,
    needsAttention,
  };
}

export default function Dashboard() {
  const [teens, setTeens] = useState<DashboardTeen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
  const [showMetrics, setShowMetrics] = useState(false);
  const [metrics, setMetrics] = useState({
    task_performance: 50,
    supervision_independence: 50,
    behavioral_stability: 50,
    cognitive_adaptability: 50,
    consistency: 50,
  });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getDashboardOverview();
      setTeens(data);
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAge.trim()) return;
    setCreating(true);
    try {
      await createTeen({
        name: formName.trim(),
        age: parseInt(formAge),
        ...(showMetrics && { baseline_vector: metrics })
      });
      setFormName("");
      setFormAge("");
      setShowMetrics(false);
      setMetrics({
        task_performance: 50,
        supervision_independence: 50,
        behavioral_stability: 50,
        cognitive_adaptability: 50,
        consistency: 50,
      });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to create teen:", err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
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

  const greeting = getGreeting();
  const summary = calculateSummaryStats(teens);

  return (
    <>
      {/* Full-bleed animated radial gradient background for the home dashboard */}
      <div className="bg-gradient-animated" />
      <div>
        {/* ── Greeting ── */}
        <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          {greeting.emoji} {greeting.text}
        </h1>
        <p className="status-line" style={{ fontSize: "1rem" }}>
          {teens.length > 0
            ? `You're tracking ${teens.length} participant${teens.length !== 1 ? "s" : ""}. Here's how they're doing.`
            : "Welcome to ARIE. Add a participant to begin tracking transition readiness."}
        </p>
      </div>

      {/* ── Top Summary Band ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 40,
        }}
      >
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 8 }}>Total Participants</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-text)", lineHeight: 1 }}>{summary.total}</div>
        </div>
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 8 }}>Average Readiness</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-accent)", lineHeight: 1 }}>{summary.avgScore}</div>
        </div>
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 8 }}>Improving</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-positive)", lineHeight: 1 }}>{summary.improving}</div>
        </div>
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 8 }}>Needs Attention</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-danger)", lineHeight: 1 }}>{summary.needsAttention}</div>
        </div>
      </div>

      {/* ── Participants Header & Controls ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div className="section-title" style={{ marginBottom: 0 }}>
          Participants
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="text"
            className="input"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: 250, 
              padding: "7px 14px", 
              fontSize: "0.875rem",
              backgroundColor: "var(--color-glass-surface)",
            }}
          />
          <button
            className="btn-secondary"
            onClick={() => setShowForm(!showForm)}
            style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
          >
            {showForm ? "Cancel" : "Add Participant"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card"
          style={{
            marginBottom: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--color-text-secondary)",
                }}
              >
                Name
              </label>
              <input
                className="input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Participant name"
                required
              />
            </div>
            <div style={{ width: 100 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--color-text-secondary)",
                }}
              >
                Age
              </label>
              <input
                className="input"
                type="number"
                min={13}
                max={21}
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                placeholder="Age"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", cursor: "pointer", color: "var(--color-text-secondary)" }}>
              <input
                type="checkbox"
                checked={showMetrics}
                onChange={(e) => setShowMetrics(e.target.checked)}
                style={{ accentColor: "var(--color-accent)" }}
              />
              Set starting metrics (optional)
            </label>
          </div>

          {showMetrics && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 8 }}>
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      marginBottom: 4,
                      color: "var(--color-text-secondary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {key.replace("_", " ")}
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => setMetrics({ ...metrics, [key]: parseInt(e.target.value) || 0 })}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-primary"
              type="submit"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Participant"}
            </button>
          </div>
        </form>
      )}

      {/* ── Teen Cards ── */}
      {teens.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 56,
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: 8 }}>
            No participants yet
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Add a participant to begin tracking their transition readiness.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 20,
          }}
        >
          {teens
            .filter((teen) => 
               teen.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((teen) => {
            const trend = TREND_LABELS[teen.trend] || TREND_LABELS.plateau;
            const status = statusLabel(teen.regression_risk);

            // Format sparkline data for Recharts
            const sparklineData = (teen.sparkline || []).map((val, i) => ({
              index: i,
              value: val,
            }));

            return (
              <Link
                key={teen.id}
                href={`/teen/${teen.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card card-interactive" style={{ display: "flex", flexDirection: "column", minHeight: 180 }}>
                  {/* Top row: avatar + name + status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div className="avatar">{getInitials(teen.name)}</div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          marginBottom: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {teen.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Age {teen.age}
                      </span>
                    </div>
                    <span className={`badge ${status.cls}`}>
                      {status.text}
                    </span>
                  </div>

                  {/* Score + Trend */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <span
                        className="score-display"
                        style={{
                          fontSize: "2.5rem",
                          color: scoreColor(teen.readiness_score),
                        }}
                      >
                        {teen.readiness_score.toFixed(1)}
                      </span>
                    </div>
                    <span
                      className={trend.className}
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                      }}
                    >
                      {trend.label}
                    </span>
                  </div>

                  {/* Micro Sparkline */}
                  <div style={{ height: 48, width: "100%", marginTop: "auto", overflow: "hidden" }}>
                    {sparklineData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                          <defs>
                            <linearGradient id={`color-${teen.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={scoreColor(teen.readiness_score)} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={scoreColor(teen.readiness_score)} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <YAxis 
                            hide 
                            domain={['dataMin - 1', 'dataMax + 1']} 
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={scoreColor(teen.readiness_score)}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#color-${teen.id})`}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div style={{ width: "100%", height: "100%", borderBottom: "1px dashed var(--color-border)" }} />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
