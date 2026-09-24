/** Industry claims-paying history. Figures are published snapshots — paid ≠ incurred. */

export type ClaimsPoint = {
  year: number;
  paidB?: number;
  incurredB?: number;
  claimantsK?: number;
  note: string;
  source: string;
};

export const CLAIMS_SERIES: ClaimsPoint[] = [
  {
    year: 2006,
    paidB: 3.3,
    note: "AALTCI: $3.3B benefits paid; about one-third to home care.",
    source: "AALTCI (Feb 2007 release on 2006 paid claims)",
  },
  {
    year: 2010,
    paidB: 6.0,
    claimantsK: 134,
    note: "AALTCI: leading 10 carriers ~$4B; industry estimate ~$6B. 134,431 claimants in a 30-day snapshot.",
    source: "AALTCI Long-Term Care Insurance Claims Report (study Jan 2011)",
  },
  {
    year: 2011,
    paidB: 6.6,
    claimantsK: 200,
    note: "AALTCI: $6.6B paid to about 200,000 people (+8% vs prior year). Women ~65% of new claims.",
    source: "AALTCI summary of claims data (2011 experience)",
  },
  {
    year: 2014,
    claimantsK: 255,
    note: "NAIC CIPR: slightly under $100B cumulative incurred claims 1992–2014; 254,910 in-force claimants; 73,130 new claims that year.",
    source: "NAIC Center for Insurance Policy & Research LTC study (data through 2014)",
  },
  {
    year: 2020,
    paidB: 11.6,
    claimantsK: 325,
    note: "AALTCI traditional LTCI paid $11.6B to about 325,000 people. Milliman/NAIC: incurred claims flattened in the COVID year.",
    source: "AALTCI paid-claims release (citing 2020); Milliman NAIC Experience Forms review",
  },
  {
    year: 2022,
    claimantsK: 345,
    note: "AALTCI: about 345,000 people received traditional LTCI benefits.",
    source: "AALTCI paid-claims release (Jan 2024, citing 2022)",
  },
  {
    year: 2023,
    paidB: 14.1,
    incurredB: 16,
    claimantsK: 353,
    note: "AALTCI: record $14.1B paid to about 353,000 people (traditional LTCI; linked-benefit hard to tally). Milliman: NAIC incurred claims ~$16B.",
    source: "AALTCI (22 Jan 2024); Milliman 2025 claims projection citing NAIC 2023",
  },
  {
    year: 2024,
    incurredB: 17,
    note: "Milliman review of NAIC 2024 Experience Reporting Forms: ~$17B incurred; ~5.8 million stand-alone lives in force; average claim size ~$180,000 (vs ~$110,000 in 2015).",
    source: "Milliman, The LTCI industry through 2024 (31 Dec 2025)",
  },
];

const CLAIMS_WITHIN_FIVE_YEARS = CLAIMS_SERIES.filter((r) => r.year >= 2022);

export const CLAIMS_CHART = CLAIMS_WITHIN_FIVE_YEARS.filter((r) => r.paidB != null || r.incurredB != null).map((r) => ({
  year: String(r.year),
  paid: r.paidB ?? null,
  incurred: r.incurredB ?? null,
}));

export const CLAIMANT_CHART = CLAIMS_WITHIN_FIVE_YEARS.filter((r) => r.claimantsK != null).map((r) => ({
  year: String(r.year),
  claimants: r.claimantsK as number,
}));

export const AALTCI_2024_SAMPLE = {
  policies: 37201,
  claimants: 6878,
  femalePct: 59,
  malePct: 41,
  marriedPct: 51,
  buyAge: 64,
  claimAgeMean: 81,
  claimAgeRange: "31–103",
  paidMin: 19,
  paidMax: 2647545,
  homeAidePct: 53,
  nursingPct: 27,
  alPct: 29,
  snVisitPct: 7,
  note: "Connecticut Partnership statistical sample (37,201 in-force policies), not the entire U.S. industry. Service-type shares can add to more than 100% when a claimant uses more than one setting.",
};

/** Why claims start, and why applications are declined. Snapshots, not this carrier. */
export const CLAIM_CAUSES = {
  note: "Shares of new claims by the initial diagnosis recorded at claim start, not of claim dollars. Publications older than five years are not linked.",
  overall: [
    { cause: "Alzheimer’s / dementia", pct: 24, note: "Nearly 1 in 4 new claims; longest-lasting on average." },
    { cause: "Stroke", pct: 9, note: "Often facility or skilled care." },
    { cause: "Arthritis", pct: 9, note: "More common among women on home-care claims." },
    { cause: "Injury / accident", pct: 9, note: "Larger share of claims that start before age 65." },
    { cause: "Circulatory", pct: 9, note: "Heart and vascular disease." },
    { cause: "Cancer", pct: 8, note: "Leading cause under age 75 on many home-care claims." },
    { cause: "Nervous system", pct: 6, note: "Includes Parkinson’s and similar; often longer claims." },
    { cause: "Respiratory", pct: 5, note: "COPD and related." },
  ],
  byAge: [
    { age: "Under 65", home: "Cancer", facility: "Nervous system", extra: "Injury and accident are over-represented vs older ages." },
    { age: "65–74", home: "Cancer", facility: "Alzheimer’s", extra: "Transition into cognitive claims." },
    { age: "75 or older", home: "Alzheimer’s", facility: "Alzheimer’s", extra: "Cognitive impairment is the dominant trigger." },
  ],
  whenClaimsBegin: [
    { age: "Under 50", pct: 0.5 },
    { age: "50–59", pct: 1.3 },
    { age: "60–69", pct: 7.5 },
    { age: "70–79", pct: 31.5 },
    { age: "80 and over", pct: 59.2 },
  ],
  whenClaimsBeginNote:
    "Mean claim age in the 2024 Connecticut Partnership sample: 81 (range 31–103); 59% female / 41% male. Older claim-start age mixes are not cited.",
  newClaims2018: [
    { age: "81–85", pct: 25 },
    { age: "86–90", pct: 27.2 },
    { age: "91+", pct: 17.5 },
  ],
};

export const UW_DECLINES = {
  note: "Underwriting decline is not a claims denial. These figures are the share of applications that did not go in force because of health (decline or, in some tables, decline plus deferral). Carriers and products differ. Simplified-issue and worksite cases are looser than fully underwritten individual traditional LTCI.",
  milliman2024: [
    { age: "40–49", pct: 18.1 },
    { age: "50–59", pct: 23.8 },
    { age: "60–64", pct: 32.7 },
    { age: "65–69", pct: 43.0 },
    { age: "70–74", pct: 50.1 },
  ],
  milliman2024Note:
    "2025 Milliman Long-Term Care Insurance Survey, Table of 2024 underwriting decisions that ended in a decline, by issue-age band (excluding one simplified-issue product). About 1 in 4 applicants in the 50s, 1 in 3 at 60–64, and about 1 in 2 at 70–74.",
  milliman2019: [
    { age: "40–49", pct: 19.4, couplePct: 35.0 },
    { age: "75+", pct: 53.6, couplePct: 78.5 },
  ],
  milliman2019Note:
    "2020 Milliman LTCI Survey (2019 applications), as reported by AALTCI: individual decline 19.4% at 40–49 and 53.6% at 75+. Probability that at least one spouse is declined: 35.0% at 40–49 and 78.5% when both are 75 or older.",
  reasons: [
    "Build (height/weight) is often the single most common hard decline on fully underwritten individual business (carrier underwriting guides, including Genworth/CareScout).",
    "Conditions that commonly close the file: insulin-treated diabetes, stroke or TIA, early cognitive change or an abnormal cognitive screen, current use of a cane/walker, and any existing ADL limitation.",
    "Other frequent impairments: heart disease, arthritis and back pain, psychiatric illness, recent cancer treatment, and current smoking.",
    "A decline is not the same as a later claim denial. After issue, tax-qualified policies pay when two of six ADLs are expected to last 90+ days or there is severe cognitive impairment needing supervision — plus the elimination period. Unlicensed family care and care outside the U.S. are commonly limited.",
  ],
};

export const GENWORTH_CLAIMS = {
  firstIssue: 1974,
  paidThrough2024B: 32,
  claimsThrough2024: 389000,
  perBusinessDayM: 10,
  paidThrough2025B: 35,
  closedNewSales: 2019,
  carescoutLaunch: 2025,
  note: "Genworth Life and affiliates. Producer materials (experience through 31 Dec 2024): more than $32B paid and more than 389,000 claims; over $10M per business day. 4Q 2025 earnings: about $35B paid through 31 Dec 2025. Closed to new traditional sales in 2019; CareScout Care Assurance launched 2025.",
};

/** Calendar-year vs lifetime vs A/E — three different “claims ratios.” */
export const GENWORTH_RATIOS = {
  naicYear: 2024,
  naicNote:
    "NAIC Long-Term Care Insurance Experience Reporting Form 1, reporting year 2024 ($000 as filed). Direct loss ratio = incurred claims ÷ earned premiums for that calendar year. Prefunded LTC routinely prints a calendar-year ratio over 100% once the block is in its claim years — premiums were collected earlier.",
  calendar: [
    {
      label: "Genworth Life (70025)",
      earnedM: 2131,
      incurredM: 3236,
      ratio: 151.89,
      lives: 967164,
      openClaims: 40221,
      opened: 17745,
      closed: 17717,
    },
    {
      label: "Genworth Life of NY (72990)",
      earnedM: 205,
      incurredM: 349,
      ratio: 170.16,
      lives: 70180,
      openClaims: 3433,
      opened: 1377,
      closed: 1332,
    },
    {
      label: "Industry individual (Form 1 current)",
      earnedM: 12298,
      incurredM: 15890,
      ratio: 129.2,
      lives: null,
      openClaims: null,
      opened: null,
      closed: null,
    },
  ],
  combined: {
    earnedM: 2336,
    incurredM: 3585,
    ratio: 153.5,
    lives: 1037344,
    openClaims: 43654,
  },
  industryItdRatio: 66.91,
  industryItdNote:
    "Form 1 individual direct inception-to-date loss ratio 66.91% (earned ~$277B, incurred ~$185B). Lifetime/inception ratios stay below calendar-year ratios because decades of premiums arrived before the claim years.",
  gaapPremiums: [
    { year: 2022, premiumsM: 2500 },
    { year: 2023, premiumsM: 2463 },
    { year: 2024, premiumsM: 2310 },
  ],
  gaapBenefits2024M: 3774,
  gaapBenefitsToPremium2024: 163,
  ae: [
    { year: 2023, preTaxM: 269, note: "Unfavorable actual vs expected (10-K liability remeasurement)." },
    { year: 2024, preTaxM: 241, note: "Lower terminations and higher claims." },
    { year: 2025, preTaxM: 256, note: "Higher claims and lower terminations; ~$75M per quarter average." },
  ],
  choiceI: {
    originalLlr: 60,
    updatedLlr: 101.3,
    limited: 92.5,
    lifetime: 116.6,
    note: "Virginia SERFF Choice I (policies issued before Oct 1, 2003), September 2025: original filing lifetime loss ratio 60%; 2024 cash-flow-testing best-estimate LLR 101.3% (92.5% limited-benefit, 116.6% lifetime-benefit).",
  },
  paidDirect: [
    { year: 2020, paidM: 2196 },
    { year: 2021, paidM: 2098 },
    { year: 2022, paidM: 2244 },
    { year: 2023, paidM: 2484 },
    { year: 2024, paidM: 2723 },
  ],
  future: {
    premUndisc2025B: 32.8,
    benUndisc2025B: 116.3,
    premDisc2025B: 22.9,
    benDisc2025B: 59.6,
    note: "10-K year-end 2025: expected remaining LTC benefit payments $116.3B undiscounted vs $32.8B remaining gross premiums (about 3.5 to 1). Discounted: $59.6B benefits vs $22.9B premiums. The runoff still has more claims ahead than premiums left to collect.",
  },
};

export const GENWORTH_RATIO_CHART = [
  { label: "GLIC 2024", ratio: 151.9 },
  { label: "GLIC NY 2024", ratio: 170.2 },
  { label: "Industry 2024", ratio: 129.2 },
  { label: "Industry ITD", ratio: 66.9 },
  { label: "Choice I orig.", ratio: 60 },
  { label: "Choice I 2024 BE", ratio: 101.3 },
];

export const INDUSTRY_CONTEXT = [
  "Private stand-alone LTCI is about 50 years old. More than 100 companies sold in the 1990s; fewer than 15 still write much new stand-alone business. Hybrid life/annuity LTC riders now dominate new sales (LIMRA combination surveys).",
  "Early pricing used disability-like lapse rates (often 5%+). SOA/LIMRA lapse studies and NAIC later found actual voluntary lapses often well under 1% at later durations, so more people kept coverage into old age than priced. Incidence and length of claim were also understated on many pre-mid-2000s blocks.",
  "Milliman (NAIC 2024 forms): covered lives down 1–3% a year (terminations outpace issues by about 127,000 lives). Open claims still rose 2–3% a year in 2022–2024 as the block ages. Top five by in-force premium (Genworth, John Hancock, Northwestern Mutual, MetLife, and Unum) cover nearly 60% of stand-alone lives.",
  "Milliman 2026 projection (no new sales in the model): paid claims keep rising into about 2041, peaking near $44 billion, then decline as the closed block runs off.",
];

/** SOA Research Institute + LIMRA experience studies (stand-alone LTCI). */
export const SOA_LIMRA = {
  study2016: {
    title: "SOA Long-Term Care Intercompany Experience Study — Aggregate Database 2000–2016",
    published: "12 Aug 2020",
    companies: 18,
    premiumShare: 80,
    exposureM: 61.3,
    claims: 620591,
    incidencePct: 1.012,
    termExposureM: 10.95,
    terminations: 349110,
    deaths: 233366,
    termPct: 3.189,
    claimMortPct: 2.131,
    note: "18 carriers, about 80% of 2016 stand-alone earned premium. Overall incidence is exposure-weighted (younger durations pull the average down). Claim termination excludes benefit exhaustion from the count. HIPAA Safe Harbor limited granularity. Genworth was a contributing company.",
  },
  study2011: {
    title: "SOA / LIMRA Intercompany Experience — policy terminations 2000–2011",
    published: "Jul 2015 (revised Sep 2015)",
    carriers: 22,
    livesShare: 75,
    note: "LIMRA (Marianne Purushotham) built the voluntary-lapse, mortality, and total-termination databases from 22 carriers, about 75% of lives in force. Incidence, claim termination, and utilization databases were produced separately (Towers Watson).",
  },
  study1984: {
    title: "SOA Long-Term Care Experience Committee Intercompany Study 1984–2004",
    incidencePct: 0.64,
    lapsePct: 5.5,
    priorLapsePct: 7.4,
    closedDeathPct: 65,
    closedRecoveryPct: 26,
    closedExpiryPct: 8,
    incidenceByAge: [
      { age: "<50", all: 0.03, zeroDay: 0.08 },
      { age: "50–59", all: 0.06, zeroDay: 0.13 },
      { age: "60–69", all: 0.2, zeroDay: 0.52 },
      { age: "70–79", all: 0.69, zeroDay: 1.44 },
      { age: "80+", all: 1.65, zeroDay: 2.79 },
    ],
    note: "Older block, higher lapses than later studies. Incidence rises sharply by attained age; a 90-day elimination period cut incidence vs 0-day. About 65% of closed claims ended in death, 26% recovery, 8% benefit expiry.",
  },
  valuation2021: {
    title: "SOA / American Academy LTC Insurance Mortality and Lapse Study (2021)",
    note: "Replaced the statutory minimum-reserve mortality and lapse bases. Base mortality: 2012 Individual Annuity Mortality. Lapse and mortality margins drawn from the 2000–2011 SOA/LIMRA LTC Voluntary Lapse and Mortality Experience Study.",
  },
  forthcoming: {
    title: "SOA Research Institute + LIMRA + NAIC experience study, contract years 2000–2023",
    announced: "4 Aug 2025",
    carriers: 13,
    marketShare: "about two-thirds of stand-alone LTCI",
    note: "Announced 4 Aug 2025. Stand-alone only (hybrids may be a later study). Data were due to LIMRA 15 Sep 2025. The published report is not in this hypothetical yet. Studies published before September 2021 are not cited.",
  },
};

/** LIMRA combination / linked-benefit sales vs stand-alone. */
export const LIMRA_COMBO = {
  year: 2023,
  individualPremiumM: 2862,
  individualPolicies: 468731,
  linkedBenefitPremiumM: 289,
  linkedBenefitPolicies: 27528,
  adb7702bPremiumM: 549,
  adb7702bPolicies: 98988,
  avgPremium: 6105,
  note: "LIMRA 2023 individual life policies with an LTC feature (as published in the 2025 Milliman LTCI Survey, Table 4). Linked-benefit and §7702B acceleration are not the same as stand-alone LTCI and are omitted from most AALTCI “paid claims” totals.",
};

export const MILLIMAN_SURVEY_2025 = {
  standAloneNewSalesM: 112.7,
  standAloneNewSales2023M: 93.9,
  claimsPaidChangePct: 5.3,
  industryIncurred2024B: 16.9,
  industryIncurredSince1991B: 229,
  nhCountPct: 24.0,
  nhDollarPct: 29.5,
  note: "2025 Milliman Long-Term Care Insurance Survey (Broker World, 16 Dec 2025). Seven claim-reporting participants paid 5.3% more in 2024 than in 2023. Statutory industry incurred ~$16.9B in 2024; running total since 1991 about $229B. Nursing-home share of claims was the lowest in the survey’s history (24% of count, 29.5% of dollars).",
};

export const RATE_STABILITY = {
  intro:
    "Stand-alone long-term care insurance is not guaranteed-level premium in the way many people expect. Most in-force blocks may request state-approved rate increases. Newer issue (post-rate-stability / post-2010s) is priced with much lower lapse and higher incidence, so increases have been smaller — they are not promised to be zero. Linked-benefit / hybrid life is typically a single premium or a limited-pay life premium; the LTC rider does not usually have a separate renewable LTCI rate. This model does not project future premium increases.",
  bullets: [
    "Early (1990s–early 2000s) pricing often used 4–5%+ voluntary lapse. Actual later-duration lapses were frequently well under 1%, so more people kept coverage into claim ages than priced.",
    "Incidence and length of claim were also understated on many pre-mid-2000s blocks. Those two misses are the main story behind in-force rate actions.",
    "Genworth reports about $34.5 billion NPV of approved in-force rate actions since 2012. Calendar-year loss ratios over 100% on a closed block in its claim years are expected; solvency is judged on reserves, remaining premiums, and the lifetime ratio.",
    "NAIC Form 1 (2024): industry individual current-year loss ratio 129.2%; inception-to-date 66.9%. A current-year ratio over 100% is not the same as an insolvent block.",
    "Rate-stability regulation (NAIC model) raised the loss-ratio / certification bar on new issue so that later increases should be less frequent. It does not freeze today’s premium.",
    "Partnership and tax-qualified status are not a rate-increase shield. Confirm the outline of coverage and the carrier’s in-force history in the issue state.",
  ],
};

export const REPORTING_HISTORY = {
  intro:
    "The figures in this hypothetical come from several public reporting streams. They are not one database, and paid is not incurred.",
  rows: [
    {
      who: "AALTCI",
      what: "Paid-claims press summaries (dollars out the door, people on claim, mix of home / AL / NH).",
      years: "2006–2023 snapshots",
    },
    {
      who: "NAIC Experience Reporting Forms",
      what: "Statutory incurred claims, earned premium, and loss ratios by company (Form 1 and related).",
      years: "Annual; 2024 forms summarized 2025",
    },
    {
      who: "Milliman",
      what: "Reviews of NAIC forms, Broker World LTCI Survey, and industry paid-claim projections.",
      years: "Annual survey; 2025 and 2026 projections",
    },
    {
      who: "SOA Research Institute + LIMRA",
      what: "Intercompany incidence, claim termination, lapse, and mortality tables used in pricing and reserves.",
      years: "1984–2004; 2000–2011; 2000–2016; 2000–2023 update announced Aug 2025",
    },
    {
      who: "Genworth / CareScout",
      what: "Largest public carrier book: paid claims, rate-action NPV, A/E, and the Cost of Care survey this model uses for state medians.",
      years: "Ongoing; 4Q 2025 / 10-K 2025",
    },
    {
      who: "LIMRA combination surveys",
      what: "New sales of life policies with an LTC feature (linked-benefit, §7702B ADB, chronic-illness riders) vs stand-alone.",
      years: "Annual; 2023 mix used here",
    },
  ],
};