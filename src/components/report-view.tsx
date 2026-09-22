"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money, moneyCents } from "@/lib/utils";
import { StateName, Pct } from "@/components/state-name";
import { CHART } from "@/lib/palette";
import { SETTING_LABELS, SETTING_SHORT, type CareSetting, historySpan } from "@/lib/costs";
import {
  ASSET_FIELDS,
  DEFAULT_ASSET_ROIS,
  csvMilestones,
  chartTickInterval,
  depletionCalendar,
  formatYearsLast,
  holdingsFrom,
  inflateDaily,
  isLifetimeBenefit,
  isLinkedKind,
  leverageLabel,
  policyKindLabel,
  specifiedFaceAmount,
  yearsPoolLasts,
  targetPremium,
  targetPremiumParts,
  TARGET_PREMIUM_LABEL,
  type AssetRois,
  type Assets,
  type LtcPolicy,
  type PolicyKind,
  type Projection,
} from "@/lib/calc";
import { LinkedClaimCard } from "@/components/linked-claim-card";
import { HybridLifeOptionsPanel } from "@/components/hybrid-life-options-panel";
import { DraPartnershipComparePanel } from "@/components/dra-partnership-compare-panel";
import { YearByYearTable } from "@/components/year-by-year-table";
import { linkedClaimScenarios, linkedCopy } from "@/lib/linked-products";
import { type MedicaidProfile } from "@/lib/medicaid";
import { partyFilled, type AdvisorParty, type ContactParty } from "@/lib/report";
import { careCostCompound, careCostSimple, CPI_METHODS } from "@/lib/cpi";
import { LTC_COMPARE_FEATURES, LTC_INSURANCE_OPTIONS } from "@/lib/ltc-compare";
import { HEALTH_INSURANCE_INTRO, HEALTH_INSURANCE_TYPES } from "@/lib/health-insurance-types";
import { LTC_RIDER_EXAMPLES, LTC_RIDER_GLANCE, LTC_RIDER_HYBRID_NOTE, LTC_RIDER_INTRO, LTC_RIDERS } from "@/lib/ltc-riders";
import { MedicaidVaBody } from "@/components/medicaid-va-card";
import { AdvisorProfessionalFolds, DesignationNoticeFold, DisclaimerCard } from "@/components/disclaimer-card";
import { TitleCollapse } from "@/components/accordion";
import { NaicLastPages } from "@/components/naic-last-pages";
import { Cite, CopyrightMark, LinkedCopy } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import { DISCLOSURE_CARD_TITLE } from "@/lib/disclaimer";
import { DisclosureTermsLink } from "@/components/disclosure-link";
import { NAIC_LOCKOUT_ASSETS, NAIC_SUITABILITY_BANNER, NAIC_SUITABILITY_WARN, NAIC_WARN_ASSETS, insuranceLockedOut, insuranceNeedsWarning } from "@/lib/naic-suitability";
import { FilledNaicWorksheet } from "@/components/naic-filled-worksheet";
import { ALL_DETAILS_ON, TAX_SECTION_LABEL, disclosureSelected, type DetailFlags } from "@/lib/report-options";
import type { SensitivityResult } from "@/lib/sensitivity";
import type { ConfidenceResult } from "@/lib/confidence";
import { ConfidencePanel } from "@/components/confidence-panel";
import { IndustryInsightsPanel } from "@/components/industry-insights";
import { ChartRegion } from "@/components/chart-region";
import { pauseCeleste, playCelesteScript, resumeCeleste, stopCeleste, watchCeleste } from "@/lib/celeste";
import { setVoiceOn, useVoiceOn } from "@/lib/voice-pref";
import { LtcGlossaryList } from "@/components/ltc-glossary";
import { SamplePolicyPack } from "@/components/sample-ltc-policy";
import {
  assetProtectionLimits,
  medicaidEligibilityImpact,
  type PartnershipResult,
  type PreservationImpact,
  type StatePartnershipRow,
} from "@/lib/partnership";
import { creditVsDeductionCopy, stateLtcTaxBreak, taxIncentiveGroups } from "@/lib/ltc-tax";
import { Irc1035Panel } from "@/components/irc-1035-panel";
import { FederalLtcDeductionPanel } from "@/components/federal-ltc-deduction-panel";
import { RECIPROCITY_RULES, type ReciprocityOutcome } from "@/lib/reciprocity";

const MODEL_START_YEAR = new Date().getFullYear();

function calendarYear(modelYear: number) {
  return MODEL_START_YEAR + Math.max(1, modelYear) - 1;
}

type ChartPoint = {
  label: string;
  cost: number;
  insurance: number;
  remaining: number;
  remainingNavy: number | null;
  remainingRed: number | null;
  remainingSelfFunded: number;
  remainingLevel: number;
  insurancePool: number;
  depletedHere: boolean;
};

type PieSlice = { name: string; value: number; color: string };

type AllocRow = {
  label: string;
  amount: number;
  heldOut: number;
  pct: number;
  speed: string;
};

type InflationRow = {
  key: string;
  label: string;
  how?: string;
  benefitInflationPct: number;
  inflationMethod: "none" | "compound" | "simple";
  proj: Projection;
};
type CareRow = { setting: CareSetting; today: number; proj: Projection };
type InsuranceCompareRow = {
  key: string;
  label: string;
  proj: Projection;
  impact: PreservationImpact;
  years: number;
};

export function ReportView({
  state,
  setting,
  delay,
  ageToday = 0,
  claimAge = 0,
  duration,
  cpi,
  roi,
  taxRate,
  iraRoi,
  netRoi,
  assets,
  assetRois,
  excludeHome,
  grossPool,
  pool,
  todayCost,
  yearsToday,
  yearsClaim,
  combinedToday,
  combinedClaim,
  insToday,
  insClaim,
  premiumTarget,
  annualIncome = 0,
  summary,
  recommendations,
  chartData,
  pie,
  majority,
  allocationRows,
  result,
  selfFunded,
  policy,
  inflationCompare,
  insuranceCompare,
  structureCompare = [],
  careCompare,
  sensitivity,
  confidence,
  medicaid,
  depletedYear,
  client,
  advisor,
  partnership,
  partnershipRows,
  preservation,
  reciprocity,
  reciprocityExamples,
  veteran = false,
  protectOn = false,
  details = ALL_DETAILS_ON,
  onClose,
  onPdf,
}: {
  state: string;
  setting: CareSetting;
  delay: number;
  ageToday?: number;
  claimAge?: number;
  duration: number;
  cpi: number;
  roi: number;
  taxRate: number;
  iraRoi: number;
  netRoi: number;
  assets: Assets;
  assetRois?: AssetRois;
  excludeHome: boolean;
  grossPool: number;
  pool: number;
  todayCost: number;
  yearsToday: number;
  yearsClaim: number;
  combinedToday: number;
  combinedClaim: number;
  insToday: number;
  insClaim: number;
  premiumTarget: number;
  annualIncome?: number;
  summary: string;
  recommendations: string[];
  chartData: ChartPoint[];
  pie: PieSlice[];
  majority: boolean;
  allocationRows: AllocRow[];
  result: Projection;
  selfFunded: Projection;
  policy: LtcPolicy;
  inflationCompare: InflationRow[];
  insuranceCompare: InsuranceCompareRow[];
  structureCompare?: {
    key: PolicyKind;
    label: string;
    thisRun?: boolean;
    proj: Projection;
  }[];
  careCompare: CareRow[];
  sensitivity: SensitivityResult;
  confidence: ConfidenceResult;
  medicaid: MedicaidProfile;
  depletedYear: number | null;
  client: ContactParty;
  advisor: AdvisorParty;
  partnership: PartnershipResult;
  partnershipRows: StatePartnershipRow[];
  preservation: PreservationImpact;
  reciprocity: ReciprocityOutcome;
  reciprocityExamples: ReciprocityOutcome[];
  veteran?: boolean;
  protectOn?: boolean;
  details?: DetailFlags;
  onClose: () => void;
  onPdf: () => void;
}) {
  const csv = policy.csv?.enabled
    ? csvMilestones(policy.singlePremium, policy.csv, delay, duration)
    : null;
  const iraBal = Number(assets.ira) || 0;
  const homeEquity = Number(assets.home) || 0;
  const spouseExcluded = Number(assets.excludable) || 0;
  const laterYearCount =
    depletedYear != null ? result.rows.filter((r) => r.year > depletedYear).length : 0;
  const depletedWhen = depletionCalendar(result.rows, depletedYear, MODEL_START_YEAR);
  const lifetime = isLifetimeBenefit(policy.benefitYears);
  const yearSets =
    policy.enabled && insuranceCompare.length > 0
      ? insuranceCompare.map((r) => ({
          key: r.key,
          label: r.label,
          proj: r.proj,
          enabled: true,
          lifetime: Boolean(r.proj.lifetimeBenefit),
        }))
      : [
          {
            key: "self" as const,
            label: "",
            proj: result,
            enabled: policy.enabled,
            lifetime,
          },
        ];
  const tip = {
    background: "#fffdf8",
    border: "1px solid #d9cfc0",
    borderRadius: 8,
  };
  const premiumParts = targetPremiumParts(pool, annualIncome);
  const [voice, setVoice] = useState<"idle" | "playing" | "paused">("idle");
  const voiceOn = useVoiceOn();
  const reportRef = useRef<HTMLDivElement>(null);
  const spoken = useMemo(() => {
    const recs = recommendations
      .map((r, i) => `Recommendation ${i + 1}. ${r}`)
      .join(" ");
    return `Descriptive summary. ${summary} Recommendations to consider. ${recs}`;
  }, [summary, recommendations]);

  useEffect(() => {
    const off = watchCeleste(setVoice);
    const root = reportRef.current;
    root?.focus();
    const inert = [
      document.getElementById("main-content"),
      document.querySelector("header"),
      document.querySelector("footer"),
      document.getElementById("hypo-chatbot"),
    ];
    inert.forEach((n) => n?.setAttribute("inert", ""));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      off();
      stopCeleste();
      inert.forEach((n) => n?.removeAttribute("inert"));
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const linkedScenarios = useMemo(() => {
    if (!policy.enabled || !isLinkedKind(policy.kind)) return [];
    const holdings = holdingsFrom(assets, assetRois ?? DEFAULT_ASSET_ROIS, excludeHome);
    return linkedClaimScenarios({
      policy,
      result,
      baseArgs: {
        pool,
        state,
        setting,
        delay,
        duration,
        cpiPct: cpi,
        roiPct: roi,
        taxRatePct: taxRate,
        iraBalance: Number(assets.ira) || 0,
        iraRoiPct: iraRoi,
        holdings,
      },
      duration,
      setting,
    });
  }, [
    policy,
    result,
    assets,
    assetRois,
    excludeHome,
    pool,
    state,
    setting,
    delay,
    duration,
    cpi,
    roi,
    taxRate,
    iraRoi,
  ]);

  const insuranceLocked = insuranceLockedOut(pool);
  const insuranceWarn = insuranceNeedsWarning(pool);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-cream"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      style={{ scrollPaddingTop: "5.5rem" }}
    >
      <article
        id="aum-report"
        ref={reportRef}
        tabIndex={-1}
        className="mx-auto max-w-5xl space-y-8 bg-paper px-4 py-8 text-ink outline-none sm:px-8"
      >
        <header className="report-block border-b-2 border-gold pb-4">
          <p className="text-xs uppercase tracking-[0.14em] text-gold-ink">
            Funding LTC Marketplace
          </p>
          <h1 id="report-title" className="mt-1 font-display text-3xl text-navy">
            Long Term Care Asset Utilization Modeling
          </h1>
          <p className="mt-2 text-sm text-muted">
            {SETTING_LABELS[setting]} in <StateName name={state} /> · care{" "}
            {delay === 0 ? "starting now" : `in ${delay} years`}
            {ageToday >= 18 ? ` (age ${ageToday} today → ${ageToday + delay} at claim)` : ""}
            · {duration} years modeled ·{" "}
            {new Date().toLocaleDateString("en-US")}
          </p>
        </header>

        <div
          className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 py-3 backdrop-blur-sm"
          role="toolbar"
          aria-label="Report controls"
        >
          <div className="stack-actions md:grid-cols-2">
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream disabled:opacity-50"
            onClick={pauseCeleste}
            disabled={voice !== "playing"}
          >
            Stop speaking
          </button>
          <button
            type="button"
            className="btn-block rounded-lg bg-navy text-cream hover:bg-teal disabled:opacity-50"
            onClick={() => {
              if (!voiceOn) setVoiceOn(true);
              if (voice === "paused") resumeCeleste();
              else void playCelesteScript(spoken);
            }}
            disabled={voice === "playing"}
          >
            {voice === "paused" ? "Resume speaking" : "Hear summary"}
          </button>
          <p className="col-span-full text-xs leading-snug text-muted" aria-live="polite">
            {voice === "playing"
              ? "Celeste is reading the descriptive summary and recommendations…"
              : voice === "paused"
                ? "Paused. Resume speaking to continue."
                : "Celeste does not start on its own. Tap Hear summary if you want this read aloud."}
          </p>
            <button
              type="button"
              onClick={onPdf}
              className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal"
            >
              (X) Close
            </button>
          </div>
        </div>

        {insuranceLocked ? (
          <section className="report-block card border-2 px-4 py-3">
            <p className="text-sm font-semibold text-navy">{NAIC_SUITABILITY_BANNER}</p>
            <p className="mt-2 text-xs text-muted">
              Countable assets in this run are {money(pool)}, under {money(NAIC_LOCKOUT_ASSETS)}.
              Insurance was locked out of this hypothetical. Not a carrier suitability
              decision.
            </p>
          </section>
        ) : insuranceWarn ? (
          <section className="report-block rounded-lg border-2 border-deplete bg-cream px-4 py-3">
            <p className="text-sm font-semibold text-deplete">{NAIC_SUITABILITY_WARN}</p>
            <p className="mt-1 text-xs text-muted">
              Countable assets are {money(pool)}, under {money(NAIC_WARN_ASSETS)}. Confirm
              affordability with a licensed representative, other professional advisors or
              planning attorney.
            </p>
          </section>
        ) : null}

        {(partyFilled(client) || veteran || (policy.enabled && (partyFilled(advisor) || advisor.firm || advisor.designation))) ? (
          <section className="report-block">
            <h2 className="mb-3 font-display text-xl text-navy">Prepared for</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {partyFilled(client) || veteran ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-ink">Client</p>
                  <p className="mt-1 font-semibold text-navy">{client.name || "—"}</p>
                  {client.address ? <p>{client.address}</p> : null}
                  <p>
                    {[client.state, client.zip].filter(Boolean).join(" ")}
                  </p>
                  {client.phone ? <p>{client.phone}</p> : null}
                  {client.email ? <p>{client.email}</p> : null}
                  {veteran ? (
                    <p className="mt-1 text-sm text-navy">Wartime veteran or surviving spouse</p>
                  ) : null}
                </div>
              ) : null}
              {policy.enabled && (partyFilled(advisor) || advisor.firm || advisor.designation) ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gold-ink">
                    Advisor / insurance professional
                  </p>
                  <p className="mt-1 font-semibold text-navy">{advisor.name || "—"}</p>
                  {advisor.designation ? <p>{advisor.designation}</p> : null}
                  <DesignationNoticeFold className="mt-2" />
                  {advisor.firm ? <p>{advisor.firm}</p> : null}
                  {advisor.address ? <p>{advisor.address}</p> : null}
                  <p>{[advisor.state, advisor.zip].filter(Boolean).join(" ")}</p>
                  {advisor.phone ? <p>{advisor.phone}</p> : null}
                  {advisor.email ? <p>{advisor.email}</p> : null}
                  <AdvisorProfessionalFolds />
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="report-block">
          <div className={`rounded-lg border-2 px-4 py-3 ${depletedWhen ? "border-deplete bg-cream" : "border-gold bg-paper"}`}>
            <p className="text-xs uppercase tracking-wide text-muted">Funds depleted</p>
            <p className={`font-display text-2xl ${depletedWhen ? "text-deplete" : "text-navy"}`}>
              {depletedWhen ? depletedWhen.label : "Not in the modeled years"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {depletedWhen
                ? `Countable assets${policy.enabled ? " (after insurance pays first)" : ""} run out in ${depletedWhen.monthName} ${depletedWhen.year}.`
                : "This run’s countable assets last through the years of care that were modeled."}
            </p>
          </div>
        </section>

        {(() => {
          const paras = summary.split("\n\n").filter(Boolean);
          const chunks: string[][] = [];
          for (let i = 0; i < paras.length; i += 2) chunks.push(paras.slice(i, i + 2));
          return chunks.map((chunk, idx) => (
            <section key={`sum-${idx}`} className="report-block">
              {idx === 0 ? (
                <h2 className="mb-3 font-display text-xl text-navy">Descriptive summary</h2>
              ) : null}
              <div className="space-y-3">
                {chunk.map((p) => (
                  <p key={p.slice(0, 48)} className="text-sm leading-relaxed">
                    <LinkedCopy text={p} />
                  </p>
                ))}
              </div>
            </section>
          ));
        })()}

        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">Recommendations to consider</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            {recommendations.map((r) => (
              <li key={r.slice(0, 52)}><LinkedCopy text={r} /></li>
            ))}
          </ol>
        </section>

        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            1. Countable assets at risk — answers
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {ASSET_FIELDS.map((f) => (
                <Qa
                  key={f.key}
                  q={f.label}
                  a={
                    <>
                      {money(assets[f.key] ?? 0)} ·{" "}
                      <Pct>{(assetRois?.[f.key] ?? 0).toFixed(1)}%</Pct>{" "}
                      {f.key === "roth"
                        ? "tax-free R.O.I."
                        : f.key === "ira" || f.key === "annuity" || f.key === "life"
                          ? "deferred R.O.I."
                          : "gross R.O.I."}
                    </>
                  }
                />
              ))}
              <Qa q="Excludable assets (* Spouse excluded assets)" a={money(assets.excludable ?? 0)} />
              <Qa
                q="Exclude primary residence from countable assets"
                a={excludeHome ? "Yes" : "No"}
              />
              <Qa q="Gross assets" a={money(grossPool)} />
              <Qa q="Countable assets (this run)" a={money(pool)} />
            </tbody>
          </table>
        </section>

        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            2. Care assumptions — answers
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <Qa q="State where care would be received" a={<StateName name={state} />} />
              <Qa
                q="Wartime veteran or surviving spouse"
                a={veteran ? "Yes — VA pension limits illustrated" : "No"}
              />
              <Qa
                q="Medicaid asset-protection strategies"
                a={
                  details.edu
                    ? "Yes — illustrated in the Educational card"
                    : "Select Medicaid, QIT, MAPT, SSI, CPI"
                }
              />
              <Qa
                q="Full details report"
                a={
                  Object.values(details).every(Boolean)
                    ? "Yes — all optional sections"
                    : "Selected sections only"
                }
              />
              <Qa q="Care setting (Where do you prefer to receive your care?)" a={SETTING_LABELS[setting]} />
              <Qa q="Age today" a={ageToday >= 18 ? String(ageToday) : "Not entered"} />
              <Qa
                q="Estimated age when care might be needed"
                a={claimAge ? String(claimAge) : "Not entered"}
              />
              <Qa
                q="Age projected at claim"
                a={
                  ageToday >= 18
                    ? `${ageToday + delay} (${delay === 0 ? "now" : `in ${delay} year${delay === 1 ? "" : "s"}`})`
                    : "Enter age today"
                }
              />
              <Qa
                q="Care projected to start (how many years from now might you need care?)"
                a={
                  ageToday < 18
                    ? "Not calculated — enter age today"
                    : delay === 0
                      ? "Now (this year)"
                      : `${delay} year${delay === 1 ? "" : "s"}`
                }
              />
              <Qa q="Years of care to model (how many years might your care last?)" a={`${duration}`} />
              <Qa q="Care-cost inflation (CPI / LTC)" a={<Pct>{cpi.toFixed(1)}%</Pct>} />
              <Qa q="Assumed gross R.O.I. on taxable assets" a={<Pct>{roi.toFixed(1)}%</Pct>} />
              <Qa q="Tax rate on taxable R.O.I." a={<Pct>{taxRate.toFixed(0)}%</Pct>} />
              <Qa q="Net R.O.I. after tax" a={<Pct>{netRoi.toFixed(2)}%</Pct>} />
              <Qa q="Deferred R.O.I. on IRA / 401(k)" a={<Pct>{iraRoi.toFixed(1)}%</Pct>} />
              <Qa
                q={
                  <>
                    Today’s median {SETTING_SHORT[setting]} cost in{" "}
                    <StateName name={state} />
                  </>
                }
                a={`${money(todayCost)} / year`}
              />
            </tbody>
          </table>
        </section>

        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            3. Insurance — answers
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <Qa q="Include insurance in the run" a={policy.enabled ? "Yes" : "No"} />
              <Qa q="Annual income (7% guideline)" a={annualIncome > 0 ? money(annualIncome) : "Not entered"} />
              <Qa
                q={TARGET_PREMIUM_LABEL}
                a={`${money(premiumTarget)} (2.5% of countable ${money(premiumParts.fromAssets)}; 7% of income ${annualIncome > 0 ? money(premiumParts.fromIncome) : "not entered"}; max = lesser)`}
              />
              {policy.enabled ? (
                <>
                  <Qa q="Policy structure" a={policyKindLabel(policy.kind)} />
                  {isLinkedKind(policy.kind) ? (
                    <>
                      <Qa q="Single premium" a={money(policy.singlePremium)} />
                      {policy.kind === "hybridLife" ? (
                        <Qa
                          q="Life insurance face amount in force"
                          a={
                            policy.monthlyBenefit > 0
                              ? `${money(specifiedFaceAmount(policy))} (${money(policy.monthlyBenefit)}/mo ÷ 2%)`
                              : "—"
                          }
                        />
                      ) : null}
                      <Qa q="Monthly LTC benefit" a={`${money(policy.monthlyBenefit)} / month`} />
                      <Qa q="LTC leverage" a={leverageLabel(policy.leverage)} />
                      <Qa
                        q={linkedCopy(policy.kind).residualLabel + " floor"}
                        a={
                          policy.residualPct
                            ? `${policy.residualPct}% of death benefit`
                            : "None"
                        }
                      />
                      <Qa q="Elimination period" a={`${policy.elimDays} days`} />
                      <Qa
                        q="Benefit Increase Option (i.e., Inflation Options)"
                        a={
                          policy.inflationMethod === "none" || policy.benefitInflationPct <= 0
                            ? "None — keep today’s monthly cap"
                            : `${policy.benefitInflationPct}% ${policy.inflationMethod}`
                        }
                      />
                      {csv ? (
                        <>
                          <Qa
                            q="CSV schedule"
                            a={
                              policy.csv.schedule === "none"
                                ? "From illustration"
                                : policy.csv.schedule === "7"
                                  ? "Standard 7-year CDSC"
                                  : "Standard 10-year CDSC"
                            }
                          />
                          <Qa q="CSV credited rate" a={`${policy.csv.creditPct}%`} />
                          <Qa q="CSV today" a={money(csv.today)} />
                          <Qa q="CSV in 5 years" a={money(csv.y5)} />
                          <Qa q="CSV in 10 years" a={money(csv.y10)} />
                          <Qa q="CSV in 20 years" a={money(csv.y20)} />
                          <Qa q="CSV at start of care" a={money(csv.atClaim)} />
                          <Qa q="CSV at end of modeled care" a={money(csv.atEnd)} />
                        </>
                      ) : (
                        <Qa q="Cash surrender value projection" a="Not included" />
                      )}
                    </>
                  ) : (
                    <>
                      <Qa q="Daily benefit today" a={money(policy.dailyBenefit)} />
                      <Qa
                        q="Benefit period"
                        a={lifetime ? "Lifetime" : `${policy.benefitYears} years`}
                      />
                      <Qa q="Elimination period" a={`${policy.elimDays} days`} />
                      <Qa
                        q="Benefit Increase Option (i.e., Inflation Options)"
                        a={
                          policy.inflationMethod === "none" || policy.benefitInflationPct <= 0
                            ? "None (level)"
                            : `${policy.benefitInflationPct}% ${policy.inflationMethod}`
                        }
                      />
                      <Qa q="Annual premium" a={money(policy.annualPremium)} />
                    </>
                  )}
                  <Qa
                    q="LTC pool at purchase"
                    a={result.lifetimeBenefit ? "Lifetime" : money(result.benefitPoolAtPurchase ?? 0)}
                  />
                  <Qa
                    q="LTC pool at claim"
                    a={result.lifetimeBenefit ? "Lifetime" : money(result.benefitPoolAtClaim ?? 0)}
                  />
                </>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            {policy.enabled ? "4. How the pool and policy are used" : "4. How the pool is used"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Countable assets today" value={money(pool)} />
            {policy.enabled ? (
              <Kpi
                label="LTC benefits at purchase"
                value={result.lifetimeBenefit ? "Lifetime" : money(insToday)}
              />
            ) : null}
            <Kpi
              label={policy.enabled ? "Combined pool today" : "Countable pool today"}
              value={
                policy.enabled && result.lifetimeBenefit
                  ? `${money(pool)} + lifetime`
                  : money(combinedToday)
              }
            />
            <Kpi
              label={`Pool exhausted · ${SETTING_SHORT[setting]} (today)`}
              value={formatYearsLast(yearsToday)}
            />
            {policy.enabled ? (
              <Kpi
                label="Combined pool at claim (assets net after tax)"
                value={
                  result.lifetimeBenefit
                    ? `${money(result.startPoolNet)} + lifetime`
                    : money(combinedClaim)
                }
              />
            ) : null}
            {policy.enabled ? (
              <Kpi
                label="Pool exhausted at claim"
                value={formatYearsLast(yearsClaim)}
              />
            ) : null}
            <Kpi label="First-year care cost" value={money(result.firstCost)} />
            {policy.enabled ? (
              <Kpi label="Insurance paid" value={money(result.insuranceTotal)} />
            ) : null}
            <Kpi label="Assets remaining" value={money(result.endPool)} />
            {policy.enabled ? (
              <Kpi label="If no policy, remaining" value={money(selfFunded.endPool)} />
            ) : null}
            <Kpi
              label="Unpaid shortfall"
              value={result.shortfallTotal ? money(result.shortfallTotal) : "None"}
            />
            {depletedWhen ? (
              <Kpi label="Funds depleted" value={depletedWhen.label} />
            ) : (
              <Kpi label="Funds depleted" value="Not in modeled years" />
            )}
          </div>
        </section>

        {policy.enabled && linkedScenarios.length ? (
          <section className="report-block">
            <LinkedClaimCard
              policy={policy}
              scenarios={linkedScenarios}
              setting={setting}
              defaultOpen
            />
          </section>
        ) : null}

        <section className="report-block card px-4 py-2 text-sm text-muted">
          <TitleCollapse title="Homestead" className="mt-0">
            <p>
              Homestead (when excluded) and spouse-excluded assets stay out of the countable
              pool.{" "}
              {excludeHome
                ? `Primary residence equity of ${money(homeEquity)} is held out of this run.`
                : "Primary residence is currently counted in the pool — check Exclude primary residence to hold it out."}
              {spouseExcluded > 0
                ? ` Spouse-excluded assets of ${money(spouseExcluded)} are also held out.`
                : ""}
            </p>
          </TitleCollapse>
          </section>

        {policy.enabled ? (
        <section className="report-block card px-4 py-4">
          <h2 className="mb-2 font-display text-xl text-navy">Same scenario — insurance pays first</h2>
          <p className="mb-3 text-sm text-muted">
            Insurance is applied to the claim first. Assets are used only as co-pay if there
            is an annual or cumulative shortfall. If insurance covers the year, assets are
            not drawn for care.
          </p>
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div className="card px-4 py-3 text-sm text-muted">
              <p className="text-xs uppercase tracking-wide">Same scenario · no policy</p>
              <p className="mt-1">
                Remaining <strong className="tabular-nums text-navy">{money(selfFunded.endPool)}</strong>.
                Shortfall <strong className="tabular-nums text-navy">{selfFunded.shortfallTotal ? money(selfFunded.shortfallTotal) : "$0"}</strong>.
              </p>
            </div>
            <div className="card px-4 py-3 text-sm text-muted">
              <p className="text-xs uppercase tracking-wide">Same scenario · insurance first, assets as co-pay</p>
              <p className="mt-1">
                Insurance on claims <strong className="tabular-nums text-navy">{money(result.insuranceTotal)}</strong>.
                Remaining <strong className="tabular-nums text-navy">{money(result.endPool)}</strong>.
                Unpaid shortfall <strong className="tabular-nums text-navy">{result.shortfallTotal ? money(result.shortfallTotal) : "$0"}</strong>.
              </p>
            </div>
          </div>
        </section>
        ) : null}


        {details.yearByYear
          ? yearSets.flatMap((set) => {
              const chunks: typeof set.proj.rows[] = [];
              for (let i = 0; i < set.proj.rows.length; i += 5) {
                chunks.push(set.proj.rows.slice(i, i + 5));
              }
              const setDepleted = set.proj.depletedYear;
              const setLater =
                setDepleted != null ? set.proj.rows.filter((r) => r.year > setDepleted).length : 0;
              return chunks.map((chunk, idx) => (
          <section key={`years-${set.key}-${idx}`} className="report-block">
            <h2 className="mb-2 font-display text-xl text-navy">
              Year-by-year projection{set.label ? ` — ${set.label}` : ""}{idx > 0 ? " (continued)" : " (View how funds are used)"}
            </h2>
            {idx === 0 && setLater > 0 && setDepleted != null ? (
              <p className="mb-2 text-sm text-muted">
                Funds depleted in {calendarYear(setDepleted)} (Y{setDepleted})
                {set.enabled
                  ? " after insurance paid first and countable assets were drawn as co-pay"
                  : " with no policy — assets paid the bill"}
                . The remaining {setLater} year{setLater === 1 ? "" : "s"} of this
                run still appear below so the full wait-until-care plus care-duration window
                stays visible.
              </p>
            ) : idx === 0 ? (
              <p className="mb-2 text-sm text-muted">
                {set.proj.rows.length} years modeled
                {delay > 0
                  ? ` (${delay} year${delay === 1 ? "" : "s"} until care, then ${duration} care year${duration === 1 ? "" : "s"})`
                  : ` · ${duration} care year${duration === 1 ? "" : "s"}`}
                . Every wait year and care year is listed.
              </p>
            ) : null}
            <YearByYearTable
              rows={chunk}
              allRows={set.proj.rows}
              policyEnabled={set.enabled}
              lifetime={set.lifetime}
              showNote={idx === chunks.length - 1}
            />
          </section>
              ));
            })
          : null}

        <section className="report-block pb-4">
          <p className="text-xs leading-relaxed text-muted">
            <strong className="text-navy">Shortfall.</strong> Shortfall after insurance =
            annual cost − insurance on that year’s claim. Assets are used only as co-pay
            against that annual (or cumulative) shortfall, in every care setting. Example:
            $50,000 home-care cost with $36,000 of insurance leaves a $14,000 shortfall;
            assets co-pay $14,000 if they last. If assets cover it, unpaid shortfall is $0;
            if not, $14,000 × 3 years is $42,000 cumulative unpaid. If insurance covers the
            year, assets are not drawn for care.
            {policy.enabled
              ? " Insurance Benefit Pool is daily benefit × 365 × benefit period at the start of the year. Countable Assets are net after tax. Insurance pays first up to daily × 365 that year; a bill at or under that maximum has $0 co-pay while the pool lasts. Insurance Balance is the pool after that calendar year’s covered claim is subtracted. Total Remaining is Insurance Balance plus countable assets net after tax after co-pay."
              : " With no policy, the full annual cost is amortized from assets until they run out."}
          </p>
          <p className="mt-3 text-sm">
            <span className={result.endPool > 0 ? "font-semibold text-good" : "font-semibold text-deplete"}>
              {result.endPool > 0
                ? `In the ${
                    policy.benefitInflationPct > 0 && policy.inflationMethod !== "none"
                      ? `${policy.benefitInflationPct}% ${policy.inflationMethod}`
                      : "level"
                  } run countable assets still have ${money(result.endPool)} after the modeled care years.`
                : `The combined pool is ${formatYearsLast(yearsToday)} at today’s ${SETTING_SHORT[setting]} cost (${policy.enabled ? money(combinedToday) : money(pool)})${
                    policy.enabled
                      ? `; at claim ${money(combinedClaim)} is ${formatYearsLast(yearsClaim)}`
                      : ""
                  }. Model shortfall after draws: ${money(result.shortfallTotal)}.`}
            </span>
          </p>
        </section>


        {policy.enabled && details.allocation && pie.length > 0 ? (
          <section className="report-block break-inside-avoid">
            <h2 className="mb-2 font-display text-xl text-navy">Explore asset allocation</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="report-chart h-72">
                <ChartRegion
                  title="Asset allocation pie"
                  summary="Pie slices and the table beside this chart list each countable sleeve and the recommended target premium."
                  className="h-72 w-full"
                >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={88}
                      isAnimationActive={false}
                      label={false}
                      labelLine={false}
                    >
                      {pie.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => money(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                </ChartRegion>
              </div>
              <div>
                <p className="mb-2 text-sm text-muted">
                  {TARGET_PREMIUM_LABEL} This run’s planning figure is {money(premiumTarget)}{" "}
                  (2.5% of countable {money(premiumParts.fromAssets)}; 7% of income{" "}
                  {annualIncome > 0 ? money(premiumParts.fromIncome) : "not entered"}; the
                  max for traditional LTCI is the lesser).
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-2">Sleeve</th>
                      <th className="py-2 pr-2">Access</th>
                      <th className="py-2 pr-2 text-right">Amount</th>
                      <th className="py-2 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationRows.map((r) => (
                      <tr key={r.label} className="border-t border-line tabular-nums">
                        <td className="py-1.5 pr-2">{r.label}</td>
                        <td className="py-1.5 pr-2">{r.heldOut ? "Held out" : r.speed}</td>
                        <td className="py-1.5 pr-2 text-right">
                          {money(r.heldOut || r.amount)}
                        </td>
                        <td className="py-1.5 text-right">
                          {r.heldOut ? "—" : <Pct>{r.pct.toFixed(0)}%</Pct>}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-gold tabular-nums font-semibold">
                      <td className="py-2 pr-2">{TARGET_PREMIUM_LABEL}</td>
                      <td className="py-2 pr-2">Planning</td>
                      <td className="py-2 pr-2 text-right">{money(premiumTarget)}</td>
                      <td className="py-2 text-right">
                        {premiumParts.limitedBy === "income" ? "7% inc." : "2.5%"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        {policy.enabled && details.allocation ? (
        <section className="report-block break-inside-avoid">
          <h2 className="mb-2 font-display text-xl text-navy">
            Asset utilization over time in <StateName name={state} />
          </h2>
          <div className="report-chart h-96 w-full overflow-visible">
            <ChartRegion
              title={`Asset utilization over time in ${state}`}
              summary="Bars show remaining countable assets each year. A hatched red area and dashed red line mark the first year countable assets hit zero. Screen readers can use the year-by-year table above."
              className="h-96 w-full overflow-visible"
            >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 12, left: 4, bottom: 52 }}>
                <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={chartTickInterval(chartData.length)} tick={{ fill: "#5c6b73", fontSize: 11 }} />
                <YAxis
                  tick={{ fill: "#5c6b73", fontSize: 12 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={tip} />
                <Legend
                  verticalAlign="bottom"
                  height={44}
                  wrapperStyle={{ paddingTop: 12, overflow: "visible" }}
                />
                {depletedYear != null ? (
                  <ReferenceLine
                    x={String(calendarYear(depletedYear))}
                    stroke={CHART.shortfall}
                    strokeDasharray="4 3"
                  />
                ) : null}
                <Area
                  type="monotone"
                  dataKey="remainingNavy"
                  name="Countable assets"
                  stroke="none"
                  fill={CHART.remaining}
                  fillOpacity={0.12}
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="remainingRed"
                  name="After depletion"
                  stroke="none"
                  fill={CHART.shortfall}
                  fillOpacity={0.12}
                  connectNulls={false}
                  isAnimationActive={false}
                  legendType="none"
                />
                <Bar dataKey="cost" name="Annual care cost" fill={CHART.cost} radius={[4, 4, 0, 0]} />
                {policy.enabled ? (
                  <Bar dataKey="insurance" name="Insurance pays first" fill={CHART.insurance} radius={[4, 4, 0, 0]} />
                ) : null}
                <Line
                  type="monotone"
                  dataKey="remainingNavy"
                  name="Countable assets remaining"
                  stroke={CHART.remaining}
                  strokeWidth={2.5}
                  connectNulls={false}
                  dot={{ r: 3, fill: CHART.remaining }}
                  isAnimationActive={false}
                />
                {depletedYear != null ? (
                  <Line
                    type="monotone"
                    dataKey="remainingRed"
                    name="After funds depleted"
                    stroke={CHART.shortfall}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    connectNulls={false}
                    dot={{ r: 4, fill: CHART.shortfall }}
                    isAnimationActive={false}
                  />
                ) : null}
                {policy.enabled ? (
                  <Line
                    type="monotone"
                    dataKey="remainingSelfFunded"
                    name="If assets paid all care"
                    stroke={CHART.selfFunded}
                    strokeDasharray="6 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
            </ChartRegion>
          </div>
        </section>
        ) : null}

        {policy.enabled && details.compareCare ? (
        <section className="report-block break-inside-avoid">
          <h2 className="mb-2 font-display text-xl text-navy">Compare long-term care options</h2>
          <div className="report-chart mb-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={careCompare.map((row) => ({
                  label: SETTING_SHORT[row.setting],
                  cost: Math.round(row.proj.rows.reduce((s, r) => s + r.cost, 0)),
                  remaining: Math.round(row.proj.endPool),
                  shortfall: Math.round(row.proj.shortfallTotal),
                }))}
              >
                <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fill: "#5c6b73", fontSize: 11 }} />
                <YAxis
                  tick={{ fill: "#5c6b73", fontSize: 12 }}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={tip} />
                <Legend />
                <Bar dataKey="cost" name="Total care cost" fill={CHART.cost} isAnimationActive={false} />
                <Bar dataKey="remaining" name="Assets remaining" fill={CHART.remaining} isAnimationActive={false} />
                <Bar dataKey="shortfall" name="Shortfall" fill={CHART.shortfall} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Care setting</th>
                  <th className="py-2 pr-2 text-right">Today’s annual</th>
                  <th className="py-2 pr-2 text-right">Pool exhausted (today)</th>
                  <th className="py-2 pr-2 text-right">First year (inflated)</th>
                  <th className="py-2 pr-2 text-right">Assets remaining</th>
                  <th className="py-2 text-right">Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {careCompare.map((row) => {
                  const yearsT =
                    policy.enabled && result.lifetimeBenefit
                      ? Number.POSITIVE_INFINITY
                      : yearsPoolLasts(pool + (policy.enabled && !result.lifetimeBenefit ? insToday : 0), row.today);
                  return (
                    <tr
                      key={row.setting}
                      className={`border-t border-line tabular-nums ${row.setting === setting ? "bg-cream font-semibold" : ""}`}
                    >
                      <td className="py-2 pr-2">{SETTING_LABELS[row.setting]}</td>
                      <td className="py-2 pr-2 text-right">{money(row.today)}</td>
                      <td className="py-2 pr-2 text-right">{formatYearsLast(yearsT)}</td>
                      <td className="py-2 pr-2 text-right">{money(row.proj.firstCost)}</td>
                      <td className="py-2 pr-2 text-right">{money(row.proj.endPool)}</td>
                      <td className="py-2 text-right">
                        {row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}

        {policy.enabled && details.compareIns ? (
        <>
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Compare long-term care insurance
          </h2>
          <p className="mb-3 text-sm text-muted">
            Same countable assets, <StateName name={state} /> {SETTING_SHORT[setting]}, timing, and R.O.I.
            Traditional lanes use this run’s daily benefit, period, and elimination.
            Benefit Increase Option (i.e., Inflation Options) uses{" "}
            {policy.benefitInflationPct > 0
              ? `${policy.benefitInflationPct}% ${policy.inflationMethod}`
              : "3% compound"}{" "}
            if none is set. Partnership applies dollar-for-dollar (or in-state TAP) on that
            traditional lane. Hybrid uses the single-premium / leverage inputs. Educational —
            not a quote.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Feature</th>
                  <th className="py-2 pr-2">No policy</th>
                  <th className="py-2 pr-2">Traditional</th>
                  <th className="py-2 pr-2">+ Partnership</th>
                  <th className="py-2">Asset-based hybrid</th>
                </tr>
              </thead>
              <tbody>
                {LTC_COMPARE_FEATURES.map((row) => (
                  <tr key={row.feature} className="border-t border-line align-top">
                    <td className="py-2 pr-2 font-semibold text-navy">{row.feature}</td>
                    <td className="py-2 pr-2 text-muted">{row.none}</td>
                    <td className="py-2 pr-2 text-muted">{row.traditional}</td>
                    <td className="py-2 pr-2 text-muted">{row.partnership}</td>
                    <td className="py-2 text-muted">{row.hybrid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-block">
          <h3 className="mb-2 font-display text-lg text-navy">
            Insurance designs — remaining assets, Partnership protection, shortfall
          </h3>
          <div className="report-chart mb-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={insuranceCompare.map((row) => ({
                  label: row.label.replace("Traditional · ", "Trad. "),
                  remaining: Math.round(row.proj.endPool),
                  protected: Math.round(row.impact.partnership.protected),
                  shortfall: Math.round(row.proj.shortfallTotal),
                }))}
                margin={{ top: 8, right: 8, left: 4, bottom: 28 }}
              >
                <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ fill: "#5c6b73", fontSize: 10 }} />
                <YAxis
                  tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`}
                  tick={{ fill: "#5c6b73", fontSize: 11 }}
                />
                <Tooltip formatter={(v) => money(Number(v) || 0)} contentStyle={tip} />
                <Legend />
                <Bar dataKey="remaining" name="Countable remaining" fill={CHART.remaining} isAnimationActive={false} />
                <Bar dataKey="protected" name="Partnership protected" fill={CHART.cost} isAnimationActive={false} />
                <Bar dataKey="shortfall" name="Unpaid shortfall" fill="url(#hatch-shortfall)" stroke={CHART.shortfall} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Design</th>
                  <th className="py-2 pr-2 text-right">Premium</th>
                  <th className="py-2 pr-2 text-right">Insurance paid</th>
                  <th className="py-2 pr-2 text-right">Assets left</th>
                  <th className="py-2 pr-2 text-right">Protected</th>
                  <th className="py-2 pr-2 text-right">Could keep</th>
                  <th className="py-2 pr-2 text-right">Shortfall</th>
                  <th className="py-2 text-right">Pool lasts</th>
                </tr>
              </thead>
              <tbody>
                {insuranceCompare.map((row) => (
                  <tr key={row.key} className="border-t border-line tabular-nums">
                    <td className="py-2 pr-2">{row.label}</td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.premiumTotal)}</td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.insuranceTotal)}</td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.endPool)}</td>
                    <td className="py-2 pr-2 text-right">{money(row.impact.partnership.protected)}</td>
                    <td className="py-2 pr-2 text-right">{money(row.impact.partnership.keep)}</td>
                    <td className="py-2 pr-2 text-right">
                      {row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "—"}
                    </td>
                    <td className="py-2 text-right">{formatYearsLast(row.years)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            * Death benefits and cash surrender vary by company and policy type. Hybrids are
            generally not Partnership-certified. Premiums are not re-priced across designs.
          </p>
        </section>
        </>
        ) : null}

        {policy.enabled && details.riders ? (
        <section className="report-block">
          <TitleCollapse title="Compare long-term care riders" className="mt-0">
          <p className="mb-3 text-sm text-muted">{LTC_RIDER_INTRO}</p>
          <p className="mb-3 text-sm text-muted">{LTC_RIDER_HYBRID_NOTE}</p>
          <TitleCollapse title="At a glance">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Rider</th>
                  <th className="py-2 pr-2">Traditional</th>
                  <th className="py-2 pr-2">Hybrid / asset-based</th>
                  <th className="py-2">Typical extra cost</th>
                </tr>
              </thead>
              <tbody>
                {LTC_RIDER_GLANCE.map((row) => (
                  <tr key={row.rider} className="border-t border-line align-top">
                    <td className="py-2 pr-2 font-semibold text-navy">{row.rider}</td>
                    <td className="py-2 pr-2 text-muted">{row.traditional}</td>
                    <td className="py-2 pr-2 text-muted">{row.hybrid}</td>
                    <td className="py-2 text-muted">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </TitleCollapse>
          <TitleCollapse title="Detail — traditional vs hybrid">
          {LTC_RIDERS.map((row) => (
            <TitleCollapse key={row.rider} title={row.rider}>
              <p className="mt-2 text-sm text-muted">
                {row.what}
              </p>
              <TitleCollapse title="Traditional">
                <p className="text-sm text-muted">{row.traditional}</p>
              </TitleCollapse>
              <TitleCollapse title="Asset-based / hybrid">
                <p className="text-sm text-muted">{row.hybrid}</p>
              </TitleCollapse>
              <TitleCollapse title="Watch">
                <p className="text-sm text-muted">{row.watch}</p>
              </TitleCollapse>
            </TitleCollapse>
          ))}
          </TitleCollapse>
          <TitleCollapse title="Detailed rider examples">
          <p className="mb-2 text-sm text-muted">
            Planning illustrations only — not this run’s premium and not a quote.
          </p>
          {LTC_RIDER_EXAMPLES.map((row) => (
            <TitleCollapse key={row.rider} title={row.rider}>
              <TitleCollapse title="Setup">
                <p className="text-sm text-muted">{row.setup}</p>
              </TitleCollapse>
              <TitleCollapse title="Without the rider">
                <p className="text-sm text-muted">{row.without}</p>
              </TitleCollapse>
              <TitleCollapse title="With the rider">
                <p className="text-sm text-muted">{row.withRider}</p>
              </TitleCollapse>
              <TitleCollapse title="Takeaway">
                <p className="text-sm text-muted">{row.takeaway}</p>
              </TitleCollapse>
            </TitleCollapse>
          ))}
          </TitleCollapse>
          <p className="mt-2 text-xs text-muted">
            Typical loads are planning ranges, not this carrier’s price. Read the outline of coverage.
          </p>
          </TitleCollapse>
        </section>
        ) : null}

        {policy.enabled && inflationCompare.length > 0 && details.inflation ? (
          <section className="report-block">
            <h2 className="mb-2 font-display text-xl text-navy">Compare inflation riders</h2>
            <p className="mb-3 text-sm text-muted">
              Same traditional daily benefit ({money(policy.dailyBenefit)} today), period,
              and care CPI (<Pct>{cpi.toFixed(1)}%</Pct>). Compound multiplies last year’s daily.
              Simple adds a percent of the original daily. Level never grows. DRA Partnership
              often requires compound at issue age 60 or younger; original CA/CT/IN/NY often
              required 5% compound. This table does not re-price premium.
            </p>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-2">How the rider works</th>
                    <th className="py-2 pr-2">Formula after n years</th>
                    <th className="py-2 pr-2 text-right">Daily at year {delay}</th>
                    <th className="py-2 text-right">Daily at year {delay + duration}</th>
                  </tr>
                </thead>
                <tbody>
                  {inflationCompare.map((row) => (
                    <tr key={`how-${row.key}`} className="border-t border-line">
                      <td className="py-2 pr-2">
                        <span className="font-semibold text-navy">{row.label}</span>
                        {row.how ? (
                          <span className="mt-0.5 block text-xs text-muted">{row.how}</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-2 text-muted">
                        {row.inflationMethod === "none"
                          ? "Daily stays at issue"
                          : row.inflationMethod === "simple"
                            ? `Issue × (1 + ${row.benefitInflationPct}% × n)`
                            : `Issue × (1 + ${row.benefitInflationPct}%)ⁿ`}
                      </td>
                      <td className="py-2 pr-2 text-right tabular-nums">
                        {money(
                          inflateDaily(
                            policy.dailyBenefit,
                            delay,
                            row.benefitInflationPct,
                            row.inflationMethod,
                          ),
                        )}
                        /day
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {money(
                          inflateDaily(
                            policy.dailyBenefit,
                            delay + duration,
                            row.benefitInflationPct,
                            row.inflationMethod,
                          ),
                        )}
                        /day
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="report-chart mb-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={inflationCompare.map((row) => {
                    const ltcClaim = row.proj.lifetimeBenefit
                      ? 0
                      : Number(row.proj.benefitPoolAtClaim ?? 0);
                    return {
                      label: row.label.replace(" — today’s values", ""),
                      combined: Math.round(row.proj.startPoolNet + ltcClaim),
                      care: Math.round(row.proj.firstCost),
                      shortfall: Math.round(row.proj.shortfallTotal),
                    };
                  })}
                >
                  <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: "#5c6b73", fontSize: 11 }} />
                  <YAxis
                    tick={{ fill: "#5c6b73", fontSize: 12 }}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(v) => money(Number(v))} contentStyle={tip} />
                  <Legend />
                  <Bar dataKey="combined" name="Combined pool at claim" fill={CHART.remaining} isAnimationActive={false} />
                  <Bar dataKey="care" name="First-year care cost" fill={CHART.cost} isAnimationActive={false} />
                  <Bar dataKey="shortfall" name="Shortfall" fill="url(#hatch-shortfall)" stroke={CHART.shortfall} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-2">Benefit Increase Option (i.e., Inflation Options)</th>
                    <th className="py-2 pr-2 text-right">Daily at care start</th>
                    <th className="py-2 pr-2 text-right">LTC pool at claim</th>
                    <th className="py-2 pr-2 text-right">Combined pool</th>
                    <th className="py-2 pr-2 text-right">Pool exhausted in</th>
                    <th className="py-2 pr-2 text-right">Insurance paid</th>
                    <th className="py-2 pr-2 text-right">Assets remaining</th>
                    <th className="py-2 text-right">Shortfall</th>
                  </tr>
                </thead>
                <tbody>
                  {inflationCompare.map((row) => {
                    const ltcClaim = row.proj.lifetimeBenefit
                      ? null
                      : Number(row.proj.benefitPoolAtClaim ?? 0);
                    const combined =
                      ltcClaim == null ? null : row.proj.startPoolNet + ltcClaim;
                    const exhausted = row.proj.lifetimeBenefit
                      ? Number.POSITIVE_INFINITY
                      : yearsPoolLasts(combined ?? 0, row.proj.firstCost);
                    return (
                      <tr key={row.key} className="border-t border-line tabular-nums">
                        <td className="py-2 pr-2">{row.label}</td>
                        <td className="py-2 pr-2 text-right">
                          {money(row.proj.firstDailyBenefit)}/day
                        </td>
                        <td className="py-2 pr-2 text-right">
                          {row.proj.lifetimeBenefit ? "Lifetime" : money(ltcClaim ?? 0)}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          {combined == null
                            ? `${money(row.proj.startPoolNet)} + lifetime`
                            : money(combined)}
                        </td>
                        <td className="py-2 pr-2 text-right">{formatYearsLast(exhausted)}</td>
                        <td className="py-2 pr-2 text-right">{money(row.proj.insuranceTotal)}</td>
                        <td className="py-2 pr-2 text-right">{money(row.proj.endPool)}</td>
                        <td className="py-2 text-right">
                          {row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {policy.enabled && details.hybrid ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Explore Traditional, Asset-based, Hybrid, and LTC Annuity
          </h2>
          <p className="mb-3 text-sm text-muted">
            Only the structures checked on this run are illustrated. Traditional uses this
            run’s premium and daily benefit. Linked lanes use this run’s hybrid fields or
            planning defaults. Educational — not a quote.
          </p>
          {structureCompare.length === 0 ? (
            <p className="text-sm text-muted">No structures were selected to run.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Structure</th>
                  <th className="py-2 pr-2 text-right">Paid in / premium</th>
                  <th className="py-2 pr-2 text-right">LTC pool at purchase</th>
                  <th className="py-2 pr-2 text-right">Insurance paid</th>
                  <th className="py-2 pr-2 text-right">Countable remaining</th>
                  <th className="py-2 pr-2 text-right">Death benefit left</th>
                  <th className="py-2 text-right">Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {structureCompare.map((row) => (
                  <tr
                    key={row.key}
                    className={`border-t border-line tabular-nums ${row.thisRun ? "bg-cream font-semibold" : ""}`}
                  >
                    <td className="py-2 pr-2">
                      {row.label}
                      {row.thisRun ? " (this run)" : ""}
                    </td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.premiumTotal)}</td>
                    <td className="py-2 pr-2 text-right">
                      {row.proj.lifetimeBenefit
                        ? "Lifetime"
                        : money(row.proj.benefitPoolAtPurchase ?? 0)}
                    </td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.insuranceTotal)}</td>
                    <td className="py-2 pr-2 text-right">{money(row.proj.endPool)}</td>
                    <td className="py-2 pr-2 text-right">
                      {row.key === "traditional" ? "—" : money(row.proj.residualDeathBenefit)}
                    </td>
                    <td className="py-2 text-right">
                      {row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          <div className="mt-4 border-t border-gold pt-4">
            <h3 className="mb-2 font-display text-lg text-navy">Hybrid life insurance options</h3>
            <HybridLifeOptionsPanel policy={policy} />
          </div>
        </section>
        ) : null}

        {policy.enabled && details.partnership ? (
        <>
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Impact of Partnership on asset preservation
          </h2>
          <p className="mb-3 text-sm text-muted"><LinkedCopy text={partnership.info.summary} /></p>
          <div className="mb-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Path</th>
                  <th className="py-2 pr-2 text-right">Remaining</th>
                  <th className="py-2 pr-2 text-right">Protected</th>
                  <th className="py-2 pr-2 text-right">Could keep at Medicaid</th>
                  <th className="py-2 text-right">Spend-down still</th>
                </tr>
              </thead>
              <tbody>
                {[preservation.noPolicy, preservation.policyOnly, preservation.partnership].map(
                  (lane) => (
                    <tr key={lane.label} className="border-t border-line tabular-nums">
                      <td className="py-1.5 pr-2">{lane.label}</td>
                      <td className="py-1.5 pr-2 text-right">{money(lane.remaining)}</td>
                      <td className="py-1.5 pr-2 text-right">{money(lane.protected)}</td>
                      <td className="py-1.5 pr-2 text-right">{money(lane.keep)}</td>
                      <td className="py-1.5 text-right">{money(lane.spend)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          <h3 className="mb-2 mt-4 font-display text-base text-navy">
            Original programs — California, Connecticut, Indiana, New York
          </h3>
          <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {preservation.original.map((row) => (
              <div key={row.state} className="rounded-lg bg-cream px-3 py-2 text-sm">
                <p className="font-semibold text-navy">{row.state}</p>
                <p className="text-muted">{row.mode}</p>
                <p className="tabular-nums">Protected {money(row.protected)}</p>
                <p className="tabular-nums text-muted">Spend-down {money(row.spend)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gold pt-4">
            <h3 className="mb-2 font-display text-lg text-navy">Compare DRA Partnership benefits</h3>
            <DraPartnershipComparePanel state={state} preservation={preservation} />
          </div>
        </section>

        {Array.from({ length: Math.ceil(partnershipRows.length / 12) }, (_, i) =>
          partnershipRows.slice(i * 12, i * 12 + 12),
        ).map((chunk, i) => (
          <section key={`pship-${i}`} className="report-block">
            <h2 className="mb-3 font-display text-xl text-navy">
              Partnership by state{i > 0 ? " (continued)" : ""}
            </h2>
            {i === 0 ? (
              <p className="mb-3 text-sm text-muted">
                Same claims as this run. Protected = benefits paid as a dollar-for-dollar
                disregard (or in-state TAP where modeled). Confirm certification locally.
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-2 pr-2">State</th>
                    <th className="py-2 pr-2">Program</th>
                    <th className="py-2 pr-2">Mode</th>
                    <th className="py-2 pr-2 text-right">Protected</th>
                    <th className="py-2 text-right">Spend-down still</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((row) => (
                    <tr
                      key={row.state}
                      className={`border-t tabular-nums ${row.state === state ? "bg-cream font-semibold" : "border-line"}`}
                    >
                      <td className="py-1.5 pr-2">{row.state}</td>
                      <td className="py-1.5 pr-2">
                        {row.info.kind === "none"
                          ? "None"
                          : row.info.kind === "masshealth"
                            ? "MassHealth"
                            : row.info.kind === "dra"
                              ? "DRA"
                              : row.info.kind === "original-dd"
                                ? "Original D4D"
                                : "Original TAP"}
                      </td>
                      <td className="py-1.5 pr-2">
                        {!row.modeled ? "—" : row.mode === "total-asset" ? "Total asset" : "D4D"}
                      </td>
                      <td className="py-1.5 pr-2 text-right">
                        {row.modeled ? money(row.assetsProtected) : "—"}
                      </td>
                      <td className="py-1.5 text-right">{money(row.spendDownStill)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="report-block card px-4 py-3 text-sm text-muted">
          <p className="font-display text-base text-navy">
            {assetProtectionLimits(state, medicaid.individualLimit).title}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {assetProtectionLimits(state, medicaid.individualLimit).bullets.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
        </section>
        </>
        ) : null}

        {policy.enabled && details.reciprocity && reciprocity.issueState !== reciprocity.medicaidState ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Partnership reciprocity
          </h2>
          <ul className="mb-3 list-disc space-y-1 pl-4 text-sm text-muted">
            {RECIPROCITY_RULES.map((r) => (
              <TitleCollapse key={r.title} title={r.title} className="mt-1">
                <p>{r.body}</p>
              </TitleCollapse>
            ))}
          </ul>
          <p className="mb-2 text-sm font-semibold text-navy">{reciprocity.title}</p>
          <ul className="mb-3 list-disc space-y-1 pl-4 text-sm text-muted">
            {reciprocity.bullets.map((b) => (
              <li key={b.slice(0, 48)}>{b}</li>
            ))}
          </ul>
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-2">Medicaid later in</th>
                <th className="py-2 pr-2">Compact?</th>
                <th className="py-2">Disregard that would travel</th>
              </tr>
            </thead>
            <tbody>
              {reciprocityExamples.map((row) => (
                <tr
                  key={row.medicaidState}
                  className={`border-t ${row.medicaidState === state ? "bg-cream font-semibold" : "border-line"}`}
                >
                  <td className="py-1.5 pr-2">{row.medicaidState}</td>
                  <td className="py-1.5 pr-2">{row.compactMedicaid ? "Yes" : "No"}</td>
                  <td className="py-1.5">
                    {row.mode === "total-asset"
                      ? "Total asset (in-state only)"
                      : row.mode === "dollar-for-dollar"
                        ? "Dollar-for-dollar"
                        : "None — insurance still pays"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        ) : null}

        <section className="report-block">
          <TitleCollapse title="Medicaid Information" className="mt-0" defaultOpen={pool > NAIC_LOCKOUT_ASSETS}>
            <MedicaidVaBody
              state={state}
              policy={policy}
              medicaid={medicaid}
              veteran={veteran}
              preservation={preservation}
              issueState={reciprocity.issueState}
            />
          </TitleCollapse>
        </section>

        {insuranceLocked || details.dhContact || details.dhLicense ? (
        <section className="report-block">
          <TitleCollapse title="Find a qualified professional" className="mt-0" defaultOpen={insuranceLocked}>
            <AdvisorProfessionalFolds details={details} lockout={insuranceLocked} />
          </TitleCollapse>
        </section>
        ) : null}

        {policy.enabled && details.trends ? (
        <>
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">
            Compound rates and healthcare cost trends
          </h2>
          <p className="mb-3 text-sm text-muted">
            Long-term care has recently risen faster than medical-care CPI.{" "}
            <Cite href={SRC.aarpLtss}>AARP</Cite> (2019–2024)
            found assisted living and home care up about{" "}
            <strong className="text-navy">8% a year</strong>, nursing-home private rooms about{" "}
            <strong className="text-navy">5% a year</strong>.{" "}
            <Cite href={SRC.carescout}>CareScout’s 2025 survey</Cite> cooled:
            assisted living +5%, in-home +3%, nursing semi +2%, private +1%.{" "}
            <Cite href={SRC.blsCpi}>BLS medical-care CPI</Cite> is near 2–3% recently
            (long-run average ~5%). This run’s care CPI is{" "}
            <Pct>{cpi.toFixed(1)}%</Pct>. A 3% compound rider tracks a cooler medical-CPI world; 5%
            compound is closer to the 2019–2024 LTC average for nursing homes. Simple 5% lags
            compound 5% more each year.
          </p>
          <div className="mb-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-cream px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-muted">AL / home 2019–24</p>
              <p className="font-display text-lg text-navy">~8% / year</p>
              <p className="text-xs text-muted">
                <Cite href={SRC.aarpLtss}>AARP</Cite> /{" "}
                <Cite href={SRC.carescout}>CareScout</Cite> 5-year run-up
              </p>
            </div>
            <div className="rounded-lg bg-cream px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-muted">NH private 2019–24</p>
              <p className="font-display text-lg text-navy">~5% / year</p>
              <p className="text-xs text-muted">
                <Cite href={SRC.aarpLtss}>AARP</Cite>; 2025{" "}
                <Cite href={SRC.carescout}>CareScout</Cite> slowed to 1–2%
              </p>
            </div>
            <div className="rounded-lg bg-cream px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-muted">Medical-care CPI</p>
              <p className="font-display text-lg text-navy">~5% long run</p>
              <p className="text-xs text-muted">BLS; recently ~2–3% (2025–26)</p>
            </div>
            <div className="card px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-muted">This run’s CPI</p>
              <p className="font-display text-lg text-navy"><Pct>{cpi.toFixed(1)}%</Pct></p>
              <p className="text-xs text-muted">
                Applied to {SETTING_SHORT[setting]} in <StateName name={state} />
              </p>
            </div>
          </div>
        </section>

        <section className="report-block">
          <h3 className="mb-2 font-display text-lg text-navy">
            $100 grown at selected rates
          </h3>
          <div className="report-chart mb-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={[0, 5, 10, 15, 20].map((y) => ({
                  y: String(y),
                  c3: inflateDaily(100, y, 3, "compound"),
                  c5: inflateDaily(100, y, 5, "compound"),
                  s5: inflateDaily(100, y, 5, "simple"),
                  cpi: inflateDaily(100, y, cpi, "compound"),
                }))}
              >
                <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                <XAxis dataKey="y" tick={{ fill: "#5c6b73", fontSize: 11 }} />
                <YAxis tick={{ fill: "#5c6b73", fontSize: 12 }} />
                <Tooltip formatter={(v) => money(Number(v))} contentStyle={tip} />
                <Legend />
                <Line dataKey="c5" name="5% compound" stroke={CHART.remaining} dot={false} isAnimationActive={false} />
                <Line dataKey="s5" name="5% simple" stroke={CHART.cost} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                <Line dataKey="cpi" name={`This run ${cpi.toFixed(1)}% CPI`} stroke={CHART.shortfall} dot={false} isAnimationActive={false} />
                <Line dataKey="c3" name="3% compound" stroke={CHART.insurance} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
        </>
        ) : null}

        {policy.enabled ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Sample policies (NAIC-style outlines)
          </h2>
          <SamplePolicyPack policy={policy} state={state} countable={pool} defaultOpen />
        </section>
        ) : null}

        {policy.enabled ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Long-term care glossary of terms
          </h2>
          <p className="mb-3 text-sm text-muted">
            Definitions as used in this hypothetical. Educational — not a policy
            contract, outline of coverage, or legal advice.
          </p>
          <LtcGlossaryList />
        </section>
        ) : null}

        {policy.enabled && details.tax ? (
        <section className="report-block card px-4 py-3 text-sm text-muted">
          <FederalLtcDeductionPanel
            premium={
              policy.enabled && !isLinkedKind(policy.kind) ? policy.annualPremium : 0
            }
          />
          <p className="mt-2">{creditVsDeductionCopy()}</p>
          <p className="mt-2">
            <strong className="text-navy">{stateLtcTaxBreak(state).title}.</strong>{" "}
            {stateLtcTaxBreak(state).detail}
          </p>
          {stateLtcTaxBreak(state).kind === "credit" &&
          policy.enabled &&
          !isLinkedKind(policy.kind) &&
          policy.annualPremium > 0 ? (
            <p className="mt-2">
              Planning figure on this premium: about{" "}
              {money(stateLtcTaxBreak(state).creditEstimate(policy.annualPremium))} of <StateName name={state} />{" "}
              credit before phase-outs.
            </p>
          ) : null}
          <p className="mt-2 text-xs">
            Not tax advice. Confirm with a <Cite href={SRC.cpaVerify}>CPA</Cite> or{" "}
            <Cite href={SRC.ea}>enrolled agent</Cite>.
          </p>
        </section>
        ) : null}

        {policy.enabled && details.tax ? (
        <>
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            {TAX_SECTION_LABEL} (2026 planning)
          </h2>
          <p className="mb-3 text-sm text-muted">
            Credits and deductions follow the taxpayer’s return (usually residence), not
            the state where care would be received. Partnership asset protection is a
            Medicaid feature, not a tax credit. Confirm the current form.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">State</th>
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2">Planning note</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...taxIncentiveGroups().credits,
                  ...taxIncentiveGroups().deductions,
                  ...taxIncentiveGroups().other,
                ].map((r) => (
                  <tr
                    key={r.state}
                    className={`border-t align-top ${r.state === state ? "bg-cream font-semibold" : "border-line"}`}
                  >
                    <td className="py-1.5 pr-2">{r.state}</td>
                    <td className="py-1.5 pr-2 capitalize">{r.kind === "none" ? "Other" : r.kind}</td>
                    <td className="py-1.5 text-muted">{r.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="report-block">
          <Irc1035Panel />
        </section>
        </>
        ) : null}

        {policy.enabled && details.fundingOptions ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">
            Long-term care insurance and funding options
          </h2>
          <p className="mb-3 text-sm text-muted">
            Educational menu — not a quote. Only the dollar lanes in the comparison above
            are run on this hypo’s numbers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Option</th>
                  <th className="py-2 pr-2">How it pays care</th>
                  <th className="py-2 pr-2">Medicaid</th>
                  <th className="py-2">When it is often discussed</th>
                </tr>
              </thead>
              <tbody>
                {LTC_INSURANCE_OPTIONS.map((row) => (
                  <tr key={row.option} className="border-t border-line align-top">
                    <td className="py-2 pr-2 font-semibold text-navy">{row.option}</td>
                    <td className="py-2 pr-2 text-muted">{row.pays}</td>
                    <td className="py-2 pr-2 text-muted">{row.medicaid}</td>
                    <td className="py-2 text-muted">{row.fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}

        {details.nationalHistory ? (
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">
            National cost history — 5- and 10-year snapshots
          </h2>
          <p className="mb-3 text-sm text-muted">
            Annual national medians. Home health is 44 hours/week. Memory care is 25%
            above assisted living. 2016–2021: AARP PPI / Genworth. 2023–2025: CareScout.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "5-year snapshot (2021–2025)", rows: historySpan(2021, 2025) },
              { title: "10-year snapshot (2016–2025)", rows: historySpan(2016, 2025) },
            ].map((block) => (
              <div key={block.title} className="overflow-x-auto card p-2">
                <p className="mb-1 text-xs font-semibold text-navy">{block.title}</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="py-1 pr-2 font-medium">Setting</th>
                      <th className="py-1 pr-2 font-medium">Then</th>
                      <th className="py-1 pr-2 font-medium">Now</th>
                      <th className="py-1 font-medium">CAGR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r) => (
                      <tr key={r.key} className="border-t border-line">
                        <td className="py-1 pr-2 text-navy">{r.label}</td>
                        <td className="py-1 pr-2 tabular-nums">{money(r.start)}</td>
                        <td className="py-1 pr-2 tabular-nums">{money(r.end)}</td>
                        <td className="py-1 tabular-nums font-semibold text-navy">
                          {r.cagr.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>
        ) : null}

        {policy.enabled && details.insights ? (
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">Industry insights</h2>
          <IndustryInsightsPanel
            embedded
            ageToday={ageToday}
            policy={policy}
            state={state}
            setting={setting}
            scenarios={linkedScenarios}
            countable={pool}
          />
        </section>
        ) : null}

        {details.compareHealth ? (
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">Compare health insurance types</h2>
          <p className="mb-3 text-sm text-muted">
            {HEALTH_INSURANCE_INTRO}{" "}
            <Cite href={SRC.medicareLtc}>Medicare.gov — long-term care</Cite>
            {" · "}
            <Cite href={SRC.medicareMedigap}>Medigap</Cite>
            {" · "}
            <Cite href={SRC.naicShopper}>NAIC Shopper’s Guide</Cite>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Type</th>
                  <th className="py-2 pr-2">What it is</th>
                  <th className="py-2 pr-2">Pays for</th>
                  <th className="py-2">Long-term / custodial care</th>
                </tr>
              </thead>
              <tbody>
                {HEALTH_INSURANCE_TYPES.map((row) => (
                  <tr key={row.type} className="border-t border-line align-top">
                    <td className="py-2 pr-2 font-semibold text-navy">{row.type}</td>
                    <td className="py-2 pr-2 text-muted"><LinkedCopy text={row.what} /></td>
                    <td className="py-2 pr-2 text-muted"><LinkedCopy text={row.pays} /></td>
                    <td className="py-2 text-muted"><LinkedCopy text={row.ltc} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        ) : null}

        {policy.enabled && details.sensitivity ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">Hypothesis sensitivity</h2>
          <p className="mb-3 text-sm text-muted">{sensitivity.insight}</p>
          <div className="report-chart mb-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={sensitivity.rows
                  .filter((r) => !r.isBase)
                  .map((r) => ({
                    label: `${r.factor} ${r.shock}`,
                    remain: Math.round(r.dRemain),
                    short: Math.round(r.dShort),
                  }))}
                margin={{ top: 8, right: 8, left: 4, bottom: 48 }}
              >
                <CartesianGrid stroke="#d9cfc0" strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} angle={-28} textAnchor="end" tick={{ fill: "#5c6b73", fontSize: 10 }} height={56} />
                <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fill: "#5c6b73", fontSize: 11 }} />
                <Tooltip formatter={(v) => money(Number(v) || 0)} />
                <Legend />
                <Bar dataKey="remain" name="Δ remaining vs this run" fill={CHART.remaining} isAnimationActive={false} />
                <Bar dataKey="short" name="Δ unpaid shortfall vs this run" fill="url(#hatch-shortfall)" stroke={CHART.shortfall} isAnimationActive={false} />
                <ReferenceLine y={0} stroke={CHART.selfFunded} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2">Assumption</th>
                  <th className="py-2 pr-2">Shock</th>
                  <th className="py-2 pr-2 text-right">Remaining</th>
                  <th className="py-2 pr-2 text-right">vs this run</th>
                  <th className="py-2 pr-2 text-right">Unpaid shortfall</th>
                  <th className="py-2 text-right">Pool at claim</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.rows.map((r) => (
                  <tr key={r.key} className={`border-t tabular-nums ${r.isBase ? "bg-cream font-semibold" : "border-line"}`}>
                    <td className="py-1.5 pr-2">{r.factor}</td>
                    <td className="py-1.5 pr-2">{r.shock}</td>
                    <td className="py-1.5 pr-2 text-right">{money(r.remaining)}</td>
                    <td className="py-1.5 pr-2 text-right">
                      {r.isBase ? "—" : `${r.dRemain > 0 ? "+" : ""}${money(r.dRemain)}`}
                    </td>
                    <td className="py-1.5 pr-2 text-right">{r.shortfall ? money(r.shortfall) : "—"}</td>
                    <td className="py-1.5 text-right">{formatYearsLast(r.yearsAtClaim)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            One-way shocks. Insurance design stays as entered. Not a forecast.
          </p>
        </section>
        ) : null}

        {policy.enabled && details.confidence ? (
        <section className="report-block">
          <h2 className="mb-3 font-display text-xl text-navy">Model confidence scores</h2>
          <ConfidencePanel confidence={confidence} />
        </section>
        ) : null}

        {details.naicGuide ? (
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">
            NAIC Shopper’s Guide to Long-Term Care Insurance
          </h2>
          <p className="text-sm text-muted">
            Official NAIC consumer booklet (2022). Many states require this guide at
            sale.{" "}
            <Cite href={SRC.naicShopper}>Open or download the Shopper’s Guide (PDF)</Cite>.
          </p>
        </section>
        ) : null}

        {details.naicWorksheet ? (
        <section className="report-block">
          <h2 className="mb-2 font-display text-xl text-navy">
            NAIC Long-Term Care Insurance Personal Worksheet
          </h2>
          <p className="text-sm text-muted">
            Fillable HTML educational copy (NAIC Model Regulation #641, Appendix B). Not a carrier application.{" "}
            <Cite href={SRC.naicSuitability}>Official blank PDF</Cite>
            . Pages 48–51 of the Shopper’s Guide reprint this worksheet.
          </p>
          <FilledNaicWorksheet />
        </section>
        ) : null}

        {disclosureSelected(details) ? (
        <section id="disclosure-terms-report" className="report-block card-xl border-2 px-4 py-2 text-sm text-muted scroll-mt-8">
          <TitleCollapse title={DISCLOSURE_CARD_TITLE} className="mt-0" defaultOpen openOnHash="disclosure-terms-report">
            <DisclaimerCard className="mt-2" include={details} details={details} />
          </TitleCollapse>
          </section>
        ) : null}

        {details.edu ? (
        <>
        <section className="report-block border-l-4 border-teal bg-paper px-4 py-2 text-sm text-muted">
          <TitleCollapse title="Educational — How CPI is calculated" className="mt-0">
          <TitleCollapse title="CPI, care costs, and riders">
            <p>
            <Cite href={SRC.blsCpi}>BLS CPI-U/CPI-W</Cite> measure a consumer market basket, not private-pay long-term
            care.
            </p>
            {CPI_METHODS.map((m) => (
              <TitleCollapse key={m.title} title={m.title}>
                <p><LinkedCopy text={m.body} /></p>
              </TitleCollapse>
            ))}
            <p className="mt-2">
              This model compounds the {SETTING_SHORT[setting]} bill at <Pct>{cpi.toFixed(1)}%</Pct>:{" "}
              {money(todayCost)} × (1 + <Pct>{cpi.toFixed(1)}%</Pct>)<sup>y</sup>. At care start (year{" "}
              {delay}): {money(careCostCompound(todayCost, cpi, delay))}. After {duration}{" "}
              care years: {money(careCostCompound(todayCost, cpi, delay + duration))}.
              Simple <Pct>{cpi.toFixed(1)}%</Pct> would be{" "}
              {money(careCostSimple(todayCost, cpi, delay + duration))}. The care bill is
              never simple-inflated. Insurance riders grow only the policy maximum and are
              not re-priced here. LTC survey rates have recently ranged from about 2–3% to
              about 5–8%. Sources: <Cite href={SRC.blsCpi}>BLS CPI</Cite>;{" "}
              <Cite href={SRC.carescout}>CareScout</Cite> /{" "}
              <Cite href={SRC.genworth}>Genworth 2024–2025</Cite>;{" "}
              <Cite href={SRC.aarpLtss}>AARP PPI on LTSS (Mar 2026)</Cite>. Not a forecast.
            </p>
          </TitleCollapse>
          </TitleCollapse>
          </section>

        <section className="report-block border-l-4 border-teal bg-paper px-4 py-2 text-sm text-muted">
          <TitleCollapse title={`Educational — Partnership and ${TAX_SECTION_LABEL}`} className="mt-0">
            <TitleCollapse title="Partnership and reciprocity">
              <p>
              A Partnership disregard equals benefits actually paid, not premiums. Income is
              still counted. California does not join the national reciprocity compact.
              Indiana/New York total asset protection is in-state only. Asset spend-down and
              income spend-down are different tests. Medicaid figures for{" "}
              <StateName name={state} /> are in Medicaid Information — they are not repeated here.
              This is current-rule planning only: it does not assume Medicaid will still be
              solvent or that any Partnership disregard or other Medicaid benefit will remain
              the same — solvency and benefits may be adjusted by legislation, regulation, or
              other government action. Full Medicaid Information is in that section of this report.
              </p>
            </TitleCollapse>
            <TitleCollapse title={TAX_SECTION_LABEL}>
              <p>
              There is no general federal LTC tax credit. Tax-qualified premiums may be
              deducted up to IRS age caps after the 7.5% AGI floor if you itemize.
              State credits (if any) are planning figures only. Not tax advice.
              </p>
            </TitleCollapse>
          </TitleCollapse>
          </section>
        </>
        ) : null}

        {policy.enabled ? <NaicLastPages /> : null}

        <p className="no-print border-t border-line pt-4 text-center text-xs text-muted">
          <CopyrightMark />{" "}
          <DisclosureTermsLink
            hash={disclosureSelected(details) ? "disclosure-terms-report" : "disclosure-terms"}
            className="font-semibold text-navy underline-offset-4 hover:underline"
          />
        </p>
        <div className="no-print mt-4 stack-actions md:grid-cols-2 md:mx-auto md:max-w-md">
          <button
            type="button"
            onClick={onPdf}
            className="btn-block rounded-lg border border-gold bg-gold text-masthead"
          >
            Download PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-block rounded-lg border border-navy bg-navy text-cream"
          >
            Close
          </button>
        </div>
        <p className="no-print mx-auto mt-3 max-w-xl text-center text-xs text-muted">
          The PDF is a print picture of this page, not a tagged accessible file. Stay on this
          View or use your browser’s Print dialog for selectable text and screen-reader
          support. Escape closes this report.
        </p>
      </article>
    </div>
  );
}

function Qa({ q, a }: { q: ReactNode; a: ReactNode }) {
  return (
    <tr className="border-t border-line">
      <th className="py-1.5 pr-3 text-left text-sm font-normal text-muted">{q}</th>
      <td className="py-1.5 text-right text-sm tabular-nums text-navy">{a}</td>
    </tr>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display text-lg tabular-nums text-navy">{value}</p>
    </div>
  );
}
