/** IRS Rev. Proc. 2025-32 §4.27 — 2026 IRC §213(d)(10) eligible TQ premium. */
import { STATE_NAMES } from "./costs";

export const FEDERAL_LTC_PREMIUM_2026: { age: string; amount: number }[] = [
  { age: "40 or younger", amount: 500 },
  { age: "41–50", amount: 930 },
  { age: "51–60", amount: 1860 },
  { age: "61–70", amount: 4960 },
  { age: "71 or older", amount: 6200 },
];

export const FEDERAL_PER_DIEM_2026 = 430;

/** HIPAA 1996 created TQ LTC; DRA 2005 is Partnership (Medicaid), not this deduction. */
export const HIPAA_AGE_DEDUCTION_INTRO =
  "The Health Insurance Portability and Accountability Act of 1996 (HIPAA) created tax-qualified long-term care insurance (IRC §7702B). Premiums on a tax-qualified contract may count as medical expenses, but only up to an age-based “eligible long-term care premium” cap under IRC §213(d)(10). The IRS indexes those caps each year (2026: Rev. Proc. 2025-32 §4.27). The Deficit Reduction Act (DRA) of 2005 expanded state Long-Term Care Partnership programs. DRA Partnership is a Medicaid asset disregard equal to benefits paid. It is not a federal income-tax deduction and does not change these age brackets.";

export const DRA_2005_TAX_TITLE = "DRA 2005 tax and Medicaid-tax impacts";

export const DRA_2005_TAX_INTRO =
  "The Deficit Reduction Act of 2005 (Pub. L. 109-171) did not create a new federal income-tax credit or a new age-based premium deduction. Its long-term care provisions are mainly Medicaid. A DRA Partnership policy is still a tax-qualified contract under HIPAA, so premiums and benefits follow the ordinary federal income-tax rules below — plus a Medicaid asset disregard when claims are paid.";

export const DRA_2005_TAX_POINTS: { heading: string; body: string }[] = [
  {
    heading: "No new federal income-tax deduction",
    body: "DRA 2005 did not change IRC §213(d)(10) or §7702B. Eligible tax-qualified premiums are still capped by attained age (2026: $500 / $930 / $1,860 / $4,960 / $6,200). Partnership certification does not raise that cap, create a federal credit, or make a hybrid deposit deductible.",
  },
  {
    heading: "Partnership policies are tax-qualified",
    body: "To be Partnership-certified, a traditional policy must be tax-qualified (HIPAA / §7702B), generally with inflation protection by issue age. Premiums may still be treated as medical expenses up to the age cap; qualified benefits remain generally excluded from income. Non-qualified and most asset-based / hybrid products are not DRA Partnership-certified.",
  },
  {
    heading: "Medicaid asset disregard is not an income-tax write-off",
    body: "For every dollar a DRA Partnership policy pays in qualifying claims, one dollar of countable assets may be disregarded for Medicaid eligibility and, typically, estate recovery. That is a Medicaid resource rule, not a deduction on Form 1040. Assets so protected are not “deducted” from taxable income.",
  },
  {
    heading: "Medicaid benefits are not taxable income",
    body: "Amounts Medicaid pays a facility or waiver provider are not included in the recipient’s federal gross income. The resident’s NAM (share of cost) is paid from countable income; it is not a charitable contribution or a medical-expense deduction for the same bill insurance or Medicaid already covered.",
  },
  {
    heading: "Look-back, home equity, and annuities (Medicaid, not income tax)",
    body: "DRA 2005 lengthened the Medicaid gift look-back to 60 months, added a home-equity cap for many single LTC applicants, and tightened annuity rules (irrevocable, actuarially sound, state remainder beneficiary). Those rules affect Medicaid eligibility and spend-down timing. They do not create or cancel the federal LTC premium deduction.",
  },
  {
    heading: "Federal and State Tax Deductions and/or Tax Credit are separate",
    body: "A few states allow a credit or deduction for LTC premiums on the state return. Those statutes are independent of DRA Partnership. A Partnership policy may qualify for a state credit if the state statute says so — Partnership status itself is not the credit.",
  },
  {
    heading: "Reciprocity does not change federal tax",
    body: "Whether another state’s Medicaid honors a Partnership certificate (DRA reciprocity) affects only the Medicaid disregard. Federal income-tax treatment of premiums and benefits follows the insured’s federal return, not the compact.",
  },
];

export type StateTaxBreak = {
  kind: "none" | "credit" | "deduction";
  title: string;
  detail: string;
  /** Rough annual credit if known; 0 if deduction-only or none. */
  creditEstimate: (premium: number) => number;
};

const noCredit = () => 0;

export function stateLtcTaxBreak(state: string): StateTaxBreak {
  switch (state) {
    case "Alabama":
      return {
        kind: "deduction",
        title: "Alabama LTC premium deduction",
        detail:
          "Alabama allows a deduction for premiums paid on a qualifying LTC contract, subject to specified limits (Ala. Code §40-18-15). A deduction lowers Alabama taxable income; it is not a credit.",
        creditEstimate: noCredit,
      };
    case "Indiana":
      return {
        kind: "deduction",
        title: "Indiana LTC premium deduction",
        detail:
          "Indiana allows an individual to deduct the eligible portion of premiums paid for a qualified LTC policy covering the taxpayer and/or spouse. Confirm the current Indiana Schedule. A deduction is not a credit and is not Partnership asset protection.",
        creditEstimate: noCredit,
      };
    case "California":
      return {
        kind: "deduction",
        title: "California conforms to the federal TQ deduction",
        detail:
          "California generally follows the federal IRC §213 age-capped deduction for tax-qualified LTC premiums (Cal. Rev. & Tax. Code §17201). There is no separate California LTC tax credit. Partnership in California is a Medicaid feature, not a tax credit.",
        creditEstimate: noCredit,
      };
    case "New York":
      return {
        kind: "credit",
        title: "New York LTC premium credit",
        detail:
          "Credit of 20% of premiums paid for a qualifying LTC policy, capped at $1,500. Individual NY AGI generally must be under $250,000. Unused credit may be carried forward. A credit reduces tax dollar-for-dollar; it is not Partnership asset protection.",
        creditEstimate: (p) => Math.min(1500, Math.max(0, p) * 0.2),
      };
    case "Maryland":
      return {
        kind: "credit",
        title: "Maryland LTC premium credit",
        detail:
          "Credit equal to 100% of eligible federally qualified LTC premiums, not to exceed $500 per insured. Typically one-time per insured under current law. Confirm Comptroller rules for the tax year.",
        creditEstimate: (p) => Math.min(500, Math.max(0, p)),
      };
    case "Minnesota":
      return {
        kind: "credit",
        title: "Minnesota LTC premium credit",
        detail:
          "Minnesota lists a credit of 25% of qualifying premiums, up to $100 per beneficiary ($200 married filing jointly). Small dollar credit — still a credit, not a deduction.",
        creditEstimate: (p) => Math.min(100, Math.max(0, p) * 0.25),
      };
    case "Colorado":
      return {
        kind: "credit",
        title: "Colorado LTC premium credit",
        detail:
          "Colorado credit equal to the lesser of 25% of premiums paid or $150 per policy. Historically limited to federal taxable income under $50,000 ($100,000 joint claiming two policies). Confirm the current Colorado form. Separate from any federal deduction.",
        creditEstimate: (p) => Math.min(150, Math.max(0, p) * 0.25),
      };
    case "North Dakota":
      return {
        kind: "credit",
        title: "North Dakota LTC premium credit",
        detail:
          "North Dakota has allowed a credit for a percentage of qualified LTC premiums, with possible income limits. Confirm the current ND Schedule.",
        creditEstimate: noCredit,
      };
    case "Oregon":
      return {
        kind: "credit",
        title: "Oregon LTC premium credit",
        detail:
          "Oregon has allowed a credit for a portion of LTC premiums, with limits and phase-outs. Confirm the current Oregon form.",
        creditEstimate: noCredit,
      };
    case "Maine":
      return {
        kind: "deduction",
        title: "Maine LTC premium deduction",
        detail:
          "Maine allows a state deduction for qualified LTC premiums, reduced by amounts already deducted federally. Employers may have a separate credit (lesser of $5,000, 20% of cost, or $100 per covered employee). A deduction lowers taxable income; it is not a credit.",
        creditEstimate: noCredit,
      };
    case "Idaho":
      return {
        kind: "deduction",
        title: "Idaho LTC premium deduction",
        detail:
          "Idaho has allowed a deduction of qualifying LTC premiums from Idaho taxable income, subject to conditions. Confirm the current Idaho addition/subtraction schedule.",
        creditEstimate: noCredit,
      };
    case "Virginia":
      return {
        kind: "deduction",
        title: "Virginia LTC premium deduction",
        detail:
          "Virginia has allowed a deduction for long-term care insurance premiums in some years. Confirm the current Virginia schedule.",
        creditEstimate: noCredit,
      };
    case "Washington":
      return {
        kind: "none",
        title: "Washington — WA Cares payroll program (not a premium credit)",
        detail:
          "Washington does not offer a classic LTC premium tax credit. It runs WA Cares, a mandatory payroll-funded long-term care program (0.58% as of 2026). Private TQ premiums still follow federal deduction rules only. Private coverage may interact with WA Cares exemptions — confirm before buying or opting out.",
        creditEstimate: noCredit,
      };
    default:
      return {
        kind: "none",
        title: `No separate ${state} LTC tax credit in this model`,
        detail: `${state} is treated as federal-only: itemized medical deduction (7.5% of AGI) and/or the self-employed health-insurance deduction, each capped by the IRS age table. A deduction is not a credit. Confirm with a CPA — some localities add their own rules.`,
        creditEstimate: noCredit,
      };
  }
}

export function federalTaxSummary(premium: number) {
  const p = Math.max(0, premium);
  return {
    premium: p,
    perDiem: FEDERAL_PER_DIEM_2026,
    rows: FEDERAL_LTC_PREMIUM_2026.map((r) => ({
      ...r,
      eligible: Math.min(p, r.amount),
      leftover: Math.max(0, p - r.amount),
    })),
  };
}

export function allStateTaxBreaks() {
  return STATE_NAMES.map((state) => ({ state, ...stateLtcTaxBreak(state) }));
}

export function taxIncentiveGroups() {
  const rows = allStateTaxBreaks();
  return {
    credits: rows.filter((r) => r.kind === "credit"),
    deductions: rows.filter((r) => r.kind === "deduction"),
    other: rows.filter((r) => r.kind === "none" && r.state === "Washington"),
  };
}

export function creditVsDeductionCopy() {
  return "A tax credit cuts the tax bill dollar-for-dollar. A deduction only reduces taxable income, so its value is the deduction times your marginal rate — and federal LTC premiums must still clear the 7.5% AGI medical floor if you itemize. Self-employed filers may take the age-capped amount above-the-line. C-corps may deduct the full premium. HSAs may pay TQ premiums up to the age cap. Hybrid deposits are generally not deductible as LTC premiums. State credits follow the taxpayer’s return (usually residence), not the state where care would be received.";
}

export const IRC_1035_TITLE = "IRC §1035 tax-free exchanges (including asset-based LTCI)";

export const IRC_1035_INTRO =
  "A §1035 exchange moves cash value from one insurance contract to another without recognizing gain at the time of the swap. The Pension Protection Act of 2006, effective for exchanges after December 31, 2009, added tax-qualified long-term care contracts (IRC §7702B) to the list. That is how a non-qualified life policy or annuity can fund a traditional tax-qualified LTCI policy or an asset-based (life + LTC) contract with a single premium deposit instead of a taxable withdrawal. Not tax advice.";

export const IRC_1035_ALLOWED: { from: string; to: string; ok: boolean }[] = [
  { from: "Life insurance", to: "Life, endowment, annuity, or qualified LTC (including a TQ LTC rider)", ok: true },
  { from: "Endowment", to: "Endowment (payments no later), annuity, or qualified LTC", ok: true },
  { from: "Annuity (non-qualified)", to: "Annuity or qualified LTC (including a TQ LTC rider on an annuity)", ok: true },
  { from: "Qualified LTC", to: "Qualified LTC only", ok: true },
  { from: "Annuity", to: "Life insurance", ok: false },
  { from: "Qualified LTC", to: "Life or annuity", ok: false },
  { from: "IRA / 401(k) / qualified annuity", to: "Any 1035 destination", ok: false },
];

export const IRC_1035_RULES: { heading: string; body: string }[] = [
  {
    heading: "Direct carrier-to-carrier",
    body: "The old issuer must send funds to the new issuer. If you cash out and then buy, gain is ordinary income and the 1035 is lost. You will usually receive a Form 1099-R even on a qualifying exchange.",
  },
  {
    heading: "Same insured / owner",
    body: "The insured (or annuitant) on the new contract must be the same as on the old one. You generally cannot 1035 into a spouse’s policy or a jointly owned contract.",
  },
  {
    heading: "Non-qualified money only",
    body: "IRAs, 401(k)s, 403(b)s, and other qualified-plan annuities are not 1035 exchanges. Those use rollover / trustee-to-trustee rules instead. This model’s 1035 note is for non-qualified life and annuity cash values.",
  },
  {
    heading: "Basis carries over — gain is deferred, not erased",
    body: "Your investment in the old contract becomes the basis of the new one. Built-in gain is not taxed at the exchange, but it can be taxed later if you surrender, take cash, or receive amounts that are not qualified LTC benefits.",
  },
  {
    heading: "Boot and loans",
    body: "Cash you keep, or a loan that is not transferred, is taxable boot to the extent of gain. Outstanding loans should be repaid or carried with the contract under the carrier’s 1035 paperwork.",
  },
  {
    heading: "Asset-based / hybrid LTCI",
    body: "A life or annuity contract does not fail 1035 treatment solely because a tax-qualified LTC rider is attached. A 1035 into a linked-benefit (asset-based) policy is a common way to use a single premium deposit. Traditional stand-alone TQ LTCI can also be the destination. Hybrid deposits are generally not deductible as LTC premiums under §213.",
  },
  {
    heading: "Partial exchanges",
    body: "A partial 1035 of an annuity to another annuity has IRS safe-harbor timing rules. A partial move from an annuity into qualified LTCI is a planning technique some carriers allow; it is not the same safe harbor. Confirm with the receiving company and a tax professional.",
  },
  {
    heading: "Receiving contract must be tax-qualified LTC",
    body: "The LTC destination must meet IRC §7702B (qualified long-term care services, guaranteed renewable, generally no cash value on a stand-alone TQ policy, benefits not duplicative of Medicare). Non-qualified “LTC” riders may not qualify.",
  },
];
