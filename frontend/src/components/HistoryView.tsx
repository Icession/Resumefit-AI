import { useEffect, useState } from "react";
import { getHistory } from "../api";
import type { AnalysisRecord } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryView({ isOpen, onClose }: Props) {
  const [items, setItems] = useState<AnalysisRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    getHistory()
      .then(setItems)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load history.")
      )
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 px-4 py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-line bg-paper p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Your history</h2>
          <button onClick={onClose} className="text-sm text-muted hover:underline">
            Close
          </button>
        </div>

        {loading && <p className="mt-6 text-sm text-muted">Loading…</p>}

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {items && items.length === 0 && (
          <p className="mt-6 text-sm text-muted">
            No analyses yet. Run one and it'll show up here.
          </p>
        )}

        {items && items.length > 0 && (
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-line bg-white p-5"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-2xl font-semibold text-forest">
                    {item.match_score}
                    <span className="ml-1 text-xs uppercase tracking-wider text-muted">
                      match
                    </span>
                  </span>
                  <span className="text-xs text-muted">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted">
                  {item.job_description}
                </p>
                <p className="mt-2 text-sm">{item.summary}</p>
                {item.missing_keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.missing_keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-line px-2.5 py-0.5 text-xs text-forest"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}