import { TitleCollapse } from "@/components/accordion";
import { Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import {
  IRC_101G_COMPARE,
  IRC_101G_INTRO,
  IRC_101G_PER_DIEM_2026,
  IRC_101G_PER_DIEM_ANNUAL_2026,
  IRC_101G_POINTS,
} from "@/lib/irc-101g";

export function Irc101gPanel() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted">
      <p>
        <strong className="text-navy">In plain language. </strong>
        {IRC_101G_INTRO}
      </p>
      <p>
        Section 101(g) of the Internal Revenue Code is the rule that lets a{" "}
        <em>life insurance</em> policy pay part of the death benefit while the insured is
        still alive — an accelerated death benefit — without that payment automatically
        becoming taxable income. It is the tax engine inside many hybrid life / linked-benefit
        designs. It is <strong className="text-navy">not</strong> a stand-alone long-term
        care insurance policy under IRC §7702B, and it is generally{" "}
        <strong className="text-navy">not</strong> Medicaid Partnership-certified.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <TitleCollapse title="Terminal illness" className="mt-0">
          <p className="text-xs uppercase tracking-wide text-gold-ink">
            Physician: death reasonably expected within 24 months
          </p>
          <p className="mt-2">
            Accelerated amounts are generally fully excluded from income. There is{" "}
            <strong className="amt-red">no daily tax cap</strong>. The contract may still
            limit how much of the face can be taken (a percentage of specified amount).
          </p>
        </TitleCollapse>
        <TitleCollapse title="Chronic illness" className="mt-0">
          <p className="text-xs uppercase tracking-wide text-gold-ink">
            2 of 6 ADLs or severe cognitive impairment
          </p>
          <p className="mt-2">
            §101(g) uses the §7702B “chronically ill” definition. Many 101(g) riders also
            require the condition to last the <em>rest of life</em> — stricter than the
            90-day tax-qualified LTC trigger. Indemnity payments are tax-free only up to
            the IRS per-diem:{" "}
            <strong className="amt-red">${IRC_101G_PER_DIEM_2026}/day</strong> (
            <strong className="amt-red">
              ${IRC_101G_PER_DIEM_ANNUAL_2026.toLocaleString("en-US")}
            </strong>{" "}
            per 365-day year) in 2026.
          </p>
        </TitleCollapse>
      </div>

      <div className="overflow-x-auto">
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
              <tr key={row.topic} className="border-t border-line align-top">
                <td className="py-2 pr-2 font-semibold text-navy">{row.topic}</td>
                <td className="py-2 pr-2">{row.g101}</td>
                <td className="py-2">{row.b7702}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {IRC_101G_POINTS.map((p) => (
        <TitleCollapse key={p.heading} title={p.heading} className="mt-2">
          <p>{p.body}</p>
        </TitleCollapse>
      ))}

      <p className="text-xs">
        Statutory text:{" "}
        <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>
        {" · "}
        <Cite href={SRC.irc7702b}>26 U.S.C. §7702B</Cite>
        . Per-diem from IRS Rev. Proc. 2025-32. This is educational — not tax, legal, or
        insurance advice. Read the outline of coverage and confirm which code the form uses.
      </p>
    </div>
  );
}
