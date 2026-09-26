"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FieldPicker, StepperField } from "@/components/field-picker";
import {
  ASSET_FIELDS,
  DAILY_BENEFIT_MAX,
  DAILY_BENEFIT_MIN,
  DAILY_BENEFIT_STEP,
  LINKED_MONTHLY_MIN,
  LINKED_MONTHLY_STEP,
  agiPremiums,
  clampDailyBenefit,
  dailyFromMonthly,
  fiveYearIssueBand,
  hybridFaceForMonthly,
  leverageLabel,
  monthlyFromDaily,
  SINGLE_PREMIUM_NOTE,
  typicalBuyerHints,
  type AssetKey,
  type AssetRois,
  type Assets,
  type LtcPolicy,
  type PolicyKind,
} from "@/lib/calc";
import { SETTING_LABELS, STATE_NAMES, type CareSetting } from "@/lib/costs";
import { money } from "@/lib/utils";
import { TAX_RATE_GROUPS, TAX_RATE_OPTIONS } from "@/lib/tax-brackets";
import { SRC } from "@/lib/sources";
import { Cite } from "@/components/source-links";
import { AALTCI_MEAN_CLAIM_AGE } from "@/lib/claim-age";
import { partnershipInfo, partnershipPolicyName } from "@/lib/partnership";

type Step =
  | { kind: "mode" }
  | { kind: "contact" }
  | { kind: "asset"; key: AssetKey; label: string }
  | { kind: "tax" }
  | { kind: "home" }
  | { kind: "exclude" }
  | { kind: "excludable" }
  | { kind: "calculate" }
  | { kind: "age" }
  | { kind: "state" }
  | { kind: "issue" }
  | { kind: "setting" }
  | { kind: "years" }
  | { kind: "cpi" }
  | { kind: "claim" }
  | { kind: "cover" }
  | { kind: "benefits" }
  | { kind: "confirm2" }
  | { kind: "section3" }
  | { kind: "run" };

const ASSET_QUESTIONS = ASSET_FIELDS.filter((f) => f.key !== "home");

function stepsFor(personalized: boolean, insuranceLocked: boolean, hasCoverage: boolean): Step[] {
  const steps: Step[] = [{ kind: "mode" }];
  if (personalized) steps.push({ kind: "contact" });
  for (const f of ASSET_QUESTIONS) steps.push({ kind: "asset", key: f.key, label: f.label });
  steps.push(
    { kind: "tax" },
    { kind: "home" },
    { kind: "exclude" },
    { kind: "excludable" },
    { kind: "calculate" },
    { kind: "age" },
    { kind: "state" },
    { kind: "issue" },
    { kind: "setting" },
    { kind: "years" },
    { kind: "cpi" },
    { kind: "claim" },
    { kind: "cover" },
  );
  if (hasCoverage) steps.push({ kind: "benefits" });
  steps.push({ kind: "confirm2" });
  if (!insuranceLocked && !hasCoverage) steps.push({ kind: "section3" });
  steps.push({ kind: "run" });
  return steps;
}

function sectionOf(step: Step) {
  if (step.kind === "mode" || step.kind === "contact") return "";
  if (
    step.kind === "age" ||
    step.kind === "state" ||
    step.kind === "issue" ||
    step.kind === "setting" ||
    step.kind === "years" ||
    step.kind === "cpi" ||
    step.kind === "claim" ||
    step.kind === "cover" ||
    step.kind === "benefits" ||
    step.kind === "confirm2"
  ) {
    return "2. Where and when care starts";
  }
  if (step.kind === "section3" || step.kind === "run") return "3. Insurance";
  return "1. Countable Assets at Risk";
}

const labelClass = "mb-1 block text-sm text-muted";

export function FactFinder({
  index,
  onIndex,
  personalized,
  onPersonalized,
  contact,
  assets,
  rois,
  lifeFaceAmount,
  onLifeFace,
  onAsset,
  onRoi,
  taxRate,
  onTaxRate,
  excludeHome,
  onExcludeHome,
  poolShown,
  pool,
  onCalculate,
  ageToday,
  onAge,
  minAge,
  state,
  onState,
  issueState,
  onIssueState,
  setting,
  onSetting,
  duration,
  onDuration,
  cpi,
  onCpi,
  claimAge,
  onClaimAge,
  onConfirm2,
  section2Confirmed,
  runKinds,
  designs,
  onToggleKind,
  onPatchKind,
  onConfirm3,
  dailyBenefit,
  benefitYears,
  elimDays,
  riderKey,
  riderOptions,
  onDaily,
  onYears,
  onElim,
  onRider,
  section3Confirmed,
  annualIncome,
  onAnnualIncome,
  agiIncluded,
  onIncludeAgi,
  insuranceLocked,
  onRun,
  onOpenForm,
  gotoStep,
  onGotoHandled,
  reportReady,
  canDownload,
  onView,
  onPdf,
}: {
  index: number;
  onIndex: (n: number) => void;
  personalized: boolean;
  onPersonalized: (on: boolean) => void;
  contact: ReactNode;
  assets: Assets;
  rois: AssetRois;
  lifeFaceAmount: number;
  onLifeFace: (n: number) => void;
  onAsset: (key: AssetKey, raw: string) => void;
  onRoi: (key: AssetKey, raw: string) => void;
  taxRate: number;
  onTaxRate: (n: number) => void;
  excludeHome: boolean;
  onExcludeHome: (on: boolean) => void;
  poolShown: boolean;
  pool: number;
  onCalculate: () => void;
  ageToday: number;
  onAge: (raw: string) => void;
  minAge: number;
  state: string;
  onState: (s: string) => void;
  issueState: string;
  onIssueState: (s: string) => void;
  setting: string;
  onSetting: (s: CareSetting) => void;
  duration: number;
  onDuration: (n: number) => void;
  cpi: number;
  onCpi: (n: number) => void;
  claimAge: number;
  onClaimAge: (n: number) => void;
  onConfirm2: () => boolean;
  section2Confirmed: boolean;
  runKinds: Record<PolicyKind, boolean>;
  designs: Record<PolicyKind, LtcPolicy>;
  onToggleKind: (kind: PolicyKind, on: boolean) => void;
  onPatchKind: (kind: PolicyKind, partial: Partial<LtcPolicy>) => void;
  onConfirm3: () => void;
  dailyBenefit: number;
  benefitYears: number;
  elimDays: number;
  riderKey: string;
  riderOptions: { key: string; label: string }[];
  onDaily: (raw: string) => void;
  onYears: (n: number) => void;
  onElim: (n: number) => void;
  onRider: (key: string) => void;
  section3Confirmed: boolean;
  annualIncome: number;
  onAnnualIncome: (n: number) => void;
  agiIncluded: boolean;
  onIncludeAgi: () => void;
  insuranceLocked: boolean;
  onRun: (only?: "traditional" | "assetBased" | "ltcAnnuity" | "hybridLife") => void;
  onOpenForm: () => void;
  gotoStep: string;
  onGotoHandled: () => void;
  reportReady: boolean;
  canDownload: boolean;
  onView: () => void;
  onPdf: () => void;
}) {
  const hasCoverage = (Object.keys(runKinds) as PolicyKind[]).some((k) => runKinds[k]);
  const steps = useMemo(
    () => stepsFor(personalized, insuranceLocked, hasCoverage),
    [personalized, insuranceLocked, hasCoverage],
  );
  const selectedKinds = (["traditional", "assetBased", "ltcAnnuity", "hybridLife"] as PolicyKind[]).filter((k) => runKinds[k]);
  const [benefitKind, setBenefitKind] = useState<PolicyKind>("traditional");
  const activeBenefit = selectedKinds.includes(benefitKind) ? benefitKind : selectedKinds[0] ?? "traditional";
  const done = index >= steps.length;
  const safeIndex = Math.min(index, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];
  const pct = done ? 100 : Math.round((safeIndex / steps.length) * 100);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (done) return;
    document.getElementById("fact-finder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [safeIndex, done]);
  useEffect(() => {
    if (!gotoStep) return;
    const i = steps.findIndex((s) => s.kind === gotoStep);
    if (i >= 0) onIndex(i);
    onGotoHandled();
  }, [gotoStep, steps, onIndex, onGotoHandled]);

  function next() {
    onIndex(Math.min(steps.length - 1, safeIndex + 1));
  }
  function back() {
    onIndex(Math.max(0, safeIndex - 1));
  }
  function totalAndMove() {
    onCalculate();
    const tax = steps.findIndex((s) => s.kind === "tax");
    if (tax >= 0) onIndex(tax);
  }

  const section = sectionOf(step);
  const names = ASSET_QUESTIONS.map((f) => f.label).slice(0, 4).join(", ");
  const passedAssets = steps.slice(0, safeIndex).filter((s) => s.kind === "asset");
  const assetSubtotal = passedAssets.reduce((sum, s) => sum + (s.kind === "asset" ? Number(assets[s.key]) || 0 : 0), 0);

  return (
    <section id="fact-finder" className="mt-4 card-xl min-w-0 scroll-mt-24 p-4 md:p-5" aria-label="Fact finder">
      <div className="mb-4">
        <div className="mb-1 flex items-baseline justify-between gap-3 text-xs font-semibold text-navy">
          <span>Fact finder</span>
          <span>
            {pct}% of 100%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Questions completed">
          <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted">
          {pct}% of 100% complete.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Fact finder</p>
      {section ? (
        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b-2 border-gold pb-2">
          <h2 className="font-display text-xl text-navy">{section}</h2>
          {section.startsWith("1.") && step.kind === "asset" ? (
            <div className="flex flex-col items-end gap-2">
              {passedAssets.length ? (
                <p className="text-base font-semibold tabular-nums text-navy">Subtotal {money(assetSubtotal)}</p>
              ) : null}
              <button
                type="button"
                className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-cream hover:brightness-110"
                onClick={totalAndMove}
              >
                TOTAL COUNTABLE ASSETS NOW
              </button>
            </div>
          ) : section.startsWith("1.") && passedAssets.length ? (
            <p className="text-base font-semibold tabular-nums text-navy">Subtotal {money(assetSubtotal)}</p>
          ) : null}
        </div>
      ) : null}
      {step.kind === "asset" && safeIndex === steps.findIndex((s) => s.kind === "asset") ? (
        <p className="mt-2 text-sm text-muted">
          Enter today’s countable asset values. If you have no countable assets in {names}, and the other lines, leave blank.
        </p>
      ) : null}

      <div className="mt-4 rounded-lg border border-line bg-paper p-4">
        {step.kind === "mode" ? (
          <>
            <p className="text-base font-semibold text-navy">Do you want to personalize the Asset Preservation Modeling or do you want to run Incognito?</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn-block rounded-lg border border-navy bg-navy px-3 py-2.5 text-sm font-semibold text-cream" onClick={() => { onPersonalized(true); next(); }}>
                Personalize
              </button>
              <button type="button" className="btn-block rounded-lg bg-teal px-3 py-2.5 text-sm font-semibold text-cream" onClick={() => { onPersonalized(false); next(); }}>
                Incognito
              </button>
            </div>
          </>
        ) : null}

        {step.kind === "contact" ? (
          <>
            <p className="mb-3 text-base font-semibold text-navy">Who is this asset model for? You can leave any line blank.</p>
            {contact}
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "asset" ? (
          <>
            <p className="text-base font-semibold text-navy">What is today’s value of your {step.label}?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor={`ff-${step.key}`}>{step.key === "life" ? "Cash Value Today" : "Value"}</label>
                <StepperField id={`ff-${step.key}`} value={assets[step.key]} onChange={(v) => onAsset(step.key, v)} step={1000} min={0} prefix="$" commas blankWhenZero />
              </div>
              <div>
                <label className={labelClass} htmlFor={`ff-roi-${step.key}`}>Return on investment %</label>
                <StepperField id={`ff-roi-${step.key}`} value={Number(rois[step.key]) || 0} onChange={(v) => onRoi(step.key, v)} step={0.1} min={0} max={20} decimals={1} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">Leave the value blank if this line is $0.</p>
            {step.key === "life" ? (
              <div className="mt-3">
                <label className={labelClass} htmlFor="ff-life-face">
                  Life insurance face amount *{" "}
                  <a href="#adb-definition" className="source-link">
                    (see definition of accelerated death benefits)
                  </a>
                </label>
                <StepperField
                  id="ff-life-face"
                  value={lifeFaceAmount}
                  onChange={(v) => onLifeFace(Number(v) || 0)}
                  step={1000}
                  min={0}
                  prefix="$"
                  commas
                  blankWhenZero
                />
                <p className="mt-1 text-xs text-muted">
                  Reported only. The face amount does not pay for care unless the policy pays an accelerated death benefit for a terminal illness as defined in the policy, or the policy is sold to a third party.
                </p>
              </div>
            ) : null}
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "tax" ? (
          <>
            <p className="text-base font-semibold text-navy">What tax rate should apply to taxable return on investment?</p>
            <div className="mt-3">
              <FieldPicker
                id="ff-tax"
                value={String(taxRate)}
                options={TAX_RATE_OPTIONS.map((o) => ({
                  value: String(o.rate),
                  label: o.label,
                  group: TAX_RATE_GROUPS.find((g) => g.key === o.group)?.heading,
                }))}
                onChange={(v) => onTaxRate(Number(v))}
              />
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "home" ? (
          <>
            <p className="text-base font-semibold text-navy">What is the estimated market value of your primary residence?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="ff-home">Market value</label>
                <StepperField id="ff-home" value={assets.home} onChange={(v) => onAsset("home", v)} step={1000} min={0} prefix="$" commas blankWhenZero />
              </div>
              <div>
                <label className={labelClass} htmlFor="ff-home-roi">Return on investment %</label>
                <StepperField id="ff-home-roi" value={Number(rois.home) || 0} onChange={(v) => onRoi("home", v)} step={0.1} min={0} max={20} decimals={1} />
              </div>
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "exclude" ? (
          <>
            <p className="text-base font-semibold text-navy">Do you wish to exclude your primary residence from countable assets?</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" className={`btn-block rounded-lg px-3 py-2.5 text-sm font-semibold ${excludeHome ? "bg-teal text-cream" : "border border-navy text-navy"}`} onClick={() => { onExcludeHome(true); next(); }}>
                Yes, exclude it
              </button>
              <button type="button" className={`btn-block rounded-lg px-3 py-2.5 text-sm font-semibold ${!excludeHome ? "bg-teal text-cream" : "border border-navy text-navy"}`} onClick={() => { onExcludeHome(false); next(); }}>
                No, count it
              </button>
            </div>
            <button type="button" className="mt-3 text-sm text-navy underline" onClick={back}>Back</button>
          </>
        ) : null}

        {step.kind === "excludable" ? (
          <>
            <p className="text-base font-semibold text-navy">Excludable assets are defaulted for the care state.</p>
            <p className="mt-2 text-sm text-muted">
              Spouse-excluded assets start at the community-spouse amount for {state || "the care state"}. You can change the amount. Source:{" "}
              <a className="source-link" href="https://www.medicaid.gov/medicaid/eligibility/spousal-impoverishment" target="_blank" rel="noopener noreferrer">
                Medicaid.gov — Spousal impoverishment
              </a>
              .
            </p>
            <div className="mt-3">
              <label className={labelClass} htmlFor="ff-excludable">Excludable assets * Spouse excluded assets</label>
              <StepperField id="ff-excludable" value={assets.excludable} onChange={(v) => onAsset("excludable", v)} step={1000} min={0} prefix="$" commas />
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "calculate" ? (
          <>
            <p className="text-base font-semibold text-navy">Section 1 is ready to calculate.</p>
            <p className="mt-2 text-sm text-muted">Calculate countable assets from the values you entered.</p>
            <div className="mt-4">
              <label className={labelClass} htmlFor="ff-agi">Adjusted gross household income today</label>
              <StepperField
                id="ff-agi"
                value={annualIncome}
                onChange={(v) => onAnnualIncome(Number(v) || 0)}
                prefix="$"
                commas
                step={1000}
                min={0}
                blankWhenZero
              />
              <p className="mt-1 text-xs leading-snug text-muted">
                {annualIncome > 0
                  ? `Suggested traditional premium ${money(agiPremiums(annualIncome).traditionalAnnual)} (7% of this income). Asset-based, annuity care, and hybrid life default the single premium to 2.5% of countable assets or $75,000, whichever is greater.`
                  : "Optional. Include this income to use 7% as the suggested traditional premium. Asset-based, annuity care, and hybrid life default the single premium to 2.5% of countable assets or $75,000, whichever is greater."}
              </p>
              <button
                type="button"
                className="btn-block mt-3 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-cream"
                onClick={onIncludeAgi}
              >
                {agiIncluded ? "Adjusted gross income included" : "Include Adjusted Gross Income"}
              </button>
            </div>
            {poolShown ? <p className="mt-3 font-display text-xl text-gold-ink">Countable pool: {money(pool)}</p> : null}
            <button
              type="button"
              className="btn-calc-red mt-4 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#b42318] px-3 py-2.5 text-base font-semibold text-white"
              onClick={() => {
                onCalculate();
                next();
              }}
            >
              Calculate Countable Assets
            </button>
            <button type="button" className="mt-3 text-sm text-navy underline" onClick={back}>Back</button>
          </>
        ) : null}

        {step.kind === "age" ? (
          <>
            <p className="text-base font-semibold text-navy">What is your age today?</p>
            <div className="mt-3">
              <StepperField id="ff-age" value={ageToday} onChange={onAge} step={1} min={minAge} max={110} />
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "state" ? (
          <>
            <p className="text-base font-semibold text-navy">In what state would care be received?</p>
            <div className="mt-3">
              <FieldPicker id="ff-state" value={state} options={STATE_NAMES.map((s) => ({ value: s, label: s }))} onChange={onState} />
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "issue" ? (
          <>
            <p className="text-base font-semibold text-navy">If insurance is to be considered, what state would the insurance become effective?</p>
            <p className="mt-1 text-xs text-muted">
              (* See{" "}
              <a className="source-link" href={SRC.ltcPartnership} target="_blank" rel="noopener noreferrer">
                reciprocity rules
              </a>
              )
            </p>
            <div className="mt-3">
              <FieldPicker id="ff-issue" value={issueState || state} options={STATE_NAMES.map((s) => ({ value: s, label: s }))} onChange={onIssueState} />
            </div>
            {(() => {
              const picked = issueState || state;
              if (!picked) return null;
              const info = partnershipInfo(picked);
              return (
                <p className="mt-3 font-display text-lg font-semibold leading-snug text-navy">
                  {picked} — {partnershipPolicyName(info)}
                  <span className="mt-1 block text-sm font-normal text-muted">
                    Mode: <Cite href={SRC.naicModel640}>NAIC Model Act #640</Cite>
                  </span>
                </p>
              );
            })()}
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "setting" ? (
          <>
            <p className="text-base font-semibold text-navy">Where do you think care would be received?</p>
            <div className="mt-3">
              <FieldPicker
                id="ff-setting"
                value={setting}
                placeholder="Select care setting"
                options={(Object.keys(SETTING_LABELS) as CareSetting[]).map((k) => ({ value: k, label: SETTING_LABELS[k] }))}
                onChange={(v) => onSetting(v as CareSetting)}
              />
            </div>
            <Nav back={back} next={next} nextDisabled={!setting} />
          </>
        ) : null}

        {step.kind === "years" ? (
          <>
            <p className="text-base font-semibold text-navy">How many years might care last?</p>
            <div className="mt-3">
              <FieldPicker
                id="ff-years"
                value={duration ? String(duration) : ""}
                placeholder="Select the number of years…"
                options={Array.from({ length: 20 }, (_, i) => i + 1).map((y) => ({ value: String(y), label: `${y} year${y === 1 ? "" : "s"}` }))}
                onChange={(v) => onDuration(Number(v) || 0)}
              />
            </div>
            <Nav back={back} next={next} nextDisabled={!duration} />
          </>
        ) : null}

        {step.kind === "cpi" ? (
          <>
            <p className="text-base font-semibold text-navy">What care-cost inflation rate should this model use?</p>
            <div className="mt-3">
              <StepperField id="ff-cpi" value={Number(cpi.toFixed(1))} onChange={(v) => onCpi(Number(v))} step={0.1} min={0} max={12} decimals={1} />
            </div>
            <p className="mt-2 text-xs leading-snug text-muted">
              * {cpi.toFixed(1)}% is the compound annual growth in the national median{" "}
              {setting ? SETTING_LABELS[setting as CareSetting].toLowerCase() : "assisted living"} cost from 2021 to 2025.{" "}
              <Cite href={SRC.carescout}>CareScout Cost of Care Survey</Cite>
            </p>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "claim" ? (
          <>
            <p className="text-base font-semibold text-navy">At what age might care be needed?</p>
            <div className="mt-3">
              <StepperField id="ff-claim" value={claimAge} onChange={(v) => onClaimAge(Number(v) || claimAge)} step={1} min={ageToday + 1} max={120} />
            </div>
            <p className="mt-2 text-xs leading-snug text-muted">
              * Industry claim experience: age {AALTCI_MEAN_CLAIM_AGE} is the mean age at claim in the{" "}
              <Cite href={SRC.aaltci2024Claims}>AALTCI 2024 LTCI claims data</Cite>
              {" "}(Connecticut Partnership sample, range 31–103). The age above is this model’s planning age. You can change it.
            </p>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "cover" ? (
          <>
            <p className="text-base font-semibold text-navy">Which long-term care insurance designs should this run include?</p>
            <p className="mt-1 text-sm text-muted">Select one or more. You can change the benefits for each design you select. Leave all off to run without insurance.</p>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ["traditional", "Traditional LTC Insurance"],
                  ["assetBased", "Asset Based LTC Insurance"],
                  ["ltcAnnuity", "Annuity Care Insurance"],
                  ["hybridLife", "Hybrid Life/LTC Insurance"],
                ] as const
              ).map(([kind, label]) => (
                <label key={kind} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy">
                  <input
                    type="checkbox"
                    className="size-4 accent-teal"
                    checked={runKinds[kind]}
                    onChange={(e) => onToggleKind(kind, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <Nav
              back={back}
              next={() => {
                if (!hasCoverage) onConfirm3();
                next();
              }}
            />
          </>
        ) : null}

        {step.kind === "benefits" && activeBenefit ? (
          <BenefitEditor
            kind={activeBenefit}
            kinds={selectedKinds}
            onKind={setBenefitKind}
            policy={designs[activeBenefit]}
            riderOptions={riderOptions}
            ageToday={ageToday}
            onPatch={(partial) => onPatchKind(activeBenefit, partial)}
            onDone={() => {
              onConfirm3();
              next();
            }}
            back={back}
          />
        ) : null}

        {step.kind === "confirm2" ? (
          <>
            <p className="text-base font-semibold text-navy">Confirm where and when you think care might be needed.</p>
            <p className="mt-2 text-sm text-muted">Age {ageToday}, care in {state || "a state still to select"}, {setting ? SETTING_LABELS[setting as CareSetting] : "care setting still to select"}, {duration || "—"} years.</p>
            <button
              type="button"
              className={`mt-4 btn-block rounded-lg px-4 py-2.5 text-sm font-semibold ${section2Confirmed ? "bg-teal text-cream" : "bg-navy text-cream"}`}
              onClick={() => {
                if (onConfirm2()) next();
              }}
            >
              Confirm Section 2 selection
            </button>
            <button type="button" className="mt-3 text-sm text-navy underline" onClick={back}>Back</button>
          </>
        ) : null}

        {step.kind === "section3" ? (
          <>
            <p className="text-base font-semibold text-navy">Confirm the insurance benefit used in this hypothetical.</p>
            <p className="mt-2 text-sm text-muted">These start from the age-based planning default. Change any field, then confirm.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Daily benefit</label>
                <StepperField id="ff-daily" value={dailyBenefit} onChange={onDaily} prefix="$" step={DAILY_BENEFIT_STEP} min={DAILY_BENEFIT_MIN} max={DAILY_BENEFIT_MAX} commas />
              </div>
              <div>
                <label className={labelClass}>Benefit period (years)</label>
                <StepperField id="ff-byears" value={benefitYears} onChange={(v) => onYears(Number(v) || benefitYears)} step={1} min={1} max={50} />
              </div>
              <div>
                <label className={labelClass}>Elimination period (days)</label>
                <FieldPicker
                  id="ff-elim"
                  value={String(elimDays)}
                  options={[0, 20, 30, 60, 90, 100, 180].map((d) => ({ value: String(d), label: `${d} days` }))}
                  onChange={(v) => onElim(Number(v))}
                />
              </div>
              <div>
                <label className={labelClass}>Benefit increase</label>
                <FieldPicker id="ff-rider" value={riderKey} options={riderOptions.map((o) => ({ value: o.key, label: o.label }))} onChange={onRider} />
              </div>
            </div>
            <button
              type="button"
              className={`mt-4 btn-block rounded-lg px-4 py-2.5 text-sm font-semibold ${section3Confirmed ? "bg-teal text-cream" : "bg-[#b42318] text-white"}`}
              onClick={() => {
                onConfirm3();
                next();
              }}
            >
              Confirm Section 3 selection
            </button>
            <button type="button" className="mt-3 text-sm text-navy underline" onClick={back}>Back</button>
          </>
        ) : null}

        {step.kind === "run" ? (
          <>
            <p className="text-base font-semibold text-navy">
              {insuranceLocked ? "Countable assets are under this model’s insurance screen. You can still run the hypothetical." : "Which hypothetical should run?"}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["traditional", "Run Traditional"],
                  ["assetBased", "Run Asset Based"],
                  ["ltcAnnuity", "Run Annuity Care"],
                  ["hybridLife", "Run Hybrid"],
                ] as const
              ).map(([kind, label]) => (
                <button key={kind} type="button" className="btn-block rounded-lg bg-navy px-3 py-2.5 text-sm font-semibold text-cream" onClick={() => { onIndex(steps.length); onRun(kind); }}>
                  {label}
                </button>
              ))}
              <button type="button" className="btn-block btn-attention-red rounded-lg sm:col-span-2" onClick={() => { onIndex(steps.length); onRun(); }}>
                Run All Selected
              </button>
            </div>
            {reportReady ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={onView} className="flex min-h-11 items-center justify-center rounded-lg border border-gold bg-gold px-3 py-2 text-sm font-semibold text-masthead">View all</button>
                {canDownload ? (
                  <button type="button" onClick={onPdf} className="flex min-h-11 items-center justify-center rounded-lg border border-navy bg-navy px-3 py-2 text-sm font-semibold text-cream">Download PDF</button>
                ) : null}
              </div>
            ) : null}
            <button type="button" className="mt-3 text-sm text-navy underline" onClick={back}>Back</button>
          </>
        ) : null}
      </div>

      <p className="mt-3 text-center text-xs text-muted">
        <button type="button" className="underline" onClick={onOpenForm}>
          Open the full form instead
        </button>
      </p>
    </section>
  );
}

function BenefitEditor({
  kind,
  kinds,
  onKind,
  policy,
  riderOptions,
  ageToday,
  onPatch,
  onDone,
  back,
}: {
  kind: PolicyKind;
  kinds: PolicyKind[];
  onKind: (kind: PolicyKind) => void;
  policy: LtcPolicy;
  riderOptions: { key: string; label: string }[];
  ageToday: number;
  onPatch: (partial: Partial<LtcPolicy>) => void;
  onDone: () => void;
  back: () => void;
}) {
  const labels: Record<PolicyKind, string> = {
    traditional: "Traditional LTC Insurance",
    assetBased: "Asset Based LTC Insurance",
    ltcAnnuity: "Annuity Care Insurance",
    hybridLife: "Hybrid Life/LTC Insurance",
  };
  const inflation =
    policy.benefitInflationPct <= 0 || policy.inflationMethod === "none"
      ? "none"
      : `${policy.benefitInflationPct}-${policy.inflationMethod}`;
  return (
    <>
      <p className="text-base font-semibold text-navy">Adjust the benefits for each design you selected.</p>
      <div className="mt-3 flex gap-1 overflow-x-auto" role="tablist">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={k === kind}
            className={`shrink-0 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold ${k === kind ? "bg-navy text-cream" : "border border-line text-navy"}`}
            onClick={() => onKind(k)}
          >
            {labels[k]}
          </button>
        ))}
      </div>
      {kind === "traditional" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Daily benefit</label>
            <StepperField
              id="ff-kind-daily"
              value={policy.dailyBenefit}
              prefix="$"
              commas
              step={DAILY_BENEFIT_STEP}
              min={DAILY_BENEFIT_MIN}
              max={DAILY_BENEFIT_MAX}
              onChange={(v) => {
                const n = clampDailyBenefit(Number(v));
                onPatch({ dailyBenefit: n, monthlyBenefit: monthlyFromDaily(n) });
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Benefit period</label>
            <FieldPicker
              id="ff-kind-years"
              value={String(policy.benefitYears)}
              options={[
                ...[3, 4, 5, 6, 8, 10].map((y) => ({ value: String(y), label: `${y} years` })),
                { value: "99", label: "Lifetime *" },
              ]}
              onChange={(v) => onPatch({ benefitYears: Number(v) })}
            />
          </div>
          <div>
            <label className={labelClass}>Elimination period</label>
            <FieldPicker
              id="ff-kind-elim"
              value={String(policy.elimDays)}
              options={[0, 20, 30, 60, 90, 100, 180].map((d) => ({ value: String(d), label: `${d} days` }))}
              onChange={(v) => onPatch({ elimDays: Number(v) })}
            />
          </div>
          <div>
            <label className={labelClass}>Benefit increase</label>
            <FieldPicker
              id="ff-kind-rider"
              value={inflation}
              options={riderOptions.map((o) => ({ value: o.key, label: o.label }))}
              onChange={(v) => {
                const found = riderOptions.find((o) => o.key === v);
                if (!found) return;
                const [pct, method] = found.key === "none" ? [0, "none" as const] : found.key.split("-");
                onPatch({
                  benefitInflationPct: found.key === "none" ? 0 : Number(pct),
                  inflationMethod: found.key === "none" ? "none" : (method as LtcPolicy["inflationMethod"]),
                });
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Annual premium</label>
            <StepperField
              id="ff-kind-premium"
              value={policy.annualPremium || 0}
              prefix="$"
              commas
              step={100}
              min={0}
              blankWhenZero
              onChange={(v) => onPatch({ annualPremium: Number(v) || 0 })}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{kind === "hybridLife" ? "Death benefit" : "Single premium / deposit"}</label>
            <StepperField
              id="ff-kind-single"
              value={policy.singlePremium || 0}
              prefix="$"
              commas
              step={1000}
              min={0}
              onChange={(v) => onPatch({ singlePremium: Number(v) || 0 })}
            />
          </div>
          <p className="text-xs leading-snug text-muted sm:col-span-2">{SINGLE_PREMIUM_NOTE}</p>
          <div>
            <label className={labelClass}>LTC leverage</label>
            <FieldPicker
              id="ff-kind-lev"
              value={String(policy.leverage || 1)}
              options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: leverageLabel(n) }))}
              onChange={(v) => onPatch({ leverage: Number(v) || 1 })}
            />
          </div>
          <div>
            <label className={labelClass}>Monthly benefit</label>
            <StepperField
              id="ff-kind-monthly"
              value={Math.max(LINKED_MONTHLY_MIN, policy.monthlyBenefit || 0)}
              prefix="$"
              commas
              step={LINKED_MONTHLY_STEP}
              min={LINKED_MONTHLY_MIN}
              onChange={(v) => {
                const raw = Number(v) || 0;
                const m = Math.max(LINKED_MONTHLY_MIN, Math.round(raw / LINKED_MONTHLY_STEP) * LINKED_MONTHLY_STEP);
                onPatch({
                  monthlyBenefit: m,
                  dailyBenefit: dailyFromMonthly(m),
                  singlePremium: kind === "hybridLife" ? hybridFaceForMonthly(m) : policy.singlePremium,
                });
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Elimination period</label>
            <FieldPicker
              id="ff-kind-elim-h"
              value={String(policy.elimDays)}
              options={[0, 20, 30, 60, 90, 100, 180].map((d) => ({ value: String(d), label: `${d} days` }))}
              onChange={(v) => onPatch({ elimDays: Number(v) })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Benefit increase</label>
            <FieldPicker
              id="ff-kind-rider-h"
              value={inflation}
              options={riderOptions.map((o) => ({ value: o.key, label: o.label }))}
              onChange={(v) => {
                const found = riderOptions.find((o) => o.key === v);
                if (!found) return;
                const method = found.key === "none" ? "none" : found.key.split("-")[1];
                onPatch({
                  benefitInflationPct: found.key === "none" ? 0 : Number(found.key.split("-")[0]),
                  inflationMethod: method as LtcPolicy["inflationMethod"],
                });
              }}
            />
          </div>
        </div>
      )}
      <p className="mt-3 text-xs leading-snug text-muted">
        * Insurance buyer experience
        {ageToday >= 40 ? ` for ages ${fiveYearIssueBand(ageToday) ?? "in this band"}` : ""}: most buyers select{" "}
        {typicalBuyerHints(ageToday).daily}/day, a {typicalBuyerHints(ageToday).period} period, a {typicalBuyerHints(ageToday).elim} wait, and{" "}
        {typicalBuyerHints(ageToday).inflation}. Daily benefit, benefit period, and wait follow the overall 2024 stand-alone sales mix.{" "}
        <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
        {" · "}
        <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" className="rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy" onClick={back}>
          Back
        </button>
        <button type="button" className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-cream" onClick={onDone}>
          Use these benefits
        </button>
      </div>
    </>
  );
}

function Nav({ back, next, nextDisabled }: { back: () => void; next: () => void; nextDisabled?: boolean }) {
  return (
    <div className="mt-4 flex gap-2">
      <button type="button" className="rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy" onClick={back}>
        Back
      </button>
      <button type="button" className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-cream disabled:opacity-40" onClick={next} disabled={nextDisabled}>
        Next
      </button>
    </div>
  );
}
