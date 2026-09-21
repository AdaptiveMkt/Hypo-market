import { partnershipInfo, tapQualifies, type PartnershipKind } from "./partnership";
import { isLinkedKind, type LtcPolicy } from "./calc";

/**
 * DRA default is national reciprocity unless a state opts out.
 * California is the Partnership state that does not join the compact.
 * States with no Partnership cannot grant a Medicaid asset disregard.
 * IN/NY total asset protection is in-state only; a receiving DRA state honors dollar-for-dollar.
 */
export function inReciprocityCompact(state: string) {
  const k = partnershipInfo(state).kind;
  if (k === "none") return false;
  if (state === "California") return false;
  if (k === "masshealth") return false;
  return true;
}

export type ReciprocityMode = "none" | "dollar-for-dollar" | "total-asset";

export type ReciprocityOutcome = {
  issueState: string;
  medicaidState: string;
  issueKind: PartnershipKind;
  medicaidKind: PartnershipKind;
  insuranceFollows: boolean;
  compactIssue: boolean;
  compactMedicaid: boolean;
  sameState: boolean;
  mode: ReciprocityMode;
  title: string;
  bullets: string[];
};

export function reciprocityOutcome(
  issueState: string,
  medicaidState: string,
  policy: LtcPolicy,
  preferTap: boolean,
): ReciprocityOutcome {
  const issueKind = partnershipInfo(issueState).kind;
  const medicaidKind = partnershipInfo(medicaidState).kind;
  const sameState = issueState === medicaidState;
  const compactIssue = inReciprocityCompact(issueState);
  const compactMedicaid = inReciprocityCompact(medicaidState);

  let mode: ReciprocityMode = "none";
  if (policy.enabled && !isLinkedKind(policy.kind)) {
    if (sameState) {
      if (medicaidKind === "original-tap" && preferTap && tapQualifies(policy, medicaidState)) {
        mode = "total-asset";
      } else if (medicaidKind !== "none") {
        mode = "dollar-for-dollar";
      }
    } else if (compactIssue && compactMedicaid) {
      mode = "dollar-for-dollar";
    }
  }

  const bullets: string[] = [
    "The insurance contract itself (daily or monthly benefit, inflation, remaining pool) follows the insured in every state. Reciprocity is only about Medicaid’s asset disregard, not about whether the claim pays.",
    "Medicaid eligibility, income rules, CSRA, home-equity caps, and estate recovery are always the rules of the state where the person applies — not the issue state.",
  ];

  if (!policy.enabled) {
    bullets.push("No policy is in this run, so there is no Partnership certification to carry.");
  } else if (isLinkedKind(policy.kind)) {
    bullets.push(
      "Hybrid products (asset-based, long-term care annuity, hybrid life) are generally not Partnership-certified in either state, so no Medicaid disregard travels.",
    );
  } else if (sameState && mode === "total-asset") {
    bullets.push(
      `Issued and used in ${medicaidState}: qualifying original-program total asset protection can apply. TAP does not follow if the person later applies for Medicaid in a DRA state — that receiving state would honor dollar-for-dollar only.`,
    );
  } else if (sameState && mode === "dollar-for-dollar") {
    bullets.push(
      `Issued and used in ${medicaidState}: in-state Partnership dollar-for-dollar disregard applies if the policy is Partnership-certified there.`,
    );
  } else if (sameState && medicaidKind === "none") {
    bullets.push(
      `${medicaidState} has no Partnership program. Benefits still pay; they do not create a Medicaid asset disregard.`,
    );
  } else if (issueState === "California" && !sameState) {
    bullets.push(
      "California does not participate in the national Partnership reciprocity compact. A California Partnership policy generally will not create a Medicaid asset disregard in another state (the claim can still pay).",
    );
  } else if (medicaidState === "California" && !sameState) {
    bullets.push(
      "California does not honor out-of-state Partnership certifications. Applying for Medi-Cal in California after buying a Partnership policy elsewhere generally yields no extra asset disregard.",
    );
  } else if (medicaidKind === "none") {
    bullets.push(
      `${medicaidState} has no Partnership program, so it cannot grant a reciprocal asset disregard even if the policy was certified in ${issueState}.`,
    );
  } else if (issueKind === "none") {
    bullets.push(
      `A policy issued in ${issueState} is not Partnership-certified (no program). Moving to ${medicaidState} does not create a disregard that was never earned.`,
    );
  } else if (issueKind === "masshealth" || medicaidKind === "masshealth") {
    bullets.push(
      "MassHealth Qualified protection is Massachusetts-specific. It is not DRA Partnership reciprocity.",
    );
  } else if (compactIssue && compactMedicaid) {
    bullets.push(
      `Both ${issueState} and ${medicaidState} are modeled as compact participants. ${medicaidState} would typically honor dollar-for-dollar disregard equal to benefits paid — even if the policy was a TAP design in Indiana or New York. TAP itself does not travel.`,
    );
  } else {
    bullets.push(
      "This pair is not treated as reciprocal in this model. Confirm with both state Medicaid agencies before relying on a disregard.",
    );
  }

  bullets.push(
    "Connecticut, Indiana, and New York filed federal state-plan amendments to reciprocate with DRA neighbors on a dollar-for-dollar basis. New Partnership sales in New York have been paused in recent years; existing NY Partnership policies can still be used.",
  );
  bullets.push(
    "Confirm certification, the Partnership disclosure, and both states’ current compact status with a licensed representative. This is educational, not a Medicaid determination.",
  );

  const title =
    mode === "total-asset"
      ? `In-state TAP (${medicaidState})`
      : mode === "dollar-for-dollar"
        ? sameState
          ? `In-state dollar-for-dollar (${medicaidState})`
          : `Reciprocal dollar-for-dollar (${issueState} → ${medicaidState})`
        : `No Medicaid disregard (${issueState} → ${medicaidState})`;

  return {
    issueState,
    medicaidState,
    issueKind,
    medicaidKind,
    insuranceFollows: true,
    compactIssue,
    compactMedicaid,
    sameState,
    mode,
    title,
    bullets,
  };
}

export const RECIPROCITY_EXAMPLES = [
  "California",
  "Connecticut",
  "Indiana",
  "New York",
  "Florida",
  "Texas",
  "Pennsylvania",
  "North Carolina",
  "Massachusetts",
  "Alaska",
  "Hawaii",
] as const;

export const RECIPROCITY_RULES = [
  {
    title: "Insurance always travels",
    body: "Daily/monthly benefits, remaining pool, inflation, and elimination follow the insured in every U.S. state. Reciprocity is only about Medicaid’s extra asset disregard.",
  },
  {
    title: "DRA default is the compact",
    body: "Under the Deficit Reduction Act, a Partnership state honors dollar-for-dollar disregard earned in another participating state unless it opts out. Wisconsin opted out briefly and rejoined in 2010. This model treats every DRA/original-CT/IN/NY state except California as in the compact.",
  },
  {
    title: "California is isolated",
    body: "California does not join the national compact either direction: a CA Partnership policy generally will not create a disregard in another state, and Medi-Cal generally will not honor an out-of-state Partnership certification.",
  },
  {
    title: "Original four",
    body: "CA/CT are dollar-for-dollar. IN/NY also offered total asset protection on richer designs. CT, IN, and NY filed federal state-plan amendments to reciprocate with DRA neighbors on a dollar-for-dollar basis. TAP itself does not travel. New NY Partnership sales have been paused in recent years; existing NY Partnership policies can still be used.",
  },
  {
    title: "No-program states cannot grant a disregard",
    body: "Alaska, Hawaii, Mississippi, Utah, Vermont, and D.C. are modeled with no Partnership program. Massachusetts uses MassHealth Qualified rules, which are not DRA reciprocity.",
  },
  {
    title: "Receiving-state Medicaid still applies",
    body: "Income tests, CSRA, home-equity caps, spend-down, look-back, and estate recovery are always the rules of the state where the person applies — not the issue state.",
  },
];
