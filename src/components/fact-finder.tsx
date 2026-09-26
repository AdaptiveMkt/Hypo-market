"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { FieldPicker, StepperField } from "@/components/field-picker";
import { ASSET_FIELDS, DAILY_BENEFIT_MAX, DAILY_BENEFIT_MIN, DAILY_BENEFIT_STEP, type AssetKey, type Assets, type AssetRois } from "@/lib/calc";
import { SETTING_LABELS, STATE_NAMES, type CareSetting } from "@/lib/costs";
import { money } from "@/lib/utils";
import { TAX_RATE_GROUPS, TAX_RATE_OPTIONS } from "@/lib/tax-brackets";

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
  | { kind: "confirm2" }
  | { kind: "section3" }
  | { kind: "run" };

const ASSET_QUESTIONS = ASSET_FIELDS.filter((f) => f.key !== "home");

function stepsFor(personalized: boolean, insuranceLocked: boolean): Step[] {
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
    { kind: "confirm2" },
  );
  if (!insuranceLocked) steps.push({ kind: "section3" });
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
  dailyBenefit,
  benefitYears,
  elimDays,
  riderKey,
  riderOptions,
  onDaily,
  onYears,
  onElim,
  onRider,
  onConfirm3,
  section3Confirmed,
  insuranceLocked,
  onRun,
  onOpenForm,
}: {
  index: number;
  onIndex: (n: number) => void;
  personalized: boolean;
  onPersonalized: (on: boolean) => void;
  contact: ReactNode;
  assets: Assets;
  rois: AssetRois;
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
  onConfirm2: () => void;
  section2Confirmed: boolean;
  dailyBenefit: number;
  benefitYears: number;
  elimDays: number;
  riderKey: string;
  riderOptions: { key: string; label: string }[];
  onDaily: (raw: string) => void;
  onYears: (n: number) => void;
  onElim: (n: number) => void;
  onRider: (key: string) => void;
  onConfirm3: () => void;
  section3Confirmed: boolean;
  insuranceLocked: boolean;
  onRun: (only?: "traditional" | "assetBased" | "ltcAnnuity" | "hybridLife") => void;
  onOpenForm: () => void;
}) {
  const steps = useMemo(() => stepsFor(personalized, insuranceLocked), [personalized, insuranceLocked]);
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
    document.getElementById("fact-finder")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [safeIndex]);

  function next() {
    onIndex(Math.min(steps.length - 1, safeIndex + 1));
  }
  function back() {
    onIndex(Math.max(0, safeIndex - 1));
  }

  const section = sectionOf(step);
  const names = ASSET_QUESTIONS.map((f) => f.label).slice(0, 4).join(", ");

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
          Question {safeIndex + 1} of {steps.length}. {pct}% of 100% complete.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Fact finder</p>
      {section ? <h2 className="mt-1 border-b-2 border-gold pb-2 font-display text-xl text-navy">{section}</h2> : null}
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
              <button type="button" className="btn-block rounded-lg bg-black px-3 py-2.5 text-sm font-semibold text-white" onClick={() => { onPersonalized(false); next(); }}>
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
                <label className={labelClass} htmlFor={`ff-${step.key}`}>Value</label>
                <StepperField id={`ff-${step.key}`} value={assets[step.key]} onChange={(v) => onAsset(step.key, v)} step={1000} min={0} prefix="$" commas blankWhenZero />
              </div>
              <div>
                <label className={labelClass} htmlFor={`ff-roi-${step.key}`}>Return on investment %</label>
                <StepperField id={`ff-roi-${step.key}`} value={Number(rois[step.key]) || 0} onChange={(v) => onRoi(step.key, v)} step={0.1} min={0} max={20} decimals={1} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">Leave the value blank if this line is $0.</p>
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
            <p className="text-base font-semibold text-navy">In what state would an insurance policy be issued?</p>
            <p className="mt-1 text-xs text-muted">Leave this as the care state unless the policy would be issued somewhere else.</p>
            <div className="mt-3">
              <FieldPicker id="ff-issue" value={issueState || state} options={STATE_NAMES.map((s) => ({ value: s, label: s }))} onChange={onIssueState} />
            </div>
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
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "claim" ? (
          <>
            <p className="text-base font-semibold text-navy">At what age might care be needed?</p>
            <div className="mt-3">
              <StepperField id="ff-claim" value={claimAge} onChange={(v) => onClaimAge(Number(v) || claimAge)} step={1} min={ageToday + 1} max={120} />
            </div>
            <Nav back={back} next={next} />
          </>
        ) : null}

        {step.kind === "confirm2" ? (
          <>
            <p className="text-base font-semibold text-navy">Confirm where and when you think care might be needed.</p>
            <p className="mt-2 text-sm text-muted">Age {ageToday}, care in {state || "a state still to select"}, {setting ? SETTING_LABELS[setting as CareSetting] : "care setting still to select"}, {duration || "—"} years.</p>
            <button
              type="button"
              className={`mt-4 btn-block rounded-lg px-4 py-2.5 text-sm font-semibold ${section2Confirmed ? "bg-teal text-cream" : "bg-navy text-cream"}`}
              onClick={() => {
                onConfirm2();
                next();
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
