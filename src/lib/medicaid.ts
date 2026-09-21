/** 2026 long-term care Medicaid planning figures. Educational — not an eligibility determination. */

export type MedicaidProfile = {
  individualLimit: number;
  coupleLimit: number;
  /** Null = community spouse may keep 100% of countable up to csraMax. */
  csraMin: number | null;
  csraMax: number;
  /** Null = no home-equity cap (California). */
  homeEquity: number | null;
  burialFund: number;
  lifeFace: number;
  notes: string[];
};

const FEDERAL_CSRA_MIN = 32532;
const FEDERAL_CSRA_MAX = 162660;
const HOME_LOW = 752000;
const HOME_HIGH = 1130000;

const HIGH_HOME = new Set([
  "Alabama",
  "Colorado",
  "Connecticut",
  "District of Columbia",
  "Hawaii",
  "Maine",
  "Massachusetts",
  "New Jersey",
  "New York",
  "Washington",
]);

/** States that typically allow the community spouse 100% of countable assets up to the max CSRA. */
const CSRA_MAX_ONLY = new Set([
  "Alaska",
  "California",
  "Colorado",
  "Florida",
  "Georgia",
  "Hawaii",
  "Louisiana",
  "Maine",
  "Minnesota",
  "Mississippi",
  "Nevada",
  "Vermont",
  "Wyoming",
]);

const BASE: MedicaidProfile = {
  individualLimit: 2000,
  coupleLimit: 3000,
  csraMin: FEDERAL_CSRA_MIN,
  csraMax: FEDERAL_CSRA_MAX,
  homeEquity: HOME_LOW,
  burialFund: 1500,
  lifeFace: 1500,
  notes: [],
};

const OVERRIDES: Partial<Record<string, Partial<MedicaidProfile>>> = {
  California: {
    individualLimit: 130000,
    coupleLimit: 195000,
    homeEquity: null,
    csraMin: null,
    notes: [
      "Medi-Cal reinstated an asset test in 2026. Confirm current SSI-related vs MAGI rules.",
    ],
  },
  "New York": {
    individualLimit: 33038,
    coupleLimit: 44796,
    csraMin: 74820,
    notes: ["{state} uses higher countable-asset limits than most states."],
  },
  Illinois: {
    individualLimit: 17500,
    coupleLimit: 17500,
    csraMin: null,
    csraMax: 143172,
    notes: ["{state} uses a higher applicant asset limit and a single CSRA figure."],
  },
  Florida: {
    csraMin: null,
    burialFund: 2500,
    lifeFace: 2500,
    notes: [
      "{state} often treats an IRA in required-minimum-distribution (payout) status as exempt.",
    ],
  },
  Connecticut: { csraMin: 50000 },
  Wisconsin: { csraMin: 50000 },
  "South Carolina": { csraMin: null, csraMax: 66480 },
};

export function medicaidProfile(state: string): MedicaidProfile {
  const p: MedicaidProfile = {
    ...BASE,
    homeEquity: HIGH_HOME.has(state) ? HOME_HIGH : BASE.homeEquity,
    csraMin: CSRA_MAX_ONLY.has(state) ? null : BASE.csraMin,
    notes: [],
    ...OVERRIDES[state],
  };
  if (OVERRIDES[state]?.notes) {
    p.notes = (OVERRIDES[state]!.notes ?? []).map((n) => n.replaceAll("{state}", state));
  }
  if (HIGH_HOME.has(state) && OVERRIDES[state]?.homeEquity === undefined) {
    p.homeEquity = HOME_HIGH;
  }
  if (CSRA_MAX_ONLY.has(state) && OVERRIDES[state]?.csraMin === undefined) {
    p.csraMin = null;
  }
  return p;
}

/** Planning default for Excludable assets: 2026 community-spouse CSRA maximum. */
export function defaultExcludableAssets(state: string) {
  if (!state) return 0;
  return medicaidProfile(state).csraMax;
}

export function spendDownUrl(state: string) {
  const hash = state.toLowerCase().replace(/\s+/g, "-");
  return `https://fundingltcmarketplace.com/case-studies.html#${hash}`;
}

/** 2026 SSI × 300% special income level for institutional / waiver (federal ceiling). */
export const SIL_2026 = 2982;

const INCOME_CAP = new Set([
  "Alabama",
  "Alaska",
  "Arizona",
  "Colorado",
  "Delaware",
  "Idaho",
  "Indiana",
  "Mississippi",
  "Nevada",
  "New Mexico",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Wyoming",
]);

const BOTH_PATHWAYS = new Set([
  "Arkansas",
  "Florida",
  "Georgia",
  "Iowa",
  "Kentucky",
  "Louisiana",
  "New Jersey",
]);

const MN_PERIOD: Record<string, string> = {
  Arkansas: "3 months",
  California: "1 month",
  Connecticut: "6 months",
  "District of Columbia": "6 months",
  Florida: "1 month",
  Georgia: "6 months",
  Hawaii: "1 month",
  Illinois: "1 month",
  Iowa: "2 months",
  Kansas: "6 months",
  Kentucky: "3 months",
  Louisiana: "3 months",
  Maine: "6 months",
  Maryland: "6 months",
  Massachusetts: "6 months",
  Michigan: "1 month",
  Minnesota: "6 months",
  Missouri: "1 month",
  Montana: "1 month",
  Nebraska: "1 month",
  "New Hampshire": "1 or 6 months",
  "New Jersey": "6 months",
  "New York": "1 month",
  "North Carolina": "6 months",
  "North Dakota": "1 month",
  Pennsylvania: "6 months",
  "Rhode Island": "1 month",
  Utah: "1 month",
  Vermont: "1 or 6 months",
  Virginia: "1 or 6 months",
  Washington: "3 or 6 months",
  "West Virginia": "6 months",
  Wisconsin: "6 months",
};

const MNIL: Record<string, string> = {
  Arkansas: "$108 / $217 couple (very low MNIL)",
  California: "$600 / $934 couple",
  Connecticut: "$851 / $1,153 couple (eff. 3/1/26–2/28/27)",
  "District of Columbia": "$857 / $902 couple",
  Florida: "$180 / $241 couple",
  Georgia: "$317 / $375 couple",
  Hawaii: "$469 / $632 couple",
  Illinois: "$1,330 / $1,803 couple (eff. 4/1/26–3/31/27)",
  Iowa: "$483 / $483 couple",
  Kansas: "$994 / $1,491 couple (aligned with SSI)",
  Kentucky: "$235 / $291 couple",
  Louisiana: "urban $100 / $192; rural $92 / $167 couple",
  Maine: "$315 / $341 couple",
  Maryland: "$350 / $392 couple",
  Massachusetts: "$522 / $650 couple",
  Michigan: "$341 / $408 couple",
  Minnesota: "$1,305 / $1,764 couple",
  Missouri: "$1,131 / $1,533 couple (aged & disabled)",
  Montana: "confirm locally",
  Nebraska: "confirm locally",
  "New Hampshire": "confirm locally",
  "New Jersey": "confirm locally",
  "New York": "community Medicaid income standard about $1,836 / month (confirm locally)",
  "North Carolina": "confirm locally",
  "North Dakota": "confirm locally",
  Pennsylvania: "confirm locally",
  "Rhode Island": "confirm locally",
  Utah: "confirm locally",
  Vermont: "confirm locally",
  Virginia: "confirm locally",
  Washington: "confirm locally",
  "West Virginia": "confirm locally",
  Wisconsin: "$1,330 / $1,803 couple",
};

export type SpendDownRules = {
  state: string;
  pathway: "income-cap" | "medically-needy" | "both";
  sil: number;
  qit: boolean;
  mnPeriod: string | null;
  mnil: string | null;
  title: string;
  bullets: string[];
};

export function spendDownRules(state: string, individualLimit: number): SpendDownRules {
  const pathway: SpendDownRules["pathway"] = BOTH_PATHWAYS.has(state)
    ? "both"
    : INCOME_CAP.has(state)
      ? "income-cap"
      : "medically-needy";
  const qit = pathway === "income-cap" || pathway === "both";
  const mnPeriod = MN_PERIOD[state] ?? (pathway === "income-cap" ? null : "confirm locally");
  const mnil = MNIL[state] ?? null;

  const bullets = [
    `Asset spend-down: countable resources above ${state}’s applicant limit (this model uses ${formatUsd(individualLimit)} for a single LTC applicant) generally must be spent on care, exempt items, or otherwise reduced before Medicaid pays. Partnership disregard, if any, is subtracted first.`,
    `Exempt examples still sit outside spend-down: homestead (subject to the home-equity cap unless a spouse or dependent child lives there), one vehicle, household goods, burial funds, and a community spouse’s CSRA.`,
    `Look-back is generally 60 months. Gifts and under-market transfers in that window can create a penalty period. Buying a Partnership policy is not a gift.`,
    `Once on institutional Medicaid, remaining countable income (after personal-needs allowance, often about $30–$160, and any community-spouse income allowance) is paid toward the facility. Medicaid pays the rest of the allowed rate.`,
  ];

  if (pathway === "income-cap") {
    bullets.push(
      `${state} is modeled as an income-cap state for nursing-home / waiver Medicaid. Gross income above the 2026 special income level of ${formatUsd(SIL_2026)} / month (300% of SSI) typically cannot be “spent down” on bills. The usual path is a Qualified Income Trust (Miller trust) that receives the excess. Without a valid QIT, income over the cap can block eligibility even if assets are spent down.`,
    );
  } else if (pathway === "both") {
    bullets.push(
      `${state} is modeled with both an institutional income cap (special income level ${formatUsd(SIL_2026)} / month in 2026, often using a Qualified Income Trust when over) and a medically needy spend-down pathway for some coverage. Medically needy spend-down period: ${mnPeriod ?? "confirm locally"}${mnil ? `; MNIL about ${mnil}` : ""}.`,
    );
  } else {
    bullets.push(
      `${state} is modeled as a medically needy (income spend-down) state. Excess income is reduced by incurred medical / LTC bills that no third party will pay. When those bills equal the excess over the medically needy income limit, Medicaid can start for the rest of the spend-down period (${mnPeriod ?? "confirm locally"})${mnil ? `. MNIL in this model: ${mnil}` : ""}.`,
    );
  }

  bullets.push(
    "Income spend-down and asset spend-down are different. Partnership and this calculator’s “spend-down still” figure are about countable assets. They do not replace the income test.",
  );
  bullets.push(
    `Confirm current ${state} Institutional Care / waiver rules with an elder-law or Medicaid specialist. This is not a determination of eligibility.`,
  );

  const title =
    pathway === "income-cap"
      ? `${state} Medicaid spend-down — income-cap (QIT)`
      : pathway === "both"
        ? `${state} Medicaid spend-down — income cap and medically needy`
        : `${state} Medicaid spend-down — medically needy`;

  return { state, pathway, sil: SIL_2026, qit, mnPeriod, mnil, title, bullets };
}

export type EligibilityRules = {
  title: string;
  bullets: { heading: string; body: string }[];
};

export function eligibilityRules(state: string): EligibilityRules {
  const p = medicaidProfile(state);
  const spend = spendDownRules(state, p.individualLimit);
  const csra =
    p.csraMin != null
      ? `from ${formatUsd(p.csraMin)} up to ${formatUsd(p.csraMax)}`
      : `up to ${formatUsd(p.csraMax)} (community spouse may keep 100% of countable assets to that cap)`;
  const home =
    p.homeEquity != null
      ? `${formatUsd(p.homeEquity)} for a single LTC applicant unless a spouse, minor child, or blind/disabled child lives there`
      : "no stated home-equity cap in this model (confirm locally)";
  const incomeBody =
    spend.pathway === "income-cap"
      ? `${state} is modeled as an income-cap state. Countable income above the 2026 special income level of ${formatUsd(SIL_2026)} / month (300% of SSI) generally cannot be spent down on bills. Excess income is usually placed in a Qualified Income Trust (Miller trust). Without a valid QIT, income over the cap can block eligibility even if assets are already at the resource limit.`
      : spend.pathway === "both"
        ? `${state} is modeled with both an institutional income cap (special income level ${formatUsd(SIL_2026)} / month; a QIT is often used when over) and a medically needy spend-down path for some coverage. Medically needy period: ${spend.mnPeriod ?? "confirm locally"}${spend.mnil ? `; MNIL about ${spend.mnil}` : ""}.`
        : `${state} is modeled as medically needy. Excess income is reduced by incurred medical / LTC bills that no third party will pay. When those bills equal the excess over the medically needy income limit, Medicaid can start for the rest of the spend-down period (${spend.mnPeriod ?? "confirm locally"})${spend.mnil ? `. MNIL in this model: ${spend.mnil}` : ""}.`;

  return {
    title: `Medicaid eligibility rules in ${state}`,
    bullets: [
      {
        heading: "Not automatic",
        body: `Medicaid long-term care in ${state} is a five-part test: functional need, categorical status, residency, countable resources, and countable income. A Partnership policy can raise how many assets may be kept. It does not skip any other test, and this model is not a determination of eligibility.`,
      },
      {
        heading: "Functional / medical need",
        body: "Institutional or waiver Medicaid generally requires a nursing-facility level of care. Typical screens: needing substantial assistance with 2 of 6 activities of daily living (bathing, dressing, toileting, transferring, continence, eating), or a severe cognitive impairment that needs substantial supervision. States add their own assessment (often a PASRR / LOC screen). A tax-qualified insurance trigger (2 of 6 ADLs or severe cognitive impairment expected to last 90+ days) is similar but is not the Medicaid determination.",
      },
      {
        heading: "Categorical and residency",
        body: `The applicant generally must be 65 or older, or blind, or disabled under SSI rules, a U.S. citizen or qualified non-citizen, and a resident of ${state} at the time of application. Medicaid uses the rules of the state where the person applies — not the state that issued an LTC policy.`,
      },
      {
        heading: "Resource (asset) test",
        body: `A single LTC applicant in ${state} is modeled with a countable-resource allowance of ${formatUsd(p.individualLimit)}${p.coupleLimit !== p.individualLimit ? ` (couple both applying ${formatUsd(p.coupleLimit)})` : ""}. Countable examples: extra vehicles, investment real estate, stocks, most cash, and cash-value life above the small face-value threshold. A community spouse may keep a CSRA ${csra}. Homestead equity cap: ${home}. This calculator does not auto-exclude exempt items unless you hold them out on those lines.`,
      },
      {
        heading: "Income test",
        body: incomeBody,
      },
      {
        heading: "Look-back and transfers",
        body: `${state} look-back for gifts and under-market transfers is generally 60 months. A penalty period can delay Medicaid even when resources are otherwise at the limit. Buying a tax-qualified or Partnership policy is not a gift. Moving money after a diagnosis can still create a penalty. Confirm current ${state} transfer rules.`,
      },
      {
        heading: "After eligibility — NAM and estate recovery",
        body: "Once on institutional Medicaid, remaining countable income (after a personal-needs allowance, often about $30–$160 / month, and any community-spouse income allowance) is paid toward the facility as the NAM — Medicaid pays the rest of the allowed rate. States may recover from the estate after death, usually including the homestead, unless a spouse or qualifying child is protected. Partnership-designated assets are generally shielded from recovery only up to benefits actually paid (or designated TAP assets in IN/NY).",
      },
      {
        heading: "Considering Medicaid planning",
        body: `Contact a qualified Medicaid or elder-care planning attorney in ${state}. Confirm CSRA, home-equity, QIT, MNIL, look-back, and estate-recovery rules with that attorney. This is educational only.`,
      },
    ],
  };
}

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

