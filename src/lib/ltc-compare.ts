export const LTC_COMPARE_FEATURES: {
  feature: string;
  none: string;
  traditional: string;
  partnership: string;
  hybrid: string;
}[] = [
  {
    feature: "How you pay",
    none: "Care is paid from countable assets as bills arrive.",
    traditional: "Annual or monthly premium until claim (then often waived).",
    partnership: "Same traditional premium. Policy must be Partnership-certified and tax-qualified.",
    hybrid: "One deposit taken from countable assets at purchase (single premium).",
  },
  {
    feature: "How claims pay",
    none: "No insurance. Assets (then unpaid shortfall) cover the setting’s cost.",
    traditional: "Reimbursement up to the daily/monthly max after the elimination period. Insurance pays first; assets co-pay the leftover.",
    partnership: "Same claim mechanics. Certification does not increase the daily max.",
    hybrid: "Monthly LTC from the leveraged pool (this model: 2% of face per month). Usually no elimination period.",
  },
  {
    feature: "Inflation",
    none: "Care costs still rise with CPI. Assets grow only at the assumed R.O.I.",
    traditional: "Optional rider: level, simple, or compound. Rider is how the daily max keeps up with care inflation.",
    partnership: "DRA Partnership usually requires inflation protection by issue age. That rider also grows the future Medicaid disregard.",
    hybrid: "Leverage and remaining pool follow the product. Often not Partnership inflation rules.",
  },
  {
    feature: "If no claim is paid",
    none: "Assets remain (subject to spending and markets).",
    traditional: "Premiums paid are generally gone. No death benefit on a stand-alone policy.",
    partnership: "Same as traditional. Disregard is earned only when benefits are paid.",
    hybrid: "Unused value can go to heirs as a death benefit, or a cash-surrender schedule if elected. Death benefits vary by company.*",
  },
  {
    feature: "Medicaid asset disregard",
    none: "None. Spend down to the state’s resource limit (plus ordinary exemptions).",
    traditional: "None, unless the policy is Partnership-certified.",
    partnership: "Dollar-for-dollar of benefits paid (or in-state TAP in qualifying IN/NY). Estate recovery uses the same ceiling.",
    hybrid: "Generally not Partnership-certified. No extra Medicaid disregard in this model.",
  },
  {
    feature: "Federal and State Tax Deductions and/or Tax Credit (2026)",
    none: "Unreimbursed care may be a medical expense. No premium deduction.",
    traditional: "TQ premiums may be deducted up to the IRS age cap ($500–$6,200). Some states add a credit (e.g. NY 20% / $1,500).",
    partnership: "Same federal TQ rules. Partnership is a Medicaid feature, not an extra tax credit.",
    hybrid: "The deposit is generally not deductible as an LTC premium. Benefits on a TQ linked-benefit design may still be tax-free.",
  },
  {
    feature: "Best used when",
    none: "Assets can absorb a multi-year care stay, or insurance is declined / not wanted.",
    traditional: "You want a dedicated care pool and can budget an ongoing premium.",
    partnership: "You may later need Medicaid and want benefits paid to raise the asset cap.",
    hybrid: "You want a single transfer, a death benefit if unused, and can move a lump sum.",
  },
];

export const LTC_INSURANCE_OPTIONS: {
  option: string;
  pays: string;
  medicaid: string;
  fit: string;
}[] = [
  {
    option: "Self-fund (no policy)",
    pays: "Countable assets pay the setting’s bill until depleted; unpaid shortfall after that.",
    medicaid: "Spend down to the state resource limit. No Partnership disregard.",
    fit: "Large liquid pool, declined for insurance, or care is imminent inside an elimination period.",
  },
  {
    option: "Traditional tax-qualified reimbursement",
    pays: "Daily/monthly max after elimination (this model defaults 100 days). Insurance pays first; assets co-pay the leftover.",
    medicaid: "None unless the policy is Partnership-certified. Premiums may be age-capped medical deductions.",
    fit: "Want a dedicated care pool and can budget an ongoing premium.",
  },
  {
    option: "Partnership (DRA or original CA/CT/IN/NY)",
    pays: "Same claim as traditional. Certification does not raise the daily max.",
    medicaid: "Dollar-for-dollar of benefits paid (or in-state TAP in qualifying IN/NY). Estate recovery uses the same ceiling.",
    fit: "May later need Medicaid and want benefits paid to raise the asset cap.",
  },
  {
    option: "Asset-based hybrid (life or annuity + LTC)",
    pays: "Monthly LTC from a leveraged pool (this model: 2% of face). Unused value can go to heirs.*",
    medicaid: "Generally not Partnership-certified. Deposit leaves the countable pool at purchase.",
    fit: "Prefer a single transfer and a death benefit if unused.",
  },
  {
    option: "Short-term care insurance",
    pays: "Typically 90–365 days of home, ALF, or facility benefits. Often easier underwriting than full LTC.",
    medicaid: "Not Partnership. Can bridge an elimination period or a MAPT look-back year.",
    fit: "Need a short private-pay bridge, not a multi-year pool.",
  },
  {
    option: "Life with chronic-illness / LTC rider",
    pays: "Accelerates part of the death benefit for qualifying care. Caps follow the life face amount.",
    medicaid: "Not Partnership. Remaining death benefit may still be an estate asset.",
    fit: "Already own (or will buy) life insurance and want a linked-benefit option.",
  },
  {
    option: "Medicaid Asset Protection Trust",
    pays: "Does not pay care. Principal may be non-countable after the 60-month look-back. Income is still countable.",
    medicaid: "Look-back penalty if funded inside 5 years. Different from a QIT/Miller trust.",
    fit: "Healthy enough to wait five years; often paired with insurance for the wait.",
  },
];