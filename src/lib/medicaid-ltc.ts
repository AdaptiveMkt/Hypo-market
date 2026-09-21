import { money } from "./utils";
import {
  eligibilityRules,
  medicaidProfile,
  spendDownRules,
  MEDICAID_FUTURE_QUALIFIER,
  MEDICAID_PAYS_CAVEAT,
} from "./medicaid";
import { partnershipInfo } from "./partnership";
import { MMMNA_2026 } from "./mapt";

export function spousalImpoverishment(state: string) {
  const p = medicaidProfile(state);
  const csra =
    p.csraMin != null
      ? `${money(p.csraMin)} minimum to ${money(p.csraMax)} maximum (2026 federal range; ${state} follows this model)`
      : `up to ${money(p.csraMax)} — this model treats ${state} as allowing the community spouse to keep 100% of countable assets to that cap`;
  return {
    title: `Spousal impoverishment protections in ${state}`,
    lead: `Federal “spousal impoverishment” rules (42 U.S.C. §1396r-5) keep the spouse who still lives at home from being left with almost nothing when the other spouse applies for Medicaid long-term care. They allocate resources (CSRA) and income (MMMNA). They are not a Qualified Income Trust and they are not a MAPT.`,
    bullets: [
      {
        heading: "Who is protected",
        body: "These rules apply when one spouse is in a medical institution (or, in most states, on an HCBS waiver) and the other is a community spouse who is not also applying. Two spouses both applying use the couple resource limit, not a CSRA.",
      },
      {
        heading: "CSRA — resources",
        body: `${state} CSRA in this model: ${csra}. Countable assets are snapshotted (often at the first continuous period of institutionalization). The institutionalized spouse is then generally limited to ${money(p.individualLimit)}. Amounts above the CSRA + applicant limit must be spent down or otherwise reduced. A Partnership disregard, if any, is applied at eligibility — it is not the CSRA.`,
      },
      {
        heading: "MMMNA — income",
        body: `The community spouse’s own income is usually not counted toward the applicant’s special income level. If the community spouse’s income is below the minimum monthly maintenance needs allowance (MMMNA), some of the institutionalized spouse’s income may be diverted first. Federal MMMNA in 2026 is ${money(MMMNA_2026)} / month in the 48 contiguous states (AK/HI are higher — confirm locally). Excess shelter costs can raise the allowance up to a state cap.`,
      },
      {
        heading: "Order of operations",
        body: "Income-first: many states meet the MMMNA from the applicant’s income before shifting extra resources. Resource-first is the minority path. Either way, a QIT (below) is only an income-cap tool. It does not increase the CSRA.",
      },
      {
        heading: "Home and income after eligibility",
        body: "The homestead usually stays exempt while the community spouse lives there (home-equity cap typically does not apply in that case). After eligibility, remaining applicant income after personal-needs allowance and any MMMNA diversion is the NAM paid to the facility.",
      },
    ],
  };
}

export function medicaidLtcOverview(state: string) {
  const profile = medicaidProfile(state);
  const spend = spendDownRules(state, profile.individualLimit);
  const elig = eligibilityRules(state);
  const pInfo = partnershipInfo(state);
  const lookBack =
    state === "California"
      ? "California uses a 30-month look-back for nursing-facility Medi-Cal on transfers on or after January 1, 2026 (not a 60-month federal clock). Community Medi-Cal is not scored the same way — confirm locally."
      : "Look-back is generally 60 months (five years) before the Medicaid LTC application. Gifts and sales below fair market value in that window can create a penalty period equal to the uncompensated value divided by the state’s average monthly private-pay nursing rate.";

  return {
    title: `Medicaid long-term care in ${state}`,
    lead: `${state} Medicaid can pay nursing-facility care, and often home- and community-based (HCBS) waiver services, after functional need, residency, resources, and income tests are met. Assisted living is covered only if the state has a waiver or specialized program — it is not automatic. This is educational planning, not a determination of eligibility. ${MEDICAID_PAYS_CAVEAT}`,
    covers: [
      "Nursing facility (institutional Medicaid) after a nursing-home level of care.",
      "HCBS waivers / home care when the state offers them and a slot is available — wait lists are common.",
      `Assisted living only if ${state} has a waiver or state plan that lists that setting.`,
    ],
    limits: [
      `Single applicant countable-asset limit in this model: ${money(profile.individualLimit)}. Couple both applying: ${money(profile.coupleLimit)}.`,
      `Community spouse resource and income rules are under Spousal impoverishment below (not repeated here).`,
      profile.homeEquity != null
        ? `Home-equity cap for a single LTC applicant: ${money(profile.homeEquity)}. The cap usually does not apply while a spouse, minor child, or blind/disabled child lives there.`
        : "This model does not apply a home-equity cap here — confirm locally.",
      spend.pathway === "income-cap" || spend.pathway === "both"
        ? `Income-cap path: special income level about ${money(spend.sil)} / month (300% of SSI FBR). Income over the cap often needs a Qualified Income Trust (Miller trust).`
        : `Medically needy path: excess income is reduced by incurred medical / LTC bills. MNIL ${spend.mnil ?? "confirm locally"}; period ${spend.mnPeriod ?? "confirm locally"}.`,
    ],
    lookBack,
    nam: `After eligibility, remaining countable income (after a small personal-needs allowance and any community-spouse income allowance) is paid to the facility as the NAM — the resident’s share of cost. Medicaid pays the rest of the allowed rate. Insurance benefits that pay the facility reduce what Medicaid (and the NAM) must cover. ${MEDICAID_PAYS_CAVEAT}`,
    partnership:
      pInfo.kind === "none"
        ? `${state} is not modeled as a Partnership state in this tool. A tax-qualified policy still pays claims; it does not, by itself, raise the Medicaid resource limit.`
        : pInfo.kind === "original-tap" || pInfo.kind === "original-dd"
          ? `${state} is an original Partnership state (CA/CT/IN/NY). Qualifying designs can protect remaining assets dollar-for-dollar or, in IN/NY, total assets when the policy meets TAP rules. Protection generally does not travel if Medicaid is later claimed in another state.`
          : pInfo.kind === "masshealth"
            ? `${state} MassHealth has its own long-term care rules. Partnership-style protection is not modeled the same as DRA compact states — confirm with counsel.`
            : `${state} participates in the DRA Partnership compact. Benefits paid on a qualifying tax-qualified policy can be disregarded dollar-for-dollar at Medicaid. The insurance contract travels; the Medicaid disregard generally follows only in compact states.`,
    estate:
      "Most states file an estate-recovery claim against the probate estate (often including the home after both spouses have died) for Medicaid LTC paid. Partnership-protected assets may still face recovery rules — confirm with counsel.",
    futureNote: MEDICAID_FUTURE_QUALIFIER,
    impoverishment: spousalImpoverishment(state),
    eligibility: elig,
    spendTitle: spend.title,
    spendBullets: spend.bullets,
    profileNotes: profile.notes,
  };
}