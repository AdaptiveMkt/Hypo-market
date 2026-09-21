import type { ConfidenceResult } from "@/lib/confidence";

const BAND_CLASS: Record<string, string> = {
  High: "text-teal",
  Moderate: "text-navy",
  Limited: "text-gold-ink",
  Low: "text-deplete",
};

export function ConfidencePanel({ confidence }: { confidence: ConfidenceResult }) {
  return (
    <div>
      <p className="mb-3 text-sm text-muted">{confidence.summary}</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Overall</p>
          <p className={`font-display text-3xl tabular-nums ${BAND_CLASS[confidence.band]}`}>
            {confidence.overall}
          </p>
          <p className={`text-sm font-semibold ${BAND_CLASS[confidence.band]}`}>{confidence.band}</p>
        </div>
        {confidence.factors.map((f) => (
          <div key={f.id} className="rounded-lg bg-cream px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">{f.label}</p>
            <p className={`font-display text-xl tabular-nums ${BAND_CLASS[f.band]}`}>
              {f.score}
              <span className="ml-2 text-sm font-sans font-semibold">{f.band}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{f.note}</p>
          </div>
        ))}
      </div>
      {confidence.recommendations.length > 0 ? (
        <div className="mb-2">
          <p className="mb-1 text-sm font-semibold text-navy">What would raise this score</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
            {confidence.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-xs text-muted">
        Educational grade of this run’s inputs — not the probability of needing care, a
        statistical confidence interval, or a guarantee of results.
      </p>
    </div>
  );
}