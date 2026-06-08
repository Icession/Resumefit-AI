import { useState } from "react";
import AnalyzeForm from "./components/AnalyzeForm";
import ResultsView from "./components/ResultsView";
import CoverLetterPanel from "./components/CoverLetterPanel";
import ATSCheckPanel from "./components/ATSCheckPanel";
import AuthModal from "./components/AuthModal";
import HistoryView from "./components/HistoryView";
import ConfirmDialog from "./components/ConfirmDialog";
import { analyzeResume, analyzeResumeFile, deleteAccount } from "./api";
import { useAuth } from "./AuthContext";
import type { AnalyzeResponse } from "./types";

interface LastInputs {
  resumeText: string;
  resumeFile: File | null;
  jobDescription: string;
}

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [lastInputs, setLastInputs] = useState<LastInputs | null>(null);
  const [confirmAccountOpen, setConfirmAccountOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      setLastInputs({ resumeText, resumeFile, jobDescription });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeleteAccount() {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      setConfirmAccountOpen(false);
      logout();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete your account.");
      setConfirmAccountOpen(false);
    } finally {
      setDeletingAccount(false);
    }
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-forest" aria-hidden="true" />

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
              <button
                onClick={() => setConfirmAccountOpen(true)}
                className="text-xs text-muted hover:text-red-600"
              >
                Delete account
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
          <p className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-forest">
            <span className="inline-block h-px w-8 bg-forest" aria-hidden="true" />
            ResuMatch
          </p>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
            Does your resume <span className="italic text-forest">fit</span> the job?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Paste or upload your resume and a job description to get a match score,
            missing keywords, and concrete rewrite suggestions.
          </p>
          {user && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-forest/30 bg-forest/5 px-3 py-1 text-sm text-forest-dark">
              You're logged in — your analyses are being saved.
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

        {result && lastInputs && (
          <CoverLetterPanel
            resumeText={lastInputs.resumeText}
            resumeFile={lastInputs.resumeFile}
            jobDescription={lastInputs.jobDescription}
          />
        )}

        {result && lastInputs && (
          <ATSCheckPanel
            resumeText={lastInputs.resumeText}
            resumeFile={lastInputs.resumeFile}
          />
        )}

        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        <HistoryView isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
        <ConfirmDialog
          open={confirmAccountOpen}
          title="Delete your account?"
          message="This permanently deletes your account, saved analyses, and profile. This cannot be undone."
          confirmLabel="Delete account"
          loading={deletingAccount}
          onConfirm={confirmDeleteAccount}
          onCancel={() => setConfirmAccountOpen(false)}
        />
      </main>
    </>
  );
}