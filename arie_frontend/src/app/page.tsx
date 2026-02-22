import Link from "next/link";
import Image from "next/image";
import arieLogo from "./arie.png";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ── Landing Nav ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "var(--color-glass-nav)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--color-glass-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Image src={arieLogo} alt="ARIE Logo" height={32} />
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--color-accent)",
                letterSpacing: "-0.01em",
              }}
            >
              ARIE
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#problem" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)", textDecoration: "none" }}>Problem</a>
            <a href="#solution" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)", textDecoration: "none" }}>Solution</a>
            <a href="#impact" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)", textDecoration: "none" }}>Impact</a>
            <Link
              href="/dashboard"
              style={{
                padding: "9px 22px",
                borderRadius: 10,
                backgroundColor: "var(--color-accent)",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.2s ease",
              }}
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 1. Hero Section ── */}
      <section
        style={{
          paddingTop: 160,
          paddingBottom: 80,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          className="bg-gradient-animated"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>
          <h1
            style={{
              fontSize: "3.75rem",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              marginBottom: 24,
            }}
          >
            Transition Readiness{" "}
            <span style={{ color: "var(--color-accent)" }}>Intelligence</span>
            <br />
            for Neurodiverse Teens
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              maxWidth: 600,
              margin: "0 auto 40px",
            }}
          >
            ARIE transforms everyday staff observations into structured readiness scores,
            early regression alerts, and personalized growth actions.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                backgroundColor: "var(--color-accent)",
                color: "white",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 16px rgba(91, 138, 114, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              Request Pilot
            </Link>
            <a
              href="#solution"
              style={{
                padding: "14px 32px",
                borderRadius: 12,
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                fontSize: "1rem",
                fontWeight: 700,
                textDecoration: "none",
                border: "1px solid var(--color-border)",
                transition: "all 0.2s ease",
              }}
            >
              ↓ See How It Works
            </a>
          </div>
        </div>

        {/* Dashboard Preview — Floating Mock */}
        <div
          style={{
            maxWidth: 960,
            margin: "64px auto 0",
            padding: "0 32px",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "var(--color-glass-surface)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--color-glass-border)",
              borderRadius: 20,
              padding: "24px 28px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Mock Nav */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, height: 28, borderRadius: 8, background: "var(--color-surface-active)", marginLeft: 12 }} />
            </div>
            {/* Mock Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Readiness Index", value: "54.0", color: "var(--color-accent)" },
                { label: "Participants", value: "4", color: "var(--color-text)" },
                { label: "Improving", value: "1", color: "var(--color-positive)" },
                { label: "Alerts", value: "0", color: "var(--color-danger)" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 6 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            {/* Mock Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    padding: "18px",
                    border: "1px solid var(--color-border)",
                    height: 80,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-accent-light)" }} />
                    <div>
                      <div style={{ width: 80, height: 10, borderRadius: 4, background: "var(--color-surface-active)", marginBottom: 6 }} />
                      <div style={{ width: 50, height: 8, borderRadius: 4, background: "var(--color-surface-active)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Problem Section ── */}
      <section
        id="problem"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "100px 32px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              marginBottom: 12,
            }}
          >
            The Challenge
          </div>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
              lineHeight: 1.15,
            }}
          >
            The Gap in Transition Planning
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {[
            {
              icon: "📋",
              title: "Subjective Tracking",
              desc: "Readiness tracking is inconsistent across staff, resulting in unreliable baselines.",
            },
            {
              icon: "⏳",
              title: "Late Detection",
              desc: "Regression is often detected weeks or months after it begins, missing the intervention window.",
            },
            {
              icon: "📄",
              title: "Generic Plans",
              desc: "Growth plans are templated, not personalized to individual capability vectors.",
            },
            {
              icon: "🔗",
              title: "Reactive Alignment",
              desc: "Vocational matching is reactive and disconnected from real-time readiness data.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "var(--color-glass-surface)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--color-glass-border)",
                borderRadius: 16,
                padding: "28px 28px",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 8, color: "var(--color-text)" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Solution Pipeline ── */}
      <section
        id="solution"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "80px 32px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              marginBottom: 12,
            }}
          >
            System Architecture
          </div>
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text)",
              lineHeight: 1.15,
            }}
          >
            From Observation to Outcome
          </h2>
        </div>

        {/* Pipeline Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            gap: 0,
            flexWrap: "wrap",
          }}
        >
          {[
            { step: "01", title: "Observation", desc: "Natural-language staff notes" },
            { step: "02", title: "Structured Ontology", desc: "5-dimension readiness vector" },
            { step: "03", title: "Readiness Engine", desc: "Scoring, trends, confidence" },
            { step: "04", title: "Growth Intelligence", desc: "AI-powered recommendations" },
            { step: "05", title: "Vocational Alignment", desc: "Constraint-aware matching" },
          ].map((item, i) => (
            <div key={item.step} style={{ display: "flex", alignItems: "stretch" }}>
              <div
                className="card-interactive"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  padding: "24px 20px",
                  textAlign: "center",
                  width: 160,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  cursor: "default",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    color: "var(--color-accent)",
                    letterSpacing: "0.06em",
                    marginBottom: 6,
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--color-text)", marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
              {i < 4 && (
                <div
                  style={{
                    width: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Differentiators ── */}
      <section
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "100px 32px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-accent)",
                marginBottom: 12,
              }}
            >
              Why ARIE
            </div>
            <h2
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--color-text)",
                lineHeight: 1.15,
              }}
            >
              What Makes This Different
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
            {[
              {
                title: "Deterministic + AI Hybrid",
                desc: "Math-based scoring engine combined with LLM-powered growth recommendations. No black-box decisions.",
                icon: "⚙️",
              },
              {
                title: "Longitudinal Regression Detection",
                desc: "Sliding-window analysis over weeks of data detects regression before it becomes critical.",
                icon: "📉",
              },
              {
                title: "Prescriptive Growth Actions",
                desc: "AI generates specific, actionable recommendations tied to individual capability gaps.",
                icon: "🎯",
              },
              {
                title: "Constraint-Aware Job Matching",
                desc: "Vocational alignment weighted by real readiness vectors, not aspirational assumptions.",
                icon: "🔄",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "32px",
                }}
              >
                <div style={{ fontSize: "1.75rem", marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8, color: "var(--color-text)" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Impact Section ── */}
      <section
        id="impact"
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "100px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-accent)",
            marginBottom: 12,
          }}
        >
          Measurable Impact
        </div>
        <h2
          style={{
            fontSize: "2.5rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            lineHeight: 1.15,
            marginBottom: 56,
          }}
        >
          Built for Scale
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { metric: "3×", label: "Earlier regression detection vs. manual methods" },
            { metric: "5", label: "Structured readiness dimensions per participant" },
            { metric: "100%", label: "Measurable intervention prioritization" },
            { metric: "∞", label: "Scalable to institutions nationwide" },
          ].map((item) => (
            <div key={item.label} style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 800,
                  color: "var(--color-accent)",
                  lineHeight: 1,
                  marginBottom: 10,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.metric}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Technical Depth ── */}
      <section
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "80px 32px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              marginBottom: 16,
            }}
          >
            Under the Hood
          </div>
          <p
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Built with a{" "}
            <span style={{ fontWeight: 700 }}>hybrid deterministic + LLM intelligence layer</span>,
            optimized for scalable, low-latency inference and{" "}
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.05rem", color: "var(--color-accent)" }}>
              vector-based alignment computation
            </span>
            . PostgreSQL-backed persistence, FastAPI serving layer, and a React frontend
            designed for institutional-grade usability.
          </p>
        </div>
      </section>

      {/* ── 7. Vision + Final CTA ── */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "120px 32px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "2.75rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          From NGO dashboards to{" "}
          <span style={{ color: "var(--color-accent)" }}>national transition intelligence</span>{" "}
          infrastructure.
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            marginBottom: 40,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          Infrastructure-level intelligence for inclusive workforce development.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "14px 36px",
              borderRadius: 12,
              backgroundColor: "var(--color-accent)",
              color: "white",
              fontSize: "1rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(91, 138, 114, 0.3)",
            }}
          >
            See Live Dashboard →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "32px",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--color-text-secondary)",
        }}
      >
        ARIE — Adaptive Readiness Intelligence Engine · Built for the AMD by Team Starscourge
      </footer>
    </div>
  );
}
