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
            Helping Neurodiverse Teens{" "}
            <span style={{ color: "var(--color-accent)" }}>Transition</span>
            <br />
            from School to Work
          </h1>
          <p
            style={{
              fontSize: "1.15rem",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              maxWidth: 620,
              margin: "0 auto 40px",
            }}
          >
            ARIE turns everyday teacher observations into structured readiness scores,
            early warning alerts, and personalized action plans — so no child slips through unnoticed.
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
              Start a Pilot
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
                    padding: "14px 16px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ fontSize: "0.65rem", color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
            {/* Mock Participant Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              {[
                { name: "Arjun M.", initials: "AM", score: "65.9", trend: "Improving", trendColor: "var(--color-positive)", scoreColor: "var(--color-positive)", sparkPath: "M0,28 L12,24 L24,20 L36,22 L48,16 L60,12 L72,8" },
                { name: "Priya S.", initials: "PS", score: "48.2", trend: "Holding", trendColor: "var(--color-warning)", scoreColor: "var(--color-warning)", sparkPath: "M0,16 L12,18 L24,14 L36,16 L48,18 L60,14 L72,16" },
                { name: "Rohan K.", initials: "RK", score: "52.0", trend: "Holding", trendColor: "var(--color-warning)", scoreColor: "var(--color-warning)", sparkPath: "M0,20 L12,18 L24,22 L36,16 L48,20 L60,18 L72,17" },
              ].map((p) => (
                <div
                  key={p.name}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 12,
                    padding: "16px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "var(--color-accent)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                      }}
                    >
                      {p.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text)" }}>{p.name}</div>
                      <div style={{ fontSize: "0.6rem", color: p.trendColor, fontWeight: 600 }}>{p.trend}</div>
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: p.scoreColor }}>{p.score}</div>
                  </div>
                  {/* Mini sparkline SVG */}
                  <svg width="100%" height="24" viewBox="0 0 72 32" preserveAspectRatio="none" style={{ display: "block" }}>
                    <defs>
                      <linearGradient id={`mock-grad-${p.initials}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={p.scoreColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={p.scoreColor} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={`${p.sparkPath} L72,32 L0,32 Z`} fill={`url(#mock-grad-${p.initials})`} />
                    <path d={p.sparkPath} fill="none" stroke={p.scoreColor} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              ))}
            </div>
            {/* Mock AI Insight Bar */}
            <div
              style={{
                background: "var(--color-surface)",
                borderRadius: 10,
                padding: "10px 16px",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: "0.85rem" }}>💡</span>
              <span style={{ fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Insight</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                Arjun&apos;s readiness score reached 65.9, showing consistent upward momentum.
              </span>
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
            The Reality
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
            The Reality in Special Education Classrooms
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {[
            {
              icon: "📋",
              title: "Inconsistent Tracking",
              desc: "Different teachers record progress differently. There is no common readiness standard across classrooms.",
            },
            {
              icon: "⏳",
              title: "Late Intervention",
              desc: "By the time regression is noticed, months have passed. The window for early support closes silently.",
            },
            {
              icon: "📄",
              title: "Generic Plans",
              desc: "Individual Education Plans often become templates, not truly individualized roadmaps for each child.",
            },
            {
              icon: "🔗",
              title: "No Clear Path to Employment",
              desc: "Vocational matching is based on assumption, not measurable readiness data tied to real capabilities.",
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
            How It Works
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
            From Daily Notes to Real Decisions
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
            { step: "01", title: "Teacher Observes", desc: "Writes what they noticed today" },
            { step: "02", title: "ARIE Structures", desc: "Maps to 5 readiness dimensions" },
            { step: "03", title: "Trends Detected", desc: "Flags growth and regression" },
            { step: "04", title: "Actions Generated", desc: "3 personalized growth steps" },
            { step: "05", title: "Pathway Aligned", desc: "Matched to suitable work roles" },
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
                title: "Hybrid Intelligence, Not Just AI",
                desc: "Mathematical scoring ensures consistency. AI adds contextual recommendations. Every decision is transparent — no black boxes.",
                icon: "⚙️",
              },
              {
                title: "Early Regression Alerts",
                desc: "ARIE flags decline weeks before it becomes critical, giving teachers time to intervene when it actually matters.",
                icon: "📉",
              },
              {
                title: "Actionable Growth Steps",
                desc: "Not just scores — clear, specific next steps for each teen. Teachers know exactly what to do on Monday morning.",
                icon: "🎯",
              },
              {
                title: "Data-Driven Vocational Alignment",
                desc: "Job pathways aligned to measurable capability, not guesswork. Every recommendation is grounded in real readiness data.",
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
          Built for India
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
          From 10 Students to 10,000
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { metric: "🏫", label: "Designed for NGOs, special schools, and vocational centers" },
            { metric: "🌐", label: "Supports multilingual input — English and Hindi" },
            { metric: "📱", label: "Works in low-resource settings with minimal infrastructure" },
            { metric: "📈", label: "Scales from a single classroom to institutions nationwide" },
          ].map((item) => (
            <div key={item.label} style={{ padding: "20px" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                {item.metric}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text)", lineHeight: 1.5, fontWeight: 500 }}>
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
            ARIE combines a{" "}
            <span style={{ fontWeight: 700 }}>deterministic readiness scoring engine</span>{" "}
            with an{" "}
            <span style={{ fontWeight: 700 }}>AI-powered recommendation layer</span>.
            Built using{" "}
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "1.05rem", color: "var(--color-accent)" }}>
              FastAPI + PostgreSQL + scalable vector computation
            </span>
            , designed for institutional deployment across India.
          </p>
        </div>
      </section>

      {/* ── 7. Micro-Story ── */}
      <section
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "80px 32px",
        }}
      >
        <div
          style={{
            background: "var(--color-glass-surface)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--color-glass-border)",
            borderRadius: 20,
            padding: "40px 44px",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-accent)",
              marginBottom: 20,
            }}
          >
            See It in Action
          </div>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: 8,
            }}
          >
            A teacher writes:
          </p>
          <blockquote
            style={{
              borderLeft: "3px solid var(--color-accent)",
              paddingLeft: 20,
              margin: "0 0 24px",
              fontSize: "1.05rem",
              fontStyle: "italic",
              color: "var(--color-text)",
              lineHeight: 1.7,
            }}
          >
            &ldquo;Needed two reminders to complete packaging task, lost focus after 15 minutes, improved after encouragement.&rdquo;
          </blockquote>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              marginBottom: 16,
            }}
          >
            ARIE converts this into structured readiness data and recommends:
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              "Incremental independence training",
              "Timed-task reinforcement",
              "Stability monitoring for 3 weeks",
            ].map((action) => (
              <div
                key={action}
                style={{
                  padding: "8px 18px",
                  borderRadius: 8,
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Vision + Final CTA ── */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "80px 32px 120px",
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
          From NGO Classrooms to{" "}
          <span style={{ color: "var(--color-accent)" }}>Nationwide Transition Intelligence</span>
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
            maxWidth: 600,
            margin: "0 auto 40px",
          }}
        >
          Every neurodiverse teen deserves a measurable, structured pathway from education to employment.
          ARIE aims to become the backbone system that enables that transition at scale.
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
