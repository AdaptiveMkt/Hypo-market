/** Educational comparison: health coverage vs long-term care. Not a quote. */

export const HEALTH_INSURANCE_INTRO =
  "Health insurance pays doctors and hospitals. It is not long-term care insurance. Medicare does not pay for most custodial long-term care (help with bathing, dressing, eating, or a residential assisted-living or nursing stay that is not skilled). This table is educational — not a plan comparison or a determination of coverage.";

export const HEALTH_INSURANCE_TYPES: {
  type: string;
  what: string;
  pays: string;
  ltc: string;
}[] = [
  {
    type: "Employer / ACA major medical",
    what: "Private health plan (job-based or Marketplace).",
    pays: "Medically necessary hospital, physician, surgery, and skilled rehab when the plan says it is covered.",
    ltc: "Almost never custodial assisted living, nursing-facility room and board, or 24-hour home care.",
  },
  {
    type: "Medicare Part A",
    what: "Hospital insurance (generally at 65, or after qualifying disability).",
    pays: "Inpatient hospital and a limited skilled-nursing-facility stay after a qualifying hospital stay (typically up to 100 days, with coinsurance after day 20).",
    ltc: "Not custodial nursing or assisted living. SNF days are skilled, not a long-term care benefit.",
  },
  {
    type: "Medicare Part B",
    what: "Medical insurance; optional with a premium.",
    pays: "Doctors, outpatient services, durable medical equipment, some home health when skilled and homebound rules are met.",
    ltc: "Not custodial home care, adult day, or assisted living room and board.",
  },
  {
    type: "Medicare Advantage (Part C)",
    what: "Private plan that replaces Original Medicare A + B (often with extras).",
    pays: "At least what Original Medicare covers; networks and prior auth vary by plan.",
    ltc: "Still not custodial long-term care. Read the plan’s Evidence of Coverage.",
  },
  {
    type: "Medigap (Medicare Supplement)",
    what: "Private policy that pairs with Original Medicare only.",
    pays: "Part A/B deductibles and coinsurance the supplement letter (G, N, etc.) lists.",
    ltc: "Does not add a long-term care pool. A few older plans had a limited at-home recovery benefit — not AL or NF custodial care.",
  },
  {
    type: "Medicare Part D",
    what: "Outpatient prescription drug coverage.",
    pays: "Formulary drugs at pharmacies; premiums and coverage phases apply.",
    ltc: "Does not pay the care setting. Drugs in a facility may bill Part D or the facility’s rate.",
  },
  {
    type: "Medicaid",
    what: "Needs-based state/federal program after income and resource rules.",
    pays: "Can pay nursing facility, HCBS waivers, and some assisted living — only after eligibility (spend-down, CSRA, QIT as the state allows).",
    ltc: "The public payer of last resort for long-term care. This model does not determine eligibility.",
  },
  {
    type: "Long-term care insurance (traditional, Partnership, hybrid, LTC annuity)",
    what: "Optional private coverage modeled in this hypothetical.",
    pays: "A daily or monthly amount after benefit triggers (typically 2 of 6 ADLs or severe cognitive impairment) and any elimination period.",
    ltc: "Designed for custodial care in the settings this run models. Not a substitute for health insurance or Medicare.",
  },
];
