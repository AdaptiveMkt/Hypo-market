export const NAIC_SHOPPER_PDF =
  "https://content.naic.org/sites/default/files/publication-ltc-lp-shoppers-guide-long-term.pdf";

/** Personal Worksheet and “Things You Should Know” in the 2022 NAIC Shopper’s Guide. */
export const NAIC_SHOPPER_WORKSHEET_START = 48;
export const NAIC_SHOPPER_WORKSHEET_END = 51;
export const NAIC_SHOPPER_WORKSHEET_PDF = `${NAIC_SHOPPER_PDF}#page=${NAIC_SHOPPER_WORKSHEET_START}`;

/**
 * Planning floors used by this model (countable assets). Not a carrier’s
 * filed suitability standard and not a NAIC statutory minimum.
 * Under $150,000 — insurance is locked out.
 * $150,000 up to under $200,000 — warning only.
 */
export const NAIC_LOCKOUT_ASSETS = 150_000;
export const NAIC_WARN_ASSETS = 200_000;
/** @deprecated use NAIC_LOCKOUT_ASSETS */
export const NAIC_ASSET_FLOOR = NAIC_LOCKOUT_ASSETS;

export const NAIC_SUITABILITY_BANNER =
  "Based on your reported countable assets, insurance may not be a suitable financial option for you to consider. Contact an appropriate insurance or financial services representative, other professional advisors or planning attorney, or a Medicaid Planning professional.";

export const NAIC_SUITABILITY_MEETS =
  "Based on the countable assets you’ve input, you meet NAIC financial suitability standards. This does not indicate insurance is right for your individual situation; however, you can still proceed through the hypothetical modeling.";

export const NAIC_SUITABILITY_MEETS_SPOKEN =
  "Based on the countable assets you’ve input, you meet N A I C financial suitability standards. This does not indicate insurance is right for your individual situation. However, you can still proceed through the hypothetical modeling.";

export const NAIC_SUITABILITY_WARN = "Insurance may not be suitable.";

export function naicLockoutSpoken(state: string) {
  const where = (state || "").trim() || "the state where care would be provided";
  return `Based on the countable assets you have disclosed, it does not appear long term care insurance is a suitable option. You may want to contact a qualified Medicaid Planning professional, such as an Elder Care Planning, Estate Planning, or other qualified planning professional in ${where}.`;
}

export function insuranceLockedOut(countable: number) {
  return (Number(countable) || 0) < NAIC_LOCKOUT_ASSETS;
}

export function insuranceNeedsWarning(countable: number) {
  const n = Number(countable) || 0;
  return n >= NAIC_LOCKOUT_ASSETS && n < NAIC_WARN_ASSETS;
}

export function belowNaicAssetGuideline(countable: number) {
  return insuranceLockedOut(countable);
}

export const NAIC_SUITABILITY_PDF =
  "https://www.insurancecompact.org/sites/default/files/2022-12/standards_ltc_i_3_appforms.pdf";

export const PAY_SOURCES = [
  "Current income from employment",
  "Current income from investments",
  "Other current income",
  "Savings",
  "Sell investments",
  "Sell other assets",
  "Money from my family",
  "Other",
] as const;

export const INCOME_BANDS = [
  "Less than $10,000",
  "$10,000–$19,999",
  "$20,000–$29,999",
  "$30,000–$50,000",
  "More than $50,000",
] as const;

export const ASSET_BANDS = [
  "Less than $20,000",
  "$20,000–$29,999",
  "$30,000–$49,999",
  "More than $50,000",
] as const;

export type SuitabilityForm = {
  applicantName: string;
  applicantState: string;
  applicantPhone: string;
  applicantEmail: string;
  role: "Applicant" | "Licensed producer";
  producerName: string;
  producerFirm: string;
  producerLicense: string;
  companyName: string;
  premiumAmount: string;
  premiumMode: "monthly" | "annual" | "single";
  policyType: "noncancellable" | "guaranteed" | "paid-up" | "";
  soldLtcSince: string;
  soldThisSince: string;
  increaseHistory: "never" | "not-10" | "increased" | "";
  increaseSummary: string;
  paySources: string[];
  payOther: string;
  affordIfSpouseDies: string;
  ifPremiumsUp50: string;
  householdIncome: string;
  incomeChange: string;
  thoughtIncomeChange: string;
  inflationProtection: string;
  noInflationPlan: string[];
  elimDays: string;
  elimCost: string;
  payElim: string[];
  assetsExHome: string;
  assetsChange: string;
  completeOrDecline: "complete" | "decline" | "";
  reviewedWithAgent: boolean;
  applicantSign: string;
  producerSign: string;
  signedDate: string;
};

export const EMPTY_SUITABILITY: SuitabilityForm = {
  applicantName: "",
  applicantState: "",
  applicantPhone: "",
  applicantEmail: "",
  role: "Applicant",
  producerName: "",
  producerFirm: "",
  producerLicense: "",
  companyName: "",
  premiumAmount: "",
  premiumMode: "annual",
  policyType: "",
  soldLtcSince: "",
  soldThisSince: "",
  increaseHistory: "",
  increaseSummary: "",
  paySources: [],
  payOther: "",
  affordIfSpouseDies: "",
  ifPremiumsUp50: "",
  householdIncome: "",
  incomeChange: "",
  thoughtIncomeChange: "",
  inflationProtection: "",
  noInflationPlan: [],
  elimDays: "",
  elimCost: "",
  payElim: [],
  assetsExHome: "",
  assetsChange: "",
  completeOrDecline: "",
  reviewedWithAgent: false,
  applicantSign: "",
  producerSign: "",
  signedDate: "",
};

export const SUITABILITY_DRAFT_KEY = "aum-naic-worksheet-draft";

export function suitabilityPairs(f: SuitabilityForm): [string, string][] {
  return [
    ["Name", f.applicantName],
    ["State", f.applicantState],
    ["Phone", f.applicantPhone],
    ["Email", f.applicantEmail],
    ["Completed as", f.role],
    ["Producer", [f.producerName, f.producerFirm, f.producerLicense].filter(Boolean).join(" · ")],
    ["Company", f.companyName],
    ["Premium", f.premiumAmount ? `${f.premiumAmount} (${f.premiumMode})` : ""],
    ["Policy type", f.policyType],
    ["Company sold LTC since", f.soldLtcSince],
    ["This form sold since", f.soldThisSince],
    ["Premium increase history", f.increaseHistory],
    ["Increase summary", f.increaseSummary],
    ["Premium payment sources", [...f.paySources, f.payOther].filter(Boolean).join("; ")],
    ["Afford if spouse/partner dies first", f.affordIfSpouseDies],
    ["If premiums rose 50%", f.ifPremiumsUp50],
    ["Household annual income", f.householdIncome],
    ["Income change next 10 years", f.incomeChange],
    ["Thought about income change vs premium", f.thoughtIncomeChange],
    ["Will buy inflation protection", f.inflationProtection],
    ["If no inflation, pay the gap from", f.noInflationPlan.join("; ")],
    ["Elimination / waiting period", f.elimDays ? `${f.elimDays} days` : ""],
    ["Approx. cost of that period", f.elimCost],
    ["Pay during elimination from", f.payElim.join("; ")],
    ["Assets excluding home", f.assetsExHome],
    ["Assets change next 10 years", f.assetsChange],
    [
      "Financial answers",
      f.completeOrDecline === "decline"
        ? "Applicant chose not to complete financial information"
        : f.completeOrDecline === "complete"
          ? "Answers describe the applicant’s financial situation"
          : "",
    ],
    ["Reviewed worksheet with producer", f.reviewedWithAgent ? "Yes" : "No"],
    ["Applicant signature (typed)", f.applicantSign],
    ["Producer signature (typed)", f.producerSign],
    ["Date", f.signedDate],
  ];
}

export function suitabilityAsText(f: SuitabilityForm): string {
  return suitabilityPairs(f)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

export function loadSuitabilityDraft(): SuitabilityForm {
  try {
    const raw = localStorage.getItem(SUITABILITY_DRAFT_KEY);
    if (!raw) return { ...EMPTY_SUITABILITY };
    const parsed = JSON.parse(raw) as Partial<SuitabilityForm>;
    return { ...EMPTY_SUITABILITY, ...parsed };
  } catch {
    return { ...EMPTY_SUITABILITY };
  }
}

export function saveSuitabilityDraft(f: SuitabilityForm) {
  try {
    localStorage.setItem(SUITABILITY_DRAFT_KEY, JSON.stringify(f));
  } catch {
    /* ignore quota */
  }
}