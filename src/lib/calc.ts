import { annualCost, type CareSetting } from "./costs";

export type AssetKey =
  | "cash"
  | "savings"
  | "stocks"
  | "bonds"
  | "funds"
  | "ira"
  | "roth"
  | "home"
  | "invre"
  | "metals"
  | "annuity"
  | "life"
  | "other"
  | "excludable";

export const ASSET_FIELDS: { key: AssetKey; label: string }[] = [
  { key: "cash", label: "Cash / checking" },
  { key: "savings", label: "Savings / CDs / money market" },
  { key: "stocks", label: "Stocks / ETFs" },
  { key: "bonds", label: "Bonds" },
  { key: "funds", label: "Mutual funds" },
  { key: "ira", label: "IRA / 401(k) (tax-deferred)" },
  { key: "roth", label: "Roth IRA (tax-free)" },
  { key: "metals", label: "Precious metals" },
  { key: "annuity", label: "Deferred annuities (cash value, tax-deferred)" },
  { key: "life", label: "Life insurance cash value (tax-deferred)" },
  { key: "other", label: "Other investable assets" },
  { key: "invre", label: "Real Estate Investment" },
  { key: "home", label: "Primary residence equity" },
];

export type Assets = Record<AssetKey, number>;
export type AssetRois = Record<AssetKey, number>;

export const DEFAULT_ASSETS: Assets = {
  cash: 1000,
  savings: 500_000,
  stocks: 1000,
  bonds: 1000,
  funds: 1000,
  ira: 1000,
  roth: 1000,
  home: 1000,
  invre: 1000,
  metals: 1000,
  annuity: 1000,
  life: 1000,
  other: 1000,
  excludable: 0,
};

export const DEFAULT_ASSET_ROIS: AssetRois = {
  cash: 3,
  savings: 3,
  stocks: 3,
  bonds: 3,
  funds: 3,
  ira: 3,
  roth: 3,
  home: 3,
  invre: 3,
  metals: 3,
  annuity: 3,
  life: 3,
  other: 3,
  excludable: 0,
};

/** Draw copay in this order: liquid first, tax-deferred next, Roth last. */
export const DRAW_ORDER: AssetKey[] = [
  "cash",
  "savings",
  "stocks",
  "bonds",
  "funds",
  "metals",
  "other",
  "annuity",
  "life",
  "invre",
  "home",
  "ira",
  "roth",
];

export type Holding = {
  key: AssetKey;
  amount: number;
  roiPct: number;
  deferred: boolean;
};

export const DEFERRED_KEYS: AssetKey[] = ["ira", "annuity", "life"];
export const TAX_FREE_KEYS: AssetKey[] = ["roth"];

export function isDeferredAsset(key: AssetKey) {
  return DEFERRED_KEYS.includes(key);
}

export function isTaxFreeAsset(key: AssetKey) {
  return TAX_FREE_KEYS.includes(key);
}

export function isUntaxedGrowth(key: AssetKey) {
  return isDeferredAsset(key) || isTaxFreeAsset(key);
}

export function holdingsFrom(
  assets: Assets,
  rois: AssetRois,
  excludeHome = false,
): Holding[] {
  return ASSET_FIELDS.filter((f) => !(excludeHome && f.key === "home")).map((f) => ({
    key: f.key,
    amount: Math.max(0, Number(assets[f.key]) || 0),
    roiPct: Number(rois[f.key]) || 0,
    deferred: isUntaxedGrowth(f.key),
  }));
}

export function weightedRoiPct(holdings: Holding[], deferred?: boolean) {
  const slice = holdings.filter((h) =>
    deferred == null ? true : deferred ? h.deferred : !h.deferred,
  );
  const w = slice.reduce((s, h) => s + h.amount, 0);
  if (w <= 0) return 0;
  return slice.reduce((s, h) => s + h.amount * h.roiPct, 0) / w;
}

function cloneHoldings(hs: Holding[]): Holding[] {
  return hs.map((h) => ({ ...h }));
}

function sumHoldings(hs: Holding[]) {
  return hs.reduce((s, h) => s + Math.max(0, h.amount), 0);
}

/** Spendable value if deferred IRA / annuity / life cash value were taxed at taxRate. */
export function afterTaxHoldingsValue(hs: Holding[], taxRate: number) {
  const t = Math.min(1, Math.max(0, Number(taxRate) || 0));
  return hs.reduce((s, h) => {
    const a = Math.max(0, h.amount);
    return s + (h.deferred ? a * (1 - t) : a);
  }, 0);
}

function iraAmount(hs: Holding[]) {
  return hs.find((h) => h.key === "ira")?.amount ?? 0;
}

function drawFromHoldings(hs: Holding[], need: number) {
  let left = need;
  for (const key of DRAW_ORDER) {
    if (left <= 0) break;
    const h = hs.find((x) => x.key === key);
    if (!h || h.amount <= 0) continue;
    const take = Math.min(h.amount, left);
    h.amount -= take;
    left -= take;
  }
  return need - left;
}

function growHoldings(hs: Holding[], taxRate: number) {
  for (const h of hs) {
    const gross = (Number(h.roiPct) || 0) / 100;
    const net = h.deferred ? gross : gross * (1 - taxRate);
    h.amount = Math.max(0, h.amount * (1 + net));
  }
}

export function poolTotal(assets: Assets, excludeHome = false) {
  return ASSET_FIELDS.reduce((sum, f) => {
    if (excludeHome && f.key === "home") return sum;
    return sum + (Number(assets[f.key]) || 0);
  }, 0);
}

export type InflationMethod = "none" | "compound" | "simple";
export type PolicyKind = "traditional" | "assetBased" | "ltcAnnuity" | "hybridLife";
export const LINKED_KINDS: PolicyKind[] = ["assetBased", "ltcAnnuity", "hybridLife"];

export function isLinkedKind(kind: PolicyKind) {
  return LINKED_KINDS.includes(kind);
}

export function policyKindLabel(kind: PolicyKind) {
  if (kind === "assetBased") return "Asset-based single premium";
  if (kind === "ltcAnnuity") return "Long-term care annuity";
  if (kind === "hybridLife") return "Hybrid life insurance";
  return "Traditional reimbursement";
}
export type CsvSchedule = "7" | "10" | "none";

export type CsvProjection = {
  enabled: boolean;
  schedule: CsvSchedule;
  creditPct: number;
  today: number;
  y5: number;
  y10: number;
  y20: number;
  atClaim: number;
  atEnd: number;
};

export const DEFAULT_CSV: CsvProjection = {
  enabled: false,
  schedule: "7",
  creditPct: 0,
  today: 0,
  y5: 0,
  y10: 0,
  y20: 0,
  atClaim: 0,
  atEnd: 0,
};

export const CDSC_7 = [0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01];
export const CDSC_10 = [0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01];

export type LtcPolicy = {
  enabled: boolean;
  kind: PolicyKind;
  dailyBenefit: number;
  benefitYears: number;
  elimDays: number;
  benefitInflationPct: number;
  inflationMethod: InflationMethod;
  annualPremium: number;
  singlePremium: number;
  monthlyBenefit: number;
  leverage: number;
  residualPct: number;
  csv: CsvProjection;
};

export const DAILY_BENEFIT_MIN = 150;
export const DAILY_BENEFIT_MAX = 800;
export const DAILY_BENEFIT_STEP = 10;
export const ASSET_BASED_MONTHLY_PCT = 0.02;
export const LINKED_MONTHLY_MIN = 3000;
export const LINKED_MONTHLY_STEP = 1000;

/** Face / specified amount needed so monthly LTC = 2% of face (common hybrid-life design). */
export function hybridFaceForMonthly(
  monthly: number,
  monthlyPct = ASSET_BASED_MONTHLY_PCT,
) {
  if (!monthly || monthlyPct <= 0) return 0;
  return Math.round(monthly / monthlyPct);
}

export function specifiedFaceAmount(policy: LtcPolicy) {
  if (policy.kind === "hybridLife" && policy.monthlyBenefit > 0) {
    return hybridFaceForMonthly(policy.monthlyBenefit);
  }
  return Math.max(0, policy.singlePremium);
}

export function clampDailyBenefit(n: number) {
  if (!Number.isFinite(n) || n <= 0) return DAILY_BENEFIT_MIN;
  const stepped = Math.round(n / DAILY_BENEFIT_STEP) * DAILY_BENEFIT_STEP;
  return Math.min(DAILY_BENEFIT_MAX, Math.max(DAILY_BENEFIT_MIN, stepped));
}

/** Milliman 2024 stand-alone sales mix + DRA Partnership inflation age bands. Not a quote. */
export const TYPICAL_DAILY_FROM_MONTHLY = 178; // $5,428/mo ÷ 365
export const TYPICAL_MONTHLY_MAX = 5000; // $5,428 rounded to $1,000
export const TYPICAL_BENEFIT_YEARS = 3; // 55.1% of 2024 sales
export const TYPICAL_ELIM_DAYS = 90; // 89.8% of 2024 sales

export type TypicalAgeBand = "under 61" | "61–75" | "76+";

export function typicalAgeBand(ageToday: number): TypicalAgeBand | null {
  const age = Math.round(Number(ageToday) || 0);
  if (age < 18) return null;
  if (age >= 76) return "76+";
  if (age >= 61) return "61–75";
  return "under 61";
}

/** Five-year Age Today band used to source the Section 3 mix (e.g. 69 → 65–69). */
export function fiveYearIssueBand(ageToday: number): string | null {
  const age = Math.round(Number(ageToday) || 0);
  if (age < 18) return null;
  if (age < 40) return age < 30 ? "18–29" : "30–39";
  if (age >= 80) return "80+";
  const lo = Math.floor(age / 5) * 5;
  return `${lo}–${lo + 4}`;
}

/** Milliman 2024 stand-alone buyer mix is published in these decade groups only. */
export function millimanDecadeGroup(ageToday: number): { label: string; share: string } | null {
  const age = Math.round(Number(ageToday) || 0);
  if (age < 18) return null;
  if (age < 30) return { label: "18–29", share: "1.3%" };
  if (age < 40) return { label: "30–39", share: "3.5%" };
  if (age < 50) return { label: "40–49", share: "9.6%" };
  if (age < 60) return { label: "50–59", share: "27.2%" };
  if (age < 70) return { label: "60–69", share: "44.1%" };
  return { label: "70+", share: "about 14%" };
}

/** Nearest AALTCI 2026 Price Index published age (55 / 60 / 65 only). */
export function aaltciNearestAge(ageToday: number): 55 | 60 | 65 | null {
  const band = fiveYearIssueBand(ageToday);
  if (band === "50–54" || band === "55–59") return 55;
  if (band === "60–64") return 60;
  if (band === "65–69") return 65;
  return null;
}

export function typicalPurchaseForAge(ageToday: number): Pick<
  LtcPolicy,
  | "dailyBenefit"
  | "benefitYears"
  | "elimDays"
  | "benefitInflationPct"
  | "inflationMethod"
  | "monthlyBenefit"
> {
  const dailyBenefit = clampDailyBenefit(TYPICAL_DAILY_FROM_MONTHLY);
  const base = {
    dailyBenefit,
    benefitYears: TYPICAL_BENEFIT_YEARS,
    elimDays: TYPICAL_ELIM_DAYS,
    monthlyBenefit: TYPICAL_MONTHLY_MAX,
  };
  const band = typicalAgeBand(ageToday);
  if (band === "76+") {
    return { ...base, benefitInflationPct: 0, inflationMethod: "none" as const };
  }
  return { ...base, benefitInflationPct: 3, inflationMethod: "compound" as const };
}

export function typicalInflationWhy(ageToday: number) {
  const band = typicalAgeBand(ageToday);
  if (band === "under 61") {
    return "DRA Partnership requires compound inflation at issue ages under 61. Among 2024 stand-alone automatic-increase riders, 3% compound is the mode (17.4%). About 58% of 2024 sales used a future purchase option instead; this model has no FPO field, so 3% compound is the planning default.";
  }
  if (band === "61–75") {
    return "DRA Partnership requires some inflation at 61–75 (compound, simple, CPI, or FPO). 3% compound is the automatic-increase default here. Most 2024 sales used FPO, which is not a field in this model.";
  }
  if (band === "76+") {
    return "DRA Partnership makes inflation optional at 76+. Mean claim age in AALTCI’s 2024 sample is 81, so the growth runway is short. Default is level (today’s values).";
  }
  return "";
}

export function typicalPurchaseNote(ageToday: number) {
  const t = typicalPurchaseForAge(ageToday);
  const inf =
    t.inflationMethod === "none" || t.benefitInflationPct <= 0
      ? "level (today’s values)"
      : `${t.benefitInflationPct}% ${t.inflationMethod}`;
  const five = fiveYearIssueBand(ageToday);
  const mill = millimanDecadeGroup(ageToday);
  return `Planning default for the ${five} band: about $${t.dailyBenefit}/day, ${t.benefitYears}-year period, ${t.elimDays}-day wait, ${inf}. Daily, period, and wait use the overall 2024 sales mix (Milliman does not publish those inside ${five}). Buyer volume for this band is sourced from Milliman’s ${mill?.label} group (${mill?.share} of 2024 stand-alone sales). Inflation still follows the Partnership issue-age rule (${typicalAgeBand(ageToday)}). Change any field to override.`;
}

export function typicalBuyerHints(ageToday: number) {
  const t = typicalPurchaseForAge(ageToday);
  const inf =
    t.inflationMethod === "none" || t.benefitInflationPct <= 0
      ? "level (today’s values)"
      : `${t.benefitInflationPct}% ${t.inflationMethod}`;
  const band = fiveYearIssueBand(ageToday) ?? "your age";
  const lead = `Based on industry average at your age bracket (${band}), most buyers are selecting`;
  return {
    lead,
    daily: `$${t.dailyBenefit}`,
    dailyRest: " daily benefit amounts",
    monthly: `$${Math.round((t.dailyBenefit * 365) / 12)}`,
    monthlyRest: " monthly.",
    inflation: inf,
    period: `${t.benefitYears}-year`,
    elim: `${t.elimDays}-day`,
  };
}

export const DEFAULT_LINKED_SINGLE_PREMIUM = 100_000;

export const DEFAULT_POLICY: LtcPolicy = {
  enabled: true,
  kind: "traditional",
  ...typicalPurchaseForAge(60),
  annualPremium: 0,
  singlePremium: DEFAULT_LINKED_SINGLE_PREMIUM,
  leverage: 1,
  residualPct: 10,
  csv: { ...DEFAULT_CSV },
};

/** Defaults shown when Hybrid life insurance is selected. */
export const DEFAULT_HYBRID_LIFE = {
  monthlyBenefit: TYPICAL_MONTHLY_MAX,
  leverage: 3,
  singlePremium: DEFAULT_LINKED_SINGLE_PREMIUM,
  elimDays: TYPICAL_ELIM_DAYS,
  residualPct: 10,
  benefitInflationPct: 0,
  inflationMethod: "none" as const,
} as const;

export const STRUCTURE_OPTIONS: { key: PolicyKind; label: string }[] = [
  { key: "traditional", label: "Traditional reimbursement" },
  { key: "assetBased", label: "Asset-based single premium" },
  { key: "ltcAnnuity", label: "Long-term care annuity" },
  { key: "hybridLife", label: "Hybrid life insurance" },
];

export type StructureFlags = Record<PolicyKind, boolean>;

export function seedKindPolicy(
  kind: PolicyKind,
  typical: ReturnType<typeof typicalPurchaseForAge>,
  annualPremium = 0,
): LtcPolicy {
  const linked = kind !== "traditional";
  return {
    ...DEFAULT_POLICY,
    ...typical,
    enabled: true,
    kind,
    annualPremium: kind === "traditional" ? annualPremium : 0,
    singlePremium: linked ? DEFAULT_LINKED_SINGLE_PREMIUM : 0,
    leverage: linked ? DEFAULT_HYBRID_LIFE.leverage : 1,
    monthlyBenefit: Math.max(
      LINKED_MONTHLY_MIN,
      typical.monthlyBenefit || monthlyFromDaily(typical.dailyBenefit),
    ),
    elimDays: linked ? DEFAULT_HYBRID_LIFE.elimDays : typical.elimDays,
    residualPct: DEFAULT_HYBRID_LIFE.residualPct,
    benefitInflationPct: linked ? DEFAULT_HYBRID_LIFE.benefitInflationPct : typical.benefitInflationPct,
    inflationMethod: linked ? DEFAULT_HYBRID_LIFE.inflationMethod : typical.inflationMethod,
    csv: { ...DEFAULT_CSV },
  };
}

export function seedKindBook(
  typical: ReturnType<typeof typicalPurchaseForAge>,
  annualPremium = 0,
): Record<PolicyKind, LtcPolicy> {
  return {
    traditional: seedKindPolicy("traditional", typical, annualPremium),
    assetBased: seedKindPolicy("assetBased", typical, annualPremium),
    ltcAnnuity: seedKindPolicy("ltcAnnuity", typical, annualPremium),
    hybridLife: seedKindPolicy("hybridLife", typical, annualPremium),
  };
}

export const DEFAULT_STRUCTURE_FLAGS: StructureFlags = {
  traditional: true,
  assetBased: false,
  ltcAnnuity: false,
  hybridLife: false,
};

/** Build a runnable policy for a comparison lane. Active kind uses this run; other linked kinds use planning defaults so the row is not $0. */
export function policyForCompareLane(
  kind: PolicyKind,
  current: LtcPolicy,
  countable: number,
): LtcPolicy {
  if (kind === current.kind) return { ...current, enabled: true, kind };
  if (kind === "traditional") {
    return { ...current, enabled: true, kind: "traditional" };
  }
  const monthly =
    current.monthlyBenefit > 0 ? current.monthlyBenefit : DEFAULT_HYBRID_LIFE.monthlyBenefit;
  const leverage = current.leverage > 1 ? current.leverage : DEFAULT_HYBRID_LIFE.leverage;
  const residual =
    current.residualPct > 0 ? current.residualPct : DEFAULT_HYBRID_LIFE.residualPct;
  const face = hybridFaceForMonthly(monthly);
  const deposit =
    current.singlePremium > 0
      ? current.singlePremium
      : DEFAULT_LINKED_SINGLE_PREMIUM;
  return {
    ...current,
    enabled: true,
    kind,
    monthlyBenefit: monthly,
    leverage,
    residualPct: residual,
    singlePremium: deposit,
    elimDays: current.elimDays || DEFAULT_HYBRID_LIFE.elimDays,
    benefitInflationPct: DEFAULT_HYBRID_LIFE.benefitInflationPct,
    inflationMethod: DEFAULT_HYBRID_LIFE.inflationMethod,
  };
}

export function leverageLabel(n: number) {
  if (!n || n <= 1) return "None — face only (no extension)";
  if (n === 2) return "2× (face + one extension)";
  if (n === 3) return "3× (common planning)";
  if (n === 4) return "4× (younger / stronger underwriting)";
  return `${n}×`;
}

export function monthlyFromDaily(daily: number) {
  return (daily * 365) / 12;
}

export function dailyFromMonthly(monthly: number) {
  return (monthly * 12) / 365;
}

export function inflateDaily(
  daily: number,
  yearsElapsed: number,
  pct: number,
  method: InflationMethod,
) {
  if (pct <= 0 || method === "none" || yearsElapsed <= 0) return daily;
  if (method === "simple") return daily * (1 + (pct / 100) * yearsElapsed);
  return daily * Math.pow(1 + pct / 100, yearsElapsed);
}

export const TARGET_PREMIUM_RATE = 0.025;
export const TARGET_INCOME_RATE = 0.07;
export const TARGET_PREMIUM_LABEL =
  "Target premium is only a suggestion based on a percentage of countable assets. Individual premiums or rates vary and may be higher or lower based on state of issue, age, marital status, underwriting & rate class, benefit selection and/or added riders.";
export const TARGET_PREMIUM_FORMULA =
  "A long-term care insurance premium funding formula of 2.5% of countable assets or 7% of fixed income (max for traditional long-term care insurance).";

export function targetPremium(countableAssets: number, annualIncome = 0) {
  return targetPremiumParts(countableAssets, annualIncome).suggested;
}

export function targetPremiumParts(countableAssets: number, annualIncome = 0) {
  const n = Number(countableAssets);
  const fromAssets = !Number.isFinite(n) || n <= 0 ? 0 : Math.round(n * TARGET_PREMIUM_RATE);
  const fromIncome =
    Number(annualIncome) > 0 ? Math.round(Number(annualIncome) * TARGET_INCOME_RATE) : 0;
  const suggested =
    fromIncome > 0 ? Math.min(fromAssets, fromIncome) : fromAssets;
  return {
    fromAssets,
    fromIncome,
    suggested,
    limitedBy: fromIncome > 0 && fromIncome < fromAssets ? ("income" as const) : ("assets" as const),
  };
}

export function netRoiPct(grossPct: number, taxRatePct: number) {
  const g = Number(grossPct) || 0;
  const t = Math.min(100, Math.max(0, Number(taxRatePct) || 0)) / 100;
  return g * (1 - t);
}

/** Principal whose annual return at roiPct equals the premium (interest-only funding). */
export function premiumFundingCapital(premium: number, roiPct: number) {
  const p = Math.max(0, Number(premium) || 0);
  const r = Number(roiPct) || 0;
  if (p <= 0 || r <= 0) return null;
  return p / (r / 100);
}

export function isLifetimeBenefit(years: number) {
  return years >= 50;
}

export function isAssetBased(policy: LtcPolicy) {
  return policy.enabled && isLinkedKind(policy.kind);
}

export function assetBasedLtcPool(policy: LtcPolicy) {
  return specifiedFaceAmount(policy) * policy.leverage;
}

export function assetBasedMonthlyCap(singlePremium: number, monthlyBenefit = 0) {
  if (monthlyBenefit > 0) return monthlyBenefit;
  return Math.max(0, singlePremium) * ASSET_BASED_MONTHLY_PCT;
}

export function benefitPoolAtPurchase(policy: LtcPolicy): number | null {
  if (!policy.enabled) return 0;
  if (isLinkedKind(policy.kind)) return assetBasedLtcPool(policy);
  if (isLifetimeBenefit(policy.benefitYears)) return null;
  return policy.dailyBenefit * 365 * policy.benefitYears;
}

function cdscRate(schedule: CsvSchedule, yearsElapsed: number) {
  const table = schedule === "10" ? CDSC_10 : schedule === "7" ? CDSC_7 : [];
  if (!table.length) return 0;
  const i = Math.max(0, Math.floor(yearsElapsed));
  return table[i] ?? 0;
}

export function cashSurrenderValue(
  premium: number,
  yearsElapsed: number,
  schedule: CsvSchedule,
  creditPct = 0,
) {
  const account = premium * Math.pow(1 + Math.max(0, creditPct) / 100, Math.max(0, yearsElapsed));
  return Math.round(account * (1 - cdscRate(schedule, yearsElapsed)));
}

/** First modeled year that is a care year. Delay 10 → year 10 (not 11). Delay 0 → year 1. */
export function careStartYear(delay: number) {
  return delay <= 0 ? 1 : Math.round(delay);
}

export function careEndYear(delay: number, duration: number) {
  return careStartYear(delay) + Math.max(1, Math.round(duration)) - 1;
}

/**
 * How many year-by-year rows to produce.
 * Covers the wait until claim plus every care year — never a 10-year cap.
 * Age 40, 41 years to claim, 10 years of care → 52 modeled years.
 */
export function projectionHorizon(delay: number, duration: number) {
  const careEnd = careEndYear(delay, duration);
  const wait = Math.max(0, Math.round(Number(delay) || 0));
  const careYears = Math.max(1, Math.round(Number(duration) || 0));
  const span = wait + careYears + (wait > 0 ? 1 : 0);
  return Math.max(careEnd, span, 10);
}

/** Thin out chart year labels so a 40–60 year run stays readable. */
export function chartTickInterval(pointCount: number, compact = false) {
  const target = compact ? 8 : 12;
  if (pointCount <= target) return compact ? 1 : 0;
  return Math.max(1, Math.ceil(pointCount / target) - 1);
}

export function csvMilestones(
  premium: number,
  csv: CsvProjection,
  delay: number,
  duration: number,
) {
  if (!csv.enabled) {
    return { today: 0, y5: 0, y10: 0, y20: 0, atClaim: 0, atEnd: 0 };
  }
  if (csv.schedule === "none") {
    return {
      today: csv.today,
      y5: csv.y5,
      y10: csv.y10,
      y20: csv.y20,
      atClaim: csv.atClaim,
      atEnd: csv.atEnd,
    };
  }
  const r = csv.creditPct;
  return {
    today: cashSurrenderValue(premium, 0, csv.schedule, r),
    y5: cashSurrenderValue(premium, 5, csv.schedule, r),
    y10: cashSurrenderValue(premium, 10, csv.schedule, r),
    y20: cashSurrenderValue(premium, 20, csv.schedule, r),
    atClaim: cashSurrenderValue(premium, delay, csv.schedule, r),
    atEnd: cashSurrenderValue(premium, careEndYear(delay, duration), csv.schedule, r),
  };
}

export function dailyCareCost(annual: number) {
  return annual / 365;
}

export function daysFundsLast(pool: number, annualCost: number) {
  if (annualCost <= 0) return Number.POSITIVE_INFINITY;
  return (pool / annualCost) * 365;
}

export function daysFundsLastWithInsurance(assets: number, insPool: number, annualCost: number) {
  return daysFundsLast(assets + insPool, annualCost);
}

export function copayPerDay(annualCost: number, annualIns: number) {
  return Math.max(0, (annualCost - annualIns) / 365);
}

export function yearsPoolLasts(pool: number, annualCost: number) {
  if (annualCost <= 0) return Number.POSITIVE_INFINITY;
  if (pool <= 0) return 0;
  return pool / annualCost;
}

export function formatDaysLast(days: number) {
  if (!Number.isFinite(days)) return "Lifetime / not depleted";
  if (days <= 0) return "0 days";
  if (days < 365) return `${days.toFixed(1)} days`;
  return `${(days / 365).toFixed(2)} years (${Math.round(days)} days)`;
}

export function formatYearsLast(years: number) {
  if (!Number.isFinite(years)) return "Lifetime / not depleted";
  if (years <= 0) return "0 years";
  if (years < 1) return formatDaysLast(years * 365);
  return `${years.toFixed(2)} years`;
}

export type YearRow = {
  year: number;
  status: "Accumulation" | "Care year" | "After care";
  cost: number;
  insurance: number;
  insurancePaid: number;
  insuranceCumulative: number;
  premium: number;
  drawn: number;
  remaining: number;
  remainingNet: number;
  remainingNetStart: number;
  shortfall: number;
  gapAfterInsurance: number;
  shortfallCumulative: number;
  dailyBenefitThen: number;
  insurancePoolStart: number;
  insurancePoolRemaining: number;
  remainingTaxable: number;
  remainingIra: number;
  payPath: string;
  claimPhase: string;
  costCumulative: number;
  drawnCumulative: number;
};

export type Projection = {
  rows: YearRow[];
  startPool: number;
  startPoolNet: number;
  firstCost: number;
  firstInsurance: number;
  firstDailyBenefit: number;
  endPool: number;
  shortfallTotal: number;
  insuranceTotal: number;
  premiumTotal: number;
  depletedYear: number | null;
  shortfallStartYear: number | null;
  lifetimeBenefit: boolean;
  benefitPoolAtPurchase: number | null;
  benefitPoolAtClaim: number | null;
  residualDeathBenefit: number;
  heirsTotal: number;
  singlePremiumPaid: number;
};

export function project(opts: {
  pool: number;
  state: string;
  setting: CareSetting;
  delay: number;
  duration: number;
  cpiPct: number;
  roiPct: number;
  policy: LtcPolicy;
  taxRatePct?: number;
  iraBalance?: number;
  iraRoiPct?: number;
  holdings?: Holding[];
}): Projection {
  const cpi = opts.cpiPct / 100;
  const taxRate = Math.min(100, Math.max(0, Number(opts.taxRatePct) || 0)) / 100;
  const base = annualCost(opts.state, opts.setting);
  const hybrid = isAssetBased(opts.policy);
  const iraStart = Math.max(0, Number(opts.iraBalance) || 0);
  const holdings = opts.holdings?.length
    ? cloneHoldings(opts.holdings)
    : [
        {
          key: "other" as AssetKey,
          amount: Math.max(0, opts.pool - iraStart),
          roiPct: opts.roiPct,
          deferred: false,
        },
        {
          key: "ira" as AssetKey,
          amount: Math.min(iraStart, Math.max(0, opts.pool)),
          roiPct: opts.iraRoiPct ?? opts.roiPct,
          deferred: true,
        },
      ];
  let singlePaid = 0;
  let dollarPool = 0;
  let monthlyCapBase = 0;
  if (hybrid) {
    const want = Math.max(0, opts.policy.singlePremium);
    singlePaid = drawFromHoldings(holdings, want);
    const face = specifiedFaceAmount({ ...opts.policy, enabled: true });
    dollarPool = face * opts.policy.leverage;
    monthlyCapBase = assetBasedMonthlyCap(face, opts.policy.monthlyBenefit);
  }

  const rows: YearRow[] = [];
  let firstCost = 0;
  let firstInsurance = 0;
  let firstDailyBenefit = hybrid
    ? (monthlyCapBase * 12) / 365
    : opts.policy.dailyBenefit;
  let startPool = sumHoldings(holdings);
  let startPoolNet = afterTaxHoldingsValue(holdings, taxRate);
  let shortfallTotal = 0;
  let insuranceTotal = 0;
  let costTotal = 0;
  let drawnTotal = 0;
  let premiumTotal = hybrid ? singlePaid : 0;
  const careStart = careStartYear(opts.delay);
  const careEnd = careEndYear(opts.delay, opts.duration);
  const horizon = projectionHorizon(opts.delay, opts.duration);
  const lifetime = !hybrid && opts.policy.benefitYears >= 50;
  let tradPool =
    opts.policy.enabled && !hybrid && !lifetime
      ? opts.policy.dailyBenefit * 365 * opts.policy.benefitYears
      : 0;
  let benefitPoolAtClaim: number | null = null;
  let priorAccrual = 0;
  let poolAtCareEnd: number | null = null;

  for (let y = 1; y <= horizon; y++) {
    growHoldings(holdings, taxRate);
    let p = sumHoldings(holdings);
    const inCare = y >= careStart && y <= careEnd;
    const yearsElapsed = y - 1;
    let premium = 0;
    if (
      !hybrid &&
      !inCare &&
      y < careStart &&
      opts.policy.enabled &&
      opts.policy.annualPremium > 0
    ) {
      premium = opts.policy.annualPremium;
      const paid = drawFromHoldings(holdings, premium);
      premiumTotal += paid;
      p = sumHoldings(holdings);
    }
    if (hybrid && y === 1) premium = singlePaid;

    const cost = inCare ? base * Math.pow(1 + cpi, Math.max(0, y - 1)) : 0;
    let dailyThen = 0;
    let insurance = 0;
    let poolStart = 0;
    let poolBeforeDraw = 0;

    if (hybrid) {
      const monthlyThen = inflateDaily(
        monthlyCapBase,
        yearsElapsed,
        opts.policy.benefitInflationPct,
        opts.policy.inflationMethod,
      );
      dailyThen = (monthlyThen * 12) / 365;
      poolStart = dollarPool;
      poolBeforeDraw = dollarPool;
      if (inCare && dollarPool > 0 && cost > 0) {
        const annualCap = monthlyThen * 12;
        insurance = Math.min(cost, annualCap, dollarPool);
        dollarPool -= insurance;
      }
    } else {
      dailyThen = inflateDaily(
        opts.policy.dailyBenefit,
        yearsElapsed,
        opts.policy.benefitInflationPct,
        opts.policy.inflationMethod,
      );
      const dailyPrev =
        yearsElapsed <= 0
          ? opts.policy.dailyBenefit
          : inflateDaily(
              opts.policy.dailyBenefit,
              yearsElapsed - 1,
              opts.policy.benefitInflationPct,
              opts.policy.inflationMethod,
            );
      if (opts.policy.enabled && !lifetime) {
        if (!inCare && y < careStart) {
          tradPool = dailyThen * 365 * opts.policy.benefitYears;
        } else if (inCare && dailyPrev > 0 && dailyThen !== dailyPrev) {
          tradPool *= dailyThen / dailyPrev;
        }
      }
      poolStart = lifetime ? 0 : tradPool;
      poolBeforeDraw = poolStart;
      if (inCare && opts.policy.enabled && cost > 0 && (lifetime || tradPool > 0)) {
        const annualCap = dailyThen * 365;
        insurance = Math.min(cost, annualCap, lifetime ? Number.POSITIVE_INFINITY : tradPool);
        if (!lifetime) tradPool = Math.max(0, tradPool - insurance);
      }
    }

    if (y === careStart) {
      startPool = sumHoldings(holdings);
      startPoolNet = afterTaxHoldingsValue(holdings, taxRate);
      firstCost = cost;
      firstInsurance = insurance;
      firstDailyBenefit = dailyThen;
      benefitPoolAtClaim = opts.policy.enabled
        ? hybrid
          ? poolBeforeDraw
          : lifetime
            ? null
            : poolBeforeDraw
        : 0;
    }

    const gapAfterInsurance = Math.max(0, cost - insurance);
    const netStart = afterTaxHoldingsValue(holdings, taxRate);
    const copay = gapAfterInsurance > 0 ? drawFromHoldings(holdings, gapAfterInsurance) : 0;
    const short = Math.max(0, gapAfterInsurance - copay);
    p = sumHoldings(holdings);
    const remainingNet = afterTaxHoldingsValue(holdings, taxRate);
    const ira = iraAmount(holdings);
    const taxable = Math.max(0, p - ira);
    shortfallTotal += short;
    insuranceTotal += insurance;
    costTotal += cost;
    drawnTotal += copay;

    let payPath = "";
    let claimPhase = "";
    if (inCare && cost > 0) {
      if (opts.policy.enabled && insurance > 0 && copay > 0) {
        payPath = "Insurance first, then assets";
      } else if (opts.policy.enabled && insurance > 0) {
        payPath = "Insurance pays first";
      } else if (copay > 0) {
        payPath = opts.policy.enabled
          ? "Asset co-pay (insurance did not cover)"
          : "Assets drawn";
      } else if (short > 0) {
        payPath = "Unpaid — no funds left";
      }
    }
    if (hybrid && insurance > 0) {
      if (opts.policy.kind === "hybridLife") {
        const paidBefore = Math.max(0, insuranceTotal - insurance);
        const face = specifiedFaceAmount({ ...opts.policy, enabled: true });
        const accelThis = Math.max(0, Math.min(insurance, Math.max(0, face - paidBefore)));
        const eobThis = Math.max(0, insurance - accelThis);
        claimPhase =
          eobThis > 0 && accelThis > 0
            ? "Acceleration, then extension of benefits"
            : eobThis > 0
              ? "Extension of benefits"
              : "Death-benefit acceleration";
      } else if (opts.policy.kind === "ltcAnnuity") {
        claimPhase = "Annuity LTC indemnity";
      } else {
        claimPhase = "Linked-benefit LTC";
      }
    }

    const poolLeft = hybrid
      ? dollarPool
      : opts.policy.enabled && !lifetime
        ? Math.max(0, tradPool)
        : 0;
    const exhausted = Boolean(inCare && opts.policy.enabled && !lifetime && poolLeft <= 0);
    const insurancePaid = inCare ? (exhausted ? 0 : priorAccrual) : 0;
    if (inCare) priorAccrual = insurance;

    rows.push({
      year: y,
      status: inCare ? "Care year" : y > careEnd ? "After care" : "Accumulation",
      cost,
      insurance,
      insurancePaid,
      insuranceCumulative: insuranceTotal,
      premium,
      drawn: copay,
      remaining: p,
      remainingNet,
      remainingNetStart: netStart,
      shortfall: short,
      gapAfterInsurance,
      shortfallCumulative: shortfallTotal,
      dailyBenefitThen: opts.policy.enabled ? dailyThen : 0,
      insurancePoolStart: opts.policy.enabled && !lifetime ? poolStart : 0,
      insurancePoolRemaining: poolLeft,
      remainingTaxable: taxable,
      remainingIra: ira,
      payPath,
      claimPhase,
      costCumulative: costTotal,
      drawnCumulative: drawnTotal,
    });
    if (y === careEnd) poolAtCareEnd = p;
  }

  const depletedYear = !opts.policy.enabled
    ? (rows.find((r) => r.remaining <= 0)?.year ?? null)
    : lifetime
      ? rows.some((r) => r.status === "Care year" && r.remaining <= 0)
        ? careEnd
        : null
      : (rows.find((r) => r.remaining <= 0 && r.insurancePoolRemaining <= 0)?.year ?? null);
  const shortfallStartYear = rows.find((r) => r.shortfall > 0)?.year ?? null;
  const face = hybrid ? specifiedFaceAmount({ ...opts.policy, enabled: true }) : 0;
  const ltcPaidFromBucket = hybrid ? face * opts.policy.leverage - dollarPool : 0;
  const endPool = poolAtCareEnd ?? sumHoldings(holdings);
  let residualDeathBenefit = 0;
  if (hybrid) {
    const residualBase = opts.policy.kind === "hybridLife" ? face : singlePaid;
    const floor = residualBase * (opts.policy.residualPct / 100);
    if (opts.policy.kind === "hybridLife") {
      residualDeathBenefit = Math.max(floor, Math.max(0, face - ltcPaidFromBucket));
    } else if (opts.policy.kind === "ltcAnnuity") {
      residualDeathBenefit = Math.max(
        floor,
        dollarPool / Math.max(1, opts.policy.leverage),
      );
    } else {
      residualDeathBenefit = Math.max(floor, Math.max(0, singlePaid - ltcPaidFromBucket));
    }
  }

  return {
    rows,
    startPool,
    startPoolNet,
    firstCost,
    firstInsurance,
    firstDailyBenefit,
    endPool,
    shortfallTotal,
    insuranceTotal,
    premiumTotal,
    depletedYear,
    shortfallStartYear,
    lifetimeBenefit: Boolean(opts.policy.enabled && lifetime),
    benefitPoolAtPurchase: benefitPoolAtPurchase(
      hybrid ? { ...opts.policy, singlePremium: singlePaid } : opts.policy,
    ),
    benefitPoolAtClaim,
    residualDeathBenefit,
    heirsTotal: endPool + residualDeathBenefit,
    singlePremiumPaid: singlePaid,
  };
}

export function combinedRemaining(
  row: YearRow,
  policyEnabled: boolean,
  lifetime: boolean,
): number {
  if (!policyEnabled || lifetime) return row.remaining;
  return row.remaining + Math.max(0, row.insurancePoolRemaining);
}

export type RemainingTone = "steady" | "drawing" | "depleted";

export function remainingToneAt(
  rows: YearRow[],
  index: number,
  policyEnabled: boolean,
  lifetime: boolean,
): RemainingTone {
  const row = rows[index];
  if (!row) return "steady";
  const left = combinedRemaining(row, policyEnabled, lifetime);
  if (left <= 0.5) return "depleted";
  if (index <= 0) return "steady";
  const prev = combinedRemaining(rows[index - 1], policyEnabled, lifetime);
  if (left + 0.5 < prev) return "drawing";
  return "steady";
}

export function remainingToneClass(tone: RemainingTone): string {
  if (tone === "depleted") return "font-bold amt-red";
  if (tone === "drawing") return "font-bold amt-green";
  return "";
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function depletionCalendar(
  rows: YearRow[],
  depletedYear: number | null,
  startYear = new Date().getFullYear(),
): { label: string; monthName: string; year: number; modelYear: number } | null {
  if (depletedYear == null) return null;
  const i = rows.findIndex((r) => r.year === depletedYear);
  if (i < 0) return null;
  const row = rows[i];
  const startRemaining =
    i === 0 ? row.remaining + row.drawn + row.shortfall : rows[i - 1]?.remaining ?? 0;
  const need = Math.max(row.drawn + row.shortfall, row.cost - (row.insurance || 0), 0);
  const frac = need > 0 ? Math.max(0, Math.min(0.999, startRemaining / need)) : 0;
  const monthIndex = Math.min(11, Math.max(0, Math.floor(frac * 12)));
  const year = startYear + depletedYear - 1;
  const monthName = MONTH_NAMES[monthIndex];
  return { label: `${monthName} ${year}`, monthName, year, modelYear: depletedYear };
}

export function shortfallStart(rows: YearRow[]): {
  year: number;
  monthInYear: number;
  monthsFromToday: number;
} | null {
  const row = rows.find((r) => r.shortfall > 0);
  if (!row) return null;
  const frac = row.cost > 0 ? Math.min(1, row.shortfall / row.cost) : 1;
  const monthInYear = Math.max(1, Math.min(12, Math.round(frac * 12) || 1));
  return {
    year: row.year,
    monthInYear,
    monthsFromToday: (row.year - 1) * 12 + monthInYear,
  };
}
