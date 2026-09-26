"use client";

import { TitleCollapse } from "@/components/accordion";
import { Irc101gPanel } from "@/components/irc-101g-panel";
import { money } from "@/lib/utils";
import { ADLS, linkedCopy, type ClaimScenarioRow } from "@/lib/linked-products";
import { IRC_101G_TITLE } from "@/lib/irc-101g";
import { SRC } from "@/lib/sources";
import type { LtcPolicy } from "@/lib/calc";
import { isLinkedKind } from "@/lib/calc";
import type { CareSetting } from "@/lib/costs";
import { SETTING_SHORT } from "@/lib/costs";

export function LinkedClaimCard({
  policy,
  scenarios,
  setting,
  defaultOpen = false,
  embedded = false,
}: {
  policy: LtcPolicy;
  scenarios: ClaimScenarioRow[];
  setting: CareSetting;
  defaultOpen?: boolean;
  embedded?: boolean;
}) {
  const copy = linkedCopy(policy.kind);
  const inner = (
    <>
      {embedded ? null : (
        <>
          <p className="font-display text-lg text-navy">{copy.title} — claim scenarios</p>
          <p className="mt-1 text-sm text-muted">
            <strong className="text-navy">{copy.chassis}. </strong>
            {copy.definition}
          </p>
        </>
      )}
      {embedded ? (
        <p className="text-sm text-muted">
          <strong className="text-navy">{copy.chassis}. </strong>
          {copy.definition}
        </p>
      ) : null}

      <TitleCollapse title="Benefit triggers" defaultOpen={defaultOpen} className="mt-3">
        <p className="text-sm text-muted">{copy.triggerBody}</p>
        <p className="mt-2 text-sm text-muted">
          The six ADLs: {ADLS.join(", ")}. Setting in this run:{" "}
          <strong className="text-navy">{SETTING_SHORT[setting]}</strong>. {copy.elimNote}
        </p>
      </TitleCollapse>

      <TitleCollapse title="How a claim is paid" defaultOpen={defaultOpen}>
        <p className="text-sm text-muted">{copy.howItPays}</p>
        <p className="mt-1 text-sm text-muted">{copy.ifClaim}</p>
        <p className="mt-1 text-sm text-muted">{copy.ifNoClaim}</p>

        {scenarios.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2 pr-2 font-medium">Scenario</th>
                <th className="py-2 pr-2 font-medium">What the contract is doing</th>
                <th className="py-2 pr-2 text-right font-medium">Insurance paid</th>
                <th className="py-2 pr-2 text-right font-medium">{copy.residualLabel}</th>
                <th className="py-2 pr-2 text-right font-medium">Assets left</th>
                <th className="py-2 text-right font-medium">Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t border-line ${row.id === "run" ? "bg-paper font-semibold text-navy" : "text-muted"}`}
                >
                  <td className="py-2 pr-2 align-top">
                    {row.title}
                    <span className="mt-0.5 block text-xs font-normal text-muted">{row.when}</span>
                  </td>
                  <td className="py-2 pr-2 align-top text-xs font-normal">{row.phase}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(row.insurance)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(row.residual)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(row.assetsLeft)}</td>
                  <td className={`py-2 text-right tabular-nums ${row.shortfall ? "text-shortfall" : ""}`}>
                    {row.shortfall ? money(row.shortfall) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : null}
        <p className="mt-2 text-xs text-muted">
          Educational planning math from the premium, monthly benefit, leverage, and residual
          you entered — not a carrier illustration, quote, or outline of coverage. * Death
          benefits vary by company and policy type. See{" "}
          <a
            href={SRC.irc101g}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
            data-source-href={SRC.irc101g}
          >
            IRC §101(g)
          </a>{" "}
          for the definition of accelerated death benefits and benefit eligibility
          requirements.
        </p>
      </TitleCollapse>

      {!embedded && isLinkedKind(policy.kind) ? (
        <TitleCollapse title={IRC_101G_TITLE} defaultOpen={defaultOpen}>
          <Irc101gPanel />
        </TitleCollapse>
      ) : null}
    </>
  );
  if (embedded) return inner;
  return (
    <div className="mb-4 card px-4 py-3">
      {inner}
    </div>
  );
}
