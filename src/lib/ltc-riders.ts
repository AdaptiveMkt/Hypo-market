export type LtcRiderRow = {
  rider: string;
  what: string;
  typical: string;
  traditional: string;
  hybrid: string;
  watch: string;
};

/** Planning notes, not a quote. Loads vary by carrier, age, and state. */
export const LTC_RIDERS: LtcRiderRow[] = [
  {
    rider: "Inflation protection",
    what: "Grows the daily/monthly maximum (and usually the pool) on a set schedule so benefits do not freeze at issue.",
    typical: "3% compound is a common planning default. 5% compound costs more. Simple adds a percent of the original daily. CPI-match tracks a published index. Future-purchase option (FPO) lets you buy more later at attained age, often with underwriting if you skip offers.",
    traditional: "Usually a rider priced into premium at issue. DRA Partnership often requires compound inflation if issued at age 60 or younger.",
    hybrid: "May be built-in, limited to the extension-of-benefits years, or not offered on the accelerated-death-benefit (ADB) slice. Ask whether year-1–3 claim payments grow.",
    watch: "Inflation of benefits is not the same as a guaranteed level premium. Traditional premiums can still rise class-wide with state approval.",
  },
  {
    rider: "Shared care",
    what: "Couples rider: if one insured exhausts their pool, they may draw from the partner’s unused benefits (or a shared third pool).",
    typical: "Planning load often about 8–20% of premium. Policies usually must match at issue.",
    traditional: "Optional on many joint-issue designs. Some forms give leftover benefits to the survivor at death.",
    hybrid: "Joint/shared linked-benefit designs may share a monthly max or an 8-year joint pool instead of two separate riders.",
    watch: "If both need care at once, a shared pool can empty faster. Confirm whether the survivor inherits remaining benefits with no extra premium.",
  },
  {
    rider: "Waiver of premium",
    what: "Premiums stop while the insured is on claim (after the elimination period, on many forms).",
    typical: "Often built into tax-qualified policies; joint-waiver for a spouse is the extra-cost version.",
    traditional: "Usually standard after benefits begin. Joint waiver / survivorship is optional.",
    hybrid: "Charges for the LTC rider are often waived during acceleration. Base life/annuity charges may still apply — read the form.",
    watch: "Waiver does not mean the elimination period was skipped. Premiums due before the waiver trigger still come due.",
  },
  {
    rider: "Restoration of benefits",
    what: "If the insured recovers and stays off claim for a set time (often 180 days), the used pool can refill up to the original maximum.",
    typical: "Planning load often about 4–6%.",
    traditional: "Useful if more than one separate care event is realistic.",
    hybrid: "Less common; ADB usually reduces death benefit as it pays and may not restore unless a restoration-of-ADB rider exists.",
    watch: "Restoration is not a second lifetime. It only refills after a qualifying recovery.",
  },
  {
    rider: "Return of premium (ROP)",
    what: "Pays heirs some or all premiums (usually minus claims) if the insured dies without using the pool — or, on some forms, only if death is before a stated age.",
    typical: "Often the most expensive add-on (planning range about 25–75%). Caps such as 3× the initial monthly benefit appear on some forms.",
    traditional: "Optional. Addresses “what if I never need care?”",
    hybrid: "The leftover death benefit already returns unused value. A separate ROP on a linked-benefit policy can double-pay for the same idea.",
    watch: "ROP is a legacy feature, not more care. Compare cost vs simply buying more daily benefit.",
  },
  {
    rider: "Nonforfeiture / contingent NF",
    what: "If the policy lapses after it has been in force a required time, a reduced paid-up benefit remains instead of $0.",
    typical: "Full shortened-benefit NF is costly (planning 15–25%). Contingent NF (triggered after a large rate increase) is often built in under NAIC/HIPAA rules.",
    traditional: "Ask whether contingent NF is already in the base policy before buying a paid rider.",
    hybrid: "Cash surrender / residual death benefit is the usual “if I quit” value, subject to CDSC.",
    watch: "A reduced paid-up benefit is much smaller than the original pool. Staying in force is the real protection.",
  },
  {
    rider: "Survivorship / joint waiver",
    what: "After both policies have been in force a required period with little or no claim, the survivor’s premiums may be waived if the first spouse dies.",
    typical: "Planning load often about 10%. Compare against shared care before buying both.",
    traditional: "Couples optional rider.",
    hybrid: "Survivorship on linked-benefit is form-specific; some second-to-die designs already pay at the second death.",
    watch: "Waiting periods and claim-free rules are strict. Not the same as shared care.",
  },
  {
    rider: "0-day home-care elimination",
    what: "Home-care benefits can start without waiting out the facility elimination period.",
    typical: "Planning load often about 8–15%.",
    traditional: "Strong if the first claim is expected at home.",
    hybrid: "Monthly cap and elimination are in the rider schedule; home vs facility waits may differ.",
    watch: "Facility claims may still have 30–100 day waits. This rider does not skip benefit triggers (2 of 6 ADLs or severe cognitive impairment).",
  },
  {
    rider: "Alternate plan of care / care coordination",
    what: "Lets the insurer pay for a written plan that is not on the standard list (e.g., home modification, adult day, or an emerging setting) when care coordination is used.",
    typical: "Often included; some richer home-health riders cost extra.",
    traditional: "Common on care-coordination forms.",
    hybrid: "Covered services follow the rider’s qualified-care definition — usually tax-qualified.",
    watch: "Not a blank check. The insurer must approve the plan. Unlicensed or family-only care is often limited.",
  },
  {
    rider: "§101(g) chronic-illness vs §7702B LTC",
    what: "Tells you whether the form is only an accelerated death benefit or true tax-qualified long-term care (with a pool that can extend past the face).",
    typical: "Not a priced add-on — it is the Internal Revenue Code the rider uses. 2026 indemnity exclusion for chronic-illness accelerations is $430/day unless actual qualified costs are higher.",
    traditional: "Stand-alone tax-qualified LTCI is IRC §7702B. There is no death-benefit acceleration.",
    hybrid: "Confirm the outline: §101(g) chronic-illness only (stops when the face is gone; many riders require the condition to last the rest of life) vs §7702B LTC rider (90-day expected duration, often with an extension of benefits).",
    watch: "A 101(g)-only rider generally cannot be advertised as long-term care insurance and is not Partnership-certified. Terminal illness (death expected within 24 months) has no per-diem cap.",
  },
];

export const LTC_RIDER_INTRO =
  "Compare riders side by side: what they do on traditional reimbursement vs asset-based / hybrid life or annuity. Riders change what the policy pays, when it pays, and what is left for a spouse or heirs. They do not change the benefit triggers (generally 2 of 6 ADLs or severe cognitive impairment, plus the elimination period). This table is educational — not a quote, not an offer, and not every rider is available on every form or in every state.";

export const LTC_RIDER_GLANCE: {
  rider: string;
  traditional: string;
  hybrid: string;
  cost: string;
}[] = [
  { rider: "Inflation protection", traditional: "Common optional rider", hybrid: "Often limited or EOB-only", cost: "Highest typical load" },
  { rider: "Shared care", traditional: "Optional couples rider", hybrid: "Joint pool / shared max instead", cost: "About 8–20%" },
  { rider: "Waiver of premium", traditional: "Usually built in on claim", hybrid: "LTC charges often waived; base may continue", cost: "Often included" },
  { rider: "Restoration of benefits", traditional: "Optional after recovery", hybrid: "Rare on ADB", cost: "About 4–6%" },
  { rider: "Return of premium", traditional: "Optional (expensive)", hybrid: "Death benefit already returns unused value", cost: "About 25–75%" },
  { rider: "Nonforfeiture", traditional: "Full NF costly; contingent often built in", hybrid: "CSV / residual death benefit", cost: "Full NF about 15–25%" },
  { rider: "Survivorship / joint waiver", traditional: "Optional couples", hybrid: "Form-specific", cost: "About 10%" },
  { rider: "0-day home-care wait", traditional: "Optional", hybrid: "In the rider schedule", cost: "About 8–15%" },
  { rider: "Alternate plan of care", traditional: "Often included", hybrid: "Follows qualified-care definition", cost: "Often included" },
  { rider: "§101(g) vs §7702B", traditional: "TQ is §7702B only", hybrid: "Must confirm which code", cost: "Code, not a load" },
];

export type LtcRiderExample = {
  rider: string;
  setup: string;
  without: string;
  withRider: string;
  takeaway: string;
};

export const LTC_RIDER_EXAMPLES: LtcRiderExample[] = [
  {
    rider: "3% compound inflation",
    setup: "Traditional $200 / day, 5-year pool ($365,000) bought today. Care starts in 10 years. Care CPI is separate.",
    without: "Level daily stays $200. Pool still $365,000. Ten years of 4% care inflation roughly doubles a $73,000 year-1 bill — the policy covers a shrinking share.",
    withRider: "Daily grows to about $269 in year 10 ($200 × 1.03¹⁰). Pool at claim about $491,000 if the maximum grows with the daily. First-year insurance max ≈ $98,000 vs $73,000 level.",
    takeaway: "Inflation is usually the highest-value rider when claim is years away. Partnership at issue age 60 or younger often requires compound, not level.",
  },
  {
    rider: "Shared care (couples)",
    setup: "Two matching $200 / day, 5-year policies ($365,000 each). Spouse A needs 7 years of care; Spouse B needs none in the illustration.",
    without: "Spouse A exhausts $365,000 in about 5 years, then countable assets (or Medicaid) pay years 6–7. Spouse B’s unused $365,000 stays locked.",
    withRider: "After A’s pool is gone, A may draw B’s unused pool. Years 6–7 can stay on insurance instead of a $150,000+ asset spend (at $75,000 / year).",
    takeaway: "Shared care is a couples tool. If both are on claim at once, the combined pool empties faster. Confirm survivor inheritance of leftovers.",
  },
  {
    rider: "Restoration of benefits",
    setup: "$200 / day, 5-year pool. A 14-month rehab claim uses about $85,000. Insured recovers and is off claim 180 days, then a later 3-year claim.",
    without: "Second claim starts with about $280,000 left. Three years at a grown daily can exhaust the remainder and open a shortfall.",
    withRider: "After 180 claim-free days the original $365,000 maximum can refill. The second claim starts with a full pool again (subject to the form).",
    takeaway: "Restoration helps two separate events (stroke then later dementia). It does not create a second lifetime while still on the first claim.",
  },
  {
    rider: "Return of premium at death",
    setup: "$4,000 annual premium × 20 years = $80,000 paid. Insured dies with $0 claims (or claims of $15,000).",
    without: "Heirs receive $0 from the LTC policy (no death benefit on a pure reimbursement form).",
    withRider: "Heirs may receive about $80,000, or $65,000 if the form subtracts $15,000 of claims. Some forms cap ROP (e.g. 3× the initial monthly benefit).",
    takeaway: "ROP is expensive (often 25–75% extra). On a hybrid, leftover death benefit already returns unused value — stacking ROP can overpay for the same idea.",
  },
  {
    rider: "Waiver of premium",
    setup: "$4,000 / year traditional premium. Three-year claim after a 100-day elimination.",
    without: "If waiver is not in force, $12,000 of premiums could still come due during the claim years — paid from the same assets that are co-paying care.",
    withRider: "After the elimination period, the $4,000 / year stops while benefits are paid. About $12,000 stays in the countable pool and can keep earning the assumed R.O.I.",
    takeaway: "Waiver is often built into tax-qualified policies. Joint waiver (spouse’s premium also stops) is the extra-cost version.",
  },
  {
    rider: "0-day home-care elimination",
    setup: "100-day facility elimination; home care at $250 / day. First claim is 24-hour home care.",
    without: "Days 1–100 at home are unpaid by insurance: about $25,000 from assets (or unpaid) before the daily benefit starts.",
    withRider: "Home-care benefits can start on day 1. That $25,000 stays in the pool. Facility claims may still wait 30–100 days.",
    takeaway: "Useful when the plan is to age at home. It does not skip 2-of-6 ADL or cognitive triggers.",
  },
  {
    rider: "§101(g) only vs §7702B + EOB",
    setup: "Hybrid life $150,000 face, $3,000 / month, 2× leverage. Qualifying chronic-illness claim lasts 6 years.",
    without: "A 101(g)-only chronic-illness rider accelerates the $150,000 face (about 50 months at $3,000) then stops. Years 5–6 are assets or unpaid. Many 101(g) riders also require the condition to be permanent.",
    withRider: "A §7702B LTC rider with 2× EOB continues after the face: pool $300,000, about 100 months at $3,000. Years 5–6 can stay on insurance.",
    takeaway: "Same monthly number on an illustration can hide two different codes. Read whether benefits stop at the face.",
  },
];

export const LTC_RIDER_HYBRID_NOTE =
  "Asset-based / linked-benefit policies already bundle a death benefit or cash value with an LTC acceleration (and often an extension of benefits). Adding traditional-style ROP or restoration on top can overlap that design. Traditional reimbursement is where inflation, shared care, and NF riders are most often priced as separate options.";
