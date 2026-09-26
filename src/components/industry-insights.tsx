import { TitleCollapse } from "@/components/accordion";
import { ClaimsHistoryPanel } from "@/components/claims-history-panel";
import { Irc101gPanel } from "@/components/irc-101g-panel";
import { LinkedClaimCard } from "@/components/linked-claim-card";
import { LtcGlossaryTerms } from "@/components/ltc-glossary";
import { SamplePolicyPack } from "@/components/sample-ltc-policy";
import { StateName } from "@/components/state-name";
import { AgiPremiumCallout } from "@/components/agi-premium-callout";
import { WhatConsumersBuyPanel } from "@/components/what-consumers-buy-panel";
import type { LtcPolicy } from "@/lib/calc";
import { isLinkedKind } from "@/lib/calc";
import { BENEFIT_TRIGGER_BODY } from "@/lib/disclaimer";
import { linkedCopy, type ClaimScenarioRow } from "@/lib/linked-products";
import type { CareSetting } from "@/lib/costs";
import type { ReactNode } from "react";

function Insight({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="card mt-3 px-3 py-2">
      <TitleCollapse
        className="mt-0"
        hint={hint}
        title={
          <span className="inline-flex items-baseline gap-2">
            <span className="tabular-nums text-teal">{String(n).padStart(2, "0")}</span>
            <span>{title}</span>
          </span>
        }
      >
        {children}
      </TitleCollapse>
    </div>
  );
}

export function IndustryInsightsPanel({
  ageToday = 0,
  policy,
  state,
  setting,
  scenarios = [],
  countable = 0,
  agi = 0,
  embedded = false,
}: {
  ageToday?: number;
  policy: LtcPolicy;
  state?: string;
  setting?: CareSetting;
  scenarios?: ClaimScenarioRow[];
  countable?: number;
  agi?: number;
  embedded?: boolean;
}) {
  const linked = linkedCopy(isLinkedKind(policy.kind) ? policy.kind : "assetBased");
  const body = (
    <>
      <AgiPremiumCallout agi={agi} className="mt-2" />
      {embedded ? (
        <p className="text-sm text-muted">
          Numbered reference sections used in this hypothetical. Each is collapsed until you
          open the title. Not this policy’s claim and not a quote.
        </p>
      ) : (
        <>
          <p className="font-display text-xl text-navy">Industry insights</p>
          <p className="mt-1 text-sm text-muted">
            Numbered reference sections used in this hypothetical. Each is collapsed until you
            open the title. Not this policy’s claim and not a quote.
          </p>
        </>
      )}

      <Insight
        n={1}
        title="Insurance policies"
        hint="Underwriting, inflation math, Partnership default, and sample outlines for traditional, asset-based, hybrid life, and LTC annuity."
      >
        <p className="text-sm text-muted">
          Real policies require underwriting. They have benefit triggers, elimination
          periods, exclusions, and limitations, and premiums may increase. Compound
          inflation multiplies the daily benefit each year; simple inflation adds a
          fixed percent of the original daily benefit each year. Selecting Include a
          policy defaults to DRA Partnership
          {state ? (
            <>
              {" "}
              where <StateName name={state} /> participates
            </>
          ) : null}
          . Choose Non-Qualified LTC Insurance policy to model a traditional policy
          with no Medicaid asset disregard.
        </p>
        <SamplePolicyPack policy={policy} state={state} countable={countable} />
      </Insight>

      <Insight
        n={2}
        title="Benefit triggers"
        hint="When a tax-qualified policy may start to pay — 2 of 6 ADLs or severe cognitive impairment."
      >
        <p className="text-sm text-muted">
          {BENEFIT_TRIGGER_BODY} This run’s elimination period is{" "}
          <strong className="amt-red">{policy.elimDays} days</strong>.
        </p>
      </Insight>

      <Insight
        n={3}
        title="IRC §101(g) accelerated death benefits"
        hint="How a life policy can pay while living, tax treatment, and how it differs from §7702B LTCI."
      >
        <Irc101gPanel />
      </Insight>

      {setting ? (
        <Insight
          n={4}
          title={`${linked.title} — claim scenarios`}
          hint="Linked-benefit chassis, how a claim is paid, residual death benefit, and this run’s dollars."
        >
          <LinkedClaimCard
            embedded
            policy={
              isLinkedKind(policy.kind)
                ? policy
                : { ...policy, kind: "assetBased", enabled: true }
            }
            scenarios={scenarios}
            setting={setting}
          />
        </Insight>
      ) : null}

      <Insight
        n={setting ? 5 : 4}
        title="Long-term care glossary of terms"
        hint="Word first, then the definition used in this hypothetical."
      >
        <p className="mb-2 text-xs text-muted">
          Click a word for the definition used in this hypothetical. Educational — not a
          policy contract, outline of coverage, or legal advice.
        </p>
        <LtcGlossaryTerms />
      </Insight>

      <Insight
        n={setting ? 6 : 5}
        title="What people are buying"
        hint="Milliman / LIMRA / AALTCI mix — daily or monthly, period, wait, inflation, and age."
      >
        <WhatConsumersBuyPanel ageToday={ageToday} kind={policy.kind} agi={agi} />
      </Insight>

      <Insight
        n={setting ? 7 : 6}
        title="Industry claims-paying history"
        hint="Paid vs incurred benefits, claim causes, rate stability, and who reports the numbers."
      >
        <ClaimsHistoryPanel />
      </Insight>
    </>
  );
  if (embedded) return body;
  return <div className="card-xl border-2 px-4 py-4 sm:col-span-2">{body}</div>;
}
