# ResuMatch

> Match your resume to the job — before you apply.

ResuMatch scores how well your resume fits a specific job description, surfaces the
keywords and skills you're missing, and rewrites your weak bullet points using your
real experience — so you can tailor every application with confidence.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=fff)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=googlegemini&logoColor=fff)

**Live Demo:** https://resumatch-kl.vercel.app

> Note: the backend runs on a free tier that sleeps after inactivity, so the first
> analysis after a while may take ~50 seconds to wake up. It's fast afterward.

![ResuMatch screenshot](docs/screenshot.png)

---

## Features

- **Match score (0–100)** between a resume and a target job description
- **Missing keywords / skills** the job wants that your resume doesn't surface
- **Bullet rewrites** that strengthen your *real* experience — no fabrication
- **Paste or upload** your resume — supports `.pdf` and `.txt` files
- **Resilient AI calls** — automatic retry with backoff when the model is busy
- Clean, responsive UI

---

## Tech Stack

- **Frontend:** React · Vite · TypeScript · Tailwind CSS
- **Backend:** Python · FastAPI
- **AI:** Google Gemini API (Gemini 2.5 Flash)
- **PDF parsing:** pdfplumber
- **Deploy:** Vercel (frontend) · Render (backend)

> Planned: PostgreSQL · SQLModel for saved analysis history.

---

## How It Works

1. The user submits a resume (pasted text or an uploaded `.pdf`/`.txt`) and a job
   description from the React frontend.
2. For file uploads, the FastAPI backend extracts the text with pdfplumber.
3. The backend sends a structured prompt to the Gemini API, requesting a fixed
   JSON shape.
4. Gemini returns the analysis as structured JSON (score, missing keywords,
   suggestions, summary).
5. The frontend renders the report. The same data shape is shared across the
   frontend, backend, and AI — one contract end to end.

---

## Getting Started (Local)

### Prerequisites
- Node.js 18+
- Python 3.11+
- A free [Gemini API key](https://aistudio.google.com/apikey)

### Backend
```bash
cd backend
python -m venv venv
# Windows (PowerShell): venv\Scripts\Activate.ps1
# macOS / Linux:        source venv/bin/activate
pip install -r requirements.txt
# copy .env.example to .env, then add your GEMINI_API_KEY
uvicorn main:app --reload
```
API docs available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:5173`.
(Optionally set `VITE_API_URL` in `frontend/.env`; it defaults to `http://localhost:8000`.)

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `GEMINI_API_KEY` | Backend | Your Google Gemini API key (required) |
| `ALLOWED_ORIGINS` | Backend | Comma-separated frontend origins allowed by CORS (defaults to localhost) |
| `VITE_API_URL` | Frontend | Base URL of the backend (defaults to `http://localhost:8000`) |

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health / status check |
| `POST` | `/analyze` | Analyze pasted resume text against a job description |
| `POST` | `/analyze/file` | Analyze an uploaded `.pdf`/`.txt` resume against a job description |

---

## Roadmap

- [x] PDF / `.txt` resume upload
- [x] Ground AI suggestions in real experience (no fabrication)
- [x] Deployed live demo (Vercel + Render)
- [ ] User accounts + saved analysis history
- [ ] PDF export of reports
- [ ] Compare one resume against multiple jobs

---

## Author

**Kurt Laurence P. Carcueva**

- Portfolio: https://kurtcarcueva-portfolio.vercel.app
- LinkedIn: https://www.linkedin.com/in/kurt-carcueva-b51650362
- Email: kl.carcueva05@gmail.com