import { INFLATION_BY_AGE } from "./what-consumers-buy";
import { MEDICAID_FUTURE_QUALIFIER } from "./medicaid";

export const DRA_COMPARE_INTRO =
  "DRA Partnership does not pay more on a claim. It is a Medicaid feature on a traditional tax-qualified policy: after qualifying benefits are paid, the state may disregard extra countable assets for eligibility and estate recovery. Hybrid, asset-based, and LTC annuity products are generally not Partnership-certified.";

export const DRA_DOES = [
  "Uses the same traditional tax-qualified reimbursement policy (same daily/monthly max, same elimination period).",
  "Creates a dollar-for-dollar Medicaid asset disregard equal to qualifying benefits the insurer actually paid — not premiums paid, and not unused maximum.",
  "Generally shields those designated assets from Medicaid estate recovery up to the same dollar ceiling.",
  "Usually requires inflation protection by issue age, which can also grow the future disregard because the shield equals benefits paid.",
];

export const DRA_DOES_NOT = [
  "Does not increase the daily or monthly insurance maximum.",
  "Does not protect income (Social Security, pensions, and other countable income still apply toward the cost of care).",
  "Does not replace homestead, vehicle, or other ordinary Medicaid exemptions.",
  "Does not grant automatic Medicaid — medical/functional eligibility still applies.",
  "Does not add a federal tax credit; TQ premium deduction caps are the same as any tax-qualified policy.",
  "Does not assume Medicaid will still be solvent or that the disregard will remain the same when care is needed.",
];

export const DRA_LANE_ROWS: { lane: string; pays: string; medicaid: string; ifNoClaim: string }[] = [
  {
    lane: "Self-fund",
    pays: "Countable assets pay the bill until depleted",
    medicaid: "Spend down to the state resource limit (plus ordinary exemptions)",
    ifNoClaim: "Assets remain, subject to spending and markets",
  },
  {
    lane: "Traditional (not Partnership)",
    pays: "Insurance first; assets co-pay leftover",
    medicaid: "Usual resource limit only — policy paid care, did not raise the asset cap",
    ifNoClaim: "Premiums paid are generally gone",
  },
  {
    lane: "DRA Partnership",
    pays: "Same claim as traditional",
    medicaid: "Resource limit + dollar-for-dollar of benefits paid; estate recovery uses the same ceiling",
    ifNoClaim: "Premiums gone; no disregard is earned until benefits are paid",
  },
  {
    lane: "Original IN/NY total asset (TAP)",
    pays: "Same claim as traditional",
    medicaid: "After a qualifying longer policy is exhausted, remaining countable assets may be disregarded (in-state only)",
    ifNoClaim: "Same as Partnership — TAP is earned when the qualifying policy is used",
  },
  {
    lane: "Hybrid life / asset-based / LTC annuity",
    pays: "Monthly from a leveraged pool; leftover value may go to heirs",
    medicaid: "Generally not Partnership-certified — no extra asset disregard in this model",
    ifNoClaim: "Death benefit or leftover contract value",
  },
];

export const DRA_INFLATION_ROWS = INFLATION_BY_AGE.partnership.map((row) => ({
  age: row.age,
  rule: row.rule,
  typical: row.typical,
}));

export const DRA_RECIPROCITY_SHORT = [
  "The insurance contract (daily/monthly max, remaining pool) follows the insured in every state.",
  "Medicaid’s asset disregard follows only if both the issue state and the Medicaid state participate in the compact.",
  "California generally does not join DRA reciprocity. States with no Partnership program cannot grant a disregard. MassHealth Qualified is not DRA.",
  "Indiana / New York total asset protection does not travel; a receiving DRA state would honor dollar-for-dollar only.",
];

export const DRA_NO_PROGRAM =
  "No Partnership program in this model: Alaska, Hawaii, Mississippi, Utah, Vermont, and the District of Columbia. Massachusetts uses MassHealth Qualified, not DRA. Original (pre-DRA) programs: California and Connecticut (dollar-for-dollar); Indiana and New York (dollar-for-dollar or TAP on qualifying designs).";

export const DRA_WHEN_TO_USE =
  "Use DRA Partnership when the person may later spend down into Medicaid and wants insurance payments to raise the asset cap and reduce estate recovery. Use non-Partnership traditional if Medicaid is unlikely. Use hybrid if the goal is a death benefit or lump-sum reposition, knowing there is no Partnership shield.";

export const DRA_FUTURE_NOTE = MEDICAID_FUTURE_QUALIFIER;
