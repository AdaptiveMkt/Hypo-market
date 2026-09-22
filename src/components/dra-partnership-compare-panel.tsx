import {
  DRA_COMPARE_INTRO,
  DRA_DOES,
  DRA_DOES_NOT,
  DRA_FUTURE_NOTE,
  DRA_INFLATION_ROWS,
  DRA_LANE_ROWS,
  DRA_NO_PROGRAM,
  DRA_RECIPROCITY_SHORT,
  DRA_WHEN_TO_USE,
} from "@/lib/dra-partnership-compare";
import { money } from "@/lib/utils";
import type { PreservationImpact } from "@/lib/partnership";

export function DraPartnershipComparePanel({
  state,
  preservation,
}: {
  state: string;
  preservation?: PreservationImpact;
}) {
  const paid = preservation?.result.benefitsPaid ?? 0;
  const remaining = preservation?.partnership.remaining ?? 0;
  const limit = preservation?.medicaidLimit ?? 0;

  return (
    <div className="space-y-4 text-sm text-navy">
      <p className="leading-relaxed text-muted">{DRA_COMPARE_INTRO}</p>
      <p className="text-xs leading-relaxed text-muted">{DRA_FUTURE_NOTE}</p>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg border border-line px-3 py-3">
          <h3 className="font-display text-base text-navy">What DRA Partnership does</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
            {DRA_DOES.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-line px-3 py-3">
          <h3 className="font-display text-base text-navy">What it does not do</h3>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
            {DRA_DOES_NOT.map((b) => (
              <li key={b.slice(0, 40)}>{b}</li>
            ))}
          </ul>
        </article>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Lane</th>
              <th className="py-2 pr-2">Pays the care bill</th>
              <th className="py-2 pr-2">Medicaid asset cap</th>
              <th className="py-2">If you never claim</th>
            </tr>
          </thead>
          <tbody>
            {DRA_LANE_ROWS.map((row) => (
              <tr key={row.lane} className="border-t border-line align-top">
                <td className="py-2 pr-2 font-semibold">{row.lane}</td>
                <td className="py-2 pr-2 text-muted">{row.pays}</td>
                <td className="py-2 pr-2 text-muted">{row.medicaid}</td>
                <td className="py-2 text-muted">{row.ifNoClaim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {preservation ? (
        <div className="rounded-lg border border-gold bg-cream px-3 py-3">
          <h3 className="font-display text-base text-navy">This run in {state}</h3>
          <p className="mt-1 leading-relaxed text-muted">
            Insurance paid <strong className="tabular-nums text-navy">{money(paid)}</strong>. Countable remaining{" "}
            <strong className="tabular-nums text-navy">{money(remaining)}</strong>. Resource allowance in this model{" "}
            <strong className="tabular-nums text-navy">{money(limit)}</strong>.
          </p>
          <dl className="mt-2 grid gap-1.5">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Without Partnership, could keep</dt>
              <dd className="tabular-nums">{money(preservation.policyOnly.keep)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">DRA Partnership protected</dt>
              <dd className="tabular-nums">{money(preservation.partnership.protected)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Could keep at Medicaid with Partnership</dt>
              <dd className="tabular-nums">{money(preservation.partnership.keep)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Spend-down still</dt>
              <dd className="tabular-nums">{money(preservation.partnership.spend)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">
            Partnership helps only if the policy is Partnership-certified traditional tax-qualified, benefits were paid, and Medicaid is later needed. While the policy still covers the private rate, Medicaid is usually not yet paying.
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="font-display text-base text-navy">Inflation required by issue age</h3>
        <dl className="mt-2 grid gap-2">
          {DRA_INFLATION_ROWS.map((row) => (
            <div key={row.age} className="rounded-lg border border-line px-3 py-2">
              <p className="font-semibold">{row.age}</p>
              <p className="text-muted">{row.rule}</p>
              <p className="mt-1 text-muted">{row.typical}</p>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="font-display text-base text-navy">Reciprocity if you move</h3>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-muted">
          {DRA_RECIPROCITY_SHORT.map((b) => (
            <li key={b.slice(0, 40)}>{b}</li>
          ))}
        </ul>
        <p className="mt-2 text-muted">{DRA_NO_PROGRAM}</p>
      </div>

      <p className="leading-relaxed">{DRA_WHEN_TO_USE}</p>
    </div>
  );
}
