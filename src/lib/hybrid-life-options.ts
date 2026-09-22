/** Educational hybrid-life options — not a carrier illustration. */

export const HYBRID_LIFE_INTRO =
  "“Hybrid life” is an umbrella term. This model’s Hybrid life insurance tab is a linked-benefit planning lane: a death benefit that can be accelerated for qualifying care, then an optional extension of benefits (EOB) after the face is used. It is not a quote, underwriting, or a named product.";

export const HYBRID_LIFE_DESIGNS: { design: string; what: string; pool: string; inModel: string }[] = [
  {
    design: "Linked-benefit life",
    what: "Permanent life built for LTC. Face is accelerated for care; an EOB rider can keep paying after the face is gone.",
    pool: "Often 2×–4× face (planning range; age and health change the multiple)",
    inModel: "This Hybrid tab when leverage is 2×, 3×, or 4×",
  },
  {
    design: "Life + LTC rider",
    what: "Whole life or UL with an LTC rider. Care usually cannot exceed the death benefit unless a continuation rider is added.",
    pool: "Face only, unless EOB / continuation is purchased",
    inModel: "This Hybrid tab at leverage 1×",
  },
  {
    design: "§101(g) chronic-illness only",
    what: "Accelerates the death benefit while living. Stops when face is gone. Generally cannot be marketed as long-term care insurance.",
    pool: "Face only; some forms pay a discounted present value",
    inModel: "Not modeled — no EOB column",
  },
];

export const HYBRID_LIFE_SIZING = [
  { field: "Monthly benefit", typical: "$3,000 default in this model ($1,000 steps, $3,000 minimum)" },
  { field: "Death benefit (face)", typical: "Monthly ÷ 2% (common planning rule: $3,000/mo → $150,000 face)" },
  { field: "LTC leverage / EOB", typical: "1× (ADB only) through 4×; 3× is this model’s planning default" },
  { field: "Elimination period", typical: "90 days default; many forms also offer 0 days" },
  { field: "Inflation / BIO", typical: "Optional here; industry more often uses EOB instead of 3% compound" },
  { field: "Residual death benefit", typical: "10% floor of face in this model if care uses the death benefit" },
];

export const HYBRID_LIFE_TAX = [
  "Dollars that reduce the face are modeled as §101(g) acceleration (chronic illness uses the 2026 $430/day indemnity cap unless actual qualified costs are higher; terminal illness has no per-diem cap).",
  "Dollars after the face is exhausted are modeled as a §7702B tax-qualified LTC continuation (EOB / leverage).",
  "The single premium / deposit is generally not an eligible §213(d)(10) LTC premium. Qualifying benefits on a TQ linked-benefit form may still be income-tax free.",
  "Hybrid / linked-benefit forms are generally not DRA Partnership-certified, so they do not create a Medicaid asset disregard in this model.",
];

export const HYBRID_LIFE_NOT_MODELED = [
  "Named carrier illustrations (for example Lincoln MoneyGuard, Nationwide CareMatters, OneAmerica, Securian, Pacific Life)",
  "Single-pay vs 5-pay / 10-pay / pay-to-65 funding schedules",
  "1035 exchange funding from an existing life or annuity contract",
  "Indemnity vs reimbursement (this run treats hybrid as paying the care bill first, assets co-pay leftover)",
  "Discounted §101(g)-only riders with no extension of benefits",
  "Joint or shared pools and couples discounts",
  "Live cash-surrender / CDSC schedules (residual % is the planning stand-in)",
  "Medical underwriting, issue-state forms, or a premium quote",
];

export const HYBRID_LIFE_TAKEAWAY =
  "Hybrid life fits when the buyer wants long-term care plus a death benefit if they never claim, and can move a lump (or limited-pay) premium. Traditional reimbursement usually buys more LTC pool per premium dollar and is the only lane in this model that can be DRA Partnership-certified. Asset-based single premium is the cousin: same leverage math, deposit-first instead of face-from-monthly.";
