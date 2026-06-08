import type { ReactNode } from "react";
import type { AnalyzeResponse } from "../types";

export default function ResultsView({ data }: { data: AnalyzeResponse }) {
  return (
    <section className="mt-12 grid gap-6 animate-[fadeIn_0.4s_ease]">
      <div className="flex flex-wrap items-center gap-7 rounded-3xl border border-line bg-white/70 p-7 shadow-sm">
        <ScoreRing score={data.match_score} />
        <p className="max-w-xl text-sm leading-relaxed text-muted">{data.summary}</p>
      </div>

      <Card title="Missing keywords">
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
      </Card>

      <Card title="Bullet rewrites">
        <ul className="grid gap-5">
          {data.suggestions.map((s, i) => (
            <li key={i} className="grid gap-1.5 border-l-2 border-forest/30 pl-4">
              <span className="text-sm text-muted line-through">{s.original}</span>
              <span className="text-sm font-medium text-ink">{s.improved}</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white/70 p-7 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2.5 font-display text-xl">
        <span className="inline-block h-5 w-1 rounded-full bg-forest" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const numberTone =
    score >= 75 ? "text-forest" : score >= 50 ? "text-amber-600" : "text-red-600";
  const arcTone =
    score >= 75 ? "stroke-forest" : score >= 50 ? "stroke-amber-600" : "stroke-red-600";

  const size = 132;
  const sw = 10;
  const r = (size - sw) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-line"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={`${arcTone} transition-[stroke-dashoffset] duration-700 ease-out`}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display text-5xl font-black leading-none ${numberTone}`}>
          {score}
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted">
          match
        </span>
      </div>
    </div>
  );
}