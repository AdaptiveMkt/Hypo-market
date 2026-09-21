import { medicaidProfile } from "./medicaid";
import { money } from "./utils";

/** 2026 SSI and related federal figures (SSA / CMCS). Educational planning — confirm current. */

export const SSI_2026 = {
  cola: 0.028,
  fbrIndividual: 994,
  fbrCouple: 1491,
  essentialPerson: 498,
  inHouseholdIndividual: 662.67,
  inHouseholdCouple: 994,
  resourceIndividual: 2000,
  resourceCouple: 3000,
  silIndividual: 2982,
  silCouple: 5964,
  sga: 1690,
  sgaBlind: 2830,
  twp: 1210,
  earnedBreakEven: 2073,
  unearnedBreakEven: 1014,
  mmmna: 2643.75,
  csraMin: 32532,
  csraMax: 162660,
  homeEquityMin: 752000,
  homeEquityMax: 1130000,
  reviewed: "2026-09-18",
};

export function ssiIncomeLimits2026() {
  const s = SSI_2026;
  return {
    title: "SSI and related federal income limits (2026)",
    summary: `SSI FBR rose 2.8% on January 1, 2026: $${s.fbrIndividual.toLocaleString("en-US")} / month individual, $${s.fbrCouple.toLocaleString("en-US")} couple. Long-term care Medicaid’s special income level is 300% of that FBR ($${s.silIndividual.toLocaleString("en-US")} / month). Request more information for the full 2026 table. Source: https://www.ssa.gov/oact/cola/SSI.html ; CMCS CIB 12/9/2025 https://www.medicaid.gov/federal-policy-guidance/downloads/cib12092025.pdf .`,
    rows: [
      { label: "SSI FBR — individual", value: `$${s.fbrIndividual.toLocaleString("en-US")} / month` },
      { label: "SSI FBR — eligible couple", value: `$${s.fbrCouple.toLocaleString("en-US")} / month` },
      { label: "Essential person", value: `$${s.essentialPerson.toLocaleString("en-US")} / month` },
      { label: "Living in the household of another", value: `$${s.inHouseholdIndividual.toLocaleString("en-US")} individual / $${s.inHouseholdCouple.toLocaleString("en-US")} couple` },
      { label: "SSI resource limit", value: `$${s.resourceIndividual.toLocaleString("en-US")} individual / $${s.resourceCouple.toLocaleString("en-US")} couple` },
      { label: "Special income level (300% of FBR)", value: `$${s.silIndividual.toLocaleString("en-US")} individual / $${s.silCouple.toLocaleString("en-US")} couple both applying` },
      { label: "SGA (non-blind / blind)", value: `$${s.sga.toLocaleString("en-US")} / $${s.sgaBlind.toLocaleString("en-US")} / month` },
      { label: "Trial work period", value: `$${s.twp.toLocaleString("en-US")} / month` },
      { label: "MMMNA (community spouse, except AK/HI)", value: `$${s.mmmna.toLocaleString("en-US")} / month` },
      { label: "CSRA min / max", value: `$${s.csraMin.toLocaleString("en-US")} / $${s.csraMax.toLocaleString("en-US")}` },
      { label: "Home-equity cap min / max", value: `$${s.homeEquityMin.toLocaleString("en-US")} / $${s.homeEquityMax.toLocaleString("en-US")}` },
    ],
    notes: [
      "SSI is a cash benefit. Long-term care Medicaid uses the FBR as the yardstick for SIL (300%) in most income-cap states — it is not the same as the SSI check the person receives.",
      "Many states add a state SSI supplement. This table is the federal floor only.",
      "COLA for SSI (January) is separate from the VA pension COLA (usually December 1). Re-check SSA.gov when a new year starts.",
    ],
  };
}

/** SSI countable-resource limits vs this state’s LTC Medicaid asset test. */
export function ssiAssetLimitsForLtc(state: string) {
  const s = SSI_2026;
  const p = medicaidProfile(state);
  const sameAsSsi =
    p.individualLimit === s.resourceIndividual && p.coupleLimit === s.resourceCouple;
  return {
    title: `SSI asset (resource) limits and ${state} Medicaid LTC`,
    lead: `SSI cash uses a nationwide countable-resource cap that has stayed at ${money(s.resourceIndividual)} for an individual and ${money(s.resourceCouple)} for an eligible couple (not increased with the January COLA). ${state} long-term care Medicaid has its own countable-asset test. The two are related — they are not the same program.`,
    bullets: [
      {
        heading: "SSI countable resources (federal, 2026)",
        body: `${money(s.resourceIndividual)} individual / ${money(s.resourceCouple)} couple. Cash, bank accounts, stocks, extra vehicles, and most cash-value life insurance generally count. The home of residence, one vehicle used for transportation, household goods, a burial plot, and a small burial fund typically do not. Going $1 over the cap can stop the SSI check for that month.`,
      },
      {
        heading: `${state} Medicaid LTC countable assets`,
        body: sameAsSsi
          ? `${state} is modeled with the same dollar caps as SSI for a single LTC applicant (${money(p.individualLimit)}) and a couple both applying (${money(p.coupleLimit)}). A community spouse may still keep a separate CSRA — that is a Medicaid spousal-impoverishment rule, not an SSI rule.`
          : `${state} is modeled with a higher (or different) LTC countable-asset limit than SSI: ${money(p.individualLimit)} for a single applicant and ${money(p.coupleLimit)} if both spouses apply. SSI cash, if the person also receives it, still uses ${money(s.resourceIndividual)} / ${money(s.resourceCouple)}. Confirm which program’s test applies to which benefit.`,
      },
      {
        heading: "What SSI does not copy from Medicaid",
        body: "SSI has no CSRA, no Partnership asset disregard, and no home-equity cap like Medicaid LTC. A Partnership policy that protects assets for Medicaid does not raise the SSI resource cap. A MAPT that is old enough for Medicaid’s 60-month look-back may still be treated as a resource or a transfer for SSI — different rules, 36-month SSI look-back on some transfers.",
      },
      {
        heading: "Nursing-home SSI",
        body: `If Medicaid pays more than half the cost of a medical institution for a full calendar month, federal SSI is generally limited to $30 / month (personal needs). That $30 is not the same as the Medicaid NAM. People on SSI in many states also receive Medicaid automatically; others use a separate ABD / LTC application. Confirm the path in ${state}.`,
      },
    ],
    note: `SSI FBR (the cash check) is ${money(s.fbrIndividual)} / month individual in 2026. LTC Medicaid’s special income level is 300% of that FBR (${money(s.silIndividual)} / month) in income-cap states — an income figure, not an asset cap. Source: https://www.ssa.gov/oact/cola/SSI.html ; CMCS CIB 12/9/2025 https://www.medicaid.gov/federal-policy-guidance/downloads/cib12092025.pdf . Educational only.`,
  };
}