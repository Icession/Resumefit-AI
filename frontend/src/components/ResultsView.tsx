import type { AnalyzeResponse } from "../types";

export default function ResultsView({ data }: { data: AnalyzeResponse }) {
  return (
    <section className="mt-12 grid gap-6 animate-[fadeIn_0.4s_ease]">
      <div className="flex flex-wrap items-center gap-6 rounded-3xl border border-line bg-white/60 p-7">
        <ScoreRing score={data.match_score} />
        <p className="max-w-xl text-sm leading-relaxed text-muted">{data.summary}</p>
      </div>

      <div className="rounded-3xl border border-line bg-white/60 p-7">
        <h2 className="mb-3 font-display text-xl">Missing keywords</h2>
        <div className="flex flex-wrap gap-2">
          {data.missing_keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border border-forest/30 bg-forest/5 px-3 py-1 text-sm text-forest-dark"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white/60 p-7">
        <h2 className="mb-4 font-display text-xl">Bullet rewrites</h2>
        <ul className="grid gap-4">
          {data.suggestions.map((s, i) => (
            <li key={i} className="grid gap-2 border-l-2 border-line pl-4">
              <span className="text-sm text-muted line-through">{s.original}</span>
              <span className="text-sm font-medium">{s.improved}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ScoreRing({ score }: { score: number }) {
  const tone =
    score >= 75 ? "text-forest" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex flex-col items-center">
      <span className={`font-display text-6xl font-black ${tone}`}>{score}</span>
      <span className="text-xs uppercase tracking-widest text-muted">match score</span>
    </div>
  );
}
