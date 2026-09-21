import { FEDERAL_PER_DIEM_2026 } from "./ltc-tax";

/** IRC §101(g) — accelerated death benefits on life insurance. */
export const IRC_101G_PER_DIEM_2026 = FEDERAL_PER_DIEM_2026;
export const IRC_101G_PER_DIEM_ANNUAL_2026 = FEDERAL_PER_DIEM_2026 * 365;

export const IRC_101G_TITLE = "IRC §101(g) accelerated death benefits";

export const IRC_101G_INTRO =
  "Internal Revenue Code §101(g) treats certain amounts paid from a life insurance contract while the insured is still alive as if they were paid by reason of death under §101(a) — generally excluded from gross income. That is the tax chassis for chronic-illness and terminal-illness accelerations of a death benefit. It is not the same as tax-qualified long-term care insurance under §7702B.";

export const IRC_101G_POINTS: { heading: string; body: string }[] = [
  {
    heading: "Terminal illness — no per-diem cap",
    body: "If a physician certifies that the insured’s death is reasonably expected within 24 months, accelerated death benefits under §101(g) are generally fully excluded from income. There is no daily cap. Carrier contracts often still limit how much of the face amount can be accelerated (for example a percentage of specified amount).",
  },
  {
    heading: "Chronic illness — same 2 of 6 / cognitive test, often permanence",
    body: "§101(g) borrows the “chronically ill” definition from §7702B(c)(2): a licensed health-care practitioner certifies that the insured cannot perform 2 of 6 ADLs without substantial assistance, or has a severe cognitive impairment requiring substantial supervision. Many §101(g) chronic-illness riders also require the condition to be expected to last the rest of the insured’s life — a higher bar than a 90-day §7702B LTC trigger. Read the rider: “LTC” on a life illustration is sometimes only a chronic-illness acceleration.",
  },
  {
    heading: "2026 per-diem limit on indemnity accelerations",
    body: `For chronically ill insureds, reimbursement of qualified long-term care costs is generally excluded. Indemnity / per-diem accelerations are tax-free only up to the IRS per-diem (Rev. Proc. 2025-32): $${IRC_101G_PER_DIEM_2026}/day ($${IRC_101G_PER_DIEM_ANNUAL_2026.toLocaleString("en-US")} per 365-day year) in 2026. Excess is taxable unless actual qualified care costs are at least as high. The cap is the year of the acceleration, not the year of purchase. Terminal-illness accelerations are not subject to this cap.`,
  },
  {
    heading: "§101(g) acceleration vs §7702B LTC rider",
    body: "A true tax-qualified LTC rider on life (§7702B(e) treats it as a separate LTC contract) typically states a monthly benefit, a benefit pool, and often an extension of benefits after the face amount is used. A §101(g) chronic-illness rider only accelerates (reduces) the death benefit; it does not create extra LTC dollars beyond the face, and some forms pay a discounted present value at claim rather than the full monthly face. This model’s hybrid-life lane assumes contractual monthly LTC plus leverage/EOB (a 7702B-style linked benefit), not a discounted 101(g)-only rider.",
  },
  {
    heading: "How this hypo maps the two codes",
    body: "Death-benefit acceleration in the hybrid-life projection is the §101(g) (or 7702B acceleration) phase: insurance paid reduces the face. Extension of benefits after the face is exhausted is modeled as a 7702B-style LTC continuation (leverage). Residual death benefit is what may remain for heirs. A 101(g)-only chronic-illness rider would stop when the face is gone — no EOB column.",
  },
  {
    heading: "Cannot be marketed as long-term care insurance",
    body: "Chronic-illness riders that qualify only under §101(g) are accelerated death benefits. They generally cannot be advertised as long-term care insurance. NAIC and state advertising rules treat 7702B LTC riders as LTCI. Confirm which code the form uses before comparing it to traditional LTCI or Partnership.",
  },
  {
    heading: "Business-owned life (§101(g)(5))",
    body: "Amounts received by a business that has an insurable interest because the insured is a director, officer, employee, or financially interested party are generally not excluded under §101(g). Employer-owned or key-person accelerations need separate tax counsel. This hypo is for personal planning.",
  },
];

export const IRC_101G_COMPARE: { topic: string; g101: string; b7702: string }[] = [
  {
    topic: "What it is",
    g101: "Acceleration of an existing life death benefit while living",
    b7702: "Tax-qualified long-term care insurance (stand-alone or a rider treated as a separate LTC contract)",
  },
  {
    topic: "Trigger",
    g101: "Terminal (death expected within 24 months) or chronically ill (2 of 6 ADLs or severe cognitive impairment; many riders also require permanence)",
    b7702: "Chronically ill: 2 of 6 ADLs or severe cognitive impairment expected to last at least 90 days",
  },
  {
    topic: "Pays beyond the death benefit?",
    g101: "No — only accelerates (and reduces) the face amount",
    b7702: "Yes, if the form includes an extension of benefits / LTC pool larger than the face",
  },
  {
    topic: "2026 tax-free indemnity cap",
    g101: `Chronic: $${IRC_101G_PER_DIEM_2026}/day; terminal: no per-diem cap`,
    b7702: `$${IRC_101G_PER_DIEM_2026}/day on per-diem/indemnity; reimbursement of qualified costs generally excluded`,
  },
  {
    topic: "Partnership / Medicaid disregard",
    g101: "Generally no — not LTCI",
    b7702: "Traditional 7702B policies may be Partnership-certified; most hybrids are not",
  },
  {
    topic: "Premium deduction (§213(d)(10))",
    g101: "Life premium is not an eligible LTC premium",
    b7702: "Eligible TQ LTC premium may be deductible up to the age cap",
  },
];
