import { useState } from "react";
import AnalyzeForm from "./components/AnalyzeForm";
import ResultsView from "./components/ResultsView";
import { analyzeResume, analyzeResumeFile } from "./api";
import type { AnalyzeResponse } from "./types";

export default function App() {
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
      <header className="mb-12">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-forest">ResumeFit AI</p>
        <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
          Does your resume fit the job?
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Paste or upload your resume and a job description to get a match score,
          missing keywords, and concrete rewrite suggestions.
        </p>
      </header>

      <AnalyzeForm loading={loading} onSubmit={handleSubmit} />

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {result && <ResultsView data={result} />}
    </main>
  );
}