"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

/* Derive insight cards from dashboard data */
function deriveInsights(teens: DashboardTeen[]) {
  const insights: { icon: string; text: string; accent: string }[] = [];

  const improving = teens.filter((t) => t.trend === "growth");
  const declining = teens.filter((t) => t.trend === "decline");
  const needsAttention = teens.filter((t) => t.regression_risk === "High");
  const avgScore =
    teens.length > 0
      ? teens.reduce((s, t) => s + t.readiness_score, 0) / teens.length
      : 0;

  if (improving.length > 0) {
    const names = improving
      .slice(0, 2)
      .map((t) => t.name)
      .join(" and ");
    insights.push({
      icon: "↑",
      text: `${names} ${improving.length === 1 ? "is" : "are"} showing improvement`,
      accent: "var(--color-positive)",
    });
  }

  if (needsAttention.length > 0) {
    const names = needsAttention
      .slice(0, 2)
      .map((t) => t.name)
      .join(" and ");
    insights.push({
      icon: "●",
      text: `${names} may need additional support`,
      accent: "var(--color-danger)",
    });
  }

  if (declining.length > 0 && declining.length !== needsAttention.length) {
    insights.push({
      icon: "↓",
      text: `${declining.length} participant${declining.length > 1 ? "s" : ""} with declining readiness`,
      accent: "var(--color-warning)",
    });
  }

  if (teens.length > 0) {
    insights.push({
      icon: "◎",
      text: `Average readiness across ${teens.length} participant${teens.length > 1 ? "s" : ""}: ${avgScore.toFixed(1)}`,
      accent: "var(--color-info)",
    });
  }

  return insights;
}

export default function Dashboard() {
  const [teens, setTeens] = useState<DashboardTeen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAge, setFormAge] = useState("");
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
      await createTeen({ name: formName.trim(), age: parseInt(formAge) });
      setFormName("");
      setFormAge("");
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
  const insights = deriveInsights(teens);

  return (
    <div>
      {/* ── Greeting + Recent Updates side-by-side ── */}
      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
          marginBottom: 36,
        }}
      >
        {/* Left: Greeting */}
        <div style={{ flex: 1 }}>
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

        {/* Right: Recent Updates */}
        {insights.length > 0 && (
          <div style={{ flex: 1, maxWidth: 420 }}>
            <div className="section-title">Recent Updates</div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: insight.accent,
                      lineHeight: 1,
                    }}
                  >
                    {insight.icon}
                  </span>
                  <span style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
                    {insight.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Participant ── */}
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
        <button
          className="btn-secondary"
          onClick={() => setShowForm(!showForm)}
          style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
        >
          {showForm ? "Cancel" : "Add Participant"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card"
          style={{
            marginBottom: 20,
            display: "flex",
            gap: 14,
            alignItems: "flex-end",
          }}
        >
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
          <button
            className="btn-primary"
            type="submit"
            disabled={creating}
            style={{ whiteSpace: "nowrap" }}
          >
            {creating ? "Creating..." : "Create"}
          </button>
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
          {teens.map((teen) => {
            const trend = TREND_LABELS[teen.trend] || TREND_LABELS.plateau;
            const status = statusLabel(teen.regression_risk);
            return (
              <Link
                key={teen.id}
                href={`/teen/${teen.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card card-interactive">
                  {/* Top row: avatar + name + status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 20,
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
                    }}
                  >
                    <div>
                      <span
                        className="score-display"
                        style={{
                          fontSize: "2.25rem",
                          color: scoreColor(teen.readiness_score),
                        }}
                      >
                        {teen.readiness_score.toFixed(1)}
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                          marginLeft: 4,
                        }}
                      >
                        / 100
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
