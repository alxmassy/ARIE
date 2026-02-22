import Link from "next/link";
import Image from "next/image";
import arieLogo from "../arie.png";

export default function HowItWorksPage() {
  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ── Nav ── */}
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
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
          </Link>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
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
              }}
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 140, paddingBottom: 60, textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>
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
            Transparency by Design
          </div>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "var(--color-text)",
              marginBottom: 20,
            }}
          >
            How ARIE Works Under the Hood
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.7,
              color: "var(--color-text-secondary)",
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            Every number, label, and recommendation in ARIE is explainable. No black boxes.
            This page documents exactly how scores are computed, trends detected, and decisions made.
          </p>
        </div>
      </section>

      {/* ── Table of Contents ── */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px 60px" }}>
        <div
          className="card"
          style={{ padding: "24px 28px" }}
        >
          <div style={{ fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, color: "var(--color-text-secondary)" }}>
            On This Page
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
            {[
              { href: "#pipeline", label: "1. Observation → Score Pipeline" },
              { href: "#dimensions", label: "2. Five Readiness Dimensions" },
              { href: "#readiness-score", label: "3. Readiness Score Formula" },
              { href: "#nlp", label: "4. NLP Observation Mapping" },
              { href: "#regression", label: "5. Regression Detection" },
              { href: "#trajectory", label: "6. Trajectory Engine (ESTE)" },
              { href: "#vocational", label: "7. Vocational Matching" },
              { href: "#confidence", label: "8. Confidence Scoring" },
              { href: "#growth-plan", label: "9. AI Growth Plan Layer" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                  padding: "4px 0",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1. Pipeline Overview ── */}
      <Section id="pipeline" label="Overview" title="From Observation to Action">
        <p style={paraStyle}>
          ARIE follows a deterministic pipeline. A teacher writes a plain-text observation. The system
          processes it through discrete engines, each with documented logic, to produce scores, alerts,
          and recommendations.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flexWrap: "wrap", marginTop: 24 }}>
          {[
            { step: "01", title: "Observation", desc: "Free-text input" },
            { step: "02", title: "NLP Engine", desc: "Extracts dimensions" },
            { step: "03", title: "Vector Computation", desc: "Normalizes scores" },
            { step: "04", title: "Temporal Engine", desc: "Detects trends" },
            { step: "05", title: "Output Layer", desc: "Scores + Actions" },
          ].map((item, i) => (
            <div key={item.step} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  padding: "16px 14px",
                  textAlign: "center",
                  width: 130,
                }}
              >
                <div style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--color-accent)", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text)", marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--color-text-secondary)" }}>
                  {item.desc}
                </div>
              </div>
              {i < 4 && (
                <div style={{ width: 24, textAlign: "center", color: "var(--color-accent)", fontWeight: 700 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── 2. Five Dimensions ── */}
      <Section id="dimensions" label="Dimensions" title="Five Readiness Dimensions" bg>
        <p style={paraStyle}>
          Every observation maps to five measurable dimensions. Each dimension has a score from 0 to 100,
          computed from specific subcomponents with defined normalization rules.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
          {[
            {
              name: "Task Performance",
              weight: "30%",
              subs: "Completion accuracy (35%), Multi-step adherence (25%), Error frequency (20%), Task endurance (20%)",
            },
            {
              name: "Behavioral Stability",
              weight: "25%",
              subs: "Escalation frequency (30%), Recovery speed (25%), Emotional volatility (25%), Peer interaction (20%)",
            },
            {
              name: "Cognitive Adaptability",
              weight: "20%",
              subs: "Task-switch latency (30%), Instruction retention (30%), Learning velocity (20%), Repetition requirement (20%)",
            },
            {
              name: "Supervision Independence",
              weight: "15%",
              subs: "Independence level (0-4 scale), normalized to 0-100",
            },
            {
              name: "Consistency",
              weight: "10%",
              subs: "Attendance (50%), On-time (30%), Routine stability (20%)",
            },
          ].map((dim) => (
            <div
              key={dim.name}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text)" }}>{dim.name}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent)" }}>{dim.weight}</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                {dim.subs}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. Readiness Score ── */}
      <Section id="readiness-score" label="Scoring" title="Readiness Score Formula">
        <p style={paraStyle}>
          The overall readiness score is a weighted sum of the five dimensions. This is a deterministic
          calculation with no AI involvement.
        </p>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            padding: "24px 28px",
            marginTop: 20,
            fontFamily: "var(--font-mono), monospace",
            fontSize: "0.875rem",
            lineHeight: 1.8,
            color: "var(--color-text)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: "inherit", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-accent)" }}>
            Formula
          </div>
          <code>
            Readiness = (Task Performance × 0.30)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Supervision Independence × 0.15)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Behavioral Stability × 0.25)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Cognitive Adaptability × 0.20)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ (Consistency × 0.10)
          </code>
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "14px 20px",
            borderRadius: 10,
            background: "var(--color-accent-light)",
            fontSize: "0.8125rem",
            color: "var(--color-accent)",
            fontWeight: 600,
          }}
        >
          Example: A student with Task=65, Supervision=50, Behavior=60, Cognitive=55, Consistency=70 → Readiness = 19.5 + 7.5 + 15.0 + 11.0 + 7.0 = 60.0
        </div>
      </Section>

      {/* ── 4. NLP Engine ── */}
      <Section id="nlp" label="NLP Engine" title="Observation to Structured Data" bg>
        <p style={paraStyle}>
          Teachers write free-text observations. ARIE&apos;s NLP engine maps these to the five readiness
          dimensions using keyword extraction and pattern matching. Supports English and Hindi input.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Input</div>
            <div style={{ fontSize: "0.875rem", fontStyle: "italic", color: "var(--color-text)", lineHeight: 1.6 }}>
              &ldquo;Needed two reminders to complete packaging task, lost focus after 15 minutes, improved after encouragement.&rdquo;
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Output</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
              task_performance: 55<br />
              supervision_independence: 40<br />
              behavioral_stability: 60<br />
              cognitive_adaptability: 45<br />
              consistency: 50
            </div>
          </div>
        </div>
        <p style={{ ...paraStyle, marginTop: 16 }}>
          Each observation creates a new &ldquo;snapshot&rdquo; — the dimension scores are merged with historical
          scores using an exponential moving average to prevent single observations from causing large swings.
        </p>
      </Section>

      {/* ── 5. Regression Detection ── */}
      <Section id="regression" label="Safety Net" title="Regression Detection">
        <p style={paraStyle}>
          ARIE continuously monitors for regression — sustained drops in readiness scores that may
          indicate a child needs additional support. Two severity levels are tracked.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={{ ...cardStyle, borderLeft: "3px solid var(--color-danger)" }}>
            <div style={{ ...cardTitleStyle, color: "var(--color-danger)" }}>High Risk</div>
            <ul style={listStyle}>
              <li>Readiness drops &gt;12% over 2 consecutive weeks</li>
              <li>OR Behavioral Stability drops &gt;15% in any single week</li>
            </ul>
          </div>
          <div style={{ ...cardStyle, borderLeft: "3px solid var(--color-warning)" }}>
            <div style={{ ...cardTitleStyle, color: "#c87b2d" }}>Medium Risk</div>
            <ul style={listStyle}>
              <li>Readiness drops &gt;6% in a single week</li>
              <li>OR Supervision Independence drops &gt;15%</li>
              <li>OR Cumulative drop &gt;10% over 4-week sliding window</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ── 6. Trajectory Engine ── */}
      <Section id="trajectory" label="ESTE" title="Early Support Trajectory Engine" bg>
        <p style={paraStyle}>
          ESTE analyzes recent readiness score history to compute trajectory direction, stability, and
          whether an early support window should be activated. It uses the recent 4-week window for slope
          calculation and the full history for volatility analysis.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Direction</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Linear regression slope over last 4 weeks:<br />
              <strong style={{ color: "var(--color-positive)" }}>Improving:</strong> slope &gt; 0.5<br />
              <strong style={{ color: "var(--color-danger)" }}>Needs Attention:</strong> slope &lt; -0.5<br />
              <strong>Stable:</strong> between -0.5 and 0.5
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Stability</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Measures volatility (residual std dev) from the full-history regression line:<br />
              <strong>High:</strong> &lt; 3.0<br />
              <strong>Moderate:</strong> 3.0 – 6.0<br />
              <strong>Unstable:</strong> &gt; 6.0
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Early Support Window</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Activates when:<br />
              • Slope &lt; 0 + not high stability<br />
              • 2+ consecutive weekly declines<br />
              • Medium regression risk detected
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "14px 20px", borderRadius: 10, background: "var(--color-accent-light)", fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600 }}>
          Confidence is based on data volume: ≥8 weeks = High, ≥5 weeks = Medium, &lt;5 weeks = Low
        </div>
      </Section>

      {/* ── 7. Vocational Matching ── */}
      <Section id="vocational" label="Pathways" title="Vocational Matching Algorithm">
        <p style={paraStyle}>
          ARIE matches students to suitable vocational pathways by computing cosine similarity between
          the student&apos;s readiness vector and predefined job profile vectors, with constraint-based
          penalty adjustments.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Matching Process</div>
            <ol style={{ ...listStyle, listStyleType: "decimal" }}>
              <li>Compute cosine similarity between student vector and each job vector</li>
              <li>Check dimension deficits against job requirements</li>
              <li>Apply penalty for deficits exceeding 15-point tolerance</li>
              <li>Disqualify if any single deficit exceeds 30 points</li>
              <li>Rank by effective similarity score</li>
            </ol>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Job Profiles</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Each job has a target vector across all 5 dimensions:<br /><br />
              <strong>Packaging Assistant</strong> — High consistency, task focus<br />
              <strong>Data Entry Clerk</strong> — High cognitive, consistency<br />
              <strong>Cleaning & Maintenance</strong> — High consistency, moderate task<br />
              <strong>Sorting & Inventory</strong> — High task performance
            </div>
          </div>
        </div>
      </Section>

      {/* ── 8. Confidence ── */}
      <Section id="confidence" label="Trust" title="Confidence Scoring" bg>
        <p style={paraStyle}>
          ARIE computes how confident you should be in its assessments using three independent factors,
          combined into a composite score.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Temporal Maturity</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              How many weeks of data exist. Full maturity at 8 weeks. Fewer weeks = lower temporal confidence.
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Score Volatility</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Standard deviation of readiness scores across snapshots. High volatility (&gt;8.0 std dev) reduces confidence.
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Observation Frequency</div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              Fewer than 0.5 observations per week reduces confidence. Regular data input strengthens trust in scores.
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: "14px 20px", borderRadius: 10, background: "var(--color-accent-light)", fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600 }}>
          Composite ≥ 0.75 → High Confidence &nbsp;|&nbsp; ≥ 0.45 → Medium &nbsp;|&nbsp; Below → Low
        </div>
      </Section>

      {/* ── 9. AI Growth Plan ── */}
      <Section id="growth-plan" label="AI Layer" title="AI-Powered Growth Plans">
        <p style={paraStyle}>
          This is the only component that uses generative AI (Gemini). The growth plan takes all
          deterministic outputs as input and generates 3 actionable recommendations with weekly focus areas.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>AI Receives</div>
            <ul style={listStyle}>
              <li>Current readiness vector (5 dimensions)</li>
              <li>Trend slopes per dimension</li>
              <li>Regression risk level</li>
              <li>Vocational match results</li>
              <li>Confidence level</li>
              <li>Recent observation texts</li>
            </ul>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>AI Produces</div>
            <ul style={listStyle}>
              <li>3 specific growth recommendations</li>
              <li>Each with a focus dimension and weekly action</li>
              <li>Framed in supportive, actionable language</li>
              <li>Never labels, never predicts outcomes</li>
            </ul>
          </div>
        </div>
        <div
          style={{
            marginTop: 16,
            padding: "14px 20px",
            borderRadius: 10,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "var(--color-text)" }}>Key distinction:</strong> The AI does not compute scores,
          detect regression, or make classification decisions. It only generates human-readable recommendations
          based on deterministic inputs. If the AI is unavailable, all other features continue to function normally.
        </div>
      </Section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 32px 100px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            marginBottom: 16,
          }}
        >
          See It in Action
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--color-text-secondary)", marginBottom: 28 }}>
          Every score on the dashboard is computed using the logic documented above.
        </p>
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
          Open Dashboard →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "32px",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--color-text-tertiary)",
        }}
      >
        ARIE — Adaptive Readiness Intelligence Engine · Built for India&apos;s special education classrooms
      </footer>
    </div>
  );
}

/* ── Reusable Section wrapper ── */
function Section({
  id,
  label,
  title,
  bg,
  children,
}: {
  id: string;
  label: string;
  title: string;
  bg?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        background: bg ? "var(--color-surface)" : "transparent",
        borderTop: bg ? "1px solid var(--color-border)" : "none",
        borderBottom: bg ? "1px solid var(--color-border)" : "none",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px" }}>
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
          {label}
        </div>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--color-text)",
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/* ── Shared styles ── */
const paraStyle: React.CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.7,
  color: "var(--color-text-secondary)",
  maxWidth: 700,
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: 14,
  padding: "20px 22px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--color-text-secondary)",
  marginBottom: 10,
};

const listStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.8,
  margin: 0,
  paddingLeft: 16,
};
