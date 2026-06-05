# TDC Matchmaker OS

An AI-assisted **operating system for professional matchmakers** at The Date Crew.

This is **not** a dating app, not Tinder, not a matrimonial marketplace. It is the internal tool a premium matchmaking agency uses every day to manage clients, understand relationship goals, generate curated matches, record coaching insights, and improve outcomes — with AI that **assists** the matchmaker rather than replacing them.

> **Demo credentials**
> `matchmaker@tdc.com` / `password123`

---

## Table of Contents

- [Quick Start](#quick-start)
- [Tech Choices](#tech-choices)
- [Matching Logic](#matching-logic)
- [AI Usage](#ai-usage)
- [Business Assumptions](#business-assumptions)
- [Design Philosophy](#design-philosophy)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)

---

## Quick Start

You need **Node 20+**, a **PostgreSQL** connection string (e.g. a free [Neon](https://neon.tech) or [Supabase](https://supabase.com) database), and a free **Groq API key** ([console.groq.com/keys](https://console.groq.com/keys)).

### 1. Backend

```bash
cd backend
cp .env.example .env          # then fill in DATABASE_URL, GROQ_API_KEY, JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates the schema
npm run db:seed               # seeds 200 profiles + matches + success stories
npm run dev                   # http://localhost:4000  (health: /api/health)
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                   # http://localhost:5173
```

Open <http://localhost:5173>, sign in with the demo credentials, and explore.

---

## Tech Choices

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | React + TypeScript + Vite | Fast DX, type-safety end-to-end, instant HMR. |
| **Styling** | Tailwind CSS | Token-driven design system; enforces the "Warm Editorial Concierge" palette consistently. |
| **Animation** | Framer Motion | Sophisticated, intentional motion (page transitions, funnel reveal, stepper, count-ups) — all gated by `prefers-reduced-motion`. |
| **Data fetching** | TanStack Query + axios | Caching, optimistic updates, and clean loading/error states without boilerplate. |
| **Forms** | react-hook-form + zod | Robust validation on login and note composer. |
| **Backend** | Node + Express + TypeScript | Minimal, explicit, well-understood; feature-based clean architecture (`routes → controller → service`). |
| **ORM / DB** | Prisma + PostgreSQL | Type-safe queries, painless migrations, an honest relational model for a relationship product. |
| **Auth** | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless, simple for a single-matchmaker internal tool. |
| **AI** | Groq SDK · `llama-3.3-70b-versatile` | Fast inference; all three AI features call it live (no hardcoded responses). |
| **Icons** | Lucide (SVG) | No emoji-as-icons — crisp, premium iconography. |

The repo is a **monorepo**: `backend/` (API + engine + seed) and `frontend/` (SPA).

---

## Matching Logic

The compatibility engine is **fully deterministic** — there is no randomness anywhere. The same database state always produces the same ranking. (Source: [`backend/src/services/compatibility/`](backend/src/services/compatibility/).)

### 12 scored dimensions

Each (client, candidate) pair is scored **0–100** on: **Age, Location, Religion, Language, Education, Profession, Family, Lifestyle, Children, Relocation, Pet, Values.**

Highlights of the per-dimension rules:

- **Age** — candidate age vs the client's preferred range (full marks inside the band, linear decay outside). With no stated preference, gender-typical expectations apply.
- **Location** — same city = 100, a preferred city = 80, same state = 70, same region = 55, else lower; openness to relocation raises a low score to a floor of 60.
- **Religion** — exact match = 100, culturally-adjacent religions get partial credit, otherwise low. A `"Same religion"` **non-negotiable** forces a hard 0 on mismatch.
- **Language / Lifestyle / Values** — Jaccard set-overlap, with bonuses (shared mother tongue) and non-negotiable satisfaction checks.
- **Children** — a `wantKids` matrix (e.g. YES/YES = 100, YES/NO = 10).
- **Profession, Education, Family, Pet, Relocation** — tier/ordinal comparisons and matrices (see [`scorers.ts`](backend/src/services/compatibility/scorers.ts)).

Missing data resolves to a neutral 50 — it never crashes and never spikes a score.

### Gender-specific weighting

The 12 dimensions are combined with weights **keyed by the client's gender** (each table sums to 1.00 — asserted at module load in [`weights.ts`](backend/src/services/compatibility/weights.ts)):

- **Male clients** prioritize the candidate being **younger / shorter / lower-income** and **matching children preference**, then lifestyle, religion, family values, language, relocation. (Height folds a small modifier into the age score; "lower income" dominates the male profession scorer.)
- **Female clients** prioritize **profession compatibility, values, relocation**, then education, lifestyle, family expectations, long-term goals, children. (Long-term goals fold into the values score; the female profession scorer rewards stability rather than "lower income".)

### Output

```
overallScore = round( Σ  dimensionScore × weight[clientGender][dimension] )
```

- **Strength areas** — dimensions ≥ 80 (top 4), surfaced as human labels ("Shared core values").
- **Potential concerns** — dimensions < 50 (max 4).
- **Top 10 matches** — opposite-gender pool, ranked by score **descending**, tie-broken by candidate id **ascending** → a stable, reproducible ranking. Persisted idempotently (`@@unique(customerId, candidateId)`).

---

## AI Usage

All AI is **live** through Groq's `llama-3.3-70b-versatile`. There are **no hardcoded or templated AI outputs**. Every prompt instructs the model to use only the provided data and never fabricate. (Source: [`backend/src/services/groq/`](backend/src/services/groq/).)

1. **AI Match Explanation — "Why This Match"** — given both profiles and the 12-dimension breakdown, generates a warm, matchmaker-quality rationale (temp 0.3). Cached on the match; regenerate with `?refresh=true`.
2. **Personalized Introduction Generator** — produces **warm / professional / personalized** introduction variants via JSON mode (temp 0.6), surfaced in the multi-step Send-Match flow.
3. **Matchmaker Insights** — analyzes a client's profile, preferences, notes, and timeline to return *Personality Summary, Relationship Priorities, Potential Challenges,* and a *Suggested Strategy* (JSON mode, zod-validated, temp 0.4).

If `GROQ_API_KEY` is absent, the app still boots and runs — only the AI endpoints return a clear `503 AI_UNAVAILABLE`, and the UI degrades gracefully (the rest of the workbench keeps working).

---

## Business Assumptions

- **One matchmaker, many clients.** The demo models a single matchmaker who owns the whole roster. The schema already supports many matchmakers (`assignedMatchmakerId`).
- **Indian matchmaking context.** Seed data and fields (mother tongue, caste, manglik, diet, family type, non-negotiables) reflect a premium Indian agency. Religion adjacency and city→state→region maps are tuned for India.
- **Opposite-gender matching.** The candidate pool for a client is the opposite gender; already-married/engaged profiles are excluded from new recommendations.
- **The funnel is the source of truth** for a client's journey; KPIs and success-rate are derived from stage counts. "Success" = reaching Relationship / Engaged / Married; the denominator is everyone past Introduction Sent.
- **AI assists, never decides.** Scores and rankings are deterministic and explainable; AI only adds language and insight on top.

---

## Design Philosophy

The product is built to feel like **premium concierge software**, not an admin template — communicating **trust, warmth, professionalism, and relationship success**.

**"Warm Editorial Concierge"** — light theme only (no dark mode, no neon, no cyberpunk):

- **Palette** — warm ivory canvas `#FBF7F4`, deep-plum ink `#3B2A30`, dusty rose `#C2848B`, soft gold `#B68A3E` for CTAs, sage `#8FA68E` for success/relationships.
- **Typography** — **Playfair Display** (editorial serif headings) + **Inter** (clean body).
- **Texture** — soft shadows, generous spacing, rounded-2xl/3xl cards, refined 150–300ms hover transitions.
- **Motion** — sophisticated and intentional: editorial page transitions, a sequentially-revealing funnel, an animated send-match stepper, count-ups — every animation respects `prefers-reduced-motion`.
- **Accessibility** — 4.5:1 contrast, visible focus rings, labelled inputs, ≥44px touch targets, color never the sole signal, `aria-live` toasts.

The color progression itself tells the story: the matchmaking funnel warms from **rose → gold → sage** as clients move toward marriage.

---

## Architecture

```
TDC Matchmaker OS/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma           # Matchmaker, Customer, Note, TimelineEvent, Match, MatchFeedback
│  │  └─ seed/                   # deterministic 200-profile generator + matches + stories
│  └─ src/
│     ├─ config/ lib/ middleware/ errors/ types/
│     ├─ features/               # auth, customers, notes, timeline, matches, feedback, dashboard, ai
│     └─ services/
│        ├─ compatibility/       # the deterministic scoring engine (pure functions)
│        ├─ matchEngine/         # Top-10 generation
│        └─ groq/                # live AI (client, prompts, service)
└─ frontend/
   └─ src/
      ├─ app/ lib/ theme/ types/ layouts/
      ├─ components/             # ui/, feedback/, data-display/, filters/
      └─ features/               # auth, dashboard, customers, workbench, queue, success
```

**Key API routes** (all under `/api`, JWT-protected except `/auth/login` and `/health`): `auth/login`, `dashboard/kpis`, `dashboard/funnel`, `customers` (filters + search + pagination), `customers/:id`, `customers/:id/notes`, `customers/:id/timeline`, `customers/:id/matches[/generate]`, `customers/:id/insights`, `matches/:id[/status|/send|/feedback|/explanation|/introduction]`, `matches/queue`, `success-stories`.

---

## Deployment

The app deploys to **Render (API + Postgres)** + **Vercel (frontend)**. Both halves
build from this repo, so push to GitHub first.

### 1. Backend + Database → Render (one-click blueprint)
A root-level [`render.yaml`](render.yaml) provisions everything:

1. In Render: **New ▸ Blueprint** → connect this repo. It auto-creates a free
   Postgres database, wires `DATABASE_URL`, builds the API, runs
   `prisma migrate deploy`, and **seeds the demo data** (200 profiles + login) in
   the build step. `JWT_SECRET` is auto-generated.
2. Set the two unsynced secrets in the service **Environment** tab:
   - `GROQ_API_KEY` — free key from <https://console.groq.com/keys> (enables AI).
   - `CLIENT_ORIGIN` — your Vercel URL, e.g. `https://tdc-matchmaker.vercel.app`
     (comma-separated list supported).
3. Health check: `GET /api/health`.

> The build re-seeds on every deploy, so the demo always starts from a clean,
> populated state.

### 2. Frontend → Vercel
A [`frontend/vercel.json`](frontend/vercel.json) (Vite preset, SPA rewrites) is included.

1. In Vercel: **Add New ▸ Project** → import this repo, set **Root Directory** to
   `frontend`.
2. Add an environment variable: `VITE_API_URL` = your Render API URL + `/api`
   (e.g. `https://tdc-matchmaker-api.onrender.com/api`).
3. Deploy. Then copy the resulting Vercel URL back into Render's `CLIENT_ORIGIN`.

### Live links

| Surface | URL |
|---|---|
| Frontend (Vercel) | _add after deploy_ |
| API health (Render) | _add after deploy_ |

**Demo login:** `matchmaker@tdc.com` / `password123`

---

## Future Improvements

- **Multi-matchmaker** roles, assignment, and team dashboards.
- **Configurable weights** — let senior matchmakers tune dimension weights per client without code.
- **AI feedback loop** — learn from match feedback to re-rank and explain *why a past match failed*.
- **Real-time** updates (websockets) for the queue and timeline.
- **Calendar & messaging** integrations for the introduction / first-call workflow.
- **Audit log & analytics** — cohort success rates, time-in-stage, matchmaker performance.
- **Test suite** — unit tests for every compatibility scorer and snapshot tests for ranking determinism.
- **Code-splitting** the frontend bundle by route.
```
