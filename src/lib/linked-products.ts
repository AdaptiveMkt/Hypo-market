import {
  isLinkedKind,
  policyKindLabel,
  project,
  specifiedFaceAmount,
  type LtcPolicy,
  type PolicyKind,
  type Projection,
} from "./calc";
import { money } from "./utils";
import { SETTING_SHORT, type CareSetting } from "./costs";

export const ADLS = [
  "bathing",
  "dressing",
  "toileting",
  "transferring",
  "continence",
  "eating",
] as const;

export type LinkedCopy = {
  kind: PolicyKind;
  title: string;
  chassis: string;
  definition: string;
  howItPays: string;
  ifNoClaim: string;
  ifClaim: string;
  triggerTitle: string;
  triggerBody: string;
  elimNote: string;
  residualLabel: string;
};

export function linkedCopy(kind: PolicyKind): LinkedCopy {
  if (kind === "ltcAnnuity") {
    return {
      kind,
      title: "Long-term care annuity",
      chassis: "Annuity contract with an LTC endorsement or multiplier",
      definition:
        "A premium is deposited into a deferred or immediate annuity. Qualifying long-term care is paid as a monthly indemnity (or reimbursement) from a leveraged LTC pool — typically a multiple of the account. This is not traditional stand-alone LTCI and is generally not Partnership-certified.",
      howItPays:
        "After the benefit trigger and any elimination period, the contract pays a monthly LTC amount, up to the remaining leveraged pool. This model treats that payment as indemnity against the care bill (insurance first; assets co-pay only the leftover).",
      ifNoClaim:
        "If no qualifying claim is paid, remaining annuity value may pass as a death benefit or leftover account, subject to the residual floor you enter. Death benefits vary by company and form.",
      ifClaim:
        "LTC draws the leveraged pool. Leftover account is modeled as unused pool ÷ leverage, but not less than the residual floor. Excess care cost is an asset co-pay. A 7702B-qualified annuity LTC rider is not a §101(g) acceleration (101(g) applies to life death benefits).",
      triggerTitle: "When an LTC annuity pays",
      triggerBody:
        "Tax-qualified annuity LTC riders generally use the same IRC §7702B chronic-illness trigger as LTCI: a licensed health-care practitioner certifies that the insured cannot perform 2 of 6 ADLs without substantial assistance, or has a severe cognitive impairment requiring substantial supervision, expected to last at least 90 days. Some non-qualified riders use a different (often stricter) trigger — read the contract.",
      elimNote:
        "Linked annuity forms often use 0 or 90 days. Days in the elimination period are usually paid from assets (or unpaid).",
      residualLabel: "Leftover annuity / death benefit",
    };
  }
  if (kind === "hybridLife") {
    return {
      kind,
      title: "Hybrid life insurance",
      chassis: "Life policy with LTC acceleration and often an extension of benefits (EOB)",
      definition:
        "A life insurance policy (typically whole life or UL) that can accelerate the death benefit for qualifying care under IRC §101(g) (chronic or terminal illness) and, on many linked-benefit forms, continue paying under a tax-qualified LTC rider (IRC §7702B) after the face amount is used. If no claim is paid, heirs generally receive the death benefit. Generally not Partnership-certified.",
      howItPays:
        "This model pays the claim first. Dollars that reduce the face amount are the §101(g) / acceleration phase. Dollars after the face is exhausted are the extension-of-benefits / §7702B phase (leverage). Assets co-pay only the leftover care bill. A §101(g)-only chronic-illness rider would stop when the face is gone — no EOB.",
      ifNoClaim:
        "If the insured dies without a qualifying acceleration, the death benefit is typically paid to the beneficiary under §101(a) (less any loans). This model uses the single premium as the planning face amount.",
      ifClaim:
        "Acceleration uses the face first (§101(g) or 7702B acceleration); then EOB if the form includes it. A residual death-benefit floor (you enter the %) can remain for heirs. Indemnity accelerations to a chronically ill insured are tax-free only up to the IRS per-diem ($430/day in 2026) unless actual qualified costs are higher. Terminal-illness accelerations have no per-diem cap.",
      triggerTitle: "When hybrid life pays — §101(g) and §7702B",
      triggerBody:
        "Terminal illness (§101(g)): a physician certifies death is reasonably expected within 24 months — generally a full income exclusion, no daily cap. Chronic illness (§101(g), using the §7702B(c)(2) definition): 2 of 6 ADLs or severe cognitive impairment; many 101(g) riders also require the condition to last the rest of life. Tax-qualified LTC / EOB riders (§7702B): the same 2 of 6 or cognitive test, expected to last at least 90 days, certified by a licensed health-care practitioner. Confirm which code the form uses — a “chronic illness” rider is not automatically LTCI.",
      elimNote:
        "This model defaults to a 90-day elimination period for hybrid life. Many forms also offer 0 days. Days in the elimination period are usually paid from assets (or unpaid) before acceleration starts.",
      residualLabel: "Residual death benefit",
    };
  }
  return {
    kind: "assetBased",
    title: "Asset-based single premium",
    chassis: "Linked-benefit life or annuity, single premium",
    definition:
      "A single premium is moved from countable assets into a life or annuity contract that creates an LTC pool equal to premium × leverage. If care is never used, a death benefit is typically paid; if care is used, the death benefit is reduced, then a residual floor may remain.",
    howItPays:
      "After the benefit trigger and elimination period, monthly LTC benefits pay the care bill first, up to the remaining leveraged pool. Countable assets co-pay only the leftover.",
    ifNoClaim:
      "Heirs typically receive a death benefit. See the residual floor and any cash-surrender schedule you entered.",
    ifClaim:
      "LTC reduces the death benefit; residual floor still applies. Excess care cost is an asset co-pay.",
    triggerTitle: "When a linked-benefit contract pays",
    triggerBody:
      "Tax-qualified linked-benefit forms use the IRC §7702B trigger: 2 of 6 ADLs or severe cognitive impairment, expected to last at least 90 days, certified by a licensed health-care practitioner.",
    elimNote:
      "This model’s linked forms use 0 or 90 days. Waiting days are usually paid from assets.",
    residualLabel: "Residual death benefit",
  };
}

export function linkedResidual(opts: {
  kind: PolicyKind;
  singlePaid: number;
  leverage: number;
  residualPct: number;
  dollarPoolLeft: number;
  ltcPaid: number;
}) {
  const floor = opts.singlePaid * (Math.max(0, opts.residualPct) / 100);
  if (opts.kind === "hybridLife") {
    const remainingFace = Math.max(0, opts.singlePaid - opts.ltcPaid);
    return Math.max(floor, remainingFace);
  }
  if (opts.kind === "ltcAnnuity") {
    const leftoverAccount = opts.dollarPoolLeft / Math.max(1, opts.leverage);
    return Math.max(floor, leftoverAccount);
  }
  return Math.max(floor, Math.max(0, opts.singlePaid - opts.ltcPaid));
}

export type ClaimScenarioRow = {
  id: string;
  title: string;
  when: string;
  insurance: number;
  residual: number;
  assetsLeft: number;
  shortfall: number;
  phase: string;
};

export function linkedClaimScenarios(opts: {
  policy: LtcPolicy;
  result: Projection;
  baseArgs: Omit<Parameters<typeof project>[0], "policy">;
  duration: number;
  setting: CareSetting;
}): ClaimScenarioRow[] {
  const copy = linkedCopy(opts.policy.kind);
  const deposit = Math.max(0, opts.result.singlePremiumPaid || opts.policy.singlePremium);
  const noneResidual = linkedResidual({
    kind: opts.policy.kind,
    singlePaid: deposit,
    leverage: opts.policy.leverage,
    residualPct: opts.policy.residualPct,
    dollarPoolLeft: deposit * opts.policy.leverage,
    ltcPaid: 0,
  });
  const short = project({ ...opts.baseArgs, policy: opts.policy, duration: 1 });
  const exhaust = project({ ...opts.baseArgs, policy: opts.policy, duration: 20 });
  const run = opts.result;

  function phase(p: Projection) {
    if (opts.policy.kind === "hybridLife") {
      const face = specifiedFaceAmount(opts.policy);
      const accel = Math.min(p.insuranceTotal, face);
      const eob = Math.max(0, p.insuranceTotal - face);
      if (p.insuranceTotal <= 0) return "No acceleration — death benefit intact";
      if (eob <= 0) return `Death benefit acceleration (${money(accel)})`;
      return `Acceleration ${money(accel)}, then extension of benefits ${money(eob)}`;
    }
    if (opts.policy.kind === "ltcAnnuity") {
      return p.insuranceTotal > 0
        ? "Annuity LTC indemnity from the leveraged pool"
        : "No LTC indemnity — leftover annuity remains";
    }
    return p.insuranceTotal > 0
      ? "Linked-benefit LTC from the leveraged pool"
      : "No LTC claim — death benefit remains";
  }

  return [
    {
      id: "none",
      title: "No LTC claim",
      when: "Insured never satisfies the benefit trigger (or dies first).",
      insurance: 0,
      residual: noneResidual,
      assetsLeft: run.startPool,
      shortfall: 0,
      phase: phase({
        ...run,
        insuranceTotal: 0,
        residualDeathBenefit: noneResidual,
        endPool: run.startPool,
        shortfallTotal: 0,
        singlePremiumPaid: deposit,
      }),
    },
    {
      id: "short",
      title: "Short claim (1 care year)",
      when: `One year of ${SETTING_SHORT[opts.setting]} after the trigger and elimination period.`,
      insurance: short.insuranceTotal,
      residual: short.residualDeathBenefit,
      assetsLeft: short.endPool,
      shortfall: short.shortfallTotal,
      phase: phase(short),
    },
    {
      id: "run",
      title: `This run (${opts.duration} care year${opts.duration === 1 ? "" : "s"})`,
      when: "Same duration and setting as the hypothetical you just ran.",
      insurance: run.insuranceTotal,
      residual: run.residualDeathBenefit,
      assetsLeft: run.endPool,
      shortfall: run.shortfallTotal,
      phase: phase(run),
    },
    {
      id: "exhaust",
      title: "Long claim (up to 20 care years)",
      when: `Benefits continue until the leveraged pool is gone or 20 years of ${SETTING_SHORT[opts.setting]}.`,
      insurance: exhaust.insuranceTotal,
      residual: exhaust.residualDeathBenefit,
      assetsLeft: exhaust.endPool,
      shortfall: exhaust.shortfallTotal,
      phase: phase(exhaust),
    },
  ].map((row) => ({ ...row, residualLabel: copy.residualLabel }) as ClaimScenarioRow);
}

export function linkedPayoutNotes(policy: LtcPolicy) {
  const copy = linkedCopy(policy.kind);
  if (!policy.enabled || !isLinkedKind(policy.kind)) return [];
  return [
    { heading: `${copy.title} — definition`, body: copy.definition },
    { heading: copy.triggerTitle, body: copy.triggerBody },
    {
      heading: "Activities of daily living (ADLs)",
      body: `The six ADLs used in tax-qualified contracts are ${ADLS.join(", ")}. “2 of 6” means substantial assistance with any two, not a medical diagnosis alone.`,
    },
    { heading: "Elimination period", body: copy.elimNote },
    { heading: "How the claim is paid in this model", body: copy.howItPays },
    { heading: "If no claim is paid", body: copy.ifNoClaim },
    { heading: "If a claim is paid", body: copy.ifClaim },
    {
      heading: "IRC §101(g) vs §7702B",
      body:
        policy.kind === "hybridLife" || policy.kind === "assetBased"
          ? "Acceleration of a life death benefit while living is governed by §101(g) (terminal illness: death expected within 24 months, no per-diem cap; chronic illness: 2 of 6 ADLs or cognitive impairment, 2026 indemnity exclusion $430/day). A tax-qualified LTC rider that extends benefits after the face is exhausted is §7702B. This hypo’s leverage/EOB column is the 7702B-style continuation. A 101(g)-only rider has no EOB."
          : "§101(g) is the life-insurance accelerated-death-benefit rule. Annuity LTC is generally a §7702B rider on the annuity, not a 101(g) acceleration.",
    },
    {
      heading: "Not a carrier illustration",
      body: `${policyKindLabel(policy.kind)} figures here are planning math from the premium, monthly benefit, leverage, and residual you entered. Real contracts require underwriting, a licensed producer, and the outline of coverage.`,
    },
  ];
}
