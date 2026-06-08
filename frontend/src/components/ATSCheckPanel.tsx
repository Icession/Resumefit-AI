import { useState } from "react";
import { checkATS, checkATSFile } from "../api";
import type { ATSReport } from "../types";

interface Props {
  resumeText: string;
  resumeFile: File | null;
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-forest";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

const STATUS_STYLES: Record<string, { dot: string; label: string }> = {
  good: { dot: "bg-green-500", label: "text-green-600" },
  warning: { dot: "bg-amber-500", label: "text-amber-600" },
  issue: { dot: "bg-red-500", label: "text-red-600" },
};

export default function ATSCheckPanel({ resumeText, resumeFile }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ATSReport | null>(null);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const data = resumeFile
        ? await checkATSFile(resumeFile)
        : await checkATS(resumeText);
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't run the ATS check.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white/60 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-5 w-1 rounded-full bg-forest" />
        <h2 className="font-display text-xl font-semibold">ATS readiness</h2>
      </div>

      <p className="mb-4 text-sm text-muted">
        Check whether an applicant tracking system can cleanly parse and read your resume —
        separate from how well it matches a specific job.
      </p>

      <button
        type="button"
        onClick={handleCheck}
        disabled={loading}
        className="rounded-lg bg-forest px-4 py-2 font-medium text-white hover:bg-forest-dark disabled:opacity-60"
      >
        {loading ? "Checking..." : report ? "Re-check" : "Check ATS readiness"}
      </button>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {report && (
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-display text-4xl font-semibold ${scoreColor(
                report.overall_score
              )}`}
            >
              {report.overall_score}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted">
              / 100 ATS readiness
            </span>
          </div>
          {report.summary && (
            <p className="mt-2 text-sm text-muted">{report.summary}</p>
          )}

          <ul className="mt-5 space-y-3">
            {report.checks.map((check, i) => {
              const style =
                STATUS_STYLES[check.status.toLowerCase()] ?? STATUS_STYLES.warning;
              return (
                <li
                  key={i}
                  className="rounded-xl border border-line bg-paper p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span className="font-medium">{check.category}</span>
                    <span
                      className={`ml-auto text-xs font-medium uppercase tracking-wider ${style.label}`}
                    >
                      {check.status}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{check.detail}</p>
                  {check.fix && (
                    <p className="mt-1 text-sm">
                      <span className="font-medium text-ink">Fix:</span>{" "}
                      <span className="text-muted">{check.fix}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}