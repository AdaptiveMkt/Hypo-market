/** VA pension, A&A, and disability compensation — educational. Rates 12/1/2025–11/30/2026. */

export const VA_NET_WORTH_2026 = 163699;
export const VA_RATES_EFFECTIVE = "12/1/2025–11/30/2026";
export const VA_RATES_REVIEWED = "2026-09-18";
export const VA_RATES_REVIEW =
  "Re-check va.gov at least weekly; MAPR and compensation usually change each December 1.";

export const VA_PENSION_LIMITS_2026: {
  household: string;
  basicAnnual: number;
  basicMonthly: number;
  houseboundAnnual: number;
  houseboundMonthly: number;
  aaAnnual: number;
  aaMonthly: number;
}[] = [
  {
    household: "Veteran, no dependents",
    basicAnnual: 17441,
    basicMonthly: 1453,
    houseboundAnnual: 21313,
    houseboundMonthly: 1776,
    aaAnnual: 29093,
    aaMonthly: 2424,
  },
  {
    household: "Veteran with one dependent",
    basicAnnual: 22839,
    basicMonthly: 1903,
    houseboundAnnual: 26710,
    houseboundMonthly: 2226,
    aaAnnual: 34488,
    aaMonthly: 2874,
  },
  {
    household: "Two veterans married (both A&A for A&A column)",
    basicAnnual: 22839,
    basicMonthly: 1903,
    houseboundAnnual: 30580,
    houseboundMonthly: 2548,
    aaAnnual: 46143,
    aaMonthly: 3845,
  },
  {
    household: "Two veterans — one A&A, one Housebound",
    basicAnnual: 22839,
    basicMonthly: 1903,
    houseboundAnnual: 26710,
    houseboundMonthly: 2226,
    aaAnnual: 38350,
    aaMonthly: 3196,
  },
  {
    household: "Surviving spouse, no dependents",
    basicAnnual: 11699,
    basicMonthly: 975,
    houseboundAnnual: 14298,
    houseboundMonthly: 1192,
    aaAnnual: 18697,
    aaMonthly: 1558,
  },
  {
    household: "Surviving spouse with one child",
    basicAnnual: 15311,
    basicMonthly: 1276,
    houseboundAnnual: 17902,
    houseboundMonthly: 1492,
    aaAnnual: 22304,
    aaMonthly: 1859,
  },
];

export const VA_AA_RATES_2026 = VA_PENSION_LIMITS_2026.map((r) => ({
  household: r.household,
  annual: r.aaAnnual,
  monthly: r.aaMonthly,
}));

export const VA_PENSION_EXTRA_CHILD = 2984;
export const VA_PENSION_PENALTY_RATE = 2874;
export const VA_MEDICAL_FLOOR_ALONE = 872;
export const VA_MEDICAL_FLOOR_DEPENDENT = 1141;

/** Veteran-alone and with-spouse monthly compensation. 10–20% have no dependent add-on. */
export const VA_DISABILITY_RATES_2026: {
  rating: number;
  alone: number;
  withSpouse: number | null;
  spouseAa: number | null;
}[] = [
  { rating: 10, alone: 180.42, withSpouse: null, spouseAa: null },
  { rating: 20, alone: 356.66, withSpouse: null, spouseAa: null },
  { rating: 30, alone: 552.47, withSpouse: 617.47, spouseAa: 59.62 },
  { rating: 40, alone: 795.84, withSpouse: 882.84, spouseAa: 80.18 },
  { rating: 50, alone: 1132.9, withSpouse: 1241.9, spouseAa: 100.74 },
  { rating: 60, alone: 1435.02, withSpouse: 1566.02, spouseAa: 120.28 },
  { rating: 70, alone: 1808.45, withSpouse: 1961.45, spouseAa: 140.84 },
  { rating: 80, alone: 2102.15, withSpouse: 2277.15, spouseAa: 161.4 },
  { rating: 90, alone: 2362.3, withSpouse: 2559.3, spouseAa: 180.93 },
  { rating: 100, alone: 3938.58, withSpouse: 4158.17, spouseAa: 201.41 },
];

/** Special monthly compensation (selected 2026 planning figures, veteran alone). */
export const VA_SMC_2026 = {
  sHousebound: 4408.53,
  lAidAttendance: 4900.83,
};

export function vaBenefitsEligibility() {
  return {
    title: "VA benefits eligibility (pension, Housebound, Aid & Attendance)",
    lead: "Checking Wartime veteran or surviving spouse does not file a claim. VA pension (including Housebound and Aid & Attendance) is a separate, needs-based benefit from Medicaid and from VA disability compensation. All of the following must be true — this is educational, not a VA determination.",
    bullets: [
      {
        heading: "Service",
        body: "Discharge other than dishonorable. Entered active duty before September 8, 1980: at least 90 days of active duty with at least 1 day in a wartime period. Entered after September 7, 1980 (enlisted): generally 24 months or the full period called, plus 1 wartime day. “Wartime” is a date Congress named — it does not require combat.",
      },
      {
        heading: "Wartime periods VA currently recognizes",
        body: "WWII (Dec 7, 1941–Dec 31, 1946); Korean conflict (Jun 27, 1950–Jan 31, 1955); Vietnam in-country (Nov 1, 1955–May 7, 1975) or elsewhere (Aug 5, 1964–May 7, 1975); Gulf War (Aug 2, 1990–a date still to be set). Mexican Border and WWI periods still exist in law but rarely apply to new claims.",
      },
      {
        heading: "Age or disability (pension)",
        body: "Age 65 or older, or permanently and totally disabled (any cause), or a nursing-home patient for skilled care, or receiving SSDI/SSI. Surviving spouses qualify on the veteran’s wartime service plus their own need and income/net-worth test.",
      },
      {
        heading: "Aid & Attendance (extra MAPR)",
        body: "On top of pension, A&A requires help with ADLs, being bedridden, being in a nursing home, or similar. Housebound is a lower add-on and cannot be stacked with A&A. A&A is cash to the household — it is not a facility reimbursement like LTC insurance.",
      },
      {
        heading: "Net worth and income",
        body: `Nationwide VA pension net worth limit for 12/1/2025–11/30/2026 is $${VA_NET_WORTH_2026.toLocaleString("en-US")} (countable assets plus annual income). Unreimbursed medical expenses can reduce countable income. Gift look-back is 36 months (not Medicaid’s 60).`,
      },
      {
        heading: "Compensation vs pension",
        body: "VA disability compensation is for a service-connected rating and has no net worth test. VA generally pays the higher of compensation or pension, not both. Compensation is not cut to $90 in a Medicaid nursing home; pension usually is if there are no dependents.",
      },
    ],
  };
}

export function vaAidAttendance() {
  return {
    title: "VA Aid and Attendance (pension add-on)",
    summary:
      "A wartime veteran or surviving spouse who needs help with ADLs may receive the Aid and Attendance increase on VA pension. It is cash to the household, not a facility payment. 2026 net worth limit is $163,699 (assets plus annual income). Look-back on gifts is 36 months. Housebound cannot be stacked with A&A. Unreimbursed medical expenses can reduce countable income.",
    bullets: [
      {
        heading: "Who may qualify for A&A",
        body: "You already qualify for VA pension, and at least one of: another person helps with daily activities (bathing, feeding, dressing); you stay in bed much of the day; you are a nursing-home patient because of disability; or eyesight is 5/200 or worse in both eyes (or visual field 5 degrees or less). Housebound is a separate, lower MAPR if you spend most of your time at home because of a permanent disability. You cannot receive A&A and Housebound at the same time.",
      },
      {
        heading: "MAPR is a ceiling, not a stacked add-on",
        body: "VA pays MAPR minus countable income. The A&A dollar in the table already includes basic pension — it is not extra on top of the basic row. Maximum A&A (zero countable income): veteran alone $2,424 / month ($29,093 / year); veteran with one dependent $2,874 / month; surviving spouse $1,558 / month. Unreimbursed medical expenses count only above 5% of the basic MAPR ($872 veteran alone / $1,141 with a dependent).",
      },
      {
        heading: "Extra child and transfer penalty",
        body: `Add $${VA_PENSION_EXTRA_CHILD.toLocaleString("en-US")} / year to MAPR for each additional dependent child. If assets were given away in the 36-month look-back, VA uses a penalty divisor of $${VA_PENSION_PENALTY_RATE.toLocaleString("en-US")} / month. Nursing-home claims also use VA Form 21-0779; A&A medical evidence often uses VA Form 21-2680.`,
      },
      {
        heading: "A&A vs disability compensation",
        body: "Pension A&A is needs-based cash. Disability compensation is for a service-connected rating and has no net worth test. VA will not pay pension and compensation together — it pays the higher benefit. Spouse A&A on a compensation award is a small extra ($59.62–$201.41 / month by rating), not the pension A&A MAPR. SMC-L (A&A on compensation) is a different, higher rate (~$4,900.83 / month veteran alone).",
      },
      {
        heading: "Weekly rate review",
        body: "MAPR and compensation figures are effective 12/1/2025–11/30/2026 (last reviewed 2026-09-18). Re-check va.gov at least weekly until the next December 1 COLA.",
      },
    ],
  };
}

export function vaDisabilityRatingNotes() {
  return {
    title: "VA disability rating (2026 compensation)",
    summary:
      "Service-connected ratings run 0–100% in 10% steps. Combined ratings use VA’s whole-person method — they are not added. Dependent add-ons start at 30%. Veteran-alone 100% is $3,938.58 / month (12/1/2025–11/30/2026). Source: https://www.va.gov/disability/compensation-rates/veteran-rates/.",
    bullets: [
      {
        heading: "How a rating is set",
        body: "Each service-connected condition gets a percentage from the VASRD. Multiple ratings are combined (not summed). Bilateral factor and special monthly compensation (SMC) can add more. A temporary 100% can apply after a service-connected hospital stay of 21+ days.",
      },
      {
        heading: "Aid and Attendance on compensation vs pension",
        body: "A&A on VA pension is the MAPR add-on in the pension table. A spouse who needs A&A can also add a small amount to disability compensation (about $60–$201 / month by rating). SMC (L and above) is a different, higher compensation add-on for severe disability or loss of use — not the same as pension A&A.",
      },
      {
        heading: "Medicaid",
        body: "The compensation amount at the combined rating is usually countable income for Medicaid. 100% veteran-alone ($3,938.58 / month in 2026) is above the typical $2,982 SIL, so a QIT may be needed in an income-cap state. Compensation is not cut to $90 in a Medicaid nursing home.",
      },
    ],
  };
}

export function medicaidVaPensionLimits(state: string) {
  return {
    title: `Medicaid and VA pension limits (${state})`,
    summary: `VA pension is needs-based with a nationwide 2026 net worth limit of $163,699 and a MAPR income ceiling. ${state} long-term care Medicaid uses a much lower resource test and a special income level (usually $2,982 / month). The Aid and Attendance / Housebound add-on is often excluded from Medicaid’s eligibility income; the basic pension often counts. In a Medicaid-paid nursing home with no dependents, VA generally reduces pension to $90 / month.`,
    bullets: [
      {
        heading: "Two different tests",
        body: `VA pension (including A&A) uses one national net worth limit — countable assets plus annual income under $163,699 (12/1/2025–11/30/2026) — and pays MAPR minus countable income. ${state} Medicaid uses a state resource limit (often about $2,000 for a single LTC applicant) and an income test (SIL or medically needy). Passing VA’s test does not mean ${state} Medicaid is approved, and vice versa.`,
      },
      {
        heading: "What Medicaid usually counts from VA pension",
        body: `Federal SSI-style rules (SSA POMS SI 00830.308, https://secure.ssa.gov/poms.nsf/lnx/0500830308) treat the Aid and Attendance and Housebound allowances as reimbursement for unreimbursed medical expenses, so they are generally not countable income for the Medicaid eligibility test. The basic pension portion often is countable. Confirm the split on the VA award letter for ${state}.`,
      },
      {
        heading: "The $90 nursing-home cap",
        body: "If a veteran or surviving spouse with no dependents is in a Medicaid-covered nursing facility, federal law generally limits VA pension (including A&A) to $90 / month after the month Medicaid starts. That $90 is typically kept as personal needs. This cap does not apply the same way to VA disability compensation.",
      },
      {
        heading: "Look-back",
        body: `VA pension look-back on gifts is 36 months (max penalty 5 years). ${state} Medicaid look-back is generally 60 months. A transfer that is old enough for VA can still penalize Medicaid.`,
      },
    ],
  };
}

export function vaDisabilityCompensationRules(state: string) {
  return {
    title: "VA disability compensation (service-connected)",
    summary:
      "Compensation is paid for a service-connected disability. It is not needs-based: no MAPR, no $163,699 net worth test, and no 36-month look-back. You cannot receive VA pension and VA disability compensation at the same time — VA pays the higher benefit. For Medicaid, compensation is usually countable income.",
    bullets: [
      {
        heading: "Who it is for",
        body: "A current disability linked to service, rated 10% to 100% (plus special monthly compensation in some cases). Wartime service is not required. Compensation is tax-free. Confirm current rates at https://www.va.gov/disability/compensation-rates/veteran-rates/.",
      },
      {
        heading: "No financial test",
        body: "Income, assets, and gifts do not reduce the compensation check. Dependent add-ons start at 30%. 10% and 20% ratings have no spouse or child add-on. Hospitalization for a service-connected condition lasting 21+ days can temporarily pay at the 100% rate. TDIU (unemployability) pays at the 100% rate when the veteran cannot work because of service-connected disability.",
      },
      {
        heading: "SMC vs pension A&A",
        body: `SMC-S (housebound on compensation) is about $${VA_SMC_2026.sHousebound.toLocaleString("en-US")} / month veteran alone. SMC-L (A&A on compensation) is about $${VA_SMC_2026.lAidAttendance.toLocaleString("en-US")} / month. Those replace or increase the 100% schedular rate — they are not the pension A&A MAPR of $2,424 / month.`,
      },
      {
        heading: `How ${state} Medicaid usually treats it`,
        body: `The monthly compensation amount is generally countable income toward ${state}’s SIL / medically needy test. 100% veteran-alone is $3,938.58 / month in 2026 — typically above SIL — so a QIT may be needed in an income-cap state. Compensation is not reduced to $90 in a Medicaid nursing home.`,
      },
      {
        heading: "Pension vs compensation — pick one",
        body: "VA will not pay both. This model does not file a VA claim or choose between the two.",
      },
    ],
  };
}