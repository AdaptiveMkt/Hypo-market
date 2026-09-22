import {
  HYBRID_LIFE_DESIGNS,
  HYBRID_LIFE_INTRO,
  HYBRID_LIFE_NOT_MODELED,
  HYBRID_LIFE_SIZING,
  HYBRID_LIFE_TAKEAWAY,
  HYBRID_LIFE_TAX,
} from "@/lib/hybrid-life-options";
import { money } from "@/lib/utils";
import { hybridFaceForMonthly, type LtcPolicy } from "@/lib/calc";

export function HybridLifeOptionsPanel({ policy }: { policy?: LtcPolicy }) {
  const monthly = policy?.kind === "hybridLife" ? Math.max(0, policy.monthlyBenefit || 0) : 0;
  const lev = policy?.kind === "hybridLife" ? Math.max(1, policy.leverage || 1) : 0;
  const face = monthly > 0 ? hybridFaceForMonthly(monthly) : 0;
  const pool = face * (lev || 1);
  const months = monthly > 0 ? pool / monthly : 0;

  return (
    <div className="space-y-4 text-sm text-navy">
      <p className="leading-relaxed text-muted">{HYBRID_LIFE_INTRO}</p>

      {monthly > 0 ? (
        <p className="rounded-lg border border-gold bg-cream px-3 py-2 leading-relaxed">
          This run’s Hybrid fields: monthly {money(monthly)}, face {money(face)}, leverage {lev}×, pool{" "}
          <strong className="tabular-nums">{money(pool)}</strong>
          {months > 0 ? ` (about ${months.toFixed(0)} months / ${(months / 12).toFixed(1)} years at that monthly).` : "."}{" "}
          Not a quote.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Design</th>
              <th className="py-2 pr-2">What it is</th>
              <th className="py-2 pr-2">LTC pool</th>
              <th className="py-2">In this model</th>
            </tr>
          </thead>
          <tbody>
            {HYBRID_LIFE_DESIGNS.map((row) => (
              <tr key={row.design} className="border-t border-line align-top">
                <td className="py-2 pr-2 font-semibold">{row.design}</td>
                <td className="py-2 pr-2 text-muted">{row.what}</td>
                <td className="py-2 pr-2 text-muted">{row.pool}</td>
                <td className="py-2 text-muted">{row.inModel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-display text-base text-navy">How this model sizes hybrid life</h3>
        <dl className="mt-2 grid gap-1.5">
          {HYBRID_LIFE_SIZING.map((row) => (
            <div key={row.field} className="flex justify-between gap-3 border-t border-line py-1.5">
              <dt className="text-muted">{row.field}</dt>
              <dd className="max-w-[28rem] text-right">{row.typical}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="font-display text-base text-navy">Tax and Medicaid notes</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
          {HYBRID_LIFE_TAX.map((b) => (
            <li key={b.slice(0, 48)}>{b}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-base text-navy">Not in this model</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
          {HYBRID_LIFE_NOT_MODELED.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>

      <p className="leading-relaxed">{HYBRID_LIFE_TAKEAWAY}</p>
    </div>
  );
}
