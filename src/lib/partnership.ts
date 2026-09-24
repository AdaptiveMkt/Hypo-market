import { medicaidProfile } from "./medicaid";
import { STATE_NAMES } from "./costs";
import { isLifetimeBenefit, isLinkedKind, type LtcPolicy } from "./calc";

/** Deficit Reduction Act (2005) dollar-for-dollar Partnership. */
export type PartnershipKind =
  | "none"
  | "masshealth"
  | "dra"
  | "original-dd"
  | "original-tap";

export type PartnershipInfo = {
  state: string;
  kind: PartnershipKind;
  label: string;
  summary: string;
};

/** States with no DRA/original Partnership program (2026 consumer guides). Confirm locally. */
const NO_PROGRAM = new Set([
  "Alaska",
  "Hawaii",
  "Mississippi",
  "Utah",
  "Vermont",
  "District of Columbia",
]);

const ORIGINAL_DD = new Set(["California", "Connecticut"]);
const ORIGINAL_TAP = new Set(["Indiana", "New York"]);

export function partnershipInfo(state: string): PartnershipInfo {
  if (state === "Massachusetts") {
    return {
      state,
      kind: "masshealth",
      label: "MassHealth Qualified (not DRA Partnership)",
      summary:
        "Massachusetts does not run a DRA Partnership. A MassHealth Qualified traditional LTC policy can provide similar dollar-for-dollar style resource protection if it meets MassHealth rules. Confirm with MassHealth and a licensed representative.",
    };
  }
  if (NO_PROGRAM.has(state)) {
    return {
      state,
      kind: "none",
      label: "No Partnership program",
      summary: `${state} does not currently operate a Qualified State Long-Term Care Partnership program. Benefits paid do not create a Medicaid asset disregard in this model.`,
    };
  }
  if (ORIGINAL_DD.has(state)) {
    return {
      state,
      kind: "original-dd",
      label: "Original Partnership — dollar-for-dollar",
      summary: `${state} is one of the four original (pre-DRA) Partnership states. Protection is dollar-for-dollar: assets equal to benefits paid on a Partnership-certified, tax-qualified policy may be disregarded for Medicaid eligibility and estate recovery. Reciprocity with DRA states is limited — California generally does not participate in DRA reciprocity.`,
    };
  }
  if (ORIGINAL_TAP.has(state)) {
    return {
      state,
      kind: "original-tap",
      label: "Original Partnership — dollar-for-dollar or total asset protection",
      summary: `${state} is an original Partnership state. Dollar-for-dollar applies to qualifying policies. Total asset protection (all remaining countable assets disregarded after a qualifying policy is exhausted) is available on designs that meet ${state === "New York" ? "New York’s higher minimum benefit periods (often about 3–4 years of comprehensive coverage)" : "Indiana’s minimum pool (often about four years of nursing-facility-level benefits)"}. DRA states cannot copy TAP.`,
    };
  }
  return {
    state,
    kind: "dra",
    label: "DRA Partnership — dollar-for-dollar",
    summary: `${state} participates in the federal Deficit Reduction Act Partnership. For every dollar a Partnership-certified, tax-qualified traditional policy pays in qualifying claims, one dollar of countable assets may be disregarded for Medicaid eligibility and estate recovery. Hybrid / asset-based products are generally not Partnership-certified.`,
  };
}

export function hasPartnershipProgram(state: string) {
  const k = partnershipInfo(state).kind;
  return k !== "none";
}

/** Consumer-facing policy name for the issue state. Traditional TQ only. */
export function partnershipPolicyName(info: PartnershipInfo): string {
  switch (info.kind) {
    case "dra":
      return "DRA Partnership Long-Term Care Insurance Policy";
    case "original-dd":
      return `Original ${info.state} Partnership Long-Term Care Insurance Policy (dollar-for-dollar)`;
    case "original-tap":
      return `Original ${info.state} Partnership Long-Term Care Insurance Policy (dollar-for-dollar or total asset protection)`;
    case "masshealth":
      return "MassHealth Qualified Long-Term Care Insurance Policy";
    default:
      return "No Partnership long-term care insurance program";
  }
}

/** NY TAP often 3+ years comprehensive; IN TAP often ~4 years of NF-level benefits. */
export function tapQualifies(policy: LtcPolicy, state: string) {
  if (!ORIGINAL_TAP.has(state)) return false;
  if (!policy.enabled || isLinkedKind(policy.kind)) return false;
  if (isLifetimeBenefit(policy.benefitYears)) return true;
  if (state === "New York") return policy.benefitYears >= 3;
  return policy.benefitYears >= 4;
}

export type PartnershipResult = {
  info: PartnershipInfo;
  modeled: boolean;
  mode: "none" | "dollar-for-dollar" | "total-asset";
  benefitsPaid: number;
  remainingCountable: number;
  assetsProtected: number;
  medicaidLimit: number;
  medicaidStillCounts: number;
  spendDownStill: number;
  note: string;
};

export function partnershipResult(opts: {
  state: string;
  policy: LtcPolicy;
  partnershipOn: boolean;
  preferTap: boolean;
  benefitsPaid: number;
  remainingCountable: number;
}): PartnershipResult {
  const info = partnershipInfo(opts.state);
  const limit = medicaidProfile(opts.state).individualLimit;
  const remaining = Math.max(0, opts.remainingCountable);
  const paid = Math.max(0, opts.benefitsPaid);

  const blank = (note: string): PartnershipResult => ({
    info,
    modeled: false,
    mode: "none",
    benefitsPaid: paid,
    remainingCountable: remaining,
    assetsProtected: 0,
    medicaidLimit: limit,
    medicaidStillCounts: remaining,
    spendDownStill: Math.max(0, remaining - limit),
    note,
  });

  if (!opts.partnershipOn) {
    return blank(
      "Partnership is not selected in this run. Choose a Partnership option with the policy to apply Medicaid asset disregard.",
    );
  }
  if (!opts.policy.enabled) {
    return blank("No policy is in this run, so no Partnership disregard is created.");
  }
  if (info.kind === "none") {
    return blank(info.summary);
  }
  if (isLinkedKind(opts.policy.kind)) {
    return blank(
      "Asset-based, long-term care annuity, and hybrid life products are generally not Partnership-certified. Use a traditional tax-qualified reimbursement policy to model Partnership.",
    );
  }

  const canTap = tapQualifies(opts.policy, opts.state) && opts.preferTap;
  const useTap = info.kind === "original-tap" && canTap;
  const protectedAmt = useTap ? remaining : Math.min(remaining, paid);
  const stillCounts = Math.max(0, remaining - protectedAmt);
  const spendDown = Math.max(0, stillCounts - limit);

  return {
    info,
    modeled: true,
    mode: useTap ? "total-asset" : "dollar-for-dollar",
    benefitsPaid: paid,
    remainingCountable: remaining,
    assetsProtected: protectedAmt,
    medicaidLimit: limit,
    medicaidStillCounts: stillCounts,
    spendDownStill: spendDown,
    note: useTap
      ? `${opts.state} total asset protection: after this qualifying policy is used, remaining countable assets of ${formatUsd(remaining)} may be disregarded (plus the usual ${formatUsd(limit)} Medicaid resource allowance). Confirm TAP minimums and exhaustion rules with ${opts.state} Medicaid.`
      : `Dollar-for-dollar: benefits paid ${formatUsd(paid)} protect ${formatUsd(protectedAmt)} of the ${formatUsd(remaining)} still countable. Medicaid would still count ${formatUsd(stillCounts)} (${formatUsd(spendDown)} to spend down after the ${formatUsd(limit)} resource allowance).`,
  };
}

function formatUsd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export type StatePartnershipRow = PartnershipResult & { state: string };

/** Same claims and remaining assets, each state's Partnership rules. */
export function partnershipByState(opts: {
  policy: LtcPolicy;
  partnershipOn: boolean;
  preferTap: boolean;
  benefitsPaid: number;
  remainingCountable: number;
}): StatePartnershipRow[] {
  return STATE_NAMES.map((state) => ({
    state,
    ...partnershipResult({ ...opts, state }),
  }));
}

export const ORIGINAL_STATES = ["California", "Connecticut", "Indiana", "New York"] as const;

/** What Partnership does and does not protect. */
export function assetProtectionLimits(state: string, medicaidLimit: number) {
  const info = partnershipInfo(state);
  return {
    title: "Asset protection limits",
    bullets: [
      `The disregard equals benefits the insurer actually paid on qualifying claims — not premiums paid, and not the unused maximum unless those dollars were paid.`,
      `Dollar-for-dollar (DRA and original CA/CT): protected assets cannot exceed benefits paid, and cannot exceed remaining countable assets. You also keep ${state}’s usual resource allowance (about ${formatUsd(medicaidLimit)} for a single applicant in this model).`,
      `Total asset protection exists only in the original Indiana and New York programs, and only on designs that meet those states’ higher minimum benefit periods. DRA states cannot copy TAP.`,
      `Income is not protected. Social Security, pensions, and other countable income are still applied toward the cost of care after personal-needs and community-spouse allowances.`,
      `Homestead, one vehicle, household goods, and other exempt property follow ordinary ${state} Medicaid rules — Partnership does not replace those exemptions.`,
      `Estate recovery: Partnership-designated assets are generally shielded from Medicaid estate recovery up to the same dollar ceiling as the benefits paid (or all designated assets under TAP). Amounts above that ceiling can still be recovered.`,
      `Reciprocity: most DRA Partnership states honor a policy bought in another DRA state. California often does not participate in DRA reciprocity. Moving can change the protection — confirm before relying on it.`,
      `Hybrids / asset-based products are generally not Partnership-certified. Only a traditional tax-qualified policy with the state’s Partnership stamp creates the disregard.`,
    ],
    kind: info.kind,
  };
}

export function medicaidEligibilityImpact(state: string, medicaidLimit: number) {
  return {
    title: `Medicaid eligibility impact in ${state}`,
    bullets: [
      `Partnership changes the resource test. It does not grant automatic Medicaid. The person must still meet medical/functional eligibility (typically 2 of 6 ADLs or severe cognitive impairment, plus the state’s level-of-care standard).`,
      `A single LTC applicant in ${state} is modeled with a countable-resource allowance of ${formatUsd(medicaidLimit)} (plus Partnership disregard if selected). A community spouse may keep a separate CSRA. Income tests still apply.`,
      `While the Partnership policy is paying, Medicaid generally will not pay the same bill. If policy benefits plus available income cover the private rate, the person is not yet a Medicaid LTC beneficiary.`,
      `After benefits stop (or if there is a leftover co-pay), unprotected countable assets must still be spent down. Partnership only raises how much can be kept; it does not erase unprotected accounts.`,
      `Look-back (generally 60 months) still applies to gifts and under-market transfers. Buying a Partnership policy is not a gift, but moving money after a diagnosis can still create a penalty period.`,
      `Income-cap states still compare countable income to the special income level (about 300% of SSI). Excess income may need a qualified income trust (Miller trust) even when assets are Partnership-protected.`,
      `This model is not a determination of Medicaid eligibility, a quote, or legal advice. Confirm with an elder-law or Medicaid specialist in ${state} and a licensed LTC insurance representative (CLTC or LTCP).`,
    ],
  };
}

export type PreservationLane = {
  label: string;
  remaining: number;
  protected: number;
  keep: number;
  spend: number;
};

export type PreservationImpact = {
  medicaidLimit: number;
  noPolicy: PreservationLane;
  policyOnly: PreservationLane;
  partnership: PreservationLane;
  result: PartnershipResult;
  extraVsPolicyOnly: number;
  extraVsNoPolicy: number;
  original: { state: string; mode: string; protected: number; spend: number }[];
  paragraphs: string[];
};

function lane(
  label: string,
  remaining: number,
  protectedAmt: number,
  limit: number,
): PreservationLane {
  const rem = Math.max(0, remaining);
  const prot = Math.min(rem, Math.max(0, protectedAmt));
  const still = Math.max(0, rem - prot);
  return {
    label,
    remaining: rem,
    protected: prot,
    keep: prot + Math.min(still, limit),
    spend: Math.max(0, still - limit),
  };
}

export function preservationImpact(opts: {
  state: string;
  policy: LtcPolicy;
  partnershipOn: boolean;
  preferTap: boolean;
  benefitsPaid: number;
  remainingWithPolicy: number;
  remainingNoPolicy: number;
}): PreservationImpact {
  const limit = medicaidProfile(opts.state).individualLimit;
  const result = partnershipResult({
    state: opts.state,
    policy: opts.policy,
    partnershipOn: opts.partnershipOn,
    preferTap: opts.preferTap,
    benefitsPaid: opts.benefitsPaid,
    remainingCountable: opts.remainingWithPolicy,
  });
  const noPolicy = lane("No policy — assets pay care", opts.remainingNoPolicy, 0, limit);
  const policyOnly = lane(
    "Non-Qualified LTC Insurance policy",
    opts.remainingWithPolicy,
    0,
    limit,
  );
  const pLane = lane(
    result.modeled
      ? result.mode === "total-asset"
        ? `Partnership · total asset (${opts.state})`
        : `Partnership · dollar-for-dollar (${opts.state})`
      : `No Partnership disregard (${opts.state})`,
    opts.remainingWithPolicy,
    result.modeled ? result.assetsProtected : 0,
    limit,
  );
  const original = ORIGINAL_STATES.map((st) => {
    const r = partnershipResult({
      ...opts,
      state: st,
      partnershipOn: true,
      preferTap: true,
      remainingCountable: opts.remainingWithPolicy,
    });
    return {
      state: st,
      mode: !r.modeled ? "Not available" : r.mode === "total-asset" ? "Total asset" : "Dollar-for-dollar",
      protected: r.modeled ? r.assetsProtected : 0,
      spend: r.spendDownStill,
    };
  });

  const extraVsPolicyOnly = pLane.keep - policyOnly.keep;
  const extraVsNoPolicy = pLane.keep - noPolicy.keep;
  const paid = Math.max(0, opts.benefitsPaid);

  const paragraphs: string[] = [];
  paragraphs.push(
    `Asset preservation has two layers. First, a policy that pays claims first can leave more countable assets at the end of care (this run: ${formatUsd(opts.remainingWithPolicy)} with a policy vs ${formatUsd(opts.remainingNoPolicy)} if assets paid all care). Second, a Partnership-certified tax-qualified policy can tell Medicaid to disregard assets equal to benefits paid.`,
  );
  paragraphs.push(
    `Without any policy, remaining countable assets of ${formatUsd(noPolicy.remaining)} would generally have to be spent down to about ${formatUsd(limit)} in ${opts.state}. Modeled spend-down: ${formatUsd(noPolicy.spend)}.`,
  );
  if (opts.policy.enabled) {
    paragraphs.push(
      `With a Non-Qualified LTC Insurance policy (no Partnership), insurance paid ${formatUsd(paid)} of care, so ${formatUsd(policyOnly.remaining)} is still countable. Medicaid would still apply the usual ${formatUsd(limit)} resource limit. Spend-down remaining: ${formatUsd(policyOnly.spend)}. The policy paid care; it did not by itself raise the Medicaid asset cap.`,
    );
    if (result.modeled) {
      paragraphs.push(
        `Purchasing this as a ${result.mode === "total-asset" ? "total-asset-protection" : "dollar-for-dollar"} Partnership policy in ${opts.state} would protect ${formatUsd(pLane.protected)} of those remaining assets. Amount that could be kept at Medicaid (protected + resource allowance): ${formatUsd(pLane.keep)}. Spend-down falls to ${formatUsd(pLane.spend)} — ${formatUsd(Math.max(0, extraVsPolicyOnly))} more preserved than the same policy without Partnership.`,
      );
    } else if (partnershipInfo(opts.state).kind === "none") {
      paragraphs.push(
        `${opts.state} does not operate a Partnership program in this model, so benefits paid do not create extra Medicaid asset disregard. Spend-down stays ${formatUsd(policyOnly.spend)}.`,
      );
    } else {
      paragraphs.push(
        `Partnership is not selected. If this traditional policy were Partnership-certified in ${opts.state}, dollar-for-dollar disregard would typically protect up to ${formatUsd(Math.min(opts.remainingWithPolicy, paid))} of remaining countable assets.`,
      );
    }
  } else {
    paragraphs.push(
      `Include a traditional tax-qualified policy in the run, then choose a Partnership option, to see disregard on top of claim payments.`,
    );
  }
  paragraphs.push(
    `Original programs — California and Connecticut: dollar-for-dollar only. Indiana and New York: dollar-for-dollar, with total asset protection on qualifying benefit periods (this model: NY about 3+ years, IN about 4+ years or lifetime*). Confirm certification, inflation-by-age rules, reciprocity, and Medicaid with a licensed representative. Not a determination of eligibility. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.`,
  );

  return {
    medicaidLimit: limit,
    noPolicy,
    policyOnly,
    partnership: pLane,
    result,
    extraVsPolicyOnly,
    extraVsNoPolicy,
    original,
    paragraphs,
  };
}

