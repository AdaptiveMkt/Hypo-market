import { medicaidProfile, SIL_2026, spendDownRules } from "./medicaid";

export const SSI_2026 = 994;
export const MMMNA_2026 = 2643.75;
export function maptRules(state: string) {
  const p = medicaidProfile(state);
  const spend = spendDownRules(state, p.individualLimit);
  return {
    title: `Medicaid Asset Protection Trusts (MAPT) in ${state}`,
    bullets: [
      {
        heading: "What a MAPT is",
        body: `An irrevocable trust drafted so the grantor gives up the right to take principal back. After the look-back, principal that was transferred is generally not a countable resource for ${state} long-term care Medicaid. A revocable living trust does not do this — those assets stay countable because the grantor can still take them.`,
      },
      {
        heading: "Income vs principal",
        body: "A typical MAPT lets the grantor keep the right to income (rent, dividends, interest) for life. That income is still countable on the Medicaid income test and usually goes toward the NAM once eligible. Protection is of principal, not of the income stream. A Qualified Income Trust (Miller trust) is a different tool used only for excess income in income-cap states — it is not a MAPT.",
      },
      {
        heading: "Five-year look-back",
        body: `Funding a MAPT is an uncompensated transfer. ${state} generally looks back 60 months from the Medicaid application (or institutional start, whichever snapshot the state uses). Transfers inside that window create a penalty: uncompensated amount ÷ the state’s average private-pay nursing-home rate = months of ineligibility. The penalty clock usually starts when the person is otherwise eligible and would be receiving care — not on the funding date.`,
      },
      {
        heading: `${state} income still applies`,
        body:
          spend.pathway === "income-cap"
            ? `${state} is an income-cap state. 2026 special income level is ${silLabel(state)} / month. MAPT income plus other countable income over that cap typically still needs a Qualified Income Trust. Protecting assets does not waive the income cap.`
            : spend.pathway === "both"
              ? `${state} uses both an income cap (2026 SIL ${silLabel(state)} / month; a QIT is often used when over) and a medically needy path. MAPT principal can help the resource test; income from the trust still counts toward ${spend.mnil ? `MNIL (${spend.mnil})` : "the medically needy income limit"} or the SIL.`
              : `${state} is modeled as medically needy. MAPT principal can help the resource test after the look-back. Trust income still counts toward the medically needy income limit${spend.mnil ? ` (${spend.mnil})` : ""}.`,
      },
      {
        heading: "What usually stays out",
        body: "IRAs and 401(k)s are often left out of a MAPT because of income tax on a withdrawal. The home is a common MAPT asset, but transferring homestead can affect the home-equity cap, tax basis, and estate recovery. Retirement accounts in payout, one vehicle, and personal effects may already be exempt without a trust — confirm in " +
          state +
          ".",
      },
      {
        heading: "Not a substitute for insurance",
        body: "A MAPT does not pay care bills during the five-year wait. Families still private-pay (or use LTC insurance) until the look-back clears. Partnership LTC insurance can protect remaining countable assets dollar-for-dollar without a five-year wait on those benefits. Many plans use both: insurance for the near term, a MAPT for later homestead or investment principal. Drafting belongs with a qualified Medicaid or elder-care planning attorney — this model does not create or value a MAPT.",
      },
    ],
  };
}

export function silLabel(state: string) {
  if (state === "Delaware") return "$2,485 (250% of SSI; DE is below the 300% ceiling)";
  if (state === "Alaska" || state === "Hawaii") {
    return `up to $${SIL_2026.toLocaleString("en-US")} federal ceiling (AK/HI SSI FBR is higher — confirm locally)`;
  }
  return `$${SIL_2026.toLocaleString("en-US")} (300% of SSI $${SSI_2026.toLocaleString("en-US")})`;
}

export function incomeLimitNotes(state: string) {
  const p = medicaidProfile(state);
  const spend = spendDownRules(state, p.individualLimit);
  const rows = [
    {
      label: "SSI federal benefit (individual, 2026)",
      value: `$${SSI_2026.toLocaleString("en-US")} / month`,
    },
    {
      label: "Special income level (institutional / waiver)",
      value: `${silLabel(state)} / month`,
    },
    {
      label: "Pathway in this model",
      value:
        spend.pathway === "income-cap"
          ? "Income-cap (QIT / Miller trust when over SIL)"
          : spend.pathway === "both"
            ? "Income-cap and medically needy"
            : "Medically needy (income spend-down)",
    },
    {
      label: "Medically needy income limit",
      value: spend.mnil ?? (spend.pathway === "income-cap" ? "Not the primary path — income cap applies" : "Confirm locally"),
    },
    {
      label: "MMMNA (community spouse income, federal 2026)",
      value:
        state === "Alaska" || state === "Hawaii"
          ? "Higher AK/HI MMMNA — confirm locally"
          : `$${MMMNA_2026.toLocaleString("en-US")} / month (all states except AK/HI)`,
    },
    {
      label: "Applicant countable resources",
      value: `$${p.individualLimit.toLocaleString("en-US")}${p.coupleLimit !== p.individualLimit ? ` (couple both applying $${p.coupleLimit.toLocaleString("en-US")})` : ""}`,
    },
  ];
  return {
    title: `${state} Medicaid income and resource limits (2026 planning)`,
    intro: `These are planning figures for long-term care Medicaid in ${state}, not MAGI adult expansion limits and not a determination of eligibility. SSI FBR 2026 is $${SSI_2026.toLocaleString("en-US")} / month; 300% SIL is $${SIL_2026.toLocaleString("en-US")} / month in most states.`,
    rows,
  };
}