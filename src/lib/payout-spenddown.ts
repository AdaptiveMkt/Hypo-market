import { spendDownRules, MEDICAID_PAYS_CAVEAT } from "./medicaid";
import { medicaidProtectStrategies } from "./medicaid-protect";
import { isLinkedKind, type LtcPolicy } from "./calc";
import { linkedPayoutNotes } from "./linked-products";

export function payoutThenSpendDown(
  state: string,
  policy: LtcPolicy,
  individualLimit: number,
) {
  const spend = spendDownRules(state, individualLimit);
  const strategies = medicaidProtectStrategies(state);
  const elim = policy.elimDays;
  const linked = isLinkedKind(policy.kind) ? linkedPayoutNotes(policy) : [];
  const payout = policy.enabled
    ? [
        ...linked,
        {
          heading: "Benefit trigger first",
          body: linked.length
            ? "See the product trigger above. A clinician certification is still required before any linked-benefit or traditional claim starts."
            : "A tax-qualified policy does not pay because of age or a diagnosis. A clinician must certify that the insured cannot perform 2 of 6 ADLs without substantial assistance, or has a severe cognitive impairment needing substantial supervision, expected to last at least 90 days.",
        },
        {
          heading: "Elimination (waiting) period",
          body: `This run uses ${elim} day${elim === 1 ? "" : "s"}. Those days of care are usually paid from countable assets (or unpaid). Insurance does not reimburse them. After the period is satisfied, benefits can start.`,
        },
        {
          heading: "Insurance pays the claim first",
          body: "Each care year, the model applies the inflated daily (or hybrid monthly) benefit to that year’s care bill, up to the remaining policy pool. Countable assets are not drawn for care while insurance covers the year.",
        },
        {
          heading: "Reimbursement posts in arrears",
          body: "Traditional reimbursement is cash after the service. The “Ins. on the claim” column is what accrued this year. “Ins. paid (arrears)” is last year’s accrual posting this year. When the pool is used up, arrears drop to $0 even if a prior accrual existed.",
        },
        {
          heading: "Countable assets are co-pay only",
          body: "If the care bill is larger than that year’s benefit, the gap is the annual shortfall after insurance. Assets (taxable first, then IRA/401(k) in this model) pay only that gap. That is spend-down of countable resources on care — not a gift.",
        },
        {
          heading: "When both are gone",
          body: `Rows collapse after combined funds are depleted (insurance pool and countable assets). Unpaid shortfall after that is the modeled gap Medicaid, family, or other payers would face — if Medicaid is then still solvent and still paying under the rules then in force. Medicaid still generally requires countable assets down to about ${individualLimit.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} for a single applicant in ${state}, after any Partnership disregard. ${MEDICAID_PAYS_CAVEAT}`,
        },
      ]
    : [
        {
          heading: "No policy on this run",
          body: "Countable assets pay the full care bill each year until they are gone. Rows collapse at that depletion year. That asset spend-down is what Medicaid looks at: resources spent on care reduce the countable pool; gifts in the look-back generally do not.",
        },
        {
          heading: "After assets are depleted",
          body: `Unpaid shortfall continues if care is still needed. Medicaid in ${state} still applies income tests (QIT or medically needy spend-down) and the applicant resource limit of about ${individualLimit.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} — if Medicaid is then still solvent and still administering those tests under the rules then in force. Insurance is not modeled here — include a policy to see insurance-first, then assets. ${MEDICAID_PAYS_CAVEAT}`,
        },
      ];

  const wanted = new Set([
    "Partnership long-term care insurance",
    "Community spouse resource allowance (CSRA)",
    "Homestead, caregiver-child, and sibling exceptions",
    "Spend-down, burial, and exempt conversions",
    "Qualified Income Trust",
  ]);

  return {
    title: policy.enabled
      ? "How insurance pays, then assets, then spend-down"
      : "How assets pay, then spend-down",
    payout,
    spendTitle: `${state} spend-down strategies (educational)`,
    spendIntro: spend.bullets[0],
    spendRules: spend.bullets.slice(1, 4),
    strategies: strategies.bullets.filter((b) => wanted.has(b.heading)),
  };
}