# ResumeFit AI — Agile Project Plan

> An AI-powered Resume / Job-Fit Analyzer. Paste a resume and a job description, get a match score, missing keywords, and rewrite suggestions for weak bullet points.
> *(Working title — rename freely.)*

---

## 1. Product Vision

**For** job seekers **who** want to tailor their resume to a specific role, **ResumeFit AI** is a web app **that** analyzes a resume against a job description and returns an actionable match report. **Unlike** manually guessing what recruiters want, it uses an LLM to surface gaps and concrete fixes.

**Success = ** a deployed, public live demo + a polished README that an employer can open and immediately understand.

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Python + FastAPI |
| Database | PostgreSQL (local SQLite for dev) via Neon/Supabase |
| ORM | SQLModel |
| AI API | Google Gemini API (Gemini 2.5 Flash, free tier) |
| Auth (optional) | Supabase Auth or JWT |
| Deploy | Vercel (frontend) · Render/Railway (backend) · Neon/Supabase (DB) |

---

## 3. How We Work (Agile Setup)

- **Framework:** Scrum-lite, solo developer.
- **Sprint length:** 1 week (adjust to your pace).
- **Board:** GitHub Projects — columns: `Backlog → To Do → In Progress → In Review → Done`.
- **Issues:** every backlog item below becomes a GitHub Issue with a label (`epic:setup`, `epic:ai`, `epic:frontend`, etc.).
- **Milestones:** one GitHub Milestone per sprint.
- **Ceremonies (lightweight):** at the start of each sprint, pick items into "To Do"; at the end, write 2–3 lines in a `RETRO.md` on what worked / what to change.
- **Branching:** `main` always deployable; do work on `feature/<name>` branches; merge via Pull Request (good habit + visible in your commit history).

**Definition of Done (applies to every item):**
- [ ] Code works locally and is committed on a feature branch
- [ ] Merged to `main` via PR
- [ ] No secrets committed (`.env` is gitignored)
- [ ] README updated if the change affects setup or features

---

## 4. User Stories (MoSCoW prioritized)

**Must have**
- As a user, I can paste my resume text and a job description so the app can compare them.
- As a user, I get an overall match score (0–100) so I know how well I fit.
- As a user, I see missing keywords/skills so I know what to add.
- As a user, I get rewrite suggestions for weak resume bullets so I can improve them.

**Should have**
- As a user, I can upload a `.pdf`/`.txt` resume instead of pasting.
- As a returning user, I can log in and see my past analyses.
- As a user, I see a loading/streaming state so the app feels responsive.

**Could have**
- As a user, I can export the report as a PDF.
- As a user, I can compare one resume against multiple job descriptions.

**Won't have (this version)**
- Team accounts, billing, multi-language support.

---

## 5. Product Backlog by Epic

**Epic A — Project Setup**
- Create new GitHub repo + `.gitignore` + license
- Set up GitHub Project board + sprint milestones
- Scaffold backend (FastAPI) and frontend (Vite + React + TS)
- README skeleton committed
- Get Gemini API key, store in `.env`

**Epic B — AI Backend**
- `POST /analyze` endpoint accepting `resume` + `job_description`
- Integrate Gemini API call
- Engineer the prompt to return structured JSON (score, missing keywords, suggestions)
- Validate/parse the JSON response safely
- Error handling (rate limits, bad input, API failures)

**Epic C — Frontend**
- Input form (two text areas + submit)
- Results view (score gauge, keyword chips, suggestion cards)
- Loading + error states
- Responsive Tailwind styling

**Epic D — Database & Auth (optional)**
- Connect PostgreSQL + SQLModel models
- Save each analysis to DB
- Auth (login/signup)
- "History" page listing past analyses

**Epic E — Deploy & Showcase**
- Deploy backend (Render/Railway)
- Deploy frontend (Vercel)
- Connect hosted Postgres (Neon/Supabase)
- Finalize README: screenshots, live demo link, stack badges, setup steps
- Add a short demo GIF/video

---

## 6. Sprint Plan

### Sprint 0 — Foundation
**Goal:** A running skeleton, repo live, board set up.
- Repo created, board + milestones configured
- FastAPI returns a hardcoded `/analyze` response
- React app renders an empty form and calls the backend
- README skeleton + `.env.example` committed
**Demo at end:** form submits → dummy response shows on screen.

### Sprint 1 — AI Core
**Goal:** Real AI analysis working end to end (backend only is fine).
- Gemini integration + prompt engineering
- Structured JSON output validated
- Error handling
**Demo at end:** call `/analyze` (via the auto docs at `/docs`) and get a real match report.

### Sprint 2 — Frontend Experience
**Goal:** A clean, usable UI on top of the working API.
- Build score gauge, keyword chips, suggestion cards
- Loading/error states
- File upload (Should-have) if time allows
**Demo at end:** paste resume + JD in the browser → see a styled report.

### Sprint 3 — Persistence & Auth (optional)
**Goal:** Turn it from a toy into a real app.
- Postgres + SQLModel, save analyses
- Auth + history page
**Demo at end:** log in, run an analysis, see it saved in history.

### Sprint 4 — Deploy & Polish
**Goal:** Public live demo + portfolio-ready README.
- Deploy all three tiers
- Screenshots, demo GIF, badges, setup instructions in README
- Final cleanup pass on code and commits
**Demo at end:** a public URL you can paste into a job application.

---

## 7. Milestones / Deliverables

1. ✅ Public GitHub repo with clean commit history
2. ✅ Live demo URL (frontend + backend deployed)
3. ✅ Showcase README (overview, screenshots, stack, live link, setup)
4. ✅ Working AI feature people can try without signing up

---

## 8. Parking Lot (future ideas)

- PDF export of reports
- Multiple-JD comparison
- Browser extension to analyze a job posting in place
- Switchable AI provider (Gemini ↔ Groq) to show abstraction skills

---

*Tip: Keep this file in the repo so reviewers can see how you planned and executed. It pairs well with a visible GitHub Projects board.*
