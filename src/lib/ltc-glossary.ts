/** Educational glossary for this hypothetical. Not a policy contract or legal advice. */

export type GlossaryEntry = {
  term: string;
  definition: string;
};

export const LTC_GLOSSARY: GlossaryEntry[] = [
  {
    term: "1035 exchange",
    definition:
      "An IRC §1035 tax-free exchange of an existing life insurance or annuity contract into another life, annuity, or qualifying long-term care contract. Basis and gain generally carry over. Must be a direct trustee-to-trustee (or carrier-to-carrier) transfer of the same owner and insured. Not every product qualifies. This model does not execute an exchange.",
  },
  {
    term: "Accelerated death benefit (IRC §101(g))",
    definition:
      "A payment from a life insurance contract while the insured is still living, taken from the death benefit. Terminal illness under §101(g) is a physician’s certification that death is reasonably expected within 24 months; those amounts are generally excluded from income with no daily cap. Chronic illness uses the 2-of-6 ADL or severe cognitive test, and many riders also require the condition to last the rest of life. A §101(g)-only rider reduces the face and stops when the face is used. It is not tax-qualified long-term care insurance under §7702B and is generally not Partnership-certified. This model does not pay care from the face amount unless those dollars are entered as a countable asset.",
  },
  {
    term: "Activities of Daily Living (ADLs)",
    definition:
      "The six self-care tasks used as a tax-qualified benefit trigger: bathing, dressing, eating, toileting, transferring (moving in and out of a bed or chair), and continence. Tax-qualified policies generally pay when a clinician certifies that the insured cannot perform two of six ADLs without substantial assistance, expected to last at least 90 days.",
  },
  {
    term: "Aid and Attendance (VA)",
    definition:
      "A Veterans Affairs pension add-on for wartime veterans or surviving spouses who need help with daily living or are housebound. It is not long-term care insurance. Net-worth, income, and service rules apply. This model illustrates VA figures only when the wartime-veteran box is selected.",
  },
  {
    term: "Asset-based long-term care",
    definition:
      "A single-premium (or limited-pay) life or annuity contract with a long-term care accelerator and, often, an extension of benefits. The deposit is typically moved out of countable assets at purchase. Unused death benefit may go to heirs. Also called linked-benefit. Planning illustrations here are not a quote.",
  },
  {
    term: "Benefit Increase Option (inflation)",
    definition:
      "A rider that grows the daily or monthly maximum while the policy is in force and, on many designs, while on claim. Level (none) never grows. Simple inflation adds a fixed percent of the original daily each year. Compound multiplies the current daily each year. Future Purchase Option (FPO) is a periodic offer to buy more benefit and is not a field in this model.",
  },
  {
    term: "Benefit period",
    definition:
      "How long the policy will pay at the full daily or monthly maximum — for example 2, 3, 5 years, or lifetime*. A pool-of-money design is daily × 365 × years. Using less than the daily max can stretch the period. Lifetime* has no period cap in this model. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.",
  },
  {
    term: "Benefit trigger",
    definition:
      "The condition that must be certified before a tax-qualified policy pays. Typically two of six ADLs expected to last 90+ days, or severe cognitive impairment needing substantial supervision, plus any elimination period. Age, a diagnosis, or a doctor’s note alone is not enough.",
  },
  {
    term: "Cash surrender value (CSV)",
    definition:
      "The amount a linked life or annuity contract would pay if surrendered, after any contingent deferred sales charge (CDSC). Optional in this model. Not the same as the long-term care pool or the death benefit. CSV = account value minus that year’s surrender charge.",
  },
  {
    term: "Chronic-illness rider (IRC §101(g))",
    definition:
      "A life-insurance rider that can accelerate the death benefit for a qualifying chronic illness. Triggers and tax treatment differ from a tax-qualified LTC rider (§7702B). This model’s hybrid-life lane is a linked-benefit / leveraged planning design, not a discounted 101(g)-only rider.",
  },
  {
    term: "Cognitive impairment",
    definition:
      "A severe loss of mental capacity (for example Alzheimer’s or other dementia) that requires substantial supervision to protect the insured’s health and safety. It is an alternative tax-qualified trigger to the two-of-six ADL test.",
  },
  {
    term: "Community Spouse Resource Allowance (CSRA)",
    definition:
      "The amount of countable resources a community (non-applicant) spouse may keep when the other spouse applies for Medicaid long-term care. Federal 2026 figures set a minimum and maximum; states pick a method within that range. This model does not auto-apply CSRA — enter a total on Excludable assets if you are holding that amount out of the countable pool.",
  },
  {
    term: "Compound inflation",
    definition:
      "Each year the daily or monthly maximum is multiplied by (1 + the rider percent). Over long delays, compound grows faster than simple. Care costs in this model inflate on a compound CPI; if the rider is slower than care CPI, the unpaid gap still grows.",
  },
  {
    term: "Countable assets",
    definition:
      "Resources Medicaid (and this model’s pool) generally counts toward eligibility: cash, CDs, stocks, most non-homestead real estate, and many cash-value life policies. Homestead, one vehicle, personal effects, and some burial funds are often treated as exempt — rules vary by state. Enter exempt totals on Excludable assets; this model does not auto-exclude them.",
  },
  {
    term: "Daily benefit / monthly benefit",
    definition:
      "The maximum the policy will reimburse (or indemnify) per day or per month of qualifying care. Monthly in this model is daily × 365 ÷ 12. Hybrid and asset-based designs more often quote a monthly amount (commonly illustrated here as 2% of face per month).",
  },
  {
    term: "Dollar-for-dollar (Partnership) disregard",
    definition:
      "Under DRA Partnership, benefits the policy actually pays generally become a matching amount of assets the applicant may keep above the usual Medicaid resource limit. Original Partnership states (CA, CT, IN, NY) use different formulas, including total-asset protection on some older policies.",
  },
  {
    term: "DRA Partnership",
    definition:
      "The Deficit Reduction Act of 2005 Partnership program. Most states participate. A qualifying tax-qualified policy with the required inflation protection can create Medicaid asset protection equal to benefits paid (dollar-for-dollar). Certification, inflation rules, and reciprocity vary by state of issue and of care.",
  },
  {
    term: "Elimination period",
    definition:
      "The waiting period after the benefit trigger is met before the policy pays — commonly 0, 30, 90, or 180 days. Care during the wait is generally paid from assets or other sources. Some hybrid designs have no elimination period. This run’s wait is shown on the Benefit triggers card.",
  },
  {
    term: "Extension of benefits (EOB)",
    definition:
      "On linked-benefit / hybrid designs, extra long-term care capacity after the base death-benefit pool is used. Leverage in this model (2×, 3×, 4×) is a planning stand-in for that extension — not a carrier’s actual multiplier.",
  },
  {
    term: "Free-look period",
    definition:
      "A required window after delivery (often 30 days) to return the policy for a full refund. State rules vary. This hypothetical is not a policy delivery.",
  },
  {
    term: "Guaranteed renewable",
    definition:
      "The carrier cannot cancel the individual policy as long as premiums are paid, but it may raise premiums for a class of insureds with state approval. It is not a guarantee that today’s premium never changes.",
  },
  {
    term: "HIPAA tax-qualified policy",
    definition:
      "A long-term care contract that meets Internal Revenue Code §7702B: required benefit triggers, consumer protections, and (for many buyers) the possibility of deducting premiums within IRS age brackets. Benefits paid for qualifying care are generally received income-tax-free up to federal per-diem or reimbursement limits. Not every LTC-labeled product is tax-qualified.",
  },
  {
    term: "Homestead / home-equity cap",
    definition:
      "A primary residence is often excluded from countable resources while a spouse, minor child, or blind/disabled child lives there. A single long-term care applicant may face a federal home-equity cap that states adopt. This model’s residence line and exclude-homestead box are planning switches, not an eligibility determination.",
  },
  {
    term: "Hybrid life with LTC",
    definition:
      "A life insurance policy that can accelerate the death benefit for qualifying long-term care and may add an extension of benefits. Face amount, monthly LTC, leverage, and residual death benefit are user-entered or planning defaults here. Unused death benefit can go to heirs if no claim, or a residual percent after a claim — see the policy language.",
  },
  {
    term: "Indemnity vs reimbursement",
    definition:
      "Reimbursement pays actual qualifying expenses up to the daily or monthly max (receipts). Indemnity (or cash) pays the stated benefit once the trigger is met, without matching bills dollar-for-dollar. Traditional stand-alone in this model is reimbursement. Many hybrids pay a monthly cash benefit.",
  },
  {
    term: "Incurred claims vs paid claims",
    definition:
      "Paid is cash the industry actually sent to claimants that year. Incurred is paid plus the change in claim reserves. A calendar-year loss ratio over 100% on a closed block in its claim years is expected; it is not the same as insolvency. Lifetime / inception-to-date ratios are what rate filings target.",
  },
  {
    term: "Instrumental Activities of Daily Living (IADLs)",
    definition:
      "Household tasks such as shopping, cooking, managing money, housework, and transportation. IADLs are not the HIPAA two-of-six trigger. Some policies or Medicaid programs look at IADLs for a different level of care; do not assume IADL help alone starts a tax-qualified claim.",
  },
  {
    term: "Leverage (linked-benefit)",
    definition:
      "A planning multiplier on the specified amount or single premium that approximates an extension of benefits (none / 2× / 3× / 4× in this model). 3× is a common illustration, not a published sales mode. Actual products use rider language, not this slider.",
  },
  {
    term: "Look-back (Medicaid)",
    definition:
      "The period (generally 60 months) Medicaid reviews for gifts or transfers below fair market value. Transfers in that window can create a penalty period of ineligibility. Spending assets on one’s own care is generally not a look-back gift. Confirm with an elder-law attorney.",
  },
  {
    term: "Life settlement",
    definition:
      "A sale of a life insurance policy to a third party by an owner who is not terminally or chronically ill. The buyer pays a cash amount that is less than the death benefit, takes over future premiums, and collects the death benefit later. Proceeds above the owner’s basis are generally taxable. A life settlement is not an insurance claim and does not pay care in this model unless the cash received is entered as a countable asset. NAIC distinguishes this from a viatical settlement.",
  },
  {
    term: "Long-term care annuity",
    definition:
      "An annuity with a long-term care multiplier or rider. The deposit can provide a leveraged LTC pool and a remaining annuity or death value if unused. Tax and surrender-charge rules differ from stand-alone LTCI and from hybrid life. This model’s lane is educational, not a product illustration.",
  },
  {
    term: "Loss ratio",
    definition:
      "Incurred claims divided by earned premium. Calendar-year, lifetime, and actual-to-expected (A/E) are different numbers. Prefunded LTC is designed so most premium arrives in healthy years and most claims after age 80, so a current-year ratio above 100% on an old block is not, by itself, a sign the policy will not pay.",
  },
  {
    term: "Medicaid Asset Protection Trust (MAPT)",
    definition:
      "An irrevocable trust designed so transferred assets may be excluded after the look-back if the trust is drafted and administered correctly. It is not this calculator. Income, remainder-beneficiary, and tax rules are specialized. Shown only when Medicaid education is selected.",
  },
  {
    term: "Medically needy / spend-down",
    definition:
      "A Medicaid path in some states where income above the limit can be spent on medical or care bills until the person meets the state’s spend-down or share-of-cost. Separate from the resource (asset) test. Not all states have a medically needy LTC program.",
  },
  {
    term: "Nonforfeiture",
    definition:
      "A value left if the policy lapses after it has been in force a required time — often a shortened benefit period or a paid-up amount. Contingent nonforfeiture (after a large rate increase) is often required on newer issue. Optional shortened-benefit riders cost extra.",
  },
  {
    term: "Non-qualified LTC policy",
    definition:
      "A contract that does not meet HIPAA §7702B. Benefit triggers, tax treatment of benefits, and premium deductibility differ. This model’s “Non-Qualified LTC Insurance policy” switch is for illustrating no Medicaid Partnership disregard — not a tax opinion.",
  },
  {
    term: "Original Partnership (CA, CT, IN, NY)",
    definition:
      "Four states that ran Partnership programs before DRA 2005. Protection formulas can include total-asset protection on some older policies, not only dollar-for-dollar. Reciprocity with DRA states is limited. This model shows original-program notes when those states are selected.",
  },
  {
    term: "Outline of coverage",
    definition:
      "A required summary of benefits, exclusions, elimination period, and inflation options that must accompany a long-term care offer. Read it before relying on any figure in this hypothetical. This site is not an outline of coverage.",
  },
  {
    term: "Partnership reciprocity",
    definition:
      "Whether Medicaid in the state of care will honor Partnership asset protection earned on a policy issued in another Partnership state. Most DRA states have substantial reciprocity; original-program states and a few others have special rules. Confirm at application and at claim.",
  },
  {
    term: "Pool of money",
    definition:
      "In this hypothetical, the total LTC benefit available: for traditional, daily × 365 × benefit years (or lifetime*). For linked products, specified amount × leverage (and any residual death benefit separately). Countable assets are a separate pool that pays after insurance, or alone if no policy is in the run. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.",
  },
  {
    term: "Qualified Income Trust (QIT / Miller Trust)",
    definition:
      "A trust used in income-cap states so that income above the Medicaid cap can be deposited and still allow eligibility, with the state as remainder beneficiary. Rules are state-specific. This model does not create a QIT.",
  },
  {
    term: "Rate class / underwriting",
    definition:
      "The health and risk tier that sets the premium (preferred, standard, substandard, or decline). Age, medications, ADLs, cognitive screens, and build are typical. This model’s premium is user-entered or an industry-average placeholder — not an underwritten rate.",
  },
  {
    term: "Rate stability",
    definition:
      "NAIC model rules that raised the loss-ratio and certification bar on new issue so later increases should be less frequent. It does not freeze today’s premium. In-force blocks, especially pre-mid-2000s, have seen substantial class-wide increases with state approval.",
  },
  {
    term: "Reimbursement",
    definition:
      "The policy pays actual incurred costs of qualifying care, up to the daily or monthly maximum, after the elimination period. Unused daily benefit may remain in the pool. Traditional stand-alone LTCI in this model is reimbursement.",
  },
  {
    term: "Residual death benefit",
    definition:
      "On many hybrids, a minimum percent of face (often 10% in planning illustrations) that remains for heirs even after long-term care accelerations. Company language varies. Shown in this model only on linked-product rows.",
  },
  {
    term: "Restoration of benefits",
    definition:
      "A rider that can restore the used benefit pool if the insured recovers and goes a stated time (often 180 days) without needing care. Not modeled as a separate field here.",
  },
  {
    term: "Shared care",
    definition:
      "A couple’s rider that lets unused benefits on one spouse’s policy be used by the other, or a joint pool. Pricing and Partnership treatment vary. Not a separate control in this hypothetical.",
  },
  {
    term: "Shortfall",
    definition:
      "Care cost minus insurance paid minus assets used that year. Annual shortfall is the unpaid gap that year. Accumulated shortfall is the running total. The graph turns red when shortfall begins; depletion is when remaining countable assets hit zero.",
  },
  {
    term: "Simple inflation",
    definition:
      "Each year adds a fixed percent of the original daily or monthly benefit (year 10 at 3% simple = original × 1.30). It grows more slowly than compound after a few years. Care CPI in this model is still compound.",
  },
  {
    term: "Specified amount / face amount",
    definition:
      "The life insurance death benefit (or annuity specified amount) that linked-benefit LTC is calculated from. In this model, hybrid monthly LTC is illustrated as 2% of face; face needed for a chosen monthly is monthly ÷ 2%.",
  },
  {
    term: "Substantial assistance / substantial supervision",
    definition:
      "HIPAA terms. Substantial assistance is hands-on or standby help to perform an ADL. Substantial supervision is the cueing or watching needed because of severe cognitive impairment. These are the usual tax-qualified trigger standards — not a doctor’s preference alone.",
  },
  {
    term: "Suitability (NAIC)",
    definition:
      "The NAIC Long-Term Care Insurance Shopper’s Guide and Personal Worksheet ask about income, assets, and whether insurance is appropriate. This model flashes a warning under $200,000 countable assets and locks insurance options under $150,000. That is an educational gate, not a carrier’s suitability form.",
  },
  {
    term: "Surrender charge (CDSC)",
    definition:
      "A declining fee the insurer deducts if you cash out or withdraw more than the contract’s free-withdrawal amount during the surrender period (commonly 7 or 10 years). Typical 7-year schedule: 7%, 6%, 5%, 4%, 3%, 2%, 1%, then 0%. Typical 10-year: 10% down to 1%. Many contracts allow about 10% free withdrawal per year; nursing-home, terminal-illness, death, and some RMD withdrawals are often waived. This model’s optional cash-surrender projection uses a standard 7- or 10-year CDSC — not a quote. Actual rates are in the contract.",
  },
  {
    term: "Tax-qualified long-term care insurance",
    definition:
      "See HIPAA tax-qualified policy. Premiums may be deductible as medical expenses within IRS age-based limits (and some states add a credit or deduction). Benefits for qualifying care are generally income-tax-free within federal rules. Partnership policies must be tax-qualified.",
  },
  {
    term: "Traditional reimbursement LTCI",
    definition:
      "Stand-alone long-term care insurance with an annual premium, a daily or monthly maximum, a benefit period, an elimination period, and an optional Benefit Increase Option. Insurance pays first after the trigger and wait; leftover cost comes from countable assets in this model.",
  },
  {
    term: "Underwriting decline",
    definition:
      "A new application that is not issued, most often for health, medications, build, or cognitive findings. Decline rates rise with issue age. Why claims start (Alzheimer’s, stroke, injury) is a different question from why a new application is declined.",
  },
  {
    term: "Viatical settlement",
    definition:
      "A sale of a life insurance policy by an owner who is terminally or chronically ill. The buyer (a viatical settlement provider) pays cash now, pays remaining premiums, and receives the death benefit. If the seller meets the §101(g) terminal or chronic test and the buyer is a qualified viatical settlement provider, the proceeds can be treated like an accelerated death benefit for tax purposes. It is still a sale, not a long-term care insurance claim. This model does not apply the proceeds to care unless they are entered as a countable asset.",
  },
  {
    term: "Waiver of premium",
    definition:
      "Premiums are typically waived after the insured is on claim and has satisfied the elimination period. This model assumes premiums are paid from the pool until care starts, then waived. Confirm the contract.",
  },
];
