import { medicaidProfile } from "./medicaid";
import { silLabel } from "./mapt";

/** Educational Medicaid asset-protection strategies. Shown only when the user selects them. Not legal advice. */

export function medicaidProtectStrategies(state: string) {
  const p = medicaidProfile(state);
  return {
    title: `Medicaid asset-protection strategies in ${state}`,
    summary: `Shown only because this run requested them. These are educational planning notes for ${state}, not a recommendation and not a determination of eligibility. A qualified Medicaid or elder-care planning attorney must design any transfer, trust, or annuity. Transfers for less than fair market value can trigger a 60-month look-back penalty. This model does not assume Medicaid will still be solvent or that any Medicaid benefit will remain the same — solvency and benefits may be adjusted by legislation, regulation, or other government action.`,
    bullets: [
      {
        heading: "Partnership long-term care insurance",
        body: `A tax-qualified Partnership policy can create a dollar-for-dollar (or original TAP) Medicaid asset disregard equal to benefits paid. That is often the only strategy that protects countable assets without a five-year wait. Include a policy in this run to see the modeled disregard. It does not replace income rules or a QIT.`,
      },
      {
        heading: "Medicaid Asset Protection Trust (MAPT)",
        body: `An irrevocable trust funded more than 60 months before a ${state} application can keep principal out of the countable pool and, after the look-back, off estate recovery. The grantor generally cannot be trustee or take principal back. Transfers inside five years are penalized. This model does not draft or value a MAPT.`,
      },
      {
        heading: "Community spouse resource allowance (CSRA)",
        body: `${state} 2026 CSRA is ${p.csraMin ? `minimum $${p.csraMin.toLocaleString("en-US")}, maximum $${p.csraMax.toLocaleString("en-US")}` : `up to $${p.csraMax.toLocaleString("en-US")}`}. The applicant is generally limited to $${p.individualLimit.toLocaleString("en-US")}. Assets can be titled to the community spouse; the snapshot date matters. Income of the community spouse is usually not counted toward the applicant’s SIL (${silLabel(state)} / month).`,
      },
      {
        heading: "Homestead, caregiver-child, and sibling exceptions",
        body: `The home is often exempt while a spouse, minor child, or blind/disabled child lives there. ${state} home-equity cap for a single LTC applicant is ${p.homeEquity ? `$${p.homeEquity.toLocaleString("en-US")}` : "confirm locally"}. Penalty-free home transfers can include: an adult child who lived in the home and provided care that delayed institutionalization for at least two years; a sibling with an equity interest who lived there at least one year; or a blind/disabled child of any age. Document residence and care contemporaneously — this exception is frequently denied.`,
      },
      {
        heading: "Transfers to a spouse or disabled child",
        body: "Transfers to a spouse are generally unlimited and not penalized, but the receiving spouse’s resources still count at the next application. Transfers to a blind or permanently disabled child (any age) and to a qualifying special-needs trust for a disabled person under 65 are also commonly excepted. Confirm 42 U.S.C. § 1396p(c)(2) in " +
          state +
          ".",
      },
      {
        heading: "Medicaid-compliant annuity (crisis)",
        body: "A DRA-compliant annuity can convert a countable lump sum into an income stream: irrevocable, non-assignable, actuarially sound, equal payments, and the state named remainder beneficiary up to Medicaid paid. Often used with a community spouse or to fund a penalty period. Income still counts toward NAM / SIL. Not the same as a retail deferred annuity on the asset form.",
      },
      {
        heading: "Spend-down, burial, and exempt conversions",
        body: `Paying legitimate debts, buying exempt items (one vehicle, prepaid irrevocable funeral, burial funds up to about $${p.burialFund.toLocaleString("en-US")} in ${state}, home repairs) can reduce countable resources without a gift penalty. Gifting “half a loaf” while annuitizing the rest is a crisis technique that still creates a penalty period — do not attempt it without counsel.`,
      },
      {
        heading: "Qualified Income Trust",
        body: `A QIT / Miller trust addresses income over SIL, not assets. It does not protect a house, brokerage account, or IRA. Use the QIT more-information card if ${state} is an income-cap state.`,
      },
    ],
  };
}