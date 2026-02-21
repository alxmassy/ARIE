"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getDashboardOverview,
  createTeen,
  type DashboardTeen,
} from "@/lib/api";

const TREND_ICONS: Record<string, { icon: string; className: string }> = {
  growth: { icon: "↑", className: "trend-growth" },
  plateau: { icon: "→", className: "trend-plateau" },
  decline: { icon: "↓", className: "trend-decline" },
};

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

  const scoreColor = (score: number) => {
    if (score >= 70) return "var(--color-positive)";
    if (score >= 40) return "var(--color-warning)";
    return "var(--color-danger)";
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
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: 4,
              letterSpacing: "-0.02em",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.875rem",
            }}
          >
            {teens.length} teen{teens.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Teen"}
        </button>
      </div>

      {/* Add Teen Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="card"
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 4,
                color: "var(--color-text-secondary)",
              }}
            >
              Name
            </label>
            <input
              className="input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Teen name"
              required
            />
          </div>
          <div style={{ width: 100 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginBottom: 4,
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

      {/* Teen Grid */}
      {teens.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ fontSize: "1rem", marginBottom: 8 }}>No teens yet</p>
          <p style={{ fontSize: "0.8125rem" }}>
            Add a teen to start tracking readiness.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {teens.map((teen) => {
            const trend = TREND_ICONS[teen.trend] || TREND_ICONS.plateau;
            return (
              <Link
                key={teen.id}
                href={`/teen/${teen.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card" style={{ cursor: "pointer" }}>
                  {/* Top row */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {teen.name}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Age {teen.age}
                      </span>
                    </div>
                    <span className={`badge ${riskClass(teen.regression_risk)}`}>
                      {teen.regression_risk}
                    </span>
                  </div>

                  {/* Score */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      className="score-display"
                      style={{
                        fontSize: "2rem",
                        color: scoreColor(teen.readiness_score),
                      }}
                    >
                      {teen.readiness_score.toFixed(1)}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      / 100
                    </span>
                    <span
                      className={trend.className}
                      style={{ fontSize: "1.25rem", marginLeft: "auto" }}
                    >
                      {trend.icon}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Readiness Score
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
