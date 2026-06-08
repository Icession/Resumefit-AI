import { useState } from "react";
import AnalyzeForm from "./components/AnalyzeForm";
import ResultsView from "./components/ResultsView";
import AuthModal from "./components/AuthModal";
import HistoryView from "./components/HistoryView";
import { analyzeResume, analyzeResumeFile } from "./api";
import { useAuth } from "./AuthContext";
import type { AnalyzeResponse } from "./types";

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleSubmit(
    resumeText: string,
    resumeFile: File | null,
    jobDescription: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const data = resumeFile
        ? await analyzeResumeFile(resumeFile, jobDescription)
        : await analyzeResume(resumeText, jobDescription);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 flex items-center justify-end gap-3 text-sm">
        {authLoading ? null : user ? (
          <>
            <span className="text-muted">{user.email}</span>
            <button
              onClick={() => setHistoryOpen(true)}
              className="rounded-lg border border-line px-3 py-1.5 font-medium hover:border-forest hover:text-forest"
            >
              History
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-line px-3 py-1.5 font-medium hover:border-forest hover:text-forest"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => setAuthOpen(true)}
            className="rounded-lg bg-forest px-3 py-1.5 font-medium text-white hover:bg-forest-dark"
          >
            Log in / Sign up
          </button>
        )}
      </div>

      <header className="mb-12">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-forest">ResuMatch</p>
        <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
          Does your resume fit the job?
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Paste or upload your resume and a job description to get a match score,
          missing keywords, and concrete rewrite suggestions.
        </p>
        {user && (
          <p className="mt-3 text-sm text-forest">
            You're logged in — your analyses are being saved to your history.
          </p>
        )}
      </header>

      <AnalyzeForm loading={loading} onSubmit={handleSubmit} />

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && <ResultsView data={result} />}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <HistoryView isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </main>
  );
}