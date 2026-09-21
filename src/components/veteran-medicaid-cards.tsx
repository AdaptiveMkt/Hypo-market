import { TitleCollapse } from "@/components/accordion";
import { MoreInfo } from "@/components/more-info";
import { Cite } from "@/components/source-links";
import { moneyCents } from "@/lib/utils";
import { SRC } from "@/lib/sources";
import {
  medicaidVaPensionLimits,
  vaDisabilityCompensationRules,
  vaDisabilityRatingNotes,
  VA_DISABILITY_RATES_2026,
  VA_SMC_2026,
  VA_RATES_EFFECTIVE,
} from "@/lib/va-aa";

export function VeteranMedicaidCards({ state }: { state: string }) {
  const med = medicaidVaPensionLimits(state);
  const dis = vaDisabilityCompensationRules(state);
  const rating = vaDisabilityRatingNotes();
  return (
    <>
      <p className="mb-1 mt-4 font-display text-base text-navy">
        VA disability compensation ({VA_RATES_EFFECTIVE})
      </p>
      <p className="mb-2 text-sm text-muted">{dis.summary}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1 pr-2">Combined rating</th>
              <th className="py-1 pr-2 text-right">Veteran alone / mo</th>
              <th className="py-1 pr-2 text-right">With spouse / mo</th>
              <th className="py-1 text-right">+ spouse A&A / mo</th>
            </tr>
          </thead>
          <tbody>
            {VA_DISABILITY_RATES_2026.map((r) => (
              <tr key={r.rating} className="border-t border-line tabular-nums">
                <td className="py-1 pr-2">{r.rating}%</td>
                <td className="py-1 pr-2 text-right">{moneyCents(r.alone)}</td>
                <td className="py-1 pr-2 text-right">
                  {r.withSpouse == null ? "Same (no add-on)" : moneyCents(r.withSpouse)}
                </td>
                <td className="py-1 text-right">
                  {r.spouseAa == null ? "—" : `+${moneyCents(r.spouseAa)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Dependent add-ons start at 30%. Spouse A&A on compensation is added to the with-spouse
        rate — it is not pension A&A. SMC-S (housebound) {moneyCents(VA_SMC_2026.sHousebound)} /
        month veteran alone; SMC-L (A&A on compensation) {moneyCents(VA_SMC_2026.lAidAttendance)}{" "}
        month. Source:{" "}
        <Cite href={SRC.vaComp}>VA disability compensation rates</Cite>. Not a VA claim.
      </p>
      <MoreInfo title={med.title} summary={med.summary}>
        {med.bullets.map((b) => (
          <TitleCollapse key={b.heading} title={b.heading}>
            <p className="text-sm text-muted">{b.body}</p>
          </TitleCollapse>
        ))}
      </MoreInfo>
      <MoreInfo title={dis.title} summary={dis.summary}>
        {dis.bullets.map((b) => (
          <TitleCollapse key={b.heading} title={b.heading}>
            <p className="text-sm text-muted">{b.body}</p>
          </TitleCollapse>
        ))}
      </MoreInfo>
      <MoreInfo title={rating.title} summary={rating.summary}>
        {rating.bullets.map((b) => (
          <TitleCollapse key={b.heading} title={b.heading}>
            <p className="text-sm text-muted">{b.body}</p>
          </TitleCollapse>
        ))}
      </MoreInfo>
    </>
  );
}