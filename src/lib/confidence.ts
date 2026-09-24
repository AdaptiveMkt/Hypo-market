import { isLinkedKind, type LtcPolicy } from "./calc";
import type { CareSetting } from "./costs";
import type { SensitivityResult } from "./sensitivity";

export type ConfidenceBand = "High" | "Moderate" | "Limited" | "Low";

export type ConfidenceFactor = {
  id: string;
  label: string;
  score: number;
  band: ConfidenceBand;
  note: string;
};

export type ConfidenceResult = {
  overall: number;
  band: ConfidenceBand;
  factors: ConfidenceFactor[];
  recommendations: string[];
  summary: string;
};

function band(score: number): ConfidenceBand {
  if (score >= 80) return "High";
  if (score >= 60) return "Moderate";
  if (score >= 40) return "Limited";
  return "Low";
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function modelConfidence(opts: {
  pool: number;
  sleevesFilled: number;
  sleevesTotal: number;
  setting: CareSetting;
  delay: number;
  duration: number;
  policy: LtcPolicy;
  partnershipOn: boolean;
  hasPartnershipProgram: boolean;
  sensitivity: SensitivityResult;
}): ConfidenceResult {
  const {
    pool,
    sleevesFilled,
    sleevesTotal,
    setting,
    delay,
    duration,
    policy,
    partnershipOn,
    hasPartnershipProgram,
    sensitivity,
  } = opts;

  const firstCost = Math.max(1, sensitivity.base.firstCost);
  const yearsCover = pool / firstCost;
  let poolScore = 40;
  if (pool <= 0) poolScore = 15;
  else if (yearsCover >= duration) poolScore = 88;
  else if (yearsCover >= duration * 0.6) poolScore = 72;
  else if (yearsCover >= 1) poolScore = 58;
  else if (yearsCover >= 0.25) poolScore = 42;
  else poolScore = 28;

  const sleevePct = sleevesTotal ? sleevesFilled / sleevesTotal : 0;
  const mixScore = clamp(25 + sleevePct * 80);

  let timeScore = 70;
  if (delay < 1) timeScore -= 15;
  if (delay > 20) timeScore -= 20;
  else if (delay > 12) timeScore -= 8;
  if (duration < 2) timeScore -= 18;
  else if (duration > 10) timeScore -= 10;
  if (setting === "home24") timeScore -= 6;
  timeScore = clamp(timeScore);

  let policyScore = 48;
  if (policy.enabled) {
    policyScore = 70;
    if (policy.kind === "traditional") {
      if (policy.dailyBenefit >= 200) policyScore += 8;
      if (policy.benefitYears >= 3) policyScore += 6;
      if (policy.inflationMethod === "compound" && policy.benefitInflationPct >= 3) policyScore += 8;
      if (policy.annualPremium > 0) policyScore += 4;
    } else {
      policyScore += 10;
      if (policy.singlePremium > 0) policyScore += 6;
    }
  }
  policyScore = clamp(policyScore);

  let partnershipScore = 62;
  if (hasPartnershipProgram && policy.enabled && partnershipOn) partnershipScore = 86;
  else if (hasPartnershipProgram && policy.enabled && !partnershipOn) partnershipScore = 55;
  else if (hasPartnershipProgram && !policy.enabled) partnershipScore = 50;
  else partnershipScore = 58;

  const remainAbs = Math.abs(sensitivity.mostRemaining?.dRemain ?? 0);
  const shortAbs = Math.abs(sensitivity.mostShortfall?.dShort ?? 0);
  const swing = Math.max(remainAbs, shortAbs);
  const baseRemain = Math.max(1, Math.abs(sensitivity.base.remaining) + Math.abs(sensitivity.base.shortfall));
  const swingPct = swing / baseRemain;
  let shockScore = 78;
  if (swingPct > 1.5) shockScore = 38;
  else if (swingPct > 0.8) shockScore = 52;
  else if (swingPct > 0.4) shockScore = 64;
  shockScore = clamp(shockScore);

  const factors: ConfidenceFactor[] = [
    {
      id: "pool",
      label: "Countable pool vs care bill",
      score: poolScore,
      band: band(poolScore),
      note:
        pool <= 0
          ? "No countable assets entered — the run is a care-cost illustration only."
          : `Pool covers about ${yearsCover.toFixed(1)} years of the first inflated bill (this run models ${duration} years).`,
    },
    {
      id: "mix",
      label: "Asset mix completeness",
      score: mixScore,
      band: band(mixScore),
      note: `${sleevesFilled} of ${sleevesTotal} sleeves have a value. Unused lines at $0 are fine; a one-sleeve pile is a thinner picture.`,
    },
    {
      id: "timing",
      label: "Timing and setting",
      score: timeScore,
      band: band(timeScore),
      note: `Care starts in ${delay} year${delay === 1 ? "" : "s"}, modeled for ${duration} year${duration === 1 ? "" : "s"} in ${setting === "home24" ? "home health / 24-hour home care" : setting === "al" ? "assisted living" : setting === "memory" ? "memory care" : "a nursing facility"}.`,
    },
    {
      id: "policy",
      label: "Insurance design in this run",
      score: policyScore,
      band: band(policyScore),
      note: policy.enabled
        ? isLinkedKind(policy.kind)
          ? `${policy.kind === "ltcAnnuity" ? "Long-term care annuity" : policy.kind === "hybridLife" ? "Hybrid life insurance" : "Asset-based / linked-benefit"} is included. Confirm the carrier illustration for leverage, residual value, and death benefit.`
          : `${policy.dailyBenefit}/day, ${policy.benefitYears >= 50 ? "lifetime*" : `${policy.benefitYears}-year`} period, ${policy.benefitInflationPct}% ${policy.inflationMethod} inflation, ${policy.elimDays}-day wait.${policy.benefitYears >= 50 ? " * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence." : ""}`
        : "No policy in this run — assets pay the whole bill. Include a policy to score a funded design.",
    },
    {
      id: "partnership",
      label: "Partnership / Medicaid alignment",
      score: partnershipScore,
      band: band(partnershipScore),
      note: hasPartnershipProgram
        ? partnershipOn && policy.enabled
          ? "Partnership is on for a participating state — dollar-for-dollar or total-asset protection can apply after claims."
          : "This state has a Partnership (or original) program. Turn it on with a qualifying policy to model asset protection."
        : "This state has no Partnership program in this model. Medicaid spend-down still follows state rules.",
    },
    {
      id: "shock",
      label: "Sensitivity swing",
      score: shockScore,
      band: band(shockScore),
      note: sensitivity.insight,
    },
  ];

  const overall = clamp(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  const b = band(overall);
  const weakest = [...factors].sort((a, c) => a.score - c.score)[0];

  const recommendations: string[] = [];
  if (poolScore < 55) recommendations.push("Enter realistic countable assets, or this is only a cost-of-care sketch.");
  if (!policy.enabled) recommendations.push("Include a policy in the run to see insurance pay first and Partnership protection.");
  if (policy.enabled && policy.kind === "traditional" && policy.inflationMethod !== "compound") {
    recommendations.push("A compound inflation rider usually tracks care costs better than simple or none.");
  }
  if (hasPartnershipProgram && policy.enabled && !partnershipOn) {
    recommendations.push("Select Partnership in participating states so the report shows Medicaid asset protection.");
  }
  if (mixScore < 50) recommendations.push("Spread values across the sleeves that actually exist so allocation and tax treatment are not a single lump.");
  if (shockScore < 55) recommendations.push("Open Hypothesis sensitivity — remaining assets move sharply when CPI, start year, or setting change.");
  if (timeScore < 55) recommendations.push("A very short or very long start-year / duration makes the CPI path dominate the picture.");

  const summary = `Overall model confidence ${overall}/100 (${b}). Weakest factor: ${weakest.label.toLowerCase()} (${weakest.score}/100). These scores grade this hypothetical’s inputs and assumption swing — not the chance of needing care, and not a statistical confidence interval.`;

  return { overall, band: b, factors, recommendations, summary };
}