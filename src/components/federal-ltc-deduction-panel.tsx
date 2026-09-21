import { TitleCollapse } from "@/components/accordion";
import { Cite, LinkedCopy } from "@/components/source-links";
import {
  DRA_2005_TAX_INTRO,
  DRA_2005_TAX_POINTS,
  DRA_2005_TAX_TITLE,
  FEDERAL_PER_DIEM_2026,
  HIPAA_AGE_DEDUCTION_INTRO,
  federalTaxSummary,
} from "@/lib/ltc-tax";
import {
  IRC_101G_COMPARE,
  IRC_101G_INTRO,
  IRC_101G_POINTS,
  IRC_101G_TITLE,
} from "@/lib/irc-101g";
import { SRC } from "@/lib/sources";
import { TAX_SECTION_LABEL } from "@/lib/report-options";
import { money } from "@/lib/utils";

export function FederalLtcDeductionPanel({
  premium = 0,
}: {
  premium?: number;
}) {
  const rows = federalTaxSummary(premium).rows;
  return (
    <div className="text-sm text-muted">
      <p className="font-display text-lg text-navy">
        {TAX_SECTION_LABEL} — HIPAA age-based deduction brackets (2026)
      </p>
      <p className="mt-2"><LinkedCopy text={HIPAA_AGE_DEDUCTION_INTRO} /></p>
      <p className="mt-2">
        There is no general federal “LTC tax credit.” Only{" "}
        <Cite href={SRC.irc7702b}>tax-qualified</Cite> premiums may be treated as
        medical expenses, and only the slice that fits the age cap. You generally must
        itemize on Schedule A and clear the 7.5% of AGI medical-expense floor (
        <Cite href={SRC.irs502}>IRS Publication 502</Cite>
        ). Self-employed filers may take the same age-capped amount above-the-line.
        C-corporations may deduct the full premium. HSA dollars may pay tax-qualified
        premiums up to the same age cap. Hybrid / asset-based deposits are generally
        not deductible as LTC premiums. Non-qualified policies do not get this
        treatment; their benefits may be taxable. 2026 indemnity / per-diem exclusion:{" "}
        {money(FEDERAL_PER_DIEM_2026)} per day.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Attained age at year-end</th>
              <th className="py-2 pr-2 text-right">2026 eligible premium</th>
              {premium > 0 ? (
                <th className="py-2 text-right">Eligible on this premium</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.age} className="border-t border-line tabular-nums">
                <td className="py-1.5 pr-2">{r.age}</td>
                <td className="py-1.5 pr-2 text-right">{money(r.amount)}</td>
                {premium > 0 ? (
                  <td className="py-1.5 text-right">{money(r.eligible)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs">
        Caps are per insured. A couple uses two ages (for example, 68 and 72 in 2026
        could count up to {money(4960 + 6200)} combined, still subject to the 7.5% AGI
        floor on a joint return). Confirm the current Rev. Proc. and your return with a
        CPA or enrolled agent. Not tax advice.
      </p>

      <p className="mt-5 font-display text-lg text-navy">{IRC_101G_TITLE}</p>
      <p className="mt-2">
        {IRC_101G_INTRO}{" "}
        <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>
        {" · "}
        <Cite href={SRC.irc7702b}>§7702B</Cite>.
      </p>
      {IRC_101G_POINTS.map((p) => (
        <TitleCollapse key={p.heading} title={p.heading} className="mt-2">
          <p>{p.body}</p>
        </TitleCollapse>
      ))}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2"> </th>
              <th className="py-2 pr-2">IRC §101(g)</th>
              <th className="py-2">IRC §7702B</th>
            </tr>
          </thead>
          <tbody>
            {IRC_101G_COMPARE.map((row) => (
              <tr key={row.topic} className="border-t border-line">
                <td className="py-2 pr-2 align-top font-semibold text-navy">{row.topic}</td>
                <td className="py-2 pr-2 align-top">{row.g101}</td>
                <td className="py-2 align-top">{row.b7702}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-5 font-display text-lg text-navy">{DRA_2005_TAX_TITLE}</p>
      <p className="mt-2"><LinkedCopy text={DRA_2005_TAX_INTRO} /></p>
      {DRA_2005_TAX_POINTS.map((p) => (
        <TitleCollapse key={p.heading} title={p.heading} className="mt-2">
          <p><LinkedCopy text={p.body} /></p>
        </TitleCollapse>
      ))}
    </div>
  );
}