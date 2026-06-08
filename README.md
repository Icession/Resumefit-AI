# ResuMatch

> Tailor your application to the job — honestly — before you apply.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=fff)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=googlegemini&logoColor=fff)

**Live demo:** https://resumatch-kl.vercel.app

> The backend runs on a free tier that sleeps after inactivity, so the first request
> after a while may take ~50 seconds to wake up. It's fast afterward.

![ResuMatch screenshot](docs/screenshot.png)

---

## Why I built this

Job hunting as a new developer means applying to a lot of roles, and every strong
application has to be tailored — a resume aimed at the specific job and a cover letter
that reads like a real person wrote it. Two things make that harder than it should be:

- **Most resumes are read by software first.** Applicant tracking systems (ATS) parse a
  resume before any recruiter sees it, and a large share are filtered out over formatting
  the software simply can't read — tables, columns, images, scanned files — rather than
  over weak content.
- **AI shortcuts tend to lie.** The easy way to "tailor" with AI is to let it invent
  experience or churn out generic filler. That's risky — recruiters and AI detectors
  notice — and it isn't really *you*.

ResuMatch is my answer: a free tool that helps tailor an application end to end — fit
analysis, honest bullet rewrites, a grounded cover letter, and an ATS readiness check —
while refusing to fabricate anything. It was also the project where I set out to build a
complete, deployed full-stack product with real authentication, a database, and
trustworthy AI behavior, rather than a toy demo.

---

## What it does

- **Fit analysis** — a match score (0–100), the keywords and skills the job wants that
  your resume doesn't surface, and rewrites of weak bullet points using only your real
  experience.
- **Cover-letter generator** — a tailored, human-sounding letter grounded in your resume,
  with optional contact details, links, and company/role targeting. Copy or download it.
- **ATS readiness check** — an AI content review combined with a deterministic scan of the
  actual PDF (scanned-image, tables, embedded graphics), a transparent readiness score, and
  specific fixes.
- **Accounts, history & profile** — save every analysis, and store your details and links
  once so they auto-fill every future cover letter. (Analysis works without an account.)
- **Full data control** — delete any saved analysis, or permanently delete your account
  along with its analyses and profile.

---

## Key design decisions

The interesting part of this project isn't the feature list — it's the reasoning behind it.

**Integrity over flattery.** Every AI prompt is constrained to the candidate's real
experience. Suggestions and cover letters never invent employers, metrics, or skills;
missing requirements are surfaced as honest gaps rather than papered over. A tailored
application still has to be true.

**The model writes prose; my code owns the facts.** In a cover letter, the contact line
and every link are collected as structured input and assembled in code — the language
model never touches them. So a GitHub or portfolio URL is always exact, never quietly
reworded or hallucinated. Letting an LLM retype a link is a small, silent, expensive
failure mode, so I designed it out.

**Parseability is a first-class problem.** Content advice alone misses the most common
reason resumes get rejected: the software can't read them. The ATS check therefore pairs
an AI content review with a deterministic inspection of the real file (via pdfplumber),
and computes the score with an explainable rule instead of asking the model to guess a
number.

**Typed contracts end to end.** Gemini is asked for a fixed JSON schema; that same shape
flows through Pydantic on the backend and TypeScript on the frontend, so the data contract
is enforced at every layer rather than hoped for.

**Hand-rolled authentication, on purpose.** I implemented JWT auth with bcrypt-hashed
passwords and ownership checks (you can only read or delete your own data) instead of
reaching for a managed auth service — I wanted to genuinely understand token-based
authentication and authorization, including account deletion and data erasure.

**Resilient by default.** Transient model overloads are retried with exponential backoff
and surfaced as a friendly message, so a momentary hiccup never reaches the user as a crash.

---

## Architecture

A React + TypeScript single-page app talks to a FastAPI backend. The backend extracts text
from uploads with pdfplumber, calls the Gemini API for structured JSON (with retry and
backoff), and persists users, analyses, and profiles in PostgreSQL via SQLModel. Cover-letter
signatures and the ATS score are assembled deterministically in the backend so the facts stay
exact. Authentication is JWT-based with bcrypt-hashed passwords. The frontend is deployed on
Vercel, the backend on Render, and the database is hosted on Neon.

---

## Tech stack

- **Frontend:** React · Vite · TypeScript · Tailwind CSS
- **Backend:** Python · FastAPI · SQLModel · Pydantic
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT (PyJWT) with bcrypt-hashed passwords
- **AI:** Google Gemini API (Gemini 2.5 Flash) with structured JSON output
- **PDF parsing:** pdfplumber
- **Deploy:** Vercel (frontend) · Render (backend)

---

## Running locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- A free [Gemini API key](https://aistudio.google.com/apikey)
- A PostgreSQL database — a free [Neon](https://neon.tech) project works well

### Backend
```bash
cd backend
python -m venv venv
# Windows (PowerShell): venv\Scripts\Activate.ps1
# macOS / Linux:        source venv/bin/activate
pip install -r requirements.txt
# copy .env.example to .env, then fill in the variables below
uvicorn main:app --reload
```
Tables are created automatically on first startup. Interactive API docs live at
`http://localhost:8000/docs`. Generate a `JWT_SECRET` with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`. Optionally set `VITE_API_URL` in `frontend/.env`;
it defaults to `http://localhost:8000`.

### Environment variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Backend | Google Gemini API key (required) |
| `DATABASE_URL` | Backend | PostgreSQL connection string, e.g. from Neon (required) |
| `JWT_SECRET` | Backend | Secret used to sign auth tokens (required) |
| `ALLOWED_ORIGINS` | Backend | Comma-separated frontend origins allowed by CORS (defaults to localhost) |
| `VITE_API_URL` | Frontend | Base URL of the backend (defaults to `http://localhost:8000`) |

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health / status check |
| `POST` | `/analyze` | Analyze pasted resume text against a job description |
| `POST` | `/analyze/file` | Analyze an uploaded `.pdf`/`.txt` resume |
| `POST` | `/cover-letter` | Generate a tailored cover letter from pasted text |
| `POST` | `/cover-letter/file` | Generate a cover letter from an uploaded resume |
| `POST` | `/ats-check` | ATS readiness report for pasted resume text |
| `POST` | `/ats-check/file` | ATS readiness report (+ PDF structure checks) for a file |
| `POST` | `/auth/signup` | Create an account, returns a token |
| `POST` | `/auth/login` | Log in, returns a token |
| `GET` | `/auth/me` | Current user |
| `DELETE` | `/auth/me` | Delete account, analyses, and profile |
| `GET` | `/history` | The logged-in user's saved analyses |
| `DELETE` | `/history/{id}` | Delete one saved analysis |
| `GET` | `/profile` | Saved applicant details |
| `PUT` | `/profile` | Save or update applicant details |

Authenticated endpoints require a `Bearer` token from signup or login.

---

## Author

**Kurt Laurence P. Carcueva**

- Portfolio: https://kurtcarcueva-portfolio.vercel.app
- GitHub: https://github.com/Icession
- LinkedIn: https://www.linkedin.com/in/kurt-carcueva-b51650362
- Email: kl.carcueva05@gmail.com