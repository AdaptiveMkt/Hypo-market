export const TAX_SECTION_LABEL =
  "Federal and State Tax Deductions and/or Tax Credit";

export const DETAIL_GROUPS = [
  {
    heading: "See the numbers",
    hint: "Charts and shocks on this run",
    items: [
      { id: "compareCare", label: "Compare long-term care options" },
      { id: "allocation", label: "Asset allocation (sleeves, pie, and utilization chart)" },
      { id: "yearByYear", label: "Year-by-year projection" },
    ],
  },
  {
    heading: "Insurance design",
    hint: "What a policy can pay — not a quote",
    items: [
      { id: "compareIns", label: "Compare long-term care insurance" },
      { id: "riders", label: "Compare long-term care riders" },
      { id: "inflation", label: "Compare inflation riders" },
      { id: "hybrid", label: "Explore Traditional, Asset-based, Hybrid, and LTC Annuity" },
      { id: "trends", label: "Compound rates and healthcare cost trends" },
      { id: "naicGuide", label: "NAIC Shopper’s Guide to Long-Term Care Insurance" },
      { id: "naicWorksheet", label: "NAIC Long-Term Care Insurance Personal Worksheet" },
    ],
  },
  {
    heading: "Medicaid, Partnership, and Federal and State Tax Deductions and/or Tax Credit",
    hint: "Open one of these unless you need the full packet — they overlap if all are on",
    items: [
      { id: "partnership", label: "State Partnership Long-Term Care — asset protection" },
      { id: "reciprocity", label: "Partnership reciprocity" },
      { id: "tax", label: TAX_SECTION_LABEL },
      { id: "fundingOptions", label: "Long-term care insurance and funding options" },
      { id: "nationalHistory", label: "National cost history — 5- and 10-year snapshots" },
      { id: "insights", label: "Industry insights" },
      { id: "compareHealth", label: "Compare health insurance types" },
      { id: "sensitivity", label: "Hypothesis sensitivity" },
      { id: "confidence", label: "Model confidence scores" },
      { id: "medicaidLtc", label: "Medicaid & VA" },
      { id: "edu", label: "How CPI is calculated (educational notes)" },
    ],
  },
  {
    heading: "Disclosure and Terms of Use",
    hint: "Check each title you want in the PDF. Unchecked folds are omitted.",
    items: [
      { id: "eduHypo", label: "Disclosure and Terms of Use (entire card)" },
      { id: "dhMayDo", label: "What you may do" },
      { id: "dhMayNot", label: "What you may not do" },
      { id: "dhHoldHarmlessCard", label: "Hold harmless — not professional advice" },
      { id: "dhLiability", label: "Limitation of liability and other terms" },
      { id: "dhAssumptions", label: "Assumptions and cost data" },
      { id: "dhSources", label: "Sources used in this hypothetical" },
    ],
  },
  {
    heading: "Hold harmless — not professional advice",
    hint: "Publisher, legal, and privacy disclosures. Include a box only if you want that title in the PDF.",
    items: [
      { id: "dhPublish", label: "Who publishes this model" },
      { id: "dhAccess", label: "Accessibility" },
      { id: "dhNotAdvice", label: "Not advice of any kind" },
      { id: "dhHoldHarmless", label: "Hold harmless" },
      { id: "dhFiduciary", label: "No fiduciary relationship — waiver as to the Publishers" },
      { id: "dhNotLegal", label: "Not legal advice" },
      { id: "dhContact", label: "Contact the appropriate professional" },
      { id: "dhLicense", label: "Look up a license or designation" },
      { id: "dhIar", label: "Investment adviser registration" },
      { id: "dhCfp", label: "CFP® Board Standards — fiduciary duty cannot be waived" },
      { id: "dhDesignation", label: "Designation non-endorsement notice" },
      { id: "dhPrivacy", label: "Privacy policy" },
    ],
  },
] as const;

export const DETAIL_SECTIONS = DETAIL_GROUPS.flatMap((g) => [...g.items]);

export type DetailId = (typeof DETAIL_SECTIONS)[number]["id"];

export const DETAIL_INDEX: Record<DetailId, number> = Object.fromEntries(
  DETAIL_SECTIONS.map((s, i) => [s.id, i + 1]),
) as Record<DetailId, number>;

export const DETAIL_HINTS: Record<DetailId, string> = {
  compareCare: "How long the combined pool lasts versus home care, assisted living, and nursing.",
  compareHealth: "Major medical, Medicare A/B/C/D, Medigap, Medicaid, and long-term care insurance — what each pays.",
  allocation: "Sleeves, pie chart, recommended target premium, and utilization over time.",
  yearByYear: "Year-by-year how insurance and assets pay the care bill until funds are depleted.",
  nationalHistory: "National median cost chart and 5- and 10-year snapshots.",
  compareIns: "Traditional reimbursement vs this run — insurance first, then assets.",
  fundingOptions: "How traditional, Partnership, hybrid, and other options typically pay care.",
  hybrid: "Run one, two, three, or four structures side by side — not a quote.",
  riders: "Shared care, restoration, nonforfeiture, return of premium, and hybrid riders.",
  inflation: "None, simple, and compound benefit-increase options against care CPI.",
  trends: "Long-term care cost index, medical CPI, and 5- and 10-year snapshots.",
  sensitivity: "What if CPI, ROI, start year, or duration shift — not a guaranteed range.",
  insights: "Claims history, what buyers choose, sample outlines, glossary, and IRC §101(g).",
  naicGuide: "Official NAIC Shopper’s Guide (PDF link). Many states require it at sale.",
  naicWorksheet: "NAIC Personal Worksheet (suitability pages) for the file.",
  partnership: "DRA and original Partnership programs — asset protection if a claim is paid.",
  reciprocity: "Whether a Partnership policy issued in one state is honored for Medicaid in another.",
  tax: "Federal eligible-premium deduction, state credits, and IRC §1035 exchanges.",
  confidence: "Grades this run’s inputs — not the chance of needing care.",
  medicaidLtc: "Medicaid long-term care, QIT, MAPT, spend-down, exemptions, and VA if selected.",
  edu: "How CPI is calculated and remaining educational notes that are not Medicaid/VA.",
  eduHypo: "The Disclosure and Terms of Use card shell and opening paragraph.",
  dhMayDo: "What you may do with this hypothetical.",
  dhMayNot: "What you may not do with this hypothetical.",
  dhHoldHarmlessCard: "The hold-harmless block (publisher, not advice, fiduciary, not legal).",
  dhLiability: "Limitation of liability, indemnification, governing law, and related terms.",
  dhAssumptions: "Assumptions and CareScout / Genworth cost-data notes.",
  dhSources: "Sources used in this hypothetical.",
  dhPublish: "Who Adaptive Marketing Group and Funding LTC Marketplace are.",
  dhAccess: "WCAG 2.2 AA notes and that the PDF is a print picture.",
  dhNotAdvice: "Not tax, legal, investment, insurance, or Medicaid advice.",
  dhHoldHarmless: "You hold the Publishers harmless for reliance on this hypothetical.",
  dhFiduciary: "No client or fiduciary relationship with the Publishers.",
  dhNotLegal: "No attorney-client relationship; not a substitute for counsel.",
  dhContact: "Contact a CFP®, CLTC/LTCP, CPA, or elder-law attorney as fits.",
  dhLicense: "Links to look up a license or professional designation.",
  dhIar: "RIA / IAR registration is separate from planning designations.",
  dhCfp: "A CFP® professional’s fiduciary duty cannot be waived.",
  dhDesignation:
    "The listed professional designations have not endorsed this hypothetical as an official planning tool.",
  dhPrivacy: "No client file is retained unless you type optional contact.",
};

/** Optional sections that only apply when insurance is in the run. */
export const INSURANCE_DETAIL_IDS: DetailId[] = [
  "compareIns",
  "fundingOptions",
  "hybrid",
  "riders",
  "inflation",
  "trends",
  "sensitivity",
  "insights",
  "naicGuide",
  "naicWorksheet",
  "partnership",
  "reciprocity",
  "tax",
];

export function isInsuranceDetail(id: DetailId) {
  return INSURANCE_DETAIL_IDS.includes(id);
}

/** Maps hold-harmless headings in DisclaimerCard to PDF checkbox ids. */
export const DISCLAIMER_HEADING_ID: Partial<Record<string, DetailId>> = {
  "Who publishes this model": "dhPublish",
  Accessibility: "dhAccess",
  "Not advice of any kind": "dhNotAdvice",
  "Hold harmless": "dhHoldHarmless",
  "No fiduciary relationship — waiver as to the Publishers": "dhFiduciary",
  "Not legal advice": "dhNotLegal",
  "Contact the appropriate professional": "dhContact",
  "Look up a license or designation": "dhLicense",
  "Investment adviser registration": "dhIar",
  "CFP® Board Standards — fiduciary duty cannot be waived": "dhCfp",
  "Designation non-endorsement notice": "dhDesignation",
  "Privacy policy": "dhPrivacy",
  "What you may do": "dhMayDo",
  "What you may not do": "dhMayNot",
  "Hold harmless — not professional advice": "dhHoldHarmlessCard",
  "Limitation of liability and other terms": "dhLiability",
  "Assumptions and cost data": "dhAssumptions",
  "Sources used in this hypothetical": "dhSources",
};

export type DetailFlags = Record<DetailId, boolean>;

export const REQUIRED_DETAIL_IDS: DetailId[] = [
  "dhDesignation",
  "dhHoldHarmlessCard",
  "dhHoldHarmless",
  "dhFiduciary",
  "dhNotLegal",
];

export function withRequiredDetails(d: DetailFlags): DetailFlags {
  const next = { ...d };
  for (const id of REQUIRED_DETAIL_IDS) next[id] = true;
  return next;
}

export const DISCLOSURE_SECTION_IDS: DetailId[] = [
  "eduHypo",
  "dhMayDo",
  "dhMayNot",
  "dhHoldHarmlessCard",
  "dhLiability",
  "dhPrivacy",
  "dhAssumptions",
  "dhSources",
];

export function disclosureSelected(d: DetailFlags) {
  return DISCLOSURE_SECTION_IDS.some((id) => d[id]);
}

export function isRequiredDetail(id: DetailId, lockout = false) {
  if (REQUIRED_DETAIL_IDS.includes(id)) return true;
  return lockout && LOCKOUT_REQUIRED_IDS.includes(id);
}

/** Forced when countable assets fail the suitability floor. */
export const LOCKOUT_REQUIRED_IDS: DetailId[] = [
  "medicaidLtc",
  "eduHypo",
  "dhHoldHarmlessCard",
  "dhHoldHarmless",
  "dhFiduciary",
  "dhNotLegal",
  "dhNotAdvice",
  "dhLiability",
  "dhSources",
  "dhContact",
  "dhLicense",
  "dhDesignation",
];

export function lockoutDetails(): DetailFlags {
  const next = { ...ALL_DETAILS_OFF };
  for (const id of LOCKOUT_REQUIRED_IDS) next[id] = true;
  return withRequiredDetails(next);
}

export function withScenarioDetails(d: DetailFlags, lockout: boolean): DetailFlags {
  const next = withRequiredDetails(d);
  if (!lockout) return next;
  for (const id of LOCKOUT_REQUIRED_IDS) next[id] = true;
  return next;
}

export const ALL_DETAILS_ON = Object.fromEntries(
  DETAIL_SECTIONS.map((s) => [s.id, true]),
) as DetailFlags;

export const ALL_DETAILS_OFF = withRequiredDetails(
  Object.fromEntries(DETAIL_SECTIONS.map((s) => [s.id, false])) as DetailFlags,
);

/** Fresh run: required hold-harmless and designation notices stay on. */
export const DEFAULT_DETAILS: DetailFlags = {
  ...ALL_DETAILS_OFF,
  dhDesignation: true,
};

export function allDetailsOn(d: DetailFlags) {
  return DETAIL_SECTIONS.every((s) => d[s.id]);
}

/** Numbers + one insurance card + Medicaid rules — enough for a client sitting. */
export const CLIENT_SITTING: DetailFlags = {
  ...ALL_DETAILS_OFF,
  allocation: true,
  compareCare: true,
  compareIns: true,
  yearByYear: true,
  partnership: true,
  medicaidLtc: false,
  dhDesignation: true,
};

export function isClientSitting(d: DetailFlags) {
  return DETAIL_SECTIONS.every((s) => d[s.id] === CLIENT_SITTING[s.id]);
}