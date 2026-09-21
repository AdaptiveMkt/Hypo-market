"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ASSET_FIELDS,
  DAILY_BENEFIT_MAX,
  DAILY_BENEFIT_MIN,
  DAILY_BENEFIT_STEP,
  LINKED_MONTHLY_MIN,
  LINKED_MONTHLY_STEP,
  DEFAULT_ASSETS,
  DEFAULT_ASSET_ROIS,
  DEFAULT_CSV,
  DEFAULT_POLICY,
  DEFAULT_STRUCTURE_FLAGS,
  DEFAULT_LINKED_SINGLE_PREMIUM,
  STRUCTURE_OPTIONS,
  seedKindBook,
  assetBasedMonthlyCap,
  clampDailyBenefit,
  dailyFromMonthly,
  depletionCalendar,
  formatYearsLast,
  holdingsFrom,
  hybridFaceForMonthly,
  isAssetBased,
  isLifetimeBenefit,
  leverageLabel,
  monthlyFromDaily,
  netRoiPct,
  poolTotal,
  policyForCompareLane,
  project,
  projectHoldingsForward,
  specifiedFaceAmount,
  targetPremiumParts,
  typicalBuyerHints,
  typicalPurchaseForAge,
  typicalPurchaseNote,
  fiveYearIssueBand,
  weightedRoiPct,
  yearsPoolLasts,
  careStartYear,
  chartTickInterval,
  remainingToneAt,
  remainingToneClass,
  type AssetRois,
  type Assets,
  type InflationMethod,
  type LtcPolicy,
  type PolicyKind,
  type StructureFlags,
} from "@/lib/calc";
import {
  DEFAULT_CARE_CPI,
  DEFAULT_CARE_SETTING,
  SETTING_LABELS,
  SETTING_SHORT,
  STATE_NAMES,
  annualCost,
  fiveYearLtcCagr,
  fiveYearLtcBenchmarks,
  type CareSetting,
} from "@/lib/costs";
import { DEFAULT_TAX_RATE, TAX_RATE_GROUPS, TAX_RATE_OPTIONS } from "@/lib/tax-brackets";
import { careCostCompound } from "@/lib/cpi";
import { compactMoney, money, moneyCents } from "@/lib/utils";
import { DEFAULT_PROTECT_PCT, sizeInsuranceToProtectAssets } from "@/lib/protect-assets";
import { CHART, PIE_COLORS } from "@/lib/palette";
import {
  AALTCI_MEAN_CLAIM_AGE,
  actuarialClaimAge,
  DEFAULT_AGE_TODAY,
  MIN_AGE_TODAY,
  yearsUntilClaim,
} from "@/lib/claim-age";
import { typicalLinkedBuyerHints, typicalPremiumHint } from "@/lib/what-consumers-buy";
import { TitleCollapse } from "@/components/accordion";
import { isDarkTheme, setTheme } from "@/components/theme-toggle";
import { StateName, Pct } from "@/components/state-name";
import { Cite, CopyrightMark, LinkedCopy } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import { HEALTH_INSURANCE_INTRO, HEALTH_INSURANCE_TYPES } from "@/lib/health-insurance-types";
import { DISCLOSURE_CARD_TITLE } from "@/lib/disclaimer";
import {
  ALL_DETAILS_OFF,
  ALL_DETAILS_ON,
  DEFAULT_DETAILS,
  DISCLOSURE_SECTION_IDS,
  isRequiredDetail,
  lockoutDetails,
  withScenarioDetails,
  DETAIL_HINTS,
  type DetailFlags,
  type DetailId,
} from "@/lib/report-options";
import {
  NAIC_LOCKOUT_ASSETS,
  NAIC_SUITABILITY_BANNER,
  NAIC_SUITABILITY_MEETS,
  NAIC_SUITABILITY_MEETS_SPOKEN,
  NAIC_SUITABILITY_WARN,
  insuranceLockedOut,
  insuranceNeedsWarning,
  naicLockoutSpoken,
} from "@/lib/naic-suitability";
import { playCeleste } from "@/lib/celeste";
import { pinToHeaderOnLoad, scrollToHeader } from "@/lib/scroll-header";
import { WhatConsumersBuyPanel } from "@/components/what-consumers-buy-panel";
import { ReportView } from "@/components/report-view";
import { PdfSectionsDialog } from "@/components/details-picker";
import { ContactAskDialog, ContactRequestDialog, PdfReadyDialog } from "@/components/pdf-delivery-dialogs";
import { MedicaidVaCard } from "@/components/medicaid-va-card";
import { AdvisorProfessionalFolds, DisclaimerCard } from "@/components/disclaimer-card";
import { WelcomeCard } from "@/components/welcome-card";
import { ChartRegion, useNarrow } from "@/components/chart-region";
import { defaultExcludableAssets, medicaidProfile } from "@/lib/medicaid";
import {
  analysisNarrative,
  EMPTY_ADVISOR,
  EMPTY_CONTACT,
  advisorReceivesPdf,
  partyFilled,
  recommendationsNarrative,
  SAVE_KEY,
  type AdvisorParty,
  type ContactParty,
} from "@/lib/report";
import { downloadReportPdf } from "@/lib/download-report-pdf";
import { emailAdvisorPdf } from "@/lib/send-report-mail";
import { pdfFilename } from "@/lib/email-attachment";
import { hypothesisSensitivity } from "@/lib/sensitivity";
import { modelConfidence } from "@/lib/confidence";
import {
  partnershipByState,
  partnershipInfo,
  partnershipPolicyName,
  partnershipResult,
  preservationImpact,
} from "@/lib/partnership";
import { RECIPROCITY_EXAMPLES, reciprocityOutcome } from "@/lib/reciprocity";
import { NaicGuideCoverRow, NaicShopperCover, NaicSuitabilityCover } from "@/components/naic-shopper-cover";
import { NaicCardDisclaimer } from "@/components/naic-last-pages";
import { FieldPicker, StepperField } from "@/components/field-picker";
import { FederalLtcDeductionPanel } from "@/components/federal-ltc-deduction-panel";
import { Irc1035Panel } from "@/components/irc-1035-panel";
import { IndustryInsightsPanel } from "@/components/industry-insights";
import { ConfidencePanel } from "@/components/confidence-panel";
import { LTC_INSURANCE_OPTIONS } from "@/lib/ltc-compare";
import { LTC_RIDER_GLANCE, LTC_RIDER_INTRO } from "@/lib/ltc-riders";

const fieldClass =
  "w-full rounded-lg border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none focus:border-teal";
const labelClass = "mb-1 block min-w-0 max-w-full text-sm leading-snug text-muted";
const MODEL_START_YEAR = new Date().getFullYear();
const ELIM_DAYS = [0, 20, 30, 60, 90, 100, 180];
const RIDER_OPTIONS: {
  key: string;
  label: string;
  benefitInflationPct: number;
  inflationMethod: InflationMethod;
}[] = [
  { key: "none", label: "None — today’s values", benefitInflationPct: 0, inflationMethod: "none" },
  { key: "3-compound", label: "3% compound", benefitInflationPct: 3, inflationMethod: "compound" },
  { key: "5-compound", label: "5% compound", benefitInflationPct: 5, inflationMethod: "compound" },
  { key: "5-simple", label: "5% simple", benefitInflationPct: 5, inflationMethod: "simple" },
];

function calendarYear(modelYear: number) {
  return MODEL_START_YEAR + Math.max(1, modelYear) - 1;
}
function riderKey(p: LtcPolicy) {
  if (p.benefitInflationPct <= 0 || p.inflationMethod === "none") return "none";
  return `${p.benefitInflationPct}-${p.inflationMethod}`;
}
function parseRider(value: string): Pick<LtcPolicy, "benefitInflationPct" | "inflationMethod"> {
  const found = RIDER_OPTIONS.find((o) => o.key === value);
  if (!found) return { benefitInflationPct: 0, inflationMethod: "none" };
  return { benefitInflationPct: found.benefitInflationPct, inflationMethod: found.inflationMethod };
}
function disabledPolicy(p: LtcPolicy): LtcPolicy {
  return { ...p, enabled: false };
}

export function Calculator() {
  const narrow = useNarrow();
  const [assets, setAssets] = useState<Assets>(() => ({
    ...DEFAULT_ASSETS,
    excludable: defaultExcludableAssets(""),
  }));
  const [excludableTouched, setExcludableTouched] = useState(false);
  const [assetRois, setAssetRois] = useState<AssetRois>(() => ({ ...DEFAULT_ASSET_ROIS }));
  const [state, setState] = useState("");
  const [setting, setSetting] = useState<CareSetting | "">("");
  const [settingNeeded, setSettingNeeded] = useState(false);
  const activeSetting: CareSetting = setting || DEFAULT_CARE_SETTING;
  const [cpiOverride, setCpiOverride] = useState<number | null>(null);
  const cpi = cpiOverride ?? (setting ? fiveYearLtcCagr(setting) : DEFAULT_CARE_CPI);
  const cpiTouched = cpiOverride != null;
  const [ageToday, setAgeToday] = useState(0);
  const [claimAge, setClaimAge] = useState(AALTCI_MEAN_CLAIM_AGE);
  const [claimAgeTouched, setClaimAgeTouched] = useState(false);
  const delay = ageToday >= MIN_AGE_TODAY ? yearsUntilClaim(ageToday, claimAge) : 0;
  const buyerHints = ageToday >= MIN_AGE_TODAY ? typicalBuyerHints(ageToday) : null;
  const [duration, setDuration] = useState(0);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [saveMsg, setSaveMsg] = useState("");
  const [stateNeeded, setStateNeeded] = useState(false);
  const [durationNeeded, setDurationNeeded] = useState(false);
  const [protectPct, setProtectPct] = useState(DEFAULT_PROTECT_PCT);
  const [ageNeeded, setAgeNeeded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [printAfterOpen, setPrintAfterOpen] = useState(false);
  const [pdfPick, setPdfPick] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(true);
  const themeBeforeIncognito = useRef<"light" | "dark" | null>(null);
  const [pdfReady, setPdfReady] = useState<{
    filename: string;
    url: string;
    note: string;
    next: "contact" | "done";
  } | null>(null);
  const [premiumTouched, setPremiumTouched] = useState(false);
  const [designTouched, setDesignTouched] = useState(false);
  const [yearPage, setYearPage] = useState(0);
  const [policy, setPolicy] = useState<LtcPolicy>(() => {
    const typical = typicalPurchaseForAge(DEFAULT_AGE_TODAY);
    const annual =
      typicalPremiumHint(DEFAULT_AGE_TODAY, typical.benefitInflationPct, typical.inflationMethod)
        .amount ?? 0;
    return { ...seedKindBook(typical, annual).traditional, enabled: false };
  });
  const [kindBook, setKindBook] = useState<Record<PolicyKind, LtcPolicy>>(() => {
    const typical = typicalPurchaseForAge(DEFAULT_AGE_TODAY);
    const annual =
      typicalPremiumHint(DEFAULT_AGE_TODAY, typical.benefitInflationPct, typical.inflationMethod)
        .amount ?? 0;
    return seedKindBook(typical, annual);
  });
  const [excludeHome, setExcludeHome] = useState(true);
  const [ran, setRan] = useState(false);
  const [poolShown, setPoolShown] = useState(false);
  const [dockOpen, setDockOpen] = useState(true);
  const [hypoRunId, setHypoRunId] = useState(0);
  const [client, setClient] = useState<ContactParty>({ ...EMPTY_CONTACT });
  const [advisor, setAdvisor] = useState<AdvisorParty>({ ...EMPTY_ADVISOR });
  const [contactAsk, setContactAsk] = useState(false);
  const [contactForm, setContactForm] = useState(false);
  const [contactDraft, setContactDraft] = useState({ name: "", phone: "", email: "", state: "" });
  const [attachAdvisor, setAttachAdvisor] = useState(true);
  const mailRef = useRef({ client: EMPTY_CONTACT, advisor: EMPTY_ADVISOR, state: "", attachAdvisor: true });
  const [partnershipOn, setPartnershipOn] = useState(true);
  const [preferTap, setPreferTap] = useState(false);
  const [issueState, setIssueState] = useState("");
  const [issueTouched, setIssueTouched] = useState(false);
  const [veteran, setVeteran] = useState(false);
  const [details, setDetails] = useState<DetailFlags>({ ...DEFAULT_DETAILS });
  const [runKinds, setRunKinds] = useState<StructureFlags>({ ...DEFAULT_STRUCTURE_FLAGS });
  const [yearKind, setYearKind] = useState<PolicyKind>("traditional");
  const [warnFlash, setWarnFlash] = useState(false);
  const insuranceWasSuitable = useRef<boolean | null>(null);

  useEffect(() => {
    pinToHeaderOnLoad();
    const t = window.setTimeout(() => scrollToHeader(false), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    mailRef.current = { client, advisor, state, attachAdvisor };
  }, [client, advisor, state, attachAdvisor]);

  useEffect(() => {
    setAdvisor((p) => (p.state === state ? p : { ...p, state }));
  }, [state]);

  useEffect(() => {
    if (!policy.enabled) return;
    setRunKinds((prev) => (prev[policy.kind] ? prev : { ...prev, [policy.kind]: true }));
    setYearKind(policy.kind);
  }, [policy.enabled, policy.kind]);

  const grossPool = poolTotal({ ...assets, excludable: 0 }, false);
  const pool = poolTotal(assets, excludeHome);
  const insuranceLocked = insuranceLockedOut(pool);
  const insuranceWarn = insuranceNeedsWarning(pool);
  const insuranceSuitable = !insuranceLocked;
  const holdings = useMemo(
    () => holdingsFrom(assets, assetRois, excludeHome),
    [assets, assetRois, excludeHome],
  );
  const roi = weightedRoiPct(holdings, false) || weightedRoiPct(holdings) || 3;
  const iraRoi = Number(assetRois.ira) || 0;
  const iraBal = Number(assets.ira) || 0;
  const homeEquity = Number(assets.home) || 0;
  const spouseExcluded = Number(assets.excludable) || 0;
  const todayCost = annualCost(state, activeSetting);
  const careStart = careStartYear(delay);
  const claimCost = careCostCompound(todayCost, cpi, Math.max(0, careStart - 1));
  const claimYearLabel = calendarYear(careStart);
  const protectSize = useMemo(() => {
    const atClaim = projectHoldingsForward(holdings, taxRate, careStart);
    return sizeInsuranceToProtectAssets({
      assetsAtClaimNet: atClaim.net,
      protectPct,
      firstYearCost: claimCost,
      cpiPct: cpi,
      careYears: Math.max(1, duration || 3),
      delayYears: Math.max(0, careStart - 1),
      ageToday,
    });
  }, [holdings, taxRate, careStart, protectPct, claimCost, cpi, duration, ageToday]);
  const medicaid = useMemo(() => medicaidProfile(state), [state]);
  const netRoi = netRoiPct(roi, taxRate);
  const premiumParts = targetPremiumParts(pool, annualIncome);
  const premiumTarget = premiumParts.suggested;
  const hybridOn = isAssetBased(policy);
  const lifetime = isLifetimeBenefit(policy.benefitYears);
  const hybMonthly = assetBasedMonthlyCap(policy.singlePremium, policy.monthlyBenefit);

  useEffect(() => {
    if (premiumTouched) return;
    const amount = typicalPremiumHint(ageToday, policy.benefitInflationPct, policy.inflationMethod)
      .amount;
    if (amount == null) return;
    setPolicy((prev) => (prev.annualPremium === amount ? prev : { ...prev, annualPremium: amount }));
  }, [ageToday, policy.benefitInflationPct, policy.inflationMethod, premiumTouched]);

  useEffect(() => {
    const was = insuranceWasSuitable.current;
    if (!insuranceSuitable) {
      setPolicy((prev) => (prev.enabled ? { ...prev, enabled: false } : prev));
    } else {
      setPolicy((prev) => (prev.enabled ? prev : { ...prev, enabled: true }));
      setPartnershipOn(true);
      if (was === false) void playCeleste(NAIC_SUITABILITY_MEETS_SPOKEN);
    }
    insuranceWasSuitable.current = insuranceSuitable;
  }, [insuranceSuitable]);

  useEffect(() => {
    if (!insuranceWarn) {
      setWarnFlash(false);
      return;
    }
    setWarnFlash(true);
    const t = window.setTimeout(() => setWarnFlash(false), 4500);
    return () => window.clearTimeout(t);
  }, [insuranceWarn, pool]);

  const baseArgs = {
    pool,
    state,
    setting: activeSetting,
    delay,
    duration: Math.max(1, duration),
    cpiPct: cpi,
    roiPct: roi,
    taxRatePct: taxRate,
    iraBalance: iraBal,
    iraRoiPct: iraRoi,
    holdings,
  };

  const result = useMemo(
    () => project({ ...baseArgs, policy }),
    [pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, policy, holdings],
  );
  const selfFunded = useMemo(
    () => project({ ...baseArgs, policy: disabledPolicy(policy) }),
    [pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, policy, holdings],
  );
  const yearView = useMemo(() => {
    if (!policy.enabled || yearKind === policy.kind) return result;
    return project({ ...baseArgs, policy: policyForCompareLane(yearKind, policy, pool) });
  }, [yearKind, result, pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, policy, holdings]);

  const pShipInfo = partnershipInfo(state);
  const partnershipApplies = Boolean(policy.enabled && partnershipOn && policy.kind === "traditional");
  const pShip = partnershipResult({
    state,
    policy,
    partnershipOn: partnershipApplies,
    preferTap,
    benefitsPaid: result.insuranceTotal,
    remainingCountable: result.endPool,
  });
  const pShipStates = partnershipByState({
    policy,
    partnershipOn: partnershipApplies,
    preferTap,
    benefitsPaid: result.insuranceTotal,
    remainingCountable: result.endPool,
  });
  const pImpact = preservationImpact({
    state,
    policy,
    partnershipOn: partnershipApplies,
    preferTap,
    benefitsPaid: result.insuranceTotal,
    remainingWithPolicy: result.endPool,
    remainingNoPolicy: selfFunded.endPool,
  });
  const effectiveIssue = issueTouched && issueState ? issueState : state;
  const issueShip = partnershipInfo(effectiveIssue || state);
  const showReciprocity = Boolean(policy.enabled && !insuranceLocked && state && effectiveIssue && effectiveIssue !== state);
  const recip = reciprocityOutcome(effectiveIssue || state, state, policy, preferTap);
  const recipExamples = RECIPROCITY_EXAMPLES.map((s) =>
    reciprocityOutcome(effectiveIssue || state, s, policy, preferTap),
  );
  const sensitivity = useMemo(
    () => hypothesisSensitivity({ ...baseArgs, policy }),
    [pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, policy, holdings],
  );
  const confidence = useMemo(
    () =>
      modelConfidence({
        pool,
        sleevesFilled: ASSET_FIELDS.filter((f) => (Number(assets[f.key]) || 0) > 0).length,
        sleevesTotal: ASSET_FIELDS.length,
        setting: activeSetting,
        delay,
        duration: Math.max(1, duration),
        policy,
        partnershipOn: partnershipApplies,
        hasPartnershipProgram: pShipInfo.kind !== "none",
        sensitivity,
      }),
    [pool, assets, setting, delay, duration, policy, partnershipApplies, pShipInfo.kind, sensitivity],
  );

  const insToday = result.benefitPoolAtPurchase ?? 0;
  const insClaim = result.benefitPoolAtClaim ?? 0;
  const combinedToday = pool + (policy.enabled && !result.lifetimeBenefit ? insToday : 0);
  const combinedClaim = result.startPoolNet + (policy.enabled && !result.lifetimeBenefit ? insClaim : 0);
  const yearsToday = yearsPoolLasts(
    policy.enabled && !result.lifetimeBenefit ? pool + insToday : pool,
    todayCost,
  );
  const yearsClaim = yearsPoolLasts(
    policy.enabled && !result.lifetimeBenefit ? result.startPoolNet + insClaim : result.startPoolNet,
    result.firstCost,
  );
  const yearDepleted = yearView.depletedYear;
  const yearRowsShown = yearView.rows;
  const lastCareRow =
    [...yearView.rows].reverse().find((r) => r.status === "Care year") ?? yearView.rows.at(-1) ?? null;
  const depletedRow =
    yearDepleted != null
      ? yearView.rows.find((r) => r.year === yearDepleted) ?? lastCareRow
      : lastCareRow;
  const depletedWhen = depletionCalendar(yearView.rows, yearDepleted, MODEL_START_YEAR);
  const firstClaimRow = yearView.rows.find((r) => r.status === "Care year") ?? lastCareRow;
  const featureRow = firstClaimRow;
  const endRunRow =
    yearView.rows.find((r) => {
      const insLeft = policy.enabled && !lifetime ? Math.max(0, r.insurancePoolRemaining) : 0;
      const total = r.remainingNet + insLeft;
      return (r.status === "Care year" || r.status === "After care") && total <= 0;
    }) ?? null;
  const depletionRow = endRunRow ?? depletedRow ?? lastCareRow;
  const fundsFullyDepleted = Boolean(endRunRow);
  const yearPageSize = 10;
  const yearPages = Math.max(1, Math.ceil(yearRowsShown.length / yearPageSize));
  const yearSlice = yearRowsShown.slice(yearPage * yearPageSize, (yearPage + 1) * yearPageSize);
  const carePage = Math.max(0, Math.floor((careStart - 1) / yearPageSize));
  const yearSliceStart = yearPage * yearPageSize + 1;
  const yearSliceEnd = Math.min(yearRowsShown.length, (yearPage + 1) * yearPageSize);
  const insOutYear =
    policy.enabled && !lifetime
      ? yearView.rows.find((r) => r.status === "Care year" && r.insurancePoolRemaining <= 0)?.year ?? null
      : null;
  const totalOutYear =
    yearView.rows.find((r) => {
      const left =
        policy.enabled && !lifetime ? r.remaining + Math.max(0, r.insurancePoolRemaining) : r.remaining;
      return (r.status === "Care year" || r.status === "After care") && left <= 0;
    })?.year ?? yearDepleted;

  useEffect(() => {
    setYearPage(0);
  }, [ran, hypoRunId, yearPageSize, yearRowsShown.length]);

  const chartData = useMemo(
    () =>
      result.rows.map((r) => ({
        label: String(calendarYear(r.year)),
        cost: r.cost,
        insurance: r.insurance,
        remaining: r.remaining,
        remainingNavy: r.shortfallCumulative > 0 ? null : r.remaining,
        remainingRed: r.shortfallCumulative > 0 ? r.remaining : null,
        remainingSelfFunded: selfFunded.rows.find((s) => s.year === r.year)?.remaining ?? 0,
        remainingLevel: r.remaining,
        insurancePool: r.insurancePoolRemaining,
        depletedHere: result.depletedYear === r.year,
      })),
    [result, selfFunded],
  );

  const allocationRows = useMemo(() => {
    const countable = holdings.filter((h) => h.amount > 0);
    const total = countable.reduce((s, h) => s + h.amount, 0) || 1;
    const field = (key: string) => ASSET_FIELDS.find((f) => f.key === key)?.label ?? key;
    return [
      ...countable.map((h) => ({
        label: field(h.key),
        amount: h.amount,
        heldOut: 0,
        pct: (h.amount / total) * 100,
        speed: h.deferred ? "Slower" : "Ready",
      })),
      ...(excludeHome && homeEquity
        ? [{ label: "Primary residence", amount: 0, heldOut: homeEquity, pct: 0, speed: "Held out" }]
        : []),
      ...(spouseExcluded
        ? [{ label: "Spouse excluded assets", amount: 0, heldOut: spouseExcluded, pct: 0, speed: "Held out" }]
        : []),
    ];
  }, [holdings, excludeHome, homeEquity, spouseExcluded]);

  const pie = allocationRows
    .filter((r) => r.amount > 0)
    .map((r, i) => ({ name: r.label, value: r.amount, color: PIE_COLORS[i % PIE_COLORS.length] }));
  const majority = pie.some((s) => s.value / Math.max(1, pie.reduce((n, x) => n + x.value, 0)) >= 0.6);
  const pieShown = majority ? pie.filter((s) => s.value === Math.max(...pie.map((x) => x.value))) : pie;

  const inflationCompare = useMemo(() => {
    if (!policy.enabled) return [];
    return RIDER_OPTIONS.map((opt) => ({
      key: opt.key,
      label: opt.label,
      how: opt.label,
      benefitInflationPct: opt.benefitInflationPct,
      inflationMethod: opt.inflationMethod,
      proj: project({
        ...baseArgs,
        policy: { ...policy, benefitInflationPct: opt.benefitInflationPct, inflationMethod: opt.inflationMethod },
      }),
    }));
  }, [policy, pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, holdings]);

  const insuranceCompare = useMemo(() => {
    if (!policy.enabled) return [];
    return STRUCTURE_OPTIONS.filter((o) => runKinds[o.key]).map((o) => {
      const p = policyForKind(o.key);
      const proj = project({ ...baseArgs, policy: p });
      return {
        key: o.key,
        label: o.label,
        proj,
        impact: preservationImpact({
          state,
          policy: p,
          partnershipOn: partnershipOn && o.key === "traditional",
          preferTap,
          benefitsPaid: proj.insuranceTotal,
          remainingWithPolicy: proj.endPool,
          remainingNoPolicy: selfFunded.endPool,
        }),
        years: yearsPoolLasts(proj.startPoolNet + (proj.benefitPoolAtClaim ?? 0), proj.firstCost),
      };
    });
  }, [policy, kindBook, runKinds, pool, state, setting, delay, duration, cpi, roi, taxRate, iraBal, iraRoi, holdings, partnershipOn, preferTap, selfFunded.endPool]);

  const structureCompare = insuranceCompare.map((r) => ({
    key: r.key as PolicyKind,
    label: r.label,
    thisRun: policy.enabled && policy.kind === r.key,
    proj: r.proj,
  }));
  const careCompare = (Object.keys(SETTING_LABELS) as CareSetting[]).map((s) => ({
    setting: s,
    today: annualCost(state, s),
    proj: project({ ...baseArgs, setting: s, policy }),
  }));
  const scenario = {
    assets,
    assetRois,
    excludeHome,
    state,
    setting: activeSetting,
    delay,
    ageToday,
    claimAge,
    duration: Math.max(1, duration),
    cpi,
    roi,
    taxRate,
    iraRoi,
    annualIncome,
    policy,
    client,
    advisor,
  };
  const summary = analysisNarrative({
    scenario,
    grossPool,
    pool,
    result,
    selfFunded,
    todayCost,
    partnershipOn: partnershipApplies,
    preferTap,
  });
  const recommendations = recommendationsNarrative({
    scenario,
    grossPool,
    pool,
    result,
    selfFunded,
    todayCost,
    partnershipOn: partnershipApplies,
    preferTap,
  });

  function patchPolicy(partial: Partial<LtcPolicy>) {
    setPolicy((p) => {
      const next = { ...p, ...partial };
      setKindBook((b) => ({ ...b, [next.kind]: next }));
      return next;
    });
  }
  function applyProtectDesign() {
    if (protectSize.alreadyProtected || insuranceLocked) return;
    const typical = typicalPurchaseForAge(ageToday || DEFAULT_AGE_TODAY);
    patchPolicy({
      enabled: true,
      kind: "traditional",
      dailyBenefit: protectSize.dailyToday,
      benefitYears: protectSize.lifetime ? 50 : protectSize.benefitYears,
      benefitInflationPct: typical.benefitInflationPct,
      inflationMethod: typical.inflationMethod,
    });
    setRunKinds((prev) => ({ ...prev, traditional: true }));
    setDesignTouched(true);
  }
  function openKindTab(kind: PolicyKind) {
    setRunKinds((f) => ({ ...f, [kind]: true }));
    setKindBook((book) => {
      const saved = { ...book, [policy.kind]: { ...policy, kind: policy.kind } };
      setPolicy({ ...saved[kind], kind, enabled: policy.enabled });
      return saved;
    });
  }
  function policyForKind(kind: PolicyKind): LtcPolicy {
    const stored = kind === policy.kind ? policy : kindBook[kind];
    return { ...stored, enabled: true, kind };
  }
  function patchDesign(partial: Partial<LtcPolicy>) {
    setDesignTouched(true);
    patchPolicy(partial);
  }
  function setAsset(key: keyof Assets, value: string) {
    const n = Number(value);
    if (key === "excludable") setExcludableTouched(true);
    setAssets((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
    setPoolShown(false);
  }
  function setAssetRoi(key: keyof Assets, value: string) {
    const n = Number(value);
    setAssetRois((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
    setPoolShown(false);
  }
  function resetAll() {
    setAssets({ ...DEFAULT_ASSETS, excludable: defaultExcludableAssets("") });
    setAssetRois({ ...DEFAULT_ASSET_ROIS });
    setState("");
    setExcludableTouched(false);
    setSetting("");
    setSettingNeeded(false);
    setCpiOverride(null);
    setAgeToday(0);
    setClaimAge(AALTCI_MEAN_CLAIM_AGE);
    setClaimAgeTouched(false);
    setDuration(0);
    setProtectPct(DEFAULT_PROTECT_PCT);
    setTaxRate(DEFAULT_TAX_RATE);
    setAnnualIncome(0);
    const typical = typicalPurchaseForAge(DEFAULT_AGE_TODAY);
    const annual =
      typicalPremiumHint(DEFAULT_AGE_TODAY, typical.benefitInflationPct, typical.inflationMethod)
        .amount ?? 0;
    const book = seedKindBook(typical, annual);
    setKindBook(book);
    setPolicy({ ...book.traditional, enabled: false });
    setRunKinds({ ...DEFAULT_STRUCTURE_FLAGS });
    setExcludeHome(true);
    setPremiumTouched(false);
    setDesignTouched(false);
    setRan(false);
    setPoolShown(false);
    setPersonalizeOpen(true);
    themeBeforeIncognito.current = null;
    setTheme(false);
    setHypoRunId(0);
    setShowReport(false);
    setClient({ ...EMPTY_CONTACT });
    setAdvisor({ ...EMPTY_ADVISOR });
    setContactAsk(false);
    setContactForm(false);
    setPartnershipOn(true);
    setPreferTap(false);
    setIssueState("");
    setIssueTouched(false);
    setVeteran(false);
    setDetails({ ...DEFAULT_DETAILS });
    setRunKinds({ ...DEFAULT_STRUCTURE_FLAGS });
    setStateNeeded(false);
    setAgeNeeded(false);
    setDurationNeeded(false);
    setYearPage(0);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    window.setTimeout(() => scrollToHeader(false), 50);
  }
  function applyIncognito(on: boolean) {
    if (on) {
      setPersonalizeOpen(false);
      setTheme(true);
      return;
    }
    setPersonalizeOpen(true);
    setTheme(false);
    themeBeforeIncognito.current = null;
  }
  useLayoutEffect(() => {
    if (!personalizeOpen) setTheme(true);
  }, [personalizeOpen]);
  function requestPdfDownload() {
    setDetails((d) => withScenarioDetails(d, insuranceLocked));
    setAttachAdvisor(advisorReceivesPdf(advisor, client));
    setPdfPick(true);
  }
  useEffect(() => {
    window.addEventListener("aum-download-pdf", requestPdfDownload);
    return () => window.removeEventListener("aum-download-pdf", requestPdfDownload);
  }, [insuranceLocked, showReciprocity]);
  function runPdfDownload() {
    setPdfPick(false);
    setShowReport(true);
    setPrintAfterOpen(true);
    setSaveMsg("Preparing PDF…");
  }

  useEffect(() => {
    if (!showReport || !printAfterOpen) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      const name = pdfFilename(state);
      downloadReportPdf(name, (msg) => {
        if (!cancelled) setSaveMsg(msg);
      })
        .then(async (file) => {
          if (cancelled) return;
          setPrintAfterOpen(false);
          setShowReport(false);
          const snap = mailRef.current;
          let note = "Use Save PDF to this computer if a download did not start.";
          let next: "contact" | "done" = "contact";
          if (advisorReceivesPdf(snap.advisor, snap.client) && snap.attachAdvisor) {
            try {
              const r = await emailAdvisorPdf({
                data: {
                  advisorName: snap.advisor.name || "Advisor",
                  advisorEmail: snap.advisor.email,
                  advisorFirm: snap.advisor.firm,
                  clientName: snap.client.name || "End user",
                  clientEmail: snap.client.email,
                  filename: file.filename,
                  pdfBase64: file.base64,
                  state: snap.client.state || snap.state,
                },
              });
              note = r.emailed
                ? "A copy was emailed to the advisor from info@fundingltcmarketplace.com."
                : "The advisor copy could not be emailed from this environment.";
            } catch {
              note = "The advisor copy could not be emailed.";
            }
            next = "done";
          } else {
            setContactDraft({
              name: snap.client.name,
              phone: snap.client.phone,
              email: snap.client.email,
              state: snap.client.state || snap.state,
            });
            note = "The form was not emailed — no advisor email on this run.";
            next = "contact";
          }
          setPdfReady({ filename: file.filename, url: file.url, note, next });
          setSaveMsg("PDF is ready. Save it to this computer.");
        })
        .catch((err) => {
          if (cancelled) return;
          setPrintAfterOpen(false);
          const msg = err instanceof Error ? err.message : "PDF could not be created.";
          setSaveMsg(`PDF did not download. ${msg} Try fewer sections, or use your browser’s Print → Save as PDF.`);
        });
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [showReport, printAfterOpen, state]);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    const scroller = document.scrollingElement || document.documentElement;
    const top = el.getBoundingClientRect().top + (scroller.scrollTop || window.scrollY || 0) - 8;
    try {
      scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } catch {
      scroller.scrollTop = Math.max(0, top);
    }
  }
  function applyAge(raw: string) {
    const n = Math.max(0, Math.min(110, Number(raw) || 0));
    setAgeToday(n);
    setAgeNeeded(false);
    if (n < MIN_AGE_TODAY) return;
    const nextClaim = !claimAgeTouched ? actuarialClaimAge(n) : claimAge <= n ? n + 1 : claimAge;
    if (!claimAgeTouched) setClaimAge(nextClaim);
    else if (claimAge <= n) setClaimAge(nextClaim);
    if (!designTouched) {
      const typical = typicalPurchaseForAge(n);
      const prem =
        typicalPremiumHint(n, typical.benefitInflationPct, typical.inflationMethod).amount ?? 0;
      const book = seedKindBook(typical, prem);
      setKindBook(book);
      setPolicy((p) => ({ ...book[p.kind], enabled: p.enabled, kind: p.kind }));
    }
  }
  const missingRun = [
    !state ? "State where care would be received" : "",
    !setting ? "Care setting" : "",
    ageToday < MIN_AGE_TODAY ? `Age today (${MIN_AGE_TODAY}+)` : "",
    !duration ? "Years of care to model" : "",
    pool <= 0 ? "Countable assets" : "",
  ].filter(Boolean);
  const dockNeed = [
    "Countable assets",
    "State of Care",
    "Care Setting",
    "State where policy is issued",
    "Age today",
    "Years of care",
  ];

  function runHypo() {
    const missingState = !state;
    const missingSetting = !setting;
    const missingAge = ageToday < MIN_AGE_TODAY;
    const missingYears = !duration;
    const missingAssets = pool <= 0;
    setStateNeeded(missingState);
    setSettingNeeded(missingSetting);
    setAgeNeeded(missingAge);
    setDurationNeeded(missingYears);
    if (missingState || missingSetting || missingAge || missingYears || missingAssets) {
      const id = missingState ? "state" : missingSetting ? "setting" : missingAge ? "age-today" : missingYears ? "duration" : "checking";
      window.setTimeout(() => {
        scrollToId(id);
        (document.getElementById(id) as HTMLElement | null)?.focus();
      }, 50);
      const list = missingRun.length ? missingRun : ["Countable assets"];
      const join =
        list.length === 1
          ? list[0]
          : list.length === 2
            ? `${list[0]} and ${list[1]}`
            : `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
      void playCeleste(`Please enter ${join} before running the hypothetical.`);
      return;
    }
    const locked = insuranceLockedOut(pool);
    setHypoRunId((n) => n + 1);
    setDetails(locked ? lockoutDetails() : withScenarioDetails({ ...ALL_DETAILS_OFF, yearByYear: true, partnership: true, medicaidLtc: true }, false));
    setRan(true);
    setYearPage(0);
    if (locked) {
      void playCeleste(naicLockoutSpoken(state));
      window.setTimeout(() => scrollToId("medicaid-va-card"), 80);
    } else {
      window.setTimeout(() => scrollToId("results"), 80);
    }
  }

  function viewAllReport() {
    setDetails(
      insuranceLocked
        ? lockoutDetails()
        : { ...ALL_DETAILS_ON, medicaidLtc: true, reciprocity: showReciprocity },
    );
    setShowReport(true);
  }
  function setDetail(id: DetailId, on: boolean) {
    if (isRequiredDetail(id, insuranceLocked) && !on) return;
    setDetails((d) => {
      const next = { ...d, [id]: on };
      if (id === "eduHypo") {
        for (const key of DISCLOSURE_SECTION_IDS) next[key] = on;
        next.eduHypo = on;
      }
      return withScenarioDetails(next, insuranceLocked);
    });
  }

  const reportProps = {
    state,
    setting: activeSetting,
    delay,
    ageToday,
    claimAge,
    duration: Math.max(1, duration),
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
    annualIncome,
    summary,
    recommendations,
    chartData,
    pie: pieShown,
    majority,
    allocationRows,
    result,
    selfFunded,
    policy,
    inflationCompare,
    insuranceCompare,
    structureCompare,
    careCompare,
    sensitivity,
    confidence,
    medicaid,
    depletedYear: result.depletedYear,
    client,
    advisor,
    partnership: pShip,
    partnershipRows: pShipStates,
    preservation: pImpact,
    reciprocity: recip,
    reciprocityExamples: recipExamples,
    veteran,
    details,
    onClose: () => setShowReport(false),
    onPdf: requestPdfDownload,
  };

  return (
    <div className="min-w-0 max-w-full overflow-x-clip">
      <WelcomeCard />
      <section className="mt-4 card-xl min-w-0 p-4 md:p-5">
        <TitleCollapse
          title="Personalize Asset Model (optional input)"
          className=""
          defaultOpen
          open={personalizeOpen}
          onOpenChange={(open) => {
            applyIncognito(!open);
          }}
          hint="Daylight shows this card. Incognito Mode collapses it and switches the site to dark mode."
          extra={
            <button
              type="button"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-900"
              aria-pressed={!personalizeOpen}
              aria-controls="personalize-asset-model"
              aria-label={personalizeOpen ? "Incognito Mode" : "Customize"}
              onClick={(e) => {
                e.stopPropagation();
                applyIncognito(personalizeOpen);
              }}
            >
              {personalizeOpen ? "Incognito Mode" : "Customize"}
            </button>
          }
        >
          <div id="personalize-asset-model">
            <PartyFields idPrefix="client" party={client} onChange={(partial) => setClient((p) => ({ ...p, ...partial }))} />
          </div>
        </TitleCollapse>
      </section>

      <section className="mt-4 card-xl min-w-0 overflow-visible p-4 sm:p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">1. Countable Assets at Risk</h2>
          <p className="mb-3 text-sm text-muted">Enter today’s values. Leave unused lines at 0. Totals are not reduced for selling costs or illiquidity.</p>
          <div className="grid gap-3 lg:grid-cols-2">
            {ASSET_FIELDS.map((f) => (
              <div key={f.key} className="min-w-0 border-b border-line/60 pb-3 last:border-b-0">
                {f.key === "home" ? (
                  <div className="mb-3 min-w-0">
                    <label className={labelClass} htmlFor="tax-rate">Tax rate on taxable R.O.I.</label>
                    <FieldPicker
                      id="tax-rate"
                      value={String(taxRate)}
                      placeholder="Select a tax rate…"
                      options={TAX_RATE_OPTIONS.map((o) => ({
                        value: String(o.rate),
                        label: o.label,
                        group: TAX_RATE_GROUPS.find((g) => g.key === o.group)?.heading,
                      }))}
                      onChange={(v) => setTaxRate(Number(v))}
                    />
                    <p className="mt-1 text-xs leading-snug text-muted">Gross <Pct>{roi.toFixed(1)}%</Pct>. Net after tax <Pct>{netRoi.toFixed(2)}%</Pct>.</p>
                  </div>
                ) : null}
                <div className="grid grid-cols-[minmax(0,1fr)_5.5rem] items-start gap-2">
                  <div className="min-w-0">
                    <label className={labelClass} htmlFor={`asset-${f.key}`}>{f.label}</label>
                    <MoneyField id={`asset-${f.key}`} value={assets[f.key]} onChange={(v) => setAsset(f.key, v)} compact />
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass} htmlFor={`roi-${f.key}`}>R.O.I. %</label>
                    <StepperField id={`roi-${f.key}`} value={Number(assetRois[f.key]) || 0} onChange={(v) => setAssetRoi(f.key, v)} step={0.1} min={0} max={20} decimals={1} compact />
                  </div>
                </div>
              </div>
            ))}
            <div>
              <label className={labelClass} htmlFor="excludable">
                Excludable assets *{" "}
                <a href="https://fundingltcmarketplace.com/case-studies.html#florida" target="_blank" rel="noopener noreferrer" className="source-link" data-source-href="https://fundingltcmarketplace.com/case-studies.html#florida">State spend down limits</a>
              </label>
              <MoneyField id="excludable" value={assets.excludable} onChange={(v) => setAsset("excludable", v)} compact />
              <p className="mt-1 text-xs text-muted">* Spouse excluded assets.</p>
            </div>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-navy lg:col-span-2">
              <input type="checkbox" className="size-4 accent-teal" checked={excludeHome} onChange={(e) => { setExcludeHome(e.target.checked); setPoolShown(false); }} />
              Exclude primary residence from countable assets
            </label>
          </div>
          {poolShown ? (
            <p className="mt-3 text-sm text-navy">
              Countable pool:{" "}
              <span className="font-display text-xl tabular-nums text-gold-ink">{money(pool)}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">Countable pool is hidden until you calculate countable assets.</p>
          )}
          <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-2">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center rounded-lg bg-gold px-3 py-2.5 text-center text-base font-semibold leading-snug text-masthead hover:brightness-105"
              onClick={() => setPoolShown(true)}
            >
              Calculate Countable Assets
            </button>
            {ran ? (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={viewAllReport} className="flex min-h-11 items-center justify-center rounded-lg border border-gold bg-gold px-3 py-2 text-center text-sm font-semibold text-masthead hover:brightness-105">View all</button>
                <button type="button" onClick={requestPdfDownload} className="flex min-h-11 items-center justify-center rounded-lg border border-navy bg-navy px-3 py-2 text-center text-sm font-semibold text-cream hover:bg-teal">Download PDF</button>
              </div>
            ) : null}
            <button
              type="button"
              onClick={resetAll}
              className="flex min-h-11 w-full items-center justify-center rounded-lg border border-card-border px-3 py-2.5 text-center text-sm font-semibold leading-snug text-navy hover:bg-cream"
            >
              Reset
            </button>
          </div>
        </section>

      <div className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-2">
        <section className="card-xl min-w-0 p-4 md:p-5" aria-label="NAIC consumer guides">
          <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">NAIC Shopper’s Guide and Suitability Worksheet</h2>
          <NaicGuideCoverRow />
          <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <NaicShopperCover framed={false} pdfChecked={details.naicGuide} onPdfChange={(v) => setDetail("naicGuide", v)} />
            <NaicSuitabilityCover framed={false} pdfChecked={details.naicWorksheet} onPdfChange={(v) => setDetail("naicWorksheet", v)} />
          </div>
          <TitleCollapse title="NAIC sources and disclaimer" className="mt-3" defaultOpen={false} hint="View more details.">
            <NaicCardDisclaimer />
          </TitleCollapse>
        </section>
        <section className="card-xl min-w-0 p-4 md:p-5">
          <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">2. Where and when care starts</h2>
            <label className={labelClass} htmlFor="age-today">Age today <span className="font-normal text-muted">(Input Your Current Age)</span></label>
            <StepperField id="age-today" value={ageToday} onChange={applyAge} step={1} min={MIN_AGE_TODAY} max={110} placeholder="Select or Input Age" blankWhenZero />
            {ageNeeded && ageToday < MIN_AGE_TODAY ? (
              <p className="mt-1 text-sm font-semibold leading-snug text-deplete" role="alert">Enter age today ({MIN_AGE_TODAY} or older) to run the hypothetical.</p>
            ) : (
              <p className="mt-1 text-xs leading-snug text-muted">Required to run. Must be {MIN_AGE_TODAY} or older.</p>
            )}
            {ageToday >= MIN_AGE_TODAY && buyerHints ? (
              <div className="mt-2 rounded-lg border border-line bg-cream px-3 py-2 text-xs leading-snug text-muted">
                <p>
                  * Based on industry averages at your age bracket (
                  <span className="font-semibold text-deplete">{fiveYearIssueBand(ageToday)}</span>
                  ), this hypo defaults traditional benefits to{" "}
                  <span className="font-semibold text-deplete">{buyerHints.daily}</span>/day,{" "}
                  <span className="font-semibold text-deplete">{buyerHints.period}</span> period,{" "}
                  <span className="font-semibold text-deplete">{buyerHints.elim}</span> wait, and{" "}
                  <span className="font-semibold text-deplete">{buyerHints.inflation}</span>. You can change any field in Section 3.
                </p>
                <p className="mt-1">{typicalPurchaseNote(ageToday)}</p>
                <p className="mt-1">
                  Sources:{" "}
                  <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
                  {" · "}
                  <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
                  {" · "}
                  <Cite href={SRC.naicShopper}>NAIC Shopper’s Guide</Cite>
                  {" · "}
                  <Cite href={SRC.aaltciFacts}>AALTCI LTC facts</Cite>
                </p>
                <TitleCollapse title="See what industry says people are buying in long-term care benefits" className="mt-2" defaultOpen={false} hint="READ MORE.">
                  <WhatConsumersBuyPanel ageToday={ageToday} kind={policy.kind} />
                </TitleCollapse>
              </div>
            ) : null}
            <label className={`${labelClass} mt-3`} htmlFor="state">State where care would be received</label>
            <FieldPicker
              id="state"
              value={state}
              placeholder="Select a state…"
              invalid={stateNeeded && !state}
              options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
              onChange={(next) => {
                setState(next);
                setStateNeeded(false);
                if (!excludableTouched) setAssets((prev) => ({ ...prev, excludable: defaultExcludableAssets(next) }));
              }}
            />
            {stateNeeded && !state ? (
              <p className="mt-1 text-sm font-semibold text-deplete" role="alert">Select the state where care would be received to run the hypothetical.</p>
            ) : (
              <p className="mt-1 text-xs text-muted">Required to run. Care costs, Medicaid figures, and Partnership notes use this state.</p>
            )}
            <label className={`${labelClass} mt-3`} htmlFor="issue-state">State where the insurance policy would be issued</label>
            <FieldPicker
              id="issue-state"
              value={issueTouched ? issueState : state}
              placeholder="Same as care state…"
              options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
              onChange={(next) => {
                setIssueTouched(true);
                setIssueState(next);
              }}
            />
            <p className="mt-1 text-xs leading-snug text-muted">
              {showReciprocity
                ? `Care in ${state}, policy issued in ${effectiveIssue}. Partnership reciprocity is shown because these states differ.`
                : "Defaults to the care state. Reciprocity is shown only if you pick a different issue state."}
            </p>
            {effectiveIssue ? (
              <p className="mt-1 text-sm font-bold leading-snug amt-red">
                {partnershipPolicyName(issueShip)}
                {issueShip.kind === "none"
                  ? ` — ${effectiveIssue} does not operate a Qualified State Long-Term Care Partnership program.`
                  : ` issued in ${effectiveIssue}. Traditional tax-qualified LTC only (not hybrid, asset-based, or LTC annuity).`}
                {issueShip.kind === "original-tap"
                  ? " Total asset protection is available on qualifying Indiana / New York designs; otherwise dollar-for-dollar."
                  : issueShip.kind === "original-dd"
                    ? " Original (pre-DRA) Partnership — dollar-for-dollar of benefits paid."
                    : issueShip.kind === "dra"
                      ? " Deficit Reduction Act Partnership — dollar-for-dollar of benefits paid."
                      : issueShip.kind === "masshealth"
                        ? " Not a DRA Partnership; MassHealth Qualified rules apply."
                        : ""}
                {" "}
                <Cite href={SRC.ltcPartnership}>CMS Long-Term Care Partnership</Cite>.
              </p>
            ) : null}
            <label className={`${labelClass} mt-3`} htmlFor="setting">Care setting <span className="font-normal text-muted">(preferred setting)</span></label>
            <FieldPicker
              id="setting"
              value={setting}
              placeholder="Select care setting"
              invalid={settingNeeded && !setting}
              options={(Object.keys(SETTING_LABELS) as CareSetting[]).map((k) => ({ value: k, label: SETTING_LABELS[k] }))}
              onChange={(v) => { setSetting(v as CareSetting); setSettingNeeded(false); setCpiOverride(null); }}
            />
            {settingNeeded && !setting ? (
              <p className="mt-1 text-sm font-semibold leading-snug text-deplete" role="alert">Select a care setting to run the hypothetical.</p>
            ) : setting && state && todayCost > 0 ? (
              <p className="mt-1 text-sm font-bold leading-snug amt-red">
                Projected {SETTING_LABELS[setting].toLowerCase()} cost at claim
                {ageToday >= MIN_AGE_TODAY
                  ? ` in ${claimYearLabel}${delay ? ` (${delay} year${delay === 1 ? "" : "s"})` : ""}`
                  : ""}
                : {money(claimCost)} per year
                {delay > 0 ? ` · today’s median ${money(todayCost)}` : ""}.
                Inflated at {cpi.toFixed(1)}% from{" "}
                <Cite href={SRC.carescout}>CareScout Cost of Care</Cite>
                {state ? <> medians in <StateName name={state} /></> : null}.
              </p>
            ) : setting && !state ? (
              <p className="mt-1 text-sm font-bold leading-snug amt-red">Select a care state to source the projected {SETTING_LABELS[setting].toLowerCase()} cost at claim.</p>
            ) : (
              <p className="mt-1 text-xs text-muted">Required to run.</p>
            )}
            <div className="mt-3 min-w-0">
                <label className={labelClass} htmlFor="duration">Select the number of years <span className="font-normal text-muted">(how long care may last)</span></label>
                <FieldPicker
                  id="duration"
                  value={duration ? String(duration) : ""}
                  placeholder="Select the number of years…"
                  invalid={durationNeeded && !duration}
                  options={Array.from({ length: 20 }, (_, i) => i + 1).map((y) => ({
                    value: String(y),
                    label: `${y} year${y === 1 ? "" : "s"}`,
                  }))}
                  onChange={(v) => { setDuration(Number(v) || 0); setDurationNeeded(false); }}
                />
                {durationNeeded && !duration ? (
                  <p className="mt-1 text-sm font-semibold leading-snug text-deplete" role="alert">Select how many years of care to model to run the hypothetical.</p>
                ) : <p className="mt-1 text-xs text-muted">Required to run.</p>}
            </div>
            {duration ? (
            <>
            <div className="mt-3 min-w-0">
                <label className={labelClass} htmlFor="cpi">Care-cost inflation (CPI / LTC)*</label>
                <StepperField id="cpi" value={Number(cpi.toFixed(1))} onChange={(v) => setCpiOverride(Number(v))} step={0.1} min={0} max={12} decimals={1} />
                <p className="mt-1 text-xs leading-snug text-muted">
                  {!setting
                    ? "Select a care setting to use the 5-year benchmark for that setting."
                    : cpiTouched
                      ? <>Custom rate. The 5-year {SETTING_SHORT[activeSetting]} benchmark is <Pct>{fiveYearLtcCagr(setting).toFixed(1)}%</Pct>.</>
                      : <>Using the 5-year {SETTING_SHORT[activeSetting]} benchmark, <Pct>{cpi.toFixed(1)}%</Pct>{state ? <> for care in <StateName name={state} /></> : null}.</>}
                </p>
            </div>
            <p className="mt-3 text-xs text-muted">* 5-year CPI / LTC for the care selected. {fiveYearLtcBenchmarks().map((row) => `If ${row.ifLabel}, the rate is ${row.cagr.toFixed(1)}%`).join(". ")}.</p>
            <div className="mt-3 grid w-full min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              <div className="min-w-0">
                <p className={labelClass}>Age projected at claim</p>
                <p className="card min-w-0 w-full max-w-full px-3 py-2.5 text-base leading-snug text-navy">
                  {ageToday < MIN_AGE_TODAY ? "Enter age today" : claimAge ? String(claimAge) : "Enter estimated age"}
                  {ageToday >= MIN_AGE_TODAY && claimAge ? (
                    <span className="mt-1 block text-sm font-normal text-muted">({delay === 0 ? "now" : `in ${delay} year${delay === 1 ? "" : "s"}`})</span>
                  ) : null}
                </p>
              </div>
              <div className="min-w-0">
                <label className={labelClass} htmlFor="claim-age">Estimated age when care might be needed *</label>
                <StepperField
                  id="claim-age"
                  value={claimAge}
                  step={1}
                  min={ageToday >= MIN_AGE_TODAY ? ageToday + 1 : MIN_AGE_TODAY + 1}
                  max={120}
                  onChange={(raw) => {
                    const floor = ageToday >= MIN_AGE_TODAY ? ageToday + 1 : MIN_AGE_TODAY + 1;
                    const n = Number(raw);
                    if (!Number.isFinite(n)) return;
                    setClaimAgeTouched(true);
                    setClaimAge(Math.max(floor, Math.round(n)));
                  }}
                />
                <p className="mt-1 text-xs font-bold amt-red">* You can change age of claim. Currently default based on claims experience for care.</p>
              </div>
              <div className="min-w-0">
                <label className={labelClass} htmlFor="delay">Care projected to start <span className="font-normal text-muted">(years from now)</span></label>
                <p id="delay" className="card min-w-0 w-full max-w-full px-3 py-2.5 text-base leading-snug text-navy">
                  {ageToday < MIN_AGE_TODAY ? "Enter age today" : delay === 0 ? "Now (this year)" : `${delay} year${delay === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-gold bg-cream px-4 py-3">
              <h3 className="red-wave font-display text-lg font-bold whitespace-normal">
                {(() => {
                  const words = "How much insurance to protect assets at claim".split(" ");
                  return words.map((word, i) => (
                    <span key={`${word}-${i}`} style={{ animationDelay: `${i * 0.12}s` }}>
                      {word}
                      {i < words.length - 1 ? "\u00a0" : ""}
                    </span>
                  ));
                })()}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Uses this run’s countable assets, age today, years until claim, care setting, inflation, and how long care may last.
                You set the share of countable assets (net after tax at claim) you want left after the modeled care years.
              </p>
              <label className={`${labelClass} mt-3`} htmlFor="protect-pct">
                Protect this share of countable assets at claim (%)
              </label>
              <StepperField
                id="protect-pct"
                value={protectPct}
                onChange={(v) => setProtectPct(Math.min(100, Math.max(0, Number(v) || 0)))}
                step={5}
                min={0}
                max={100}
              />
              {ageToday < MIN_AGE_TODAY || !state || !setting ? (
                <p className="mt-2 text-sm text-muted">Enter age today, care state, and care setting to size a policy.</p>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-navy">
                  <p>
                    If you have <strong className="tabular-nums">{money(pool)}</strong> countable assets today at age{" "}
                    <strong>{ageToday}</strong>, and care is expected in{" "}
                    <strong>{delay === 0 ? "this year" : `${delay} year${delay === 1 ? "" : "s"}`}</strong> at age{" "}
                    <strong>{claimAge}</strong>, this model projects about{" "}
                    <strong className="tabular-nums">{moneyCents(protectSize.assetsAtClaimNet)}</strong> countable assets
                    (net after tax) at claim.
                  </p>
                  <p>
                    To protect <strong>{protectPct}%</strong> of that nest egg (
                    <strong className="tabular-nums">{moneyCents(protectSize.protectDollars)}</strong>
                    ) through {protectSize.careYears} year{protectSize.careYears === 1 ? "" : "s"} of{" "}
                    {SETTING_LABELS[activeSetting].toLowerCase()} (about{" "}
                    <strong className="tabular-nums">{moneyCents(protectSize.careTotal)}</strong> of inflated care costs),
                    {protectSize.alreadyProtected ? (
                      <>
                        {" "}assets on this run can cover the modeled bills while still leaving that share. Insurance is optional for this protection target — not a quote.
                      </>
                    ) : (
                      <>
                        {" "}consider a traditional reimbursement design of about{" "}
                        <strong className="tabular-nums">{money(protectSize.dailyToday)}</strong>/day
                        {protectSize.lifetime
                          ? " with a lifetime benefit period"
                          : ` for ${protectSize.benefitYears} year${protectSize.benefitYears === 1 ? "" : "s"}`}
                        {" "}purchased today
                        {protectSize.dailyToday !== protectSize.dailyAtClaim
                          ? ` (about ${money(protectSize.dailyAtClaim)}/day at claim if benefits inflate with the age-based default)`
                          : ""}
                        . That is a pool of about{" "}
                        <strong className="tabular-nums">
                          {protectSize.lifetime ? `${money(protectSize.annualCapAtClaim)}/year, lifetime` : moneyCents(protectSize.poolNeeded)}
                        </strong>
                        . Assets would be asked to co-pay up to{" "}
                        <strong className="tabular-nums">{moneyCents(protectSize.spendable)}</strong>
                        . Not a quote — underwriting, state, and riders change what can actually be issued.
                      </>
                    )}
                  </p>
                  {!protectSize.alreadyProtected && !insuranceLocked ? (
                    <button
                      type="button"
                      className="btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal"
                      onClick={applyProtectDesign}
                    >
                      Use this design in Insurance
                    </button>
                  ) : null}
                </div>
              )}
            </div>
            <div className="mt-4 stack-actions">
              {missingRun.length ? (
                <p className="w-full min-w-0 text-sm font-semibold leading-snug text-deplete" role="status">
                  To run, complete:
                  <span className="mt-1 block font-normal text-navy">
                    {missingRun.map((item) => (
                      <span key={item} className="block">• {item}</span>
                    ))}
                  </span>
                </p>
              ) : null}
              <button type="button" className="btn-block rounded-lg bg-gold text-masthead hover:brightness-105" onClick={runHypo}>Run hypothetical</button>
            </div>
            </>
            ) : null}
          </section>
      </div>

      <section className="mt-4 card-xl min-w-0 p-4 md:p-5">
          <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">3. Insurance</h2>
            {insuranceLocked ? (
              <div className="rounded-lg border-2 border-deplete bg-cream px-4 py-3">
                <p className="text-sm font-semibold text-navy">{NAIC_SUITABILITY_BANNER}</p>
                <p className="mt-1 text-xs text-muted">Countable assets {money(pool)} are under {money(NAIC_LOCKOUT_ASSETS)}.</p>
              </div>
            ) : (
              <>
                {insuranceWarn ? (
                  <p className={`mb-3 text-sm font-semibold text-deplete ${warnFlash ? "red-wave" : ""}`}>{NAIC_SUITABILITY_WARN}</p>
                ) : (
                  <p className="mb-3 text-sm text-navy">{NAIC_SUITABILITY_MEETS}</p>
                )}
                <label className="mb-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-navy">
                  <input type="checkbox" className="size-4 accent-teal" checked={policy.enabled} onChange={(e) => {
                    const on = e.target.checked;
                    patchPolicy({ enabled: on });
                    if (on) setRunKinds((f) => ({ ...f, [policy.kind]: true }));
                  }} />
                  Include long-term care insurance in the run
                </label>
                {policy.enabled ? (
                  <div className="space-y-3">
                    <fieldset className="min-w-0 overflow-hidden rounded-lg border border-gold">
                      <legend className="px-2 text-sm font-semibold text-navy">Insurance types</legend>
                      <p className="px-3 pb-2 text-xs text-muted">Open a tab to enter that type’s deposits and benefits. Check a type to include it in the run. You can include more than one.</p>
                      <div className="flex min-w-0 flex-wrap gap-1 border-b border-gold bg-cream px-2 pt-1">
                        {STRUCTURE_OPTIONS.map((o) => {
                          const active = policy.kind === o.key;
                          return (
                            <div
                              key={o.key}
                              className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-t-lg px-2 py-1 ${
                                active ? "border border-b-0 border-gold bg-paper text-navy" : "text-muted"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="size-4 shrink-0 accent-teal"
                                checked={!!runKinds[o.key]}
                                aria-label={`Include ${o.label} in the run`}
                                onChange={(e) => {
                                  const on = e.target.checked;
                                  setRunKinds((prev) => {
                                    const next = { ...prev, [o.key]: on };
                                    if (!Object.values(next).some(Boolean)) next[o.key] = true;
                                    return next;
                                  });
                                  if (on) openKindTab(o.key);
                                }}
                              />
                              <button
                                type="button"
                                className="min-h-11 min-w-0 flex-1 text-left text-xs font-semibold leading-snug sm:text-sm"
                                onClick={() => openKindTab(o.key)}
                              >
                                {o.label}
                                {active ? " (open)" : ""}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-3 bg-paper p-3">
                        <p className="text-sm font-semibold text-navy">
                          {STRUCTURE_OPTIONS.find((s) => s.key === policy.kind)?.label} — deposits and benefits
                        </p>
                    {policy.kind === "traditional" ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className={labelClass} htmlFor="daily">Daily benefit</label>
                            <StepperField id="daily" value={policy.dailyBenefit} prefix="$" step={DAILY_BENEFIT_STEP} min={DAILY_BENEFIT_MIN} max={DAILY_BENEFIT_MAX} onChange={(v) => {
                              const n = clampDailyBenefit(Number(v));
                              patchDesign({ dailyBenefit: n, monthlyBenefit: monthlyFromDaily(n) });
                            }} />
                            {buyerHints ? (
                              <p className="mt-1 text-xs text-muted">
                                * {buyerHints.lead} <span className="font-semibold text-deplete">{buyerHints.daily}</span>
                                {buyerHints.dailyRest}.{" "}
                                <Cite href={SRC.millimanSurvey2025}>Milliman 2025 LTCI Survey</Cite>
                              </p>
                            ) : null}
                            {(() => {
                              const daily = policy.dailyBenefit || 0;
                              const years = lifetime ? Math.max(1, duration || 10) : policy.benefitYears || 0;
                              const annual = daily * 365;
                              const poolAmt = annual * years;
                              return (
                            <p className="mt-1 text-xs text-muted">
                              Annual: <span className="font-semibold text-deplete">{money(annual)}</span>
                              {` (${money(daily)} × 365)`}
                              {" · "}
                              LTC pool at purchase: <span className="font-semibold text-deplete">{money(poolAmt)}</span>
                              {lifetime
                                ? ` (${money(annual)} × ${years} years of modeled care, Lifetime)`
                                : ` (${money(annual)} × ${years} years)`}
                            </p>
                              );
                            })()}
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="monthly">Monthly benefit</label>
                            <p id="monthly" className="card px-3 py-2.5 tabular-nums text-navy">{money(monthlyFromDaily(policy.dailyBenefit))}</p>
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="years">Benefit period</label>
                            <FieldPicker
                              id="years"
                              value={String(policy.benefitYears)}
                              placeholder="Select a benefit period…"
                              options={[
                                ...[3, 4, 5, 6, 8, 10].map((y) => ({ value: String(y), label: `${y} years` })),
                                { value: "99", label: "Lifetime *" },
                              ]}
                              onChange={(v) => patchDesign({ benefitYears: Number(v) })}
                            />
                            {buyerHints ? (
                              <p className="mt-1 text-xs text-muted">
                                * {buyerHints.lead} <span className="font-semibold text-deplete">{buyerHints.period}</span> benefit periods.{" "}
                                <Cite href={SRC.millimanSurvey2025}>Milliman 2025 LTCI Survey</Cite>
                              </p>
                            ) : null}
                            {lifetime ? (
                              <p className="mt-1 text-xs font-semibold amt-red">* This option is not available with all insurance companies.</p>
                            ) : null}
                          </div>
                          <div>
                            <label className={labelClass} htmlFor="elim">Elimination period</label>
                            <FieldPicker
                              id="elim"
                              value={String(policy.elimDays)}
                              placeholder="Select an elimination period…"
                              options={ELIM_DAYS.map((d) => ({ value: String(d), label: `${d} days` }))}
                              onChange={(v) => patchDesign({ elimDays: Number(v) })}
                            />
                            {buyerHints ? (
                              <p className="mt-1 text-xs text-muted">
                                * {buyerHints.lead} <span className="font-semibold text-deplete">{buyerHints.elim}</span> elimination periods.{" "}
                                <Cite href={SRC.millimanSurvey2025}>Milliman 2025 LTCI Survey</Cite>
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <label className={labelClass} htmlFor="rider">Benefit Increase Option (i.e., Inflation Options)</label>
                        <FieldPicker
                          id="rider"
                          value={riderKey(policy)}
                          placeholder="Select an inflation option…"
                          options={RIDER_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
                          onChange={(v) => patchDesign(parseRider(v))}
                        />
                        {buyerHints ? (
                          <p className="mt-1 text-xs text-muted">
                            * {buyerHints.lead} <span className="font-semibold text-deplete">{buyerHints.inflation}</span>.{" "}
                            <Cite href={SRC.millimanSurvey2025}>Milliman 2025 LTCI Survey</Cite>
                            {" · "}
                            <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
                          </p>
                        ) : null}
                        <label className={labelClass} htmlFor="premium">Annual premium</label>
                        <StepperField id="premium" value={policy.annualPremium || 0} prefix="$" step={100} min={0} blankWhenZero onChange={(v) => { setPremiumTouched(true); patchPolicy({ annualPremium: Number(v) || 0 }); }} />
                        {ageToday >= MIN_AGE_TODAY && typicalPremiumHint(ageToday, policy.benefitInflationPct, policy.inflationMethod).amount ? (
                          <p className="mt-1 text-xs text-muted">
                            * Based on industry averages at your age bracket (
                            <span className="font-semibold text-deplete">{fiveYearIssueBand(ageToday)}</span>
                            ), most buyers’ average premium is{" "}
                            <span className="font-semibold text-deplete">
                              {money(typicalPremiumHint(ageToday, policy.benefitInflationPct, policy.inflationMethod).amount ?? 0)}
                            </span>{" "}
                            based on these benefit options.{" "}
                            <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
                          </p>
                        ) : null}
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-navy">
                          <input type="checkbox" className="size-4 accent-teal" checked={partnershipOn} onChange={(e) => setPartnershipOn(e.target.checked)} />
                          DRA Partnership (traditional tax-qualified LTC only)
                        </label>
                        <p className="text-xs text-muted">Not available on asset-based, hybrid life, or LTC annuity. Those products are generally not Partnership-certified.</p>
                      </>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className={labelClass} htmlFor="single">{policy.kind === "hybridLife" ? "Death benefit" : "Single premium / deposit"}</label>
                          <StepperField id="single" value={policy.singlePremium || 0} prefix="$" step={1000} min={0} onChange={(v) => patchDesign({ singlePremium: Number(v) || 0 })} />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="leverage">LTC leverage / extension</label>
                          <FieldPicker
                            id="leverage"
                            value={String(policy.leverage || 1)}
                            placeholder="Select leverage…"
                            options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: leverageLabel(n) }))}
                            onChange={(v) => patchDesign({ leverage: Number(v) || 1 })}
                          />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="monthly-hyb">Monthly benefit</label>
                          <StepperField id="monthly-hyb" value={Math.max(LINKED_MONTHLY_MIN, policy.monthlyBenefit || 0)} prefix="$" step={LINKED_MONTHLY_STEP} min={LINKED_MONTHLY_MIN} onChange={(v) => {
                            const raw = Number(v) || 0;
                            const m = Math.max(LINKED_MONTHLY_MIN, Math.round(raw / LINKED_MONTHLY_STEP) * LINKED_MONTHLY_STEP);
                            patchDesign({ monthlyBenefit: m, dailyBenefit: dailyFromMonthly(m), singlePremium: policy.kind === "hybridLife" ? hybridFaceForMonthly(m) : policy.singlePremium });
                          }} />
                          {ageToday >= MIN_AGE_TODAY ? (
                            <p className="mt-1 text-xs text-muted">
                              * {typicalLinkedBuyerHints(ageToday).lead}{" "}
                              <span className="font-semibold text-deplete">{typicalLinkedBuyerHints(ageToday).monthly}</span> monthly.{" "}
                              <Cite href={SRC.millimanSurvey2025}>Milliman 2025 LTCI Survey</Cite>
                              {" · "}
                              <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
                              {" · "}
                              <Cite href={SRC.limra}>LIMRA</Cite>
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="elim-hyb">Elimination period</label>
                          <FieldPicker
                            id="elim-hyb"
                            value={String(policy.elimDays)}
                            placeholder="Select an elimination period…"
                            options={ELIM_DAYS.map((d) => ({ value: String(d), label: `${d} days` }))}
                            onChange={(v) => patchDesign({ elimDays: Number(v) })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass} htmlFor="rider-hyb">Benefit Increase Option (i.e., Inflation Options)</label>
                          <FieldPicker
                            id="rider-hyb"
                            value={riderKey(policy)}
                            placeholder="Select an inflation option…"
                            options={RIDER_OPTIONS.map((o) => ({ value: o.key, label: o.label }))}
                            onChange={(v) => patchDesign(parseRider(v))}
                          />
                        </div>
                        {(() => {
                          const face = specifiedFaceAmount(policy);
                          const lev = Math.max(1, policy.leverage || 1);
                          const poolAmt = face * lev;
                          const monthly = Math.max(LINKED_MONTHLY_MIN, policy.monthlyBenefit || hybMonthly || 0);
                          const months = monthly > 0 ? poolAmt / monthly : 0;
                          const years = months / 12;
                          return (
                            <p className="sm:col-span-2 text-xs leading-snug text-muted">
                              LTC benefits are the premium (or death benefit) times leverage — not a selected benefit period.{" "}
                              Pool <span className="font-semibold text-deplete">{money(poolAmt)}</span>
                              {` (${money(face)} × ${lev}×)`}.
                              {monthly > 0 ? (
                                <>
                                  {" "}At <span className="font-semibold text-deplete">{money(monthly)}</span>/month that is about{" "}
                                  <span className="font-semibold text-deplete">{months.toFixed(0)} months</span>
                                  {` (${years.toFixed(1)} years)`} of benefits until the pool is used.
                                </>
                              ) : null}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                      </div>
                    </fieldset>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Check Include long-term care insurance in the run to add a policy.</p>
                )}
              </>
            )}
            <div className="mt-4 stack-actions">
              {missingRun.length ? (
                <p className="w-full min-w-0 text-sm font-semibold leading-snug text-deplete" role="status">
                  To run, complete:
                  <span className="mt-1 block font-normal text-navy">
                    {missingRun.map((item) => (
                      <span key={item} className="block">• {item}</span>
                    ))}
                  </span>
                </p>
              ) : null}
              <button type="button" className="btn-block rounded-lg bg-gold text-masthead hover:brightness-105" onClick={runHypo}>Run hypothetical</button>
            </div>
          </section>

      {ran && (
        <>
        <section id="results" className="mt-5 scroll-mt-28 card-xl min-w-0 p-4 md:p-5 lg:scroll-mt-4">
          <TitleCollapse title="Your hypothetical is ready" className="mt-0" defaultOpen hint="Click the title to view the combined pool, remaining assets, and key results from this run.">
            <p className="mb-4 text-sm text-muted">
              {insuranceLocked
                ? "Countable assets in this run do not meet the suitability floor for insurance. View all and the PDF include Medicaid planning, required legal disclaimers, sources, and how to find a qualified professional."
                : "Compare long-term care options below. View all opens the full on-screen report."}
            </p>
            <div className={`mb-4 rounded-lg border-2 px-4 py-3 ${depletedWhen ? "border-deplete bg-cream" : "border-gold bg-paper"}`}>
              <p className="text-xs font-bold uppercase tracking-wide amt-red">
                {depletedWhen ? "Funds depleted" : "Last year modeled"}
              </p>
              <p className="font-display text-2xl font-bold amt-red">
                {depletedWhen
                  ? depletedWhen.label
                  : depletedRow
                    ? `${calendarYear(depletedRow.year)} · Year ${depletedRow.year}`
                    : "Not in the modeled years"}
              </p>
              <p className="mt-1 text-sm font-bold amt-red">
                {depletedWhen
                  ? `Countable assets${policy.enabled ? " (after insurance pays first)" : ""} run out in ${depletedWhen.monthName} ${depletedWhen.year}.`
                  : "This run’s countable assets last through the years of care that were modeled."}
              </p>
            </div>
            <MovableKpiGrid
              captions={{
                column: featureRow
                  ? `Beginning of the run — claim starts in ${calendarYear(featureRow.year)}.`
                  : undefined,
                depletion: depletionRow
                  ? fundsFullyDepleted
                    ? `End of the run — total assets (insurance benefits + net countable assets) are depleted in ${calendarYear(depletionRow.year)}.`
                    : lifetime
                      ? `End of the run — net countable assets are depleted in ${calendarYear(depletionRow.year)}. Lifetime insurance benefits are still in force in this model.`
                      : `End of the run — total assets are not fully depleted in the modeled years. Last care year shown is ${calendarYear(depletionRow.year)}.`
                  : undefined,
                more: "Other figures from this run, if you want them on the Ready card.",
                cumulative: yearRowsShown.at(-1)
                  ? `Running totals through ${calendarYear(yearRowsShown.at(-1)!.year)} — care cost = insurance paid + co-pay from assets + unpaid shortfall.`
                  : undefined,
              }}
              items={[
                ...(featureRow
                  ? [
                      { id: "col-year", group: "column" as const, label: "Beginning of the run", value: String(calendarYear(featureRow.year)), amount: calendarYear(featureRow.year) },
                      { id: "col-assets", group: "column" as const, label: "Countable Assets (net after tax) · beginning", value: moneyCents(featureRow.remainingNetStart) },
                    ]
                  : []),
                ...(policy.enabled && featureRow
                  ? [{ id: "col-pool", group: "column" as const, label: "Insurance Benefit Pool · beginning", value: lifetime ? "Lifetime" : moneyCents(featureRow.insurancePoolStart) }]
                  : []),
                ...(featureRow
                  ? [
                      {
                        id: "col-total",
                        group: "column" as const,
                        label: "Total Remaining · beginning",
                        value:
                          policy.enabled && lifetime
                            ? `${moneyCents(featureRow.remainingNet)} + lifetime`
                            : moneyCents(
                                policy.enabled
                                  ? featureRow.remainingNet + Math.max(0, featureRow.insurancePoolRemaining)
                                  : featureRow.remainingNet,
                              ),
                      },
                      { id: "col-cost", group: "column" as const, label: "Annual Care Costs* (est) · beginning", value: <RedAmt>{moneyCents(featureRow.cost)}</RedAmt>, amount: featureRow.cost },
                    ]
                  : []),
                ...(policy.enabled && featureRow
                  ? [
                      { id: "col-benefits", group: "column" as const, label: "Insurance Benefits · beginning", value: moneyCents(featureRow.insurance), amount: featureRow.insurance },
                      { id: "col-benefits-cum", group: "column" as const, label: "Accumulative insurance paid · beginning", value: moneyCents(featureRow.insuranceCumulative), amount: featureRow.insuranceCumulative },
                      { id: "col-balance", group: "column" as const, label: "Insurance Balance · beginning", value: lifetime ? "Lifetime" : moneyCents(featureRow.insurancePoolRemaining) },
                    ]
                  : []),
                ...(featureRow
                  ? [
                      {
                        id: "col-copay",
                        group: "column" as const,
                        label: "Accumulative co-pay from countable assets · beginning",
                        value: (
                          <span className={featureRow.drawnCumulative > 0 ? "font-bold amt-red" : ""}>
                            {featureRow.drawnCumulative > 0 ? moneyCents(-featureRow.drawnCumulative) : moneyCents(0)}
                          </span>
                        ),
                      },
                      {
                        id: "col-shortfall",
                        group: "column" as const,
                        label: "Cumulative Shortfall · beginning",
                        value: featureRow.shortfallCumulative ? <RedAmt>{moneyCents(featureRow.shortfallCumulative)}</RedAmt> : "—",
                      },
                    ]
                  : []),
                ...(depletionRow
                  ? [
                      { id: "dep-year", group: "depletion" as const, label: "End of the run", value: String(calendarYear(depletionRow.year)), amount: calendarYear(depletionRow.year) },
                      { id: "dep-status", group: "depletion" as const, label: "Status · end", value: <RedAmt>{depletionRow.status}</RedAmt> },
                      { id: "dep-assets", group: "depletion" as const, label: "Countable Assets (net after tax) · end", value: moneyCents(depletionRow.remainingNetStart), amount: depletionRow.remainingNet },
                    ]
                  : []),
                ...(policy.enabled && depletionRow
                  ? [{ id: "dep-pool", group: "depletion" as const, label: "Insurance Benefit Pool · end", value: lifetime ? "Lifetime" : moneyCents(depletionRow.insurancePoolStart) }]
                  : []),
                ...(depletionRow
                  ? [
                      {
                        id: "dep-total",
                        group: "depletion" as const,
                        label: "Total Remaining · end",
                        value:
                          policy.enabled && lifetime
                            ? `${moneyCents(depletionRow.remainingNet)} + lifetime`
                            : moneyCents(
                                policy.enabled
                                  ? depletionRow.remainingNet + Math.max(0, depletionRow.insurancePoolRemaining)
                                  : depletionRow.remainingNet,
                              ),
                      },
                      { id: "dep-cost", group: "depletion" as const, label: "Annual Care Costs* (est) · end", value: <RedAmt>{moneyCents(depletionRow.cost)}</RedAmt> },
                      { id: "dep-cost-cum", group: "depletion" as const, label: "Total cumulative care cost · end", value: <RedAmt>{moneyCents(depletionRow.costCumulative)}</RedAmt>, amount: depletionRow.costCumulative },
                    ]
                  : []),
                ...(policy.enabled && depletionRow
                  ? [
                      { id: "dep-benefits", group: "depletion" as const, label: "Insurance Benefits · end", value: moneyCents(depletionRow.insurance) },
                      { id: "dep-benefits-cum", group: "depletion" as const, label: "Accumulative insurance paid · end", value: moneyCents(depletionRow.insuranceCumulative), amount: depletionRow.insuranceCumulative },
                      { id: "dep-balance", group: "depletion" as const, label: "Insurance Balance · end", value: lifetime ? "Lifetime" : moneyCents(depletionRow.insurancePoolRemaining) },
                    ]
                  : []),
                ...(depletionRow
                  ? [
                      {
                        id: "dep-copay",
                        group: "depletion" as const,
                        label: "Accumulative co-pay from countable assets · end",
                        amount: depletionRow.drawnCumulative,
                        value: (
                          <span className={depletionRow.drawnCumulative > 0 ? "font-bold amt-red" : ""}>
                            {depletionRow.drawnCumulative > 0 ? moneyCents(-depletionRow.drawnCumulative) : moneyCents(0)}
                          </span>
                        ),
                      },
                      {
                        id: "dep-shortfall",
                        group: "depletion" as const,
                        label: "Cumulative Shortfall · end",
                        amount: depletionRow.shortfallCumulative,
                        value: depletionRow.shortfallCumulative ? <RedAmt>{moneyCents(depletionRow.shortfallCumulative)}</RedAmt> : "—",
                      },
                      {
                        id: "dep-gap",
                        group: "depletion" as const,
                        label: "Care cost − insurance (copay + unpaid) · end",
                        amount: Math.max(0, depletionRow.costCumulative - depletionRow.insuranceCumulative),
                        value: <RedAmt>{moneyCents(Math.max(0, depletionRow.costCumulative - depletionRow.insuranceCumulative))}</RedAmt>,
                      },
                    ]
                  : []),
                ...(yearRowsShown.at(-1)
                  ? [
                      {
                        id: "cum-through",
                        group: "cumulative" as const,
                        label: "Cumulative through",
                        value: String(calendarYear(yearRowsShown.at(-1)!.year)),
                        amount: calendarYear(yearRowsShown.at(-1)!.year),
                      },
                      {
                        id: "cum-cost",
                        group: "cumulative" as const,
                        label: "Total cumulative care cost",
                        value: <RedAmt>{moneyCents(yearRowsShown.at(-1)!.costCumulative)}</RedAmt>,
                        amount: yearRowsShown.at(-1)!.costCumulative,
                      },
                      ...(policy.enabled
                        ? [
                            {
                              id: "cum-ins",
                              group: "cumulative" as const,
                              label: "Accumulative insurance paid",
                              value: moneyCents(yearRowsShown.at(-1)!.insuranceCumulative),
                              amount: yearRowsShown.at(-1)!.insuranceCumulative,
                            },
                          ]
                        : []),
                      {
                        id: "cum-copay",
                        group: "cumulative" as const,
                        label: "Accumulative co-pay from countable assets",
                        amount: yearRowsShown.at(-1)!.drawnCumulative,
                        value: (
                          <span className={yearRowsShown.at(-1)!.drawnCumulative > 0 ? "font-bold amt-red" : ""}>
                            {yearRowsShown.at(-1)!.drawnCumulative > 0
                              ? moneyCents(-yearRowsShown.at(-1)!.drawnCumulative)
                              : moneyCents(0)}
                          </span>
                        ),
                      },
                      {
                        id: "cum-short",
                        group: "cumulative" as const,
                        label: "Cumulative unpaid shortfall",
                        amount: yearRowsShown.at(-1)!.shortfallCumulative,
                        value: yearRowsShown.at(-1)!.shortfallCumulative ? (
                          <RedAmt>{moneyCents(yearRowsShown.at(-1)!.shortfallCumulative)}</RedAmt>
                        ) : (
                          "—"
                        ),
                      },
                      {
                        id: "cum-gap",
                        group: "cumulative" as const,
                        label: "Care cost − insurance (copay + unpaid)",
                        amount: Math.max(
                          0,
                          yearRowsShown.at(-1)!.costCumulative - yearRowsShown.at(-1)!.insuranceCumulative,
                        ),
                        value: (
                          <RedAmt>
                            {moneyCents(
                              Math.max(
                                0,
                                yearRowsShown.at(-1)!.costCumulative - yearRowsShown.at(-1)!.insuranceCumulative,
                              ),
                            )}
                          </RedAmt>
                        ),
                      },
                      {
                        id: "cum-premium",
                        group: "cumulative" as const,
                        label: "Premium paid (this run)",
                        value: moneyCents(result.premiumTotal),
                      },
                    ]
                  : []),
                { id: "claim-assets", group: "more" as const, label: "Countable assets at claim (net after tax)", value: <RedAmt>{moneyCents(result.startPoolNet)}</RedAmt> },
                { id: "assets-today", group: "more" as const, label: "Countable assets today", value: moneyCents(pool) },
                { id: "first-cost", group: "more" as const, label: "First-year care cost", value: moneyCents(result.firstCost), amount: result.firstCost },
                ...(policy.enabled
                  ? [
                      { id: "col-benefits-total", group: "more" as const, label: "Insurance Benefits (this run)", value: <RedAmt>{moneyCents(result.insuranceTotal)}</RedAmt>, amount: result.insuranceTotal },
                      { id: "ltc-purchase", group: "more" as const, label: "LTC pool at purchase", value: result.lifetimeBenefit ? "Lifetime" : moneyCents(insToday) },
                      { id: "ltc-claim", group: "more" as const, label: "LTC benefits at claim", value: result.lifetimeBenefit ? "Lifetime" : moneyCents(insClaim) },
                    ]
                  : []),
                {
                  id: "combined-today",
                  group: "more" as const,
                  label: policy.enabled ? "Combined pool today (assets + LTC)" : "Countable pool today",
                  value: policy.enabled && result.lifetimeBenefit ? `${money(pool)} + lifetime` : moneyCents(combinedToday),
                },
                { id: "end-assets", group: "more" as const, label: "Assets remaining (end of run)", value: <RedAmt>{moneyCents(result.endPool)}</RedAmt>, amount: result.endPool },
                { id: "end-short", group: "more" as const, label: "Unpaid shortfall (end of run)", value: <RedAmt>{result.shortfallTotal ? moneyCents(result.shortfallTotal) : "None"}</RedAmt>, amount: result.shortfallTotal },
              ]}
            />
            <div className="mt-2 stack-actions md:grid-cols-2">
              <button type="button" onClick={viewAllReport} className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105">View all</button>
              <button type="button" onClick={requestPdfDownload} className="btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal">Download PDF</button>
              <p className="col-span-full text-xs leading-snug text-muted">Open a title below to view more details. Check Add to PDF on each card you want in the download.</p>
            </div>
          </TitleCollapse>
        </section>

          {!insuranceLocked ? (
            <>
          <ViewFold title="Year by year projection" hint={`${DETAIL_HINTS.yearByYear} View more details.`} defaultOpen checked={details.yearByYear} onPdf={(v) => setDetail("yearByYear", v)}>
            <p className="mb-3 text-sm text-muted">
              {yearRowsShown.length} years modeled
              {delay > 0
                ? ` — ${delay} year${delay === 1 ? "" : "s"} until care starts (Y${careStart}), then ${Math.max(1, duration)} care year${Math.max(1, duration) === 1 ? "" : "s"} through Y${careStart + Math.max(1, duration) - 1}.`
                : ` — ${Math.max(1, duration)} care year${Math.max(1, duration) === 1 ? "" : "s"} starting now.`}
              {" "}Every wait year and care year is listed, including years after funds are depleted.
            </p>
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[720px] table-fixed text-sm">
                <thead>
                  <tr className="border-b border-gold text-[11px] font-semibold leading-tight text-muted">
                    <th className="w-[3.25rem] py-2 px-1 text-center align-bottom">Year</th>
                    <th className="py-2 px-1 text-center align-bottom">Countable Assets<br />(net after tax)</th>
                    {policy.enabled ? (
                      <th className="py-2 px-1 text-center align-bottom">Insurance<br />Benefit Pool</th>
                    ) : null}
                    <th className="py-2 px-1 text-center align-bottom">Total<br />Remaining</th>
                    <th className="py-2 px-1 text-center align-bottom">Annual Care<br />Costs* <span className="normal-case font-medium">(est)</span></th>
                    {policy.enabled ? (
                      <>
                        <th className="py-2 px-1 text-center align-bottom">Insurance<br />Benefits</th>
                        <th className="py-2 px-1 text-center align-bottom">Insurance<br />Balance</th>
                        <th className="py-2 px-1 text-center align-bottom">Co-pay from<br />Countable Assets</th>
                      </>
                    ) : (
                      <th className="py-2 px-1 text-center align-bottom">Co-pay from<br />Countable Assets</th>
                    )}
                    <th className="py-2 px-1 text-center align-bottom">Cumulative<br />Shortfall</th>
                  </tr>
                </thead>
                <tbody>
                  {yearSlice.map((r) => {
                    const insLeft = lifetime && policy.enabled ? null : Math.max(0, r.insurancePoolRemaining);
                    const totalLeft = policy.enabled
                      ? (insLeft == null ? r.remainingNet : r.remainingNet + insLeft)
                      : r.remainingNet;
                    const insGone =
                      policy.enabled &&
                      !lifetime &&
                      r.status === "Care year" &&
                      Math.round(r.insurancePoolRemaining) <= 0;
                    const allGone = totalOutYear != null && r.year === totalOutYear;
                    const gone = insGone || allGone;
                    const assetsNet = r.remainingNetStart;
                    const poolStartLabel =
                      lifetime && policy.enabled ? "Lifetime" : moneyCents(r.insurancePoolStart);
                    const poolLeft =
                      lifetime && policy.enabled ? "Lifetime" : moneyCents(r.insurancePoolRemaining);
                    const totalLabel =
                      lifetime && policy.enabled
                        ? `${moneyCents(r.remainingNet)} + lifetime`
                        : moneyCents(totalLeft);
                    const remainIdx = yearView.rows.findIndex((x) => x.year === r.year);
                    const remainTone = remainingToneAt(yearView.rows, remainIdx, policy.enabled, lifetime);
                    const remainClass = remainingToneClass(remainTone);
                    const remainTitle =
                      remainTone === "depleted"
                        ? "Funds depleted"
                        : remainTone === "drawing"
                          ? "Funds drawing down"
                          : undefined;
                    const cell = gone ? "py-2 px-1 text-center font-bold amt-red" : "py-2 px-1 text-center";
                    return (
                      <tr
                        key={r.year}
                        className={`border-t tabular-nums ${gone ? "border-deplete bg-cream" : "border-line text-navy"}`}
                      >
                        <td className={cell}>{calendarYear(r.year)}</td>
                        <td className={cell}>{moneyCents(assetsNet)}</td>
                        {policy.enabled ? (
                          <td className={cell}>{poolStartLabel}</td>
                        ) : null}
                        <td className={`py-2 px-1 text-center ${remainClass}`} title={remainTitle}>{totalLabel}</td>
                        <td className={`${cell} ${r.cost ? "font-bold amt-red" : ""}`}>{moneyCents(r.cost)}</td>
                        {policy.enabled ? (
                          <>
                            <td className={cell}>{moneyCents(r.insurance)}</td>
                            <td className={cell}>{poolLeft}</td>
                          </>
                        ) : null}
                        <td className={`${cell} ${r.drawn ? "font-bold amt-red" : ""}`}>
                          {r.drawn > 0 ? moneyCents(-r.drawn) : moneyCents(0)}
                        </td>
                        <td className={`${gone ? "py-2 font-bold amt-red" : "py-2"} px-1 text-center`}>
                          {r.shortfallCumulative ? moneyCents(r.shortfallCumulative) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gold tabular-nums">
                    <td className="py-2 px-1 text-center font-semibold">End of run</td>
                    <td className="py-2 px-1 text-center">—</td>
                    {policy.enabled ? <td className="py-2 px-1 text-center">—</td> : null}
                    <td className="py-2 px-1 text-center">—</td>
                    <td className="py-2 px-1 text-center font-bold amt-red">
                      {moneyCents(yearRowsShown.at(-1)?.costCumulative ?? 0)}
                    </td>
                    {policy.enabled ? (
                      <>
                        <td className="py-2 px-1 text-center">
                          {moneyCents(yearRowsShown.at(-1)?.insuranceCumulative ?? 0)}
                        </td>
                        <td className="py-2 px-1 text-center">—</td>
                      </>
                    ) : null}
                    <td className="py-2 px-1 text-center font-bold amt-red">
                      {(yearRowsShown.at(-1)?.drawnCumulative ?? 0) > 0
                        ? moneyCents(-(yearRowsShown.at(-1)?.drawnCumulative ?? 0))
                        : moneyCents(0)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {yearRowsShown.at(-1)?.shortfallCumulative
                        ? moneyCents(yearRowsShown.at(-1)!.shortfallCumulative)
                        : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <p className="mt-2 text-xs text-muted">
                {policy.enabled
                  ? "Insurance Benefit Pool is daily benefit × 365 × benefit period at the start of that year (for example $200/day × 3 years = $219,000.00). Countable Assets are net after tax (deferred accounts reduced by this run’s tax rate) before this year’s co-pay. Annual Care Costs* (est) are modeled from published median costs and this run’s inflation — not a quote. Insurance pays first up to the annual maximum (daily benefit × 365, e.g. $73,000.00). If the bill is at or under that maximum and the pool still has room, Co-pay from Countable Assets is $0.00. Any amount assets do pay is shown as a negative number. Insurance Balance is the pool after that calendar year’s covered claim is subtracted. Total Remaining is Insurance Balance plus countable assets net after tax after the co-pay. "
                  : null}
                {policy.enabled ? "Total Remaining" : "Countable Assets"} turns bold green when the pool starts declining, and bold red when it is depleted.
                The table runs through the wait until care and every modeled care year — it does not stop at year 10 or at depletion.
              </p>
            </div>
            {yearPages > 1 ? (
              <div className="mt-3 stack-actions">
                <button type="button" className="btn-block rounded-lg border border-navy text-navy disabled:opacity-40" disabled={yearPage <= 0} onClick={() => setYearPage((p) => Math.max(0, p - 1))}>Previous years</button>
                <p className="text-center text-xs text-muted">
                  {yearRowsShown.length} years modeled
                  {delay > 0
                    ? ` (${delay} until care, then ${Math.max(1, duration)} care year${Math.max(1, duration) === 1 ? "" : "s"})`
                    : ` · ${Math.max(1, duration)} care year${Math.max(1, duration) === 1 ? "" : "s"}`}
                  {" "}· page {yearPage + 1} of {yearPages} · years {yearSliceStart}–{yearSliceEnd}
                </p>
                <button type="button" className="btn-block rounded-lg border border-navy text-navy disabled:opacity-40" disabled={yearPage >= yearPages - 1} onClick={() => setYearPage((p) => Math.min(yearPages - 1, p + 1))}>Next years</button>
                {carePage > 0 ? (
                  <button
                    type="button"
                    className="btn-block rounded-lg border border-navy text-navy"
                    onClick={() => setYearPage(carePage)}
                    disabled={yearPage === carePage}
                  >
                    Skip to first care year (Y{careStart})
                  </button>
                ) : null}
              </div>
            ) : null}
          </ViewFold>

          {pie.length > 0 ? (
            <ViewFold title="Asset allocation" hint={`${DETAIL_HINTS.allocation} View more details.`} checked={details.allocation} onPdf={(v) => setDetail("allocation", v)}>
              <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="chart-page min-w-0 w-full">
                  <p className="mb-2 text-sm font-semibold text-navy">Asset allocation</p>
                  <ChartRegion title="Asset allocation" summary="Countable sleeves in this run. Names are listed under the pie." className="mx-auto h-52 w-full max-w-[16rem]">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0} minHeight={180}>
                      <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                        <Pie data={pieShown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={0} outerRadius={narrow ? 78 : 88} isAnimationActive={false} label={false} labelLine={false}>
                          {pieShown.map((s) => <Cell key={s.name} fill={s.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => money(Number(v) || 0)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartRegion>
                  <SleeveLegend items={pieShown} />
                </div>
                <div className="chart-page min-w-0 w-full pb-6">
                  <p className="mb-2 text-sm font-semibold text-navy">
                    Asset utilization over time in {state ? <StateName name={state} /> : "the selected state"}
                  </p>
                  <ChartRegion title={`Asset utilization over time in ${state || "the selected state"}`} summary="Care bills versus remaining countable assets. The remaining line turns red at shortfall." className="h-56 w-full sm:h-64">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0} minHeight={200}>
                      <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                        <XAxis dataKey="label" interval={chartTickInterval(chartData.length, narrow)} angle={narrow ? -32 : 0} textAnchor={narrow ? "end" : "middle"} height={narrow ? 44 : 28} tick={{ fill: CHART.tick, fontSize: narrow ? 10 : 11 }} />
                        <YAxis tickFormatter={(v) => compactMoney(Number(v) || 0)} tick={{ fill: CHART.tick, fontSize: 10 }} width={narrow ? 40 : 52} />
                        <Tooltip formatter={(v) => money(Number(v) || 0)} />
                        <Bar dataKey="cost" name={`${SETTING_SHORT[activeSetting]} bill`} fill={CHART.cost} isAnimationActive={false} />
                        {policy.enabled ? <Bar dataKey="insurance" name="Insurance paid" fill={CHART.insurance} isAnimationActive={false} /> : null}
                        <Line type="monotone" dataKey="remainingNavy" name="Assets remaining" stroke={CHART.remaining} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="remainingRed" name="Shortfall" stroke={CHART.shortfall} strokeWidth={2.5} dot={false} connectNulls={false} isAnimationActive={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartRegion>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-navy">
                    <li className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm" style={{ background: CHART.cost }} /> {SETTING_SHORT[activeSetting]} bill</li>
                    {policy.enabled ? <li className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-sm" style={{ background: CHART.insurance }} /> Insurance paid</li> : null}
                    <li className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full" style={{ background: CHART.remaining }} /> Assets remaining</li>
                    <li className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full" style={{ background: CHART.shortfall }} /> Shortfall</li>
                  </ul>
                </div>
              </div>
            </ViewFold>
          ) : null}

          <ViewFold title="Compare long-term care options" hint={`${DETAIL_HINTS.compareCare} View more details.`} checked={details.compareCare} onPdf={(v) => setDetail("compareCare", v)}>
            <div className="grid gap-3">
              {careCompare.map((row) => (
                <article key={row.setting} className="rounded-lg border border-line px-3 py-3">
                  <p className="font-display text-base text-navy">{SETTING_LABELS[row.setting]}</p>
                  <dl className="mt-2 grid gap-1.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted">Today’s annual cost</dt><dd className="tabular-nums">{money(row.today)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">First-year bill in this run</dt><dd className="tabular-nums">{money(row.proj.firstCost)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Assets remaining</dt><dd className="tabular-nums">{money(row.proj.endPool)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "None"}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </ViewFold>

          {policy.enabled && insuranceCompare.length > 0 ? (
            <ViewFold title="Compare insurance options" hint={`${DETAIL_HINTS.compareIns} View more details.`} checked={details.compareIns} onPdf={(v) => setDetail("compareIns", v)}>
              <div className="grid gap-3">
                {insuranceCompare.map((row) => (
                  <article key={row.key} className="rounded-lg border border-line px-3 py-3">
                    <p className="font-display text-base text-navy">{row.label}{row.key === policy.kind ? " · this run" : ""}</p>
                    <dl className="mt-2 grid gap-1.5 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-muted">Insurance paid</dt><dd className="tabular-nums">{money(row.proj.insuranceTotal)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Assets left</dt><dd className="tabular-nums">{money(row.proj.endPool)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "None"}</dd></div>
                    </dl>
                  </article>
                ))}
                <article className="rounded-lg border border-line px-3 py-3">
                  <p className="font-display text-base text-navy">No policy (self-funded)</p>
                  <dl className="mt-2 grid gap-1.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted">Insurance paid</dt><dd className="tabular-nums">{money(0)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Assets left</dt><dd className="tabular-nums">{money(selfFunded.endPool)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{selfFunded.shortfallTotal ? money(selfFunded.shortfallTotal) : "None"}</dd></div>
                  </dl>
                </article>
              </div>
            </ViewFold>
          ) : null}

          {policy.enabled ? (
            <ViewFold title="Compare long-term care riders" hint={`${DETAIL_HINTS.riders} View more details.`} checked={details.riders} onPdf={(v) => setDetail("riders", v)}>
              <p className="mb-3 text-sm text-muted">{LTC_RIDER_INTRO}</p>
              <div className="grid gap-3">
                {LTC_RIDER_GLANCE.map((row) => (
                  <article key={row.rider} className="rounded-lg border border-line px-3 py-3">
                    <p className="font-display text-base text-navy">{row.rider}</p>
                    <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Traditional. </span>{row.traditional}</p>
                    <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Hybrid. </span>{row.hybrid}</p>
                    <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Typical extra cost. </span>{row.cost}</p>
                  </article>
                ))}
              </div>
            </ViewFold>
          ) : null}

          {policy.enabled && inflationCompare.length > 0 ? (
            <ViewFold title="Compare inflation riders" hint={`${DETAIL_HINTS.inflation} View more details.`} checked={details.inflation} onPdf={(v) => setDetail("inflation", v)}>
              <div className="grid gap-3">
                {inflationCompare.map((row) => (
                  <article key={row.key} className="rounded-lg border border-line px-3 py-3">
                    <p className="font-display text-base text-navy">{row.label}</p>
                    <dl className="mt-2 grid gap-1.5 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-muted">Insurance paid</dt><dd className="tabular-nums">{money(row.proj.insuranceTotal)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Assets remaining</dt><dd className="tabular-nums">{money(row.proj.endPool)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "None"}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </ViewFold>
          ) : null}

          {policy.enabled ? (
            <ViewFold title="Explore Traditional, Asset-based, Hybrid, and LTC Annuity" hint={`${DETAIL_HINTS.hybrid} View more details.`} checked={details.hybrid} onPdf={(v) => setDetail("hybrid", v)}>
              <div className="grid gap-3">
                {structureCompare.map((row) => (
                  <article key={row.key} className={`rounded-lg border px-3 py-3 ${row.thisRun ? "border-gold bg-cream" : "border-line"}`}>
                    <p className="font-display text-base text-navy">{row.label}{row.thisRun ? " · this run" : ""}</p>
                    <dl className="mt-2 grid gap-1.5 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-muted">Paid in / premium</dt><dd className="tabular-nums">{money(row.proj.premiumTotal)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">LTC pool at purchase</dt><dd className="tabular-nums">{row.proj.lifetimeBenefit ? "Lifetime" : money(row.proj.benefitPoolAtPurchase ?? 0)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Insurance paid</dt><dd className="tabular-nums">{money(row.proj.insuranceTotal)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Assets remaining</dt><dd className="tabular-nums">{money(row.proj.endPool)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{row.proj.shortfallTotal ? money(row.proj.shortfallTotal) : "None"}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </ViewFold>
          ) : null}

          <ViewFold title="Compound rates and healthcare cost trends" hint={`${DETAIL_HINTS.trends} View more details.`} checked={details.trends} onPdf={(v) => setDetail("trends", v)}>
            <p className="mb-3 text-sm text-muted">This run uses a care-cost inflation of <Pct>{cpi.toFixed(1)}%</Pct> for {SETTING_LABELS[activeSetting]}.</p>
            <div className="grid gap-3">
              {fiveYearLtcBenchmarks().map((row) => (
                <article key={row.key} className="rounded-lg border border-line px-3 py-3">
                  <p className="font-display text-base text-navy">{SETTING_LABELS[row.key]}</p>
                  <p className="text-sm tabular-nums text-navy">5-year LTC index <Pct>{row.cagr.toFixed(1)}%</Pct></p>
                  <p className="mt-1 text-sm text-muted">{row.ifLabel}</p>
                </article>
              ))}
            </div>
          </ViewFold>

          {policy.enabled ? (
            <ViewFold title="State Partnership long-term care" hint={`${pShip.info.label}. ${DETAIL_HINTS.partnership} View more details.`} checked={details.partnership} onPdf={(v) => setDetail("partnership", v)}>
              <p className="mb-3 text-sm leading-relaxed text-navy"><LinkedCopy text={pShip.info.summary} /></p>
              <p className="mb-3 text-sm text-muted">{pShip.note}</p>
              <div className="grid gap-3">
                {[pImpact.noPolicy, pImpact.policyOnly, pImpact.partnership].map((lane) => (
                  <article key={lane.label} className="rounded-lg border border-line px-3 py-3">
                    <p className="font-display text-base text-navy">{lane.label}</p>
                    <dl className="mt-2 grid gap-1.5 text-sm">
                      <div className="flex justify-between gap-3"><dt className="text-muted">Remaining</dt><dd className="tabular-nums text-navy">{money(lane.remaining)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Partnership protected</dt><dd className="tabular-nums text-navy">{money(lane.protected)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Could keep at Medicaid</dt><dd className="tabular-nums text-navy">{money(lane.keep)}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-muted">Spend-down still</dt><dd className="tabular-nums text-navy">{money(lane.spend)}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </ViewFold>
          ) : null}

          {showReciprocity ? (
            <ViewFold title="Partnership reciprocity" hint={`Policy issued in ${effectiveIssue}; care / Medicaid in ${state}. View more details.`} checked={details.reciprocity} onPdf={(v) => setDetail("reciprocity", v)}>
              <p className="mb-2 text-sm font-semibold text-navy">{recip.title}</p>
              <ul className="mb-3 list-disc space-y-1 pl-4 text-sm text-muted">
                {recip.bullets.map((b) => (
                  <li key={b.slice(0, 56)}>{b}</li>
                ))}
              </ul>
              <p className="text-xs text-muted">The claim can still pay in any state. Reciprocity is only whether Medicaid in the care state honors Partnership asset protection from the issue state.</p>
            </ViewFold>
          ) : null}

          {policy.enabled ? (
            <ViewFold title="Federal and State Tax Deductions and/or Tax Credit" hint={`${DETAIL_HINTS.tax} View more details.`} checked={details.tax} onPdf={(v) => setDetail("tax", v)}>
              <FederalLtcDeductionPanel premium={policy.annualPremium} />
              <Irc1035Panel />
            </ViewFold>
          ) : null}

          {policy.enabled ? (
            <ViewFold title="Long-term care insurance and funding options" hint={`${DETAIL_HINTS.fundingOptions} View more details.`} checked={details.fundingOptions} onPdf={(v) => setDetail("fundingOptions", v)}>
              <div className="grid gap-3">
                {LTC_INSURANCE_OPTIONS.map((row) => (
                  <article key={row.option} className="rounded-lg border border-line px-3 py-3">
                    <p className="font-display text-base text-navy">{row.option}</p>
                    <p className="mt-1 text-sm text-muted">{row.pays}</p>
                    <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Medicaid. </span>{row.medicaid}</p>
                    <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Often discussed. </span>{row.fit}</p>
                  </article>
                ))}
              </div>
            </ViewFold>
          ) : null}

          <ViewFold title="National cost history" hint={`${DETAIL_HINTS.nationalHistory} View more details.`} checked={details.nationalHistory} onPdf={(v) => setDetail("nationalHistory", v)}>
            <div className="grid gap-3">
              {fiveYearLtcBenchmarks().map((row) => (
                <article key={row.key} className="rounded-lg border border-line px-3 py-3">
                  <p className="font-display text-base text-navy">{SETTING_LABELS[row.key]}</p>
                  <p className="mt-1 text-sm text-muted">{row.ifLabel}</p>
                  <p className="mt-1 text-sm tabular-nums text-navy">5-year LTC index <Pct>{row.cagr.toFixed(1)}%</Pct></p>
                </article>
              ))}
            </div>
          </ViewFold>

          {policy.enabled ? (
            <ViewFold title="Industry insights" hint={`${DETAIL_HINTS.insights} View more details.`} checked={details.insights} onPdf={(v) => setDetail("insights", v)}>
              <IndustryInsightsPanel ageToday={ageToday} policy={policy} state={state} setting={activeSetting} countable={pool} embedded />
            </ViewFold>
          ) : null}

          <ViewFold title="Compare health insurance types" hint={`${DETAIL_HINTS.compareHealth} View more details.`} checked={details.compareHealth} onPdf={(v) => setDetail("compareHealth", v)}>
            <p className="mb-3 text-sm text-muted">
              {HEALTH_INSURANCE_INTRO}{" "}
              <Cite href={SRC.medicareLtc}>Medicare.gov — long-term care</Cite>
              {" · "}
              <Cite href={SRC.medicareMedigap}>Medigap</Cite>
              {" · "}
              <Cite href={SRC.naicShopper}>NAIC Shopper’s Guide</Cite>.
            </p>
            <div className="grid gap-3">
              {HEALTH_INSURANCE_TYPES.map((row) => (
                <article key={row.type} className="rounded-lg border border-line px-3 py-3">
                  <p className="font-display text-base text-navy">{row.type}</p>
                  <p className="mt-1 text-sm text-muted"><LinkedCopy text={row.what} /></p>
                  <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Pays. </span><LinkedCopy text={row.pays} /></p>
                  <p className="mt-1 text-sm text-muted"><span className="font-semibold text-navy">Long-term care. </span><LinkedCopy text={row.ltc} /></p>
                </article>
              ))}
            </div>
          </ViewFold>

          <ViewFold title="Hypothesis sensitivity" hint={`${DETAIL_HINTS.sensitivity} View more details.`} checked={details.sensitivity} onPdf={(v) => setDetail("sensitivity", v)}>
            <p className="mb-3 text-sm text-muted">{sensitivity.insight}</p>
            <div className="grid gap-3">
              {sensitivity.rows.map((row) => (
                <article key={row.key} className={`rounded-lg border px-3 py-3 ${row.isBase ? "border-gold bg-cream" : "border-line"}`}>
                  <p className="font-display text-base text-navy">{row.factor}{row.isBase ? " · this run" : ""}</p>
                  <p className="text-sm text-muted">{row.shock}</p>
                  <dl className="mt-2 grid gap-1.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted">Assets remaining</dt><dd className="tabular-nums">{money(row.remaining)}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Shortfall</dt><dd className="tabular-nums">{row.shortfall ? money(row.shortfall) : "None"}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-muted">Years at claim cost</dt><dd className="tabular-nums">{row.yearsAtClaim.toFixed(2)}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          </ViewFold>

          <ViewFold title="Model confidence scores" hint={`${DETAIL_HINTS.confidence} View more details.`} checked={details.confidence} onPdf={(v) => setDetail("confidence", v)}>
            <ConfidencePanel confidence={confidence} />
          </ViewFold>
            </>
          ) : null}

          {ran ? (
            <MedicaidVaCard
              key={`medicaid-${hypoRunId}`}
              state={state}
              policy={policy}
              medicaid={medicaid}
              veteran={veteran}
              onVeteranChange={setVeteran}
              preservation={pImpact}
              issueState={effectiveIssue || state}
              preferTap={preferTap}
              defaultOpen={true}
              pdfChecked={details.medicaidLtc}
              onPdfChange={(v) => setDetail("medicaidLtc", v)}
              pdfLocked
            />
          ) : null}

          {insuranceLocked ? (
            <div className="mt-5 card-xl px-4 py-2">
              <TitleCollapse title="Find a qualified professional" className="mt-0" defaultOpen hint="Medicaid, elder-care, and estate-planning contacts — not a referral.">
                <AdvisorProfessionalFolds details={details} onPdfChange={setDetail} lockout={insuranceLocked} />
              </TitleCollapse>
            </div>
          ) : policy.enabled ? (
            <div className="mt-5 card-xl px-4 py-2">
              <TitleCollapse title="Advisor / insurance professional (optional)" className="mt-0" defaultOpen hint="Click the title to add the advisor or agent on the report. Leave blank to omit.">
                <PartyFields idPrefix="advisor" party={{ ...advisor, state }} extra details={details} onPdfChange={setDetail} onChange={(partial) => {
                  if (partial.state && partial.state !== state) setState(partial.state);
                  setAdvisor((p) => ({ ...p, ...partial, state: partial.state || state }));
                }} />
                <AdvisorProfessionalFolds details={details} onPdfChange={setDetail} />
              </TitleCollapse>
            </div>
          ) : null}
        </>
      )}

      <div id="disclosure-terms" className="mt-5 scroll-mt-8 card-xl border-2 px-4 py-2 text-sm text-muted">
        <TitleCollapse title={DISCLOSURE_CARD_TITLE} className="mt-0" openOnHash="disclosure-terms" pdfChecked={details.eduHypo} onPdfChange={(v) => setDetail("eduHypo", v)}>
          <DisclaimerCard className="mt-2" details={details} onPdfChange={setDetail} />
        </TitleCollapse>
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={requestPdfDownload}
          className="btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal md:mx-auto md:max-w-xs"
        >
          Download PDF
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-muted"><CopyrightMark /></p>
      {saveMsg ? <p className="mt-2 text-center text-sm text-good">{saveMsg}</p> : null}

      <div className="mobile-dock lg:hidden">
        {dockOpen ? (
          <div className="mobile-dock-card">
            <button
              type="button"
              className="mobile-dock-close"
              onClick={() => setDockOpen(false)}
              aria-label="Close"
            >
              <span aria-hidden>X</span> Close
            </button>
            {ran ? (
              <div className="mobile-dock-row">
                <button type="button" className="btn-block min-w-0 rounded-lg bg-gold text-sm text-masthead" onClick={viewAllReport}>View all</button>
                <button type="button" className="btn-block min-w-0 rounded-lg border border-navy bg-navy text-sm text-cream" onClick={requestPdfDownload}>PDF</button>
                <button type="button" className="btn-block min-w-0 rounded-lg border border-navy text-sm text-navy" onClick={() => scrollToId(insuranceLocked ? "medicaid-va-card" : "results")}>View results</button>
                <button type="button" className="btn-block min-w-0 rounded-lg border border-navy text-sm text-navy" onClick={runHypo}>Run again</button>
              </div>
            ) : (
              <>
                <p className="mb-2 max-w-full text-center text-xs font-semibold leading-snug text-deplete">
                  Need:
                  {dockNeed.map((item) => (
                    <span key={item} className="mt-0.5 block font-normal text-navy">• {item}</span>
                  ))}
                </p>
                {missingRun.length ? null : (
                  <p className="mb-2 text-center text-xs text-muted">Ready to run this hypothetical.</p>
                )}
                <div className="mobile-dock-row">
                  <button type="button" className="btn-block min-w-0 rounded-lg border border-navy text-sm text-navy" onClick={() => window.dispatchEvent(new Event("aum:open-chat"))}>Ask</button>
                  <button type="button" className="btn-block min-w-0 rounded-lg bg-gold text-sm text-masthead" onClick={runHypo}>Run hypothetical</button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button type="button" className="mobile-dock-reopen" onClick={() => setDockOpen(true)}>
            Open run card
          </button>
        )}
      </div>

      {showReport ? createPortal(<ReportView {...reportProps} />, document.body) : null}
      {pdfPick ? createPortal(
        <PdfSectionsDialog
          open
          details={details}
          onChange={(next) => setDetails(withScenarioDetails(next, insuranceLocked))}
          policyEnabled={policy.enabled}
          lockoutMode={insuranceLocked}
          showReciprocity={showReciprocity}
          advisorEmail={advisor.email.trim()}
          advisorName={advisor.name}
          clientReady={partyFilled(client)}
          attachAdvisor={attachAdvisor}
          onAttachAdvisorChange={setAttachAdvisor}
          filenamePreview={pdfFilename(state)}
          onCancel={() => setPdfPick(false)}
          onConfirm={runPdfDownload}
        />,
        document.body,
      ) : null}
      {pdfReady ? createPortal(
        <PdfReadyDialog
          open
          filename={pdfReady.filename}
          url={pdfReady.url}
          note={pdfReady.note}
          onContinue={() => {
            const next = pdfReady.next;
            URL.revokeObjectURL(pdfReady.url);
            setPdfReady(null);
            if (next === "contact") {
              setContactAsk(true);
            } else {
              resetAll();
              setSaveMsg("PDF saved. The form was reset.");
              window.setTimeout(() => setSaveMsg(""), 3500);
            }
          }}
        />,
        document.body,
      ) : null}
      {contactAsk ? createPortal(
        <ContactAskDialog
          open
          onYes={() => {
            setContactAsk(false);
            setContactForm(true);
          }}
          onNo={() => {
            setContactAsk(false);
            resetAll();
            setSaveMsg("PDF downloaded. The form was reset and not saved.");
            window.setTimeout(() => setSaveMsg(""), 3500);
          }}
        />,
        document.body,
      ) : null}
      {contactForm ? createPortal(
        <ContactRequestDialog
          key={`${contactDraft.name}-${contactDraft.email}-${contactDraft.state}`}
          open
          initial={contactDraft}
          onCancel={() => {
            setContactForm(false);
            resetAll();
            setSaveMsg("PDF downloaded. The form was reset and not saved.");
            window.setTimeout(() => setSaveMsg(""), 3500);
          }}
          onSent={(ok) => {
            setContactForm(false);
            resetAll();
            setSaveMsg(
              ok
                ? "Contact request sent to info@fundingltcmarketplace.com. The form was reset."
                : "PDF downloaded. The contact request could not be emailed from this environment.",
            );
            window.setTimeout(() => setSaveMsg(""), 4500);
          }}
        />,
        document.body,
      ) : null}
    </div>
  );
}

function SleeveLegend({ items }: { items: { name: string; value: number; color: string }[] }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <ul className="mt-3 grid grid-cols-1 gap-1.5 md:grid-cols-2">
      {items.map((s) => (
        <li key={s.name} className="flex min-w-0 items-start gap-2 text-xs text-navy">
          <span className="mt-0.5 inline-block size-2.5 shrink-0 rounded-sm" style={{ background: s.color }} aria-hidden />
          <span className="min-w-0 leading-snug">
            <span className="block truncate">{s.name}</span>
            <span className="tabular-nums text-muted">{money(s.value)} · {Math.round((s.value / total) * 100)}%</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function ViewFold({
  title,
  hint,
  checked,
  onPdf,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint: string;
  checked?: boolean;
  onPdf?: (on: boolean) => void;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 card-xl px-4 py-2">
      <TitleCollapse
        title={title}
        defaultOpen={defaultOpen}
        className="mt-0"
        hint={hint}
        pdfChecked={checked}
        onPdfChange={onPdf}
      >
        {children}
      </TitleCollapse>
    </div>
  );
}

function MoneyField({ id, value, onChange, compact }: { id: string; value: number; onChange: (raw: string) => void; compact?: boolean }) {
  return <StepperField id={id} value={value} onChange={onChange} step={1000} min={0} prefix="$" compact={compact} />;
}

const KPI_ORDER_KEY = "aum-kpi-order-v3";
const KPI_SELECTED_KEY = "aum-kpi-selected-v3";

const DEFAULT_READY_CARD_IDS = [
  "col-year",
  "combined-today",
  "col-cost",
  "dep-year",
  "col-total",
  "dep-cost",
  "dep-cost-cum",
  "dep-benefits-cum",
  "dep-copay",
];

const READY_DUP_FAMILIES: string[][] = [
  ["dep-benefits-cum", "cum-ins", "col-benefits-total"],
  ["dep-cost-cum", "cum-cost"],
  ["dep-copay", "cum-copay"],
  ["dep-shortfall", "cum-short", "end-short"],
  ["col-cost", "first-cost"],
  ["col-benefits", "col-benefits-cum"],
  ["dep-gap", "cum-gap"],
  ["col-year", "cum-through"],
  ["dep-assets", "end-assets"],
];

function sameReadyAmount(a: number | string | undefined, b: number | string | undefined) {
  if (a == null || b == null) return false;
  if (typeof a === "number" && typeof b === "number") return Math.round(a * 100) === Math.round(b * 100);
  return String(a) === String(b);
}

function loadKpiList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveKpiList(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

function sortKpis<T extends { id: string }>(items: T[], order: string[]): T[] {
  const pos = new Map(order.map((id, i) => [id, i]));
  return [...items].sort((a, b) => {
    const ai = pos.get(a.id);
    const bi = pos.get(b.id);
    if (ai == null && bi == null) return 0;
    if (ai == null) return 1;
    if (bi == null) return -1;
    return ai - bi;
  });
}

type HypoCardItem = {
  id: string;
  label: string;
  value: ReactNode;
  group: "column" | "depletion" | "cumulative" | "more";
  amount?: number | string;
};

function dropDuplicateReadyCards(items: HypoCardItem[]) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const drop = new Set<string>();
  for (const family of READY_DUP_FAMILIES) {
    const present = family.map((id) => byId.get(id)).filter((i): i is HypoCardItem => Boolean(i));
    if (present.length < 2) continue;
    const keep = present[0];
    for (const extra of present.slice(1)) {
      if (sameReadyAmount(keep.amount, extra.amount)) drop.add(extra.id);
    }
  }
  return items.filter((i) => !drop.has(i.id));
}

function MovableKpiGrid({
  items,
  captions,
}: {
  items: HypoCardItem[];
  captions?: { column?: string; depletion?: string; cumulative?: string; more?: string };
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<string | null>(null);

  useEffect(() => {
    const storedOrder = loadKpiList(KPI_ORDER_KEY);
    setOrder(storedOrder.length ? storedOrder : [...DEFAULT_READY_CARD_IDS]);
    const stored = localStorage.getItem(KPI_SELECTED_KEY);
    setSelected(stored ? loadKpiList(KPI_SELECTED_KEY) : null);
  }, []);

  const uniqueItems = useMemo(() => dropDuplicateReadyCards(items), [items]);
  const columnItems = useMemo(() => uniqueItems.filter((i) => i.group === "column"), [uniqueItems]);
  const depletionItems = useMemo(() => uniqueItems.filter((i) => i.group === "depletion"), [uniqueItems]);
  const cumulativeItems = useMemo(() => uniqueItems.filter((i) => i.group === "cumulative"), [uniqueItems]);
  const moreItems = useMemo(() => uniqueItems.filter((i) => i.group === "more"), [uniqueItems]);
  const defaultIds = useMemo(
    () => DEFAULT_READY_CARD_IDS.filter((id) => uniqueItems.some((i) => i.id === id)),
    [uniqueItems],
  );
  const chosen = selected ?? defaultIds;
  const visibleItems = useMemo(
    () => sortKpis(uniqueItems.filter((i) => chosen.includes(i.id)), order.length ? order : defaultIds),
    [uniqueItems, order, chosen, defaultIds],
  );

  function persistOrder(next: string[]) {
    setOrder(next);
    saveKpiList(KPI_ORDER_KEY, next);
  }

  function persistSelected(next: string[]) {
    setSelected(next);
    saveKpiList(KPI_SELECTED_KEY, next);
  }

  function toggle(id: string) {
    persistSelected(chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  }

  function resetView() {
    persistSelected(defaultIds);
    persistOrder(defaultIds);
  }

  function idNearest(x: number, y: number): string | null {
    const nodes = gridRef.current?.querySelectorAll("[data-kpi-id]");
    if (!nodes?.length) return null;
    let best: string | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    nodes.forEach((node) => {
      const id = node.getAttribute("data-kpi-id");
      if (!id || id === fromRef.current) return;
      const r = node.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2);
      const dy = y - (r.top + r.height / 2);
      const d = dx * dx + dy * dy;
      if (d < bestDist) {
        bestDist = d;
        best = id;
      }
    });
    return best;
  }

  function finish(x: number, y: number) {
    const from = fromRef.current;
    const over = idNearest(x, y);
    fromRef.current = null;
    setDragging(null);
    setOverId(null);
    if (!from || !over || from === over) return;
    const ids = visibleItems.map((i) => i.id);
    const next = ids.filter((id) => id !== from);
    const at = next.indexOf(over);
    next.splice(at < 0 ? next.length : at, 0, from);
    persistOrder(next);
  }

  function Chip({ item }: { item: HypoCardItem }) {
    const on = chosen.includes(item.id);
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => toggle(item.id)}
        className={`rounded-full border px-2.5 py-1 text-left text-[11px] leading-snug ${
          on ? "border-gold bg-gold text-masthead" : "border-line text-muted hover:border-navy hover:text-navy"
        }`}
      >
        {item.label}
      </button>
    );
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Beginning of the run</p>
      {captions?.column ? <p className="mt-1 text-xs text-muted">{captions.column}</p> : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {columnItems.map((item) => (
          <Chip key={item.id} item={item} />
        ))}
      </div>
      {depletionItems.length ? (
        <>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">End of the run</p>
          {captions?.depletion ? <p className="mt-1 text-xs text-muted">{captions.depletion}</p> : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {depletionItems.map((item) => (
              <Chip key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}
      {cumulativeItems.length ? (
        <>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Cumulative</p>
          {captions?.cumulative ? <p className="mt-1 text-xs text-muted">{captions.cumulative}</p> : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cumulativeItems.map((item) => (
              <Chip key={item.id} item={item} />
            ))}
          </div>
        </>
      ) : null}
      {moreItems.length ? (
        <>
          <div className="mt-3 border-t border-gold pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Other card options</p>
            {captions?.more ? <p className="mt-1 text-xs text-muted">{captions.more}</p> : null}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {moreItems.map((item) => (
                <Chip key={item.id} item={item} />
              ))}
            </div>
          </div>
        </>
      ) : null}
      <div className="mt-3 mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">Selected cards appear below. Drag to rearrange. × removes from this view.</p>
        <button
          type="button"
          className="rounded-lg border border-navy px-3 py-1.5 text-xs text-navy hover:bg-cream"
          onClick={resetView}
        >
          Reset cards to default
        </button>
      </div>
      <div ref={gridRef} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((item) => {
          const active = dragging === item.id;
          const over = overId === item.id && dragging && dragging !== item.id;
          return (
            <div
              key={item.id}
              data-kpi-id={item.id}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                if ((e.target as HTMLElement | null)?.closest("[data-kpi-remove]")) return;
                fromRef.current = item.id;
                setDragging(item.id);
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!fromRef.current) return;
                const overNext = idNearest(e.clientX, e.clientY);
                if (overNext !== overId) setOverId(overNext);
              }}
              onPointerUp={(e) => finish(e.clientX, e.clientY)}
              onPointerCancel={() => {
                fromRef.current = null;
                setDragging(null);
                setOverId(null);
              }}
              className={`card relative touch-none select-none px-4 py-3 pr-10 ${
                active ? "cursor-grabbing opacity-60" : "cursor-grab"
              } ${over ? "ring-2 ring-gold" : ""}`}
            >
              <button
                type="button"
                data-kpi-remove
                className="absolute right-1.5 top-1.5 inline-flex size-8 items-center justify-center rounded-md text-lg leading-none text-muted hover:bg-cream hover:text-navy"
                aria-label={`Remove ${item.label}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item.id);
                }}
              >
                ×
              </button>
              <p className="text-xs uppercase tracking-wide text-muted">{item.label}</p>
              <p className="font-display text-xl tabular-nums text-navy">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RedAmt({ children }: { children: ReactNode }) {
  return <span className="amt-red font-bold">{children}</span>;
}

function PartyFields({
  idPrefix,
  party,
  extra,
  onChange,
}: {
  idPrefix: string;
  party: ContactParty & { designation?: string; firm?: string };
  extra?: boolean;
  details?: DetailFlags;
  onPdfChange?: (id: DetailId, on: boolean) => void;
  onChange: (partial: Partial<AdvisorParty>) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-name`}>Name</label>
        <input id={`${idPrefix}-name`} className={fieldClass} value={party.name} autoComplete="name" onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      {extra ? (
        <>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-designation`}>Designation</label>
            <input id={`${idPrefix}-designation`} className={fieldClass} value={party.designation ?? ""} onChange={(e) => onChange({ designation: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor={`${idPrefix}-firm`}>Company or firm</label>
            <input id={`${idPrefix}-firm`} className={fieldClass} value={party.firm ?? ""} onChange={(e) => onChange({ firm: e.target.value })} />
          </div>
        </>
      ) : null}
      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor={`${idPrefix}-address`}>Address</label>
        <input id={`${idPrefix}-address`} className={fieldClass} value={party.address} autoComplete="street-address" onChange={(e) => onChange({ address: e.target.value })} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-state`}>State</label>
        <FieldPicker
          id={`${idPrefix}-state`}
          value={party.state}
          placeholder="Select…"
          options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
          onChange={(v) => onChange({ state: v })}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-zip`}>ZIP code</label>
        <input id={`${idPrefix}-zip`} className={fieldClass} autoComplete="postal-code" value={party.zip} onChange={(e) => onChange({ zip: e.target.value })} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-phone`}>Phone</label>
        <input id={`${idPrefix}-phone`} className={fieldClass} autoComplete="tel" value={party.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-email`}>Email</label>
        <input id={`${idPrefix}-email`} className={fieldClass} autoComplete="email" value={party.email} onChange={(e) => onChange({ email: e.target.value })} />
        {extra ? (
          <p className="mt-1 text-xs text-muted">
            If the end user’s contact is also on this run, a copy of the PDF is emailed to this address from info@fundingltcmarketplace.com.
          </p>
        ) : null}
      </div>
    </div>
  );
}
