# ARIE — Adaptive Readiness Intelligence Engine

**AI-powered transition readiness system for neurodiverse teens, built for India's special education classrooms.**

ARIE transforms everyday teacher observations into structured readiness scores, early regression alerts, and personalized growth plans — so no child slips through unnoticed during the critical transition from school to work.

> **Live:** [ariedashboard.vercel.app](https://ariedashboard.vercel.app) · **Transparency:** [How It Works](https://ariedashboard.vercel.app/how-it-works)

---

## Why ARIE Exists

In India's special education system, transition readiness tracking is fragmented — different teachers record progress differently, regression goes unnoticed for months, and vocational alignment relies on guesswork rather than data. ARIE solves this with a hybrid intelligence approach:

- **Deterministic scoring** ensures consistency across classrooms
- **AI recommendations** add contextual, actionable growth plans
- **Every calculation is explainable** — no black boxes

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  Landing Page · Dashboard · Teen Detail · How It Works       │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐  ┌────────────────────┐ │
│  │ NLP Engine   │   │ Readiness    │  │ Temporal Engine    │ │
│  │ (text→dims)  │   │ Engine       │  │ (trends, rolling)  │ │
│  └──────┬───────┘   │ (scoring)    │  └────────┬───────────┘ │
│         │           └──────┬───────┘           │             │
│         │                  │                   │             │
│  ┌──────▼───────────────── ▼───────────────────▼──────────┐  │
│  │              Ontology Engine (vector math)             │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────┐   ┌────────▼───────┐  ┌──────────────────┐   │
│  │ Regression │   │ Trajectory     │  │ Vocational       │   │
│  │ Engine     │   │ Engine (ESTE)  │  │ Engine           │   │
│  └────────────┘   └────────────────┘  └──────────────────┘   │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │        Growth Engine (Gemini AI — only AI layer)       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                      PostgreSQL (Supabase)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Core Engines

### 1. NLP Engine (`services/nlp_engine.py`)

Converts free-text teacher observations into structured dimension scores using keyword extraction and pattern matching. Supports **English and Hindi** input with voice transcription.

**Input:** _"Needed two reminders to complete packaging task, lost focus after 15 mins"_  
**Output:** `{ task_performance: 55, supervision_independence: 40, behavioral_stability: 60, ... }`

### 2. Ontology Engine (`services/ontology_engine.py`)

Normalizes raw NLP outputs into calibrated 0–100 scores using lookup tables and subcomponent weights defined in the ontology specification. Handles edge cases like error frequency inversion and endurance thresholds.

### 3. Readiness Engine (`services/readiness_engine.py`)

Computes the final **Readiness Score** — a weighted sum across five dimensions:

| Dimension                | Weight |
| ------------------------ | ------ |
| Task Performance         | 30%    |
| Behavioral Stability     | 25%    |
| Cognitive Adaptability   | 20%    |
| Supervision Independence | 15%    |
| Consistency              | 10%    |

### 4. Temporal Engine (`services/temporal_engine.py`)

Tracks how scores evolve over time:

- **Rolling averages** (3-week window) to smooth noise
- **Trend detection** (4-week window) → Improving / Holding / Declining
- **Per-dimension slopes** for granular tracking

### 5. Regression Engine (`services/regression_engine.py`)

Monitors for sustained score drops using a sliding window approach:

- **High risk:** >12% readiness drop over 2 weeks OR >15% behavioral stability drop
- **Medium risk:** >6% single-week drop OR >10% cumulative drop over 4 weeks

### 6. Trajectory Engine — ESTE (`services/trajectory_engine.py`)

The **Early Support Trajectory Engine** adds three capabilities:

- **Trajectory direction** via linear regression on recent data
- **Stability classification** (High / Moderate / Unstable) from residual volatility
- **Early Support Window** — activates when decline patterns are detected, prompting proactive intervention before regression deepens

### 7. Vocational Engine (`services/vocational_engine.py`)

Matches students to suitable job pathways using:

- **Cosine similarity** between student readiness vector and job profile vectors
- **Constraint-based penalties** for dimension deficits exceeding tolerance thresholds
- **Disqualification** for severe deficits (>30 point gap in any dimension)

### 8. Growth Engine (`services/growth_engine.py`)

The **only AI-powered component**. Takes all deterministic outputs as input and generates 3 actionable growth recommendations via Gemini. Responses are cached in the database to avoid repeated API calls. If Gemini is unavailable, all other features continue working.

---

## Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| **Frontend**   | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts |
| **Backend**    | FastAPI, Python 3.12+, SQLAlchemy, Pydantic                |
| **Database**   | PostgreSQL (Supabase)                                      |
| **AI**         | Google Gemini (`gemini-2.5-flash-lite`)                    |
| **Deployment** | Vercel (frontend), Docker-ready (backend)                  |


## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL database (or [Supabase](https://supabase.com) project)
- Gemini API key ([Google AI Studio](https://aistudio.google.com))

### Backend Setup

```bash
cd arie_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   SUPABASE_URL=postgresql://...
#   GEMINI_API_KEY=your_key
#   GEMINI_MODEL=gemini-2.5-flash-lite

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd arie_frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local with:
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```


## API Endpoints

| Method   | Endpoint                           | Description                         |
| -------- | ---------------------------------- | ----------------------------------- |
| `GET`    | `/dashboard/overview`              | All participants with summary stats |
| `GET`    | `/dashboard/teen/{id}`             | Full detail for one participant     |
| `GET`    | `/dashboard/teen/{id}/growth-plan` | AI-generated growth recommendations |
| `POST`   | `/teens/`                          | Create a new participant            |
| `DELETE` | `/teens/{id}`                      | Remove a participant                |
| `POST`   | `/observations/`                   | Submit a text observation           |
| `POST`   | `/transcription/`                  | Transcribe audio to text            |

---

## Design Principles

1. **Human-centered language** — Never labels children. Uses "readiness" not "ability", "support" not "intervention"
2. **Deterministic core** — All scoring is mathematical and reproducible. AI is isolated to one optional layer
3. **Full explainability** — Every score has a traceable formula. The `/how-it-works` page documents the complete methodology
4. **Support-oriented** — Focuses on what support would be most effective, not on deficits
5. **No cross-student comparison** — Each child is assessed against objective criteria, never ranked against peers

---


## Environment Variables

| Variable              | Required | Description                                   |
| --------------------- | -------- | --------------------------------------------- |
| `SUPABASE_URL`        | Yes      | PostgreSQL connection string                  |
| `GEMINI_API_KEY`      | Yes      | Google Gemini API key                         |
| `GEMINI_MODEL`        | No       | Model name (default: `gemini-2.5-flash-lite`) |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend URL for frontend API calls            |

---

## License

This project is developed as part of academic research on AI-assisted transition readiness for neurodiverse adolescents.

---

<p align="center">
  <strong>ARIE</strong> — Because every neurodiverse teen deserves a measurable, structured pathway from education to employment.
</p>
