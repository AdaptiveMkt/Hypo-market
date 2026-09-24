/** What consumers actually buy — stand-alone vs combination. Educational snapshots. */

import { aaltciNearestAge, fiveYearIssueBand, type InflationMethod } from "./calc";

export const WHAT_CONSUMERS_BUY_ANCHOR = "what-consumers-buy";
export const IF_BENEFITS_GROW_ANCHOR = "if-benefits-grow";
export const WHAT_CONSUMERS_BUY_INFLATION_ANCHOR = "what-consumers-buy-inflation";

export const WHAT_CONSUMERS_BUY_TITLE = "What consumers buy";

export const WHAT_CONSUMERS_BUY_INTRO =
  "New sales and in-force books are not the same product. Most dollars of new long-term care protection now come from combination (hybrid) life policies, not stand-alone LTCI. This hypothetical lets you enter a traditional reimbursement, asset-based single premium, LTC annuity, or hybrid life design. The figures below are published industry distributions of what was issued — not a recommendation, not this carrier’s mix, and not a quote. Benefits on this run are entered in today’s values; whether they stay level or grow is the inflation choice you make.";

export const WHAT_CONSUMERS_BUY_MARKET = [
  {
    label: "Stand-alone new premium, 2024",
    value: "$112.7 million",
    note: "2025 Milliman LTCI Survey (Broker World). Up from $93.9 million in 2023.",
  },
  {
    label: "Life policies with an LTC feature, 2023",
    value: "$2.86 billion",
    note: "LIMRA individual life + LTC feature (468,731 policies). Linked-benefit $289 million; §7702B ADB $549 million.",
  },
  {
    label: "Typical stand-alone premium",
    value: "$3,265 / insured",
    note: "$3,885 per buying unit (2024 Milliman survey). Average initial monthly maximum $5,428 (about $178/day).",
  },
  {
    label: "AALTCI 2026 price-index design",
    value: "$165,000 pool",
    note: "July 2026 AALTCI Price Index (Illinois, select health). Level vs 3% vs 5% compound. Benefits at age 85: about $400,500 at 3% compound and $679,100 at 5% from that $165,000 start.",
  },
];

/** 2024 column excluding Bankers Fundamental Plus, except where noted. */
export const WHAT_CONSUMERS_BUY_FEATURES = {
  monthly: [
    { item: "Less than $3,000 / month (~$99/day)", share: "8.5%" },
    { item: "$3,000–$4,499 (~$99–$148/day)", share: "25.4%" },
    { item: "$4,500–$5,999 (~$148–$197/day)", share: "22.8%" },
    { item: "$6,000–$7,499 (~$197–$247/day)", share: "22.9%" },
    { item: "$7,500–$8,999 (~$247–$296/day)", share: "9.6%" },
    { item: "$9,000 or more (~$296+/day)", share: "10.8%" },
    { item: "Average initial monthly maximum", share: "$5,428" },
    { item: "Monthly (or weekly) determination", share: "73.2%" },
  ],
  monthlyNote:
    "2025 Milliman LTCI Survey, Tables 25–26, 2024 stand-alone sales. Average initial monthly max set a record at $5,428 (about $178/day if used every day). Individual vs worksite initial daily max about $182 vs $168 — covering 5.3 vs 4.9 hours of a $34/hour home aide at issue (Genworth 2024 cited in the survey). This model’s default $200/day is about $6,083/month, in the $6,000–$7,499 band. Daily vs monthly is a claim-accounting choice; newer issues are mostly monthly.",
  benefitPeriod: [
    { item: "Shorter than 2 years", share: "0.4%" },
    { item: "2 years", share: "11.1%" },
    { item: "3 years (mode)", share: "55.1%" },
    { item: "4 years", share: "3.6%" },
    { item: "5 years", share: "7.4%" },
    { item: "6 years", share: "20.0%" },
    { item: "7–10 years", share: "2.3%" },
    { item: "Lifetime*", share: "0.1%" },
    { item: "Average (no lifetime)", share: "3.79 years" },
  ],
  benefitPeriodNote:
    "Table 23, 2024 excluding one short-duration product. With that product included, 3-year falls to 33.2% and the average period is 2.81 years (46.7% two years or shorter). Lifetime* is essentially gone from new stand-alone sales. This model defaults to 3 years — the 2024 sales mode (55.1%). Milliman does not publish period mix by issue age. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.",
  inflation: [
    { item: "4.5%+ compound for life", share: "2.7%" },
    { item: "3% compound for life", share: "17.4%" },
    { item: "2% compound", share: "1.7%" },
    { item: "1% compound", share: "1.0%" },
    { item: "Simple increase", share: "2.1%" },
    { item: "CPI / indexed level premium", share: "0.9%" },
    { item: "All automatic increases except FPO", share: "26.0%" },
    { item: "Future purchase option (fixed)", share: "28.9%" },
    { item: "Future purchase option (indexed)", share: "29.4%" },
  ],
  inflationNote:
    "Table 28, 2024 excluding the short-duration product. Most new stand-alone sales use a future purchase option, not automatic 5% compound. Milliman projects about $369/day at age 80 for an average 60-year-old 2024 buyer if FPOs are elected (about 3.6% compound equivalent). LIMRA: 98.2% of 2022 linked-benefit buyers chose benefit increases, an extension of benefits, or both. This model does not have an FPO field. Inflation defaults follow DRA Partnership issue-age bands: 3% compound under 76, level at 76+.",
  elim: [
    { item: "0–19 days", share: "0.1%" },
    { item: "20–44 days", share: "1.6%" },
    { item: "45–83 days", share: "0.5%" },
    { item: "84–100 days (typically 90)", share: "89.8%" },
    { item: "101–200 days", share: "5.1%" },
  ],
  elimNote:
    "Table 33, 2024 excluding the short-duration product. More than 90% of the non-worksite market buys a 90-day facility elimination period; many worksite programs offer only 90 days. This model defaults to 90 days.",
  riders: [
    { item: "Shared Care (share of 3-year policies)", share: "19.2%" },
    { item: "Shared Care (share of 6-year policies)", share: "23.1%" },
    { item: "Shared Care among both-buy couples", share: "4–77%" },
    { item: "Joint waiver of premium (couples, range)", share: "10–100%" },
    { item: "Survivorship (couples, range)", share: "2.4–12.5%" },
  ],
  ridersNote:
    "Tables 38–40, 2025 Milliman survey. Shared Care lets one partner use the other’s remaining pool (or a third shared pool) after their own is exhausted — it effectively lengthens the couple’s period. Election varies widely by carrier. Joint waiver of premium and survivorship are the other common couple riders. Home-care richness is usually built into comprehensive designs rather than sold as a separate add-on; one carrier’s home-care riders clustered with compound inflation. Restoration of benefits and return of premium are not broken out in the 2024 sales tables.",
  who: [
    { item: "Female share of stand-alone sales", share: "54.4%" },
    { item: "Ages 18–29", share: "1.3%" },
    { item: "Ages 30–39", share: "3.5%" },
    { item: "Ages 40–49", share: "9.6%" },
    { item: "Ages 50–59", share: "27.2%" },
    { item: "Ages 60–69", share: "44.1%" },
    { item: "Ages 70+ (remainder)", share: "about 14%" },
    { item: "Average issue age (all 2024)", share: "about 60" },
    { item: "Average issue age (ex-short product)", share: "about 56–57" },
    { item: "Worksite buyers vs non-worksite", share: "~10 years younger" },
  ],
  whoNote:
    "Tables 20, 30, 36 and market-penetration ages, 2025 Milliman survey. Women are 54.4% of 2024 buyers and a larger share of claimants (AALTCI 2024 CT sample 59% female, mean claim age 81). The survey does not publish daily-benefit, benefit-period, elimination, or inflation mix by gender. AALTCI Price Index premiums by age and sex are in the inflation block below. Buyers concentrate at 50–69 — the window where Partnership often requires compound inflation and where underwriting declines are still typically in the 20–40% range rather than 50%+.",
};

export const WHAT_CONSUMERS_BUY_INFORCE =
  "In-force stand-alone policies (the claims-paying block) look different from 2024 sales: Milliman’s 2026 industry claims projection used an illustrative mix of 70% three-year / 30% lifetime*, 50% 5% compound / 50% none, 90-day elimination, 60% married at issue, reimbursement 85%. Lifetime* and 5% compound were common on policies issued 15–25 years ago. They are rare on policies issued last year. Do not assume the in-force mix is what a new buyer can still purchase. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.";

/** Inflation riders by age and gender — published snapshots, not a quote. */
export const INFLATION_BY_AGE = {
  intro:
    "Whether benefits stay at today’s values or grow is the inflation rider. Milliman does not publish a gender split of that rider. Age is the published driver: Partnership rules, years until a typical claim (mean about 81), and premium. Women pay more for the same design and are a slight majority of buyers.",
  partnership: [
    {
      age: "Under 61",
      rule: "DRA Partnership: compound inflation required",
      typical:
        "3% compound is the current stand-alone standard. 5% compound was only 2.7% of 2024 sales (ex-short product).",
    },
    {
      age: "61–75",
      rule: "DRA Partnership: some inflation protection required",
      typical:
        "3% compound, 2% compound, CPI/indexed, or a future purchase option. Most 2024 sales used FPO, not automatic 5%.",
    },
    {
      age: "76+",
      rule: "DRA Partnership: inflation optional",
      typical:
        "Level, simple, or FPO more common. Mean claim age in AALTCI’s 2024 CT sample is 81 — a shorter runway.",
    },
  ],
  millimanAge:
    "2024 stand-alone sales: 27.2% ages 50–59 and 44.1% ages 60–69. Younger buyers have more years of care-cost inflation before a typical claim in the 80s, so a level benefit loses more purchasing power. Worksite buyers average about 10 years younger than non-worksite; without an increase feature their covered home-care hours at age 80 fall faster (Milliman worksite analysis).",
  gender:
    "Women were 54.4% of 2024 stand-alone buyers (Milliman Table 36) and about 59% of claimants in AALTCI’s 2024 Connecticut sample. The survey does not split inflation-type by sex. The 2026 AALTCI Price Index (Illinois, $165,000 initial pool, select health, July 2026) shows a woman pays more than a man of the same age for the same inflation design — adding 3% or 5% compound multiplies that gap.",
  premiums: [
    {
      age: 55,
      m0: 950,
      m3: 2200,
      m5: 3710,
      f0: 1500,
      f3: 3750,
      f5: 6400,
      c0: 2080,
      c3: 5050,
      c5: 8575,
      published: ["m0", "m3", "m5", "f0", "f3", "f5", "c0", "c3", "c5"],
    },
    {
      age: 60,
      m0: 1130,
      m3: 2615,
      m5: 4405,
      f0: 1780,
      f3: 4450,
      f5: 7595,
      c0: 2520,
      c3: 6115,
      c5: 10385,
      published: ["f3", "c3"],
    },
    {
      age: 65,
      m0: 1325,
      m3: 3065,
      m5: 5165,
      f0: 2090,
      f3: 5220,
      f5: 8910,
      c0: 2895,
      c3: 7030,
      c5: 11935,
      published: ["c3"],
    },
  ],
  ilCouple60_3pct: [4591, 5661, 6440, 6712, 7173],
  premiumNote:
    "AALTCI 2026 Long-Term Care Insurance Price Index (https://www.aaltci.org/2026-AALTCI-Long-Term-Care-Insurance-Price-Index/), Illinois, $165,000 initial benefits per insured, select health, pricing as of July 2026. Age 55 level / 3% / 5% (male, female, couple) are published Index cells. Age 60 woman 3% compound $4,450 and age 65 couple 3% compound $7,030 combined are published. Age 60 couple 3% $6,115 is the average of five Illinois carriers ($4,591–$7,173). Other age-60 cells are scaled from age 55 using the published woman 3% ratio ($4,450 / $3,750). Other age-65 cells are scaled from age 55 using the published couple 3% ratio ($7,030 / $5,050). The Index does not publish 70 or 75. At age 85 the Index illustrates about $400,500 per insured at 3% compound and about $679,100 at 5% compound from the $165,000 start. 2026 vs 2025: couple both 55 about $5,010 vs $5,050; single woman 60 $4,450 vs $4,550. Carrier spread on the same profile: up to 29% at age 60 and up to 80% at age 65 — AALTCI notes the most expensive policy can cost 56.24% more per year. Premiums vary by state of issue, health, marital status, and riders. This model’s default annual premium is the Index man/woman midpoint for the Age-today band and the Benefit Increase Option you selected. Not a quote.",
  age70:
    "Age 70 and older: the 2026 AALTCI Price Index does not publish a 70 or 75 band. Traditional stand-alone issue is limited at those ages; AALTCI 2024 underwriting declines were 44.8% at 70–74 and 51.7% at 75–79. Linked-benefit / hybrid life is more commonly used. Partnership inflation is still required in some form through age 75, then optional at 76+. Ask a licensed producer for a quote in the issue state — do not interpolate these 55–65 dollars to age 70.",
  millimanMix:
    "2024 sales excluding one short-duration product: 3% compound 17.4%; 4.5%+ compound 2.7%; all automatic increases except FPO 26.0%; FPO fixed 28.9%; FPO indexed 29.4%. Milliman projects about $369/day at age 80 for an average 60-year-old 2024 buyer if FPOs are elected (about 3.6% compound equivalent).",
};

/** AALTCI 2026 Index average (man/woman midpoint) for this Age-today band and inflation option. */
export function typicalPremiumHint(
  ageToday: number,
  inflationPct: number,
  inflationMethod: InflationMethod,
): { band: string; amount: number | null } {
  const band = fiveYearIssueBand(ageToday) ?? "your age";
  const indexAge = aaltciNearestAge(ageToday);
  if (indexAge == null) return { band, amount: null };
  const row = INFLATION_BY_AGE.premiums.find((r) => r.age === indexAge);
  if (!row) return { band, amount: null };
  const col: "0" | "3" | "5" =
    inflationMethod === "none" || inflationPct <= 0
      ? "0"
      : inflationPct >= 4.5
        ? "5"
        : "3";
  const man = col === "0" ? row.m0 : col === "3" ? row.m3 : row.m5;
  const woman = col === "0" ? row.f0 : col === "3" ? row.f3 : row.f5;
  return { band, amount: Math.round((man + woman) / 2) };
}

/** Combo / linked / hybrid / LTC-annuity — LIMRA + AALTCI snapshots, not a quote. */
export const COMBO_MARKET = [
  {
    label: "Chronic-illness ADB, 2024",
    value: "327,025 policies",
    note: "73% of combination new policies (LIMRA 2024 via EY 2025). Many are discounted §101(g) riders, not a leveraged LTC pool.",
  },
  {
    label: "LTC rider on life, 2024",
    value: "91,619 policies",
    note: "20% of combination new policies. Acceleration of the death benefit; often no extension after the face is used.",
  },
  {
    label: "Linked-benefit (EOB), 2024",
    value: "32,268 policies",
    note: "7% of combination new policies. Face + extension of benefits — this model’s hybrid / asset-based lane.",
  },
  {
    label: "Stand-alone LTCI, 2024",
    value: "38,715 policies",
    note: "LIMRA 2024 via EY 2025. Still more lives than linked-benefit EOB, far fewer than chronic-illness ADB.",
  },
];

export const LINKED_BENEFIT_FEATURES = {
  intro:
    "New long-term care dollars now come mostly from combination life, not stand-alone LTCI. LIMRA splits that book into chronic-illness ADB, an LTC rider on life, and linked-benefit (extension of benefits). This model’s hybrid-life and asset-based lanes are the linked-benefit / leveraged design — not a discounted 101(g)-only rider. Figures below are published industry snapshots, not this carrier’s mix and not a quote.",
  design: [
    { item: "Chronic-illness ADB share of 2024 combo policies", share: "73%" },
    { item: "LTC rider on life", share: "20%" },
    { item: "Linked-benefit with extension of benefits", share: "7%" },
    { item: "2022 linked-benefit buyers who chose increases, EOB, or both", share: "98.2%" },
    { item: "2022 recurring-premium combo that was ADB-only (no EOB)", share: "89.5%" },
    { item: "Planning monthly as a % of face (common illustration)", share: "2%" },
  ],
  designNote:
    "LIMRA 2024 Combination Product Survey as quoted in EY, Hybrid insurance on the rise (2025). 98.2% and 89.5% are 2022 LIMRA figures Milliman republished. A 2% of-face monthly cap is an illustration convention used on many hybrid forms, not a published sales mix. This model defaults monthly to $5,000 ($1,000 step; stand-alone 2024 average monthly max was $5,428).",
  monthly: [
    { item: "Stand-alone 2024 average initial monthly max", share: "$5,428" },
    { item: "This model’s $1,000-step default", share: "$5,000" },
    { item: "AALTCI linked example pool at issue (age 55)", share: "$180,000" },
    { item: "AALTCI linked example death benefit (age 55)", share: "$120,000" },
  ],
  monthlyNote:
    "Milliman does not publish combo monthly-max mix. The $5,000 default is the stand-alone average rounded to this model’s $1,000 step. AALTCI’s circulated linked-benefit example (age 55) is a $180,000 LTC pool with a $120,000 death benefit — about 36 months at $5,000 if the pool is used evenly.",
  leverage: [
    { item: "None — accelerate face only (ADB / no EOB)", share: "Most combo lives" },
    { item: "2× (face + one extension)", share: "Common EOB" },
    { item: "3× (common planning illustration)", share: "This model’s default" },
    { item: "4× (younger / stronger underwriting)", share: "Carrier-specific" },
  ],
  leverageNote:
    "LIMRA does not publish a leverage-factor mix. 98.2% of 2022 linked-benefit buyers chose benefit increases, an extension of benefits, or both — EOB is the typical way the pool exceeds the face. This model defaults to 3× (planning). True ADB-only forms should be modeled as 1× (None).",
  elim: [
    { item: "90 calendar days (typical hybrid form)", share: "Common" },
    { item: "0 days", share: "Also offered" },
  ],
  elimNote:
    "Carrier form reviews (Brighthouse SmartCare, Securian SecureCare, Nationwide CareMatters, Lincoln MoneyGuard) commonly use a 90-day elimination, often paid retroactively once met. This model defaults to 90 days. LIMRA does not publish combo elimination mix.",
  inflation: [
    { item: "Benefit increases, EOB, or both (2022 linked-benefit)", share: "98.2%" },
    { item: "Automatic 5% compound (stand-alone 2024)", share: "2.7%" },
    { item: "This model’s linked default", share: "None (use EOB)" },
  ],
  inflationNote:
    "On linked-benefit, the extension of benefits usually does the work that an inflation rider does on stand-alone LTCI. This model defaults inflation to none and leverage to 3×. Choose 3% compound if the illustration grows the monthly cap. Combo products are generally not DRA Partnership-certified, so Partnership inflation rules do not apply.",
  deposit: [
    { item: "Traditional $180k pool, age 55 man (annual, no inflation)", share: "$1,050" },
    { item: "Traditional $180k pool, age 55 woman (annual, no inflation)", share: "$1,645" },
    { item: "Linked Co. A $180k pool / $120k DB, age 55 man (annual)", share: "$3,540" },
    { item: "Linked Co. A $180k pool / $120k DB, age 55 woman (annual)", share: "$3,265" },
    { item: "Linked Co. B $240k pool / $120k DB, age 55 man (annual)", share: "$3,750" },
    { item: "Linked Co. B $240k pool / $120k DB, age 55 woman (annual)", share: "$3,555" },
  ],
  depositNote:
    "AALTCI 2026 Price Index, age 55, no inflation growth. Linked-benefit annual premiums are for Company A ($180,000 LTC pool, $120,000 minimum death benefit) and Company B ($240,000 pool, $120,000 death benefit). Traditional $180,000 pool is shown on the same Index page for comparison — linked annual premiums are higher because they also fund a death benefit. The Index does not publish linked figures at 60, 65, or 70. Typical planning deposits cited in the trade press are $50,000–$150,000 from CDs or a 1035 exchange. Not a quote.",
};

export const LTC_ANNUITY_FEATURES = {
  intro:
    "LIMRA and Milliman do not publish a full sales mix for long-term care annuities. Advisor Magazine (2026) lists LTCi annuity premium as unreported (lump sums). What is published: the chassis is an annuity with an LTC multiplier, monthly benefits often track account value, funding is frequently a 1035 exchange, and these forms are generally not Partnership-certified.",
  rows: [
    { item: "Published sales mix (lives / premium)", share: "Not reported" },
    { item: "Typical planning multiplier", share: "2×–3×" },
    { item: "Monthly cap in this model", share: "$1,000 steps" },
    { item: "Common funding", share: "Deposit or 1035" },
    { item: "Partnership certification", share: "Generally no" },
    { item: "This model’s defaults", share: "$5,000 / mo · 3× · 90-day wait" },
  ],
  note:
    "If no claim is paid, leftover annuity or a death benefit may remain (you set the residual floor). Qualifying LTC on a tax-qualified rider uses the IRC §7702B trigger (2 of 6 ADLs or severe cognitive impairment). This is not a §101(g) acceleration — 101(g) applies to life death benefits. Confirm the contract.",
};

export const TYPICAL_LINKED = {
  monthlyBenefit: 5000,
  leverage: 3,
  residualPct: 10,
  elimDays: 90,
  benefitInflationPct: 0,
  inflationMethod: "none" as InflationMethod,
};

export function typicalLinkedPurchase() {
  return { ...TYPICAL_LINKED };
}

/** AALTCI linked-benefit lumps are published at age 55 only. */
export function typicalLinkedDepositHint(
  ageToday: number,
  inflationPct: number,
  inflationMethod: InflationMethod,
): { band: string; lump: number | null; annual: number | null } {
  const band = fiveYearIssueBand(ageToday) ?? "your age";
  const withGrowth = inflationMethod !== "none" && inflationPct >= 3;
  if (ageToday < 50 || ageToday > 59) return { band, lump: null, annual: null };
  if (withGrowth) return { band, lump: 74220, annual: 5500 };
  return { band, lump: 53388, annual: 3403 };
}

export function typicalLinkedBuyerHints(ageToday: number) {
  const t = typicalLinkedPurchase();
  const band = fiveYearIssueBand(ageToday) ?? "your age";
  const inf =
    t.inflationMethod === "none" || t.benefitInflationPct <= 0
      ? "none (extension of benefits more common than an inflation rider)"
      : `${t.benefitInflationPct}% ${t.inflationMethod}`;
  return {
    lead: `Based on industry snapshots at your age bracket (${band}), most buyers are selecting`,
    monthly: `$${t.monthlyBenefit.toLocaleString("en-US")}`,
    leverage: `${t.leverage}×`,
    elim: `${t.elimDays}-day`,
    inflation: inf,
    residual: `${t.residualPct}%`,
  };
}

export function typicalLinkedPurchaseNote(ageToday: number) {
  const five = fiveYearIssueBand(ageToday);
  return `Planning default for the ${five} band on linked-benefit / hybrid / LTC-annuity: about $5,000 per month, 3× leverage, 90-day wait, 10% residual, inflation none (EOB is the typical substitute). Monthly is the 2024 stand-alone average ($5,428) rounded to this model’s $1,000 step — LIMRA does not publish combo monthly mix. Leverage 3× is a planning illustration, not a published sales mode. 98.2% of 2022 linked-benefit buyers chose benefit increases, an extension of benefits, or both (LIMRA via Milliman). AALTCI publishes a linked lump only at age 55. Change any field to override. Not a quote.`;
}

