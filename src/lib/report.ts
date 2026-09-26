import { HOLD_HARMLESS_FULL } from "@/lib/disclaimer";
import { money } from "./utils";
import {
  ASSET_FIELDS,
  csvMilestones,
  formatYearsLast,
  fiveYearIssueBand,
  isLifetimeBenefit,
  LIFETIME_BENEFIT_MARK,
  LIFETIME_BENEFIT_NOTE,
  isLinkedKind,
  policyKindLabel,
  netRoiPct,
  shortfallStart,
  targetPremium,
  TARGET_INCOME_RATE,
  yearsPoolLasts,
  type AssetRois,
  type Assets,
  type LtcPolicy,
  type Projection,
} from "./calc";
import { SETTING_LABELS, type CareSetting } from "./costs";
import { stateLtcTaxBreak } from "./ltc-tax";
import { typicalPremiumHint } from "./what-consumers-buy";

export const SAVE_KEY = "aum-scenario-v2";

export type ContactParty = {
  name: string;
  address: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
};

export type AdvisorParty = ContactParty & {
  designation: string;
  firm: string;
};

export const EMPTY_CONTACT: ContactParty = {
  name: "",
  address: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
};

export const EMPTY_ADVISOR: AdvisorParty = {
  ...EMPTY_CONTACT,
  designation: "",
  firm: "",
};

export function partyFilled(p: ContactParty | AdvisorParty | undefined) {
  if (!p) return false;
  return Boolean(p.name || p.address || p.phone || p.email || p.zip);
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Advisor receives a PDF copy only when both parties are on the run and the advisor has an email. */
export function advisorReceivesPdf(advisor?: AdvisorParty, client?: ContactParty) {
  return Boolean(advisor && validEmail(advisor.email) && partyFilled(client));
}

export type Scenario = {
  assets: Assets;
  assetRois?: AssetRois;
  excludeHome: boolean;
  state: string;
  setting: CareSetting;
  delay: number;
  ageToday?: number;
  claimAge?: number;
  duration: number;
  cpi: number;
  roi: number;
  taxRate: number;
  iraRoi: number;
  annualIncome?: number;
  policy: LtcPolicy;
  client?: ContactParty;
  advisor?: AdvisorParty;
};

export function saveScenario(s: Scenario) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
}

export function loadScenario(): Scenario | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Scenario>;
    if (!s || typeof s !== "object" || !s.assets) return null;
    return s as Scenario;
  } catch {
    return null;
  }
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ReportOpts = {
  scenario: Scenario;
  grossPool: number;
  pool: number;
  result: Projection;
  selfFunded: Projection;
  todayCost: number;
  partnershipOn?: boolean;
  preferTap?: boolean;
};

/** Plain-language description of this run for the Analysis sheet and emails. */
export function analysisNarrative(opts: ReportOpts): string {
  const { scenario: s, grossPool, pool, result, selfFunded, todayCost } = opts;
  const setting = SETTING_LABELS[s.setting];
  const startWhen = s.delay === 0 ? "now" : `in ${s.delay} year${s.delay === 1 ? "" : "s"}`;
  const net = netRoiPct(s.roi, s.taxRate ?? 0);
  const daily = todayCost / 365;
  const yearsToday = yearsPoolLasts(pool, todayCost);
  const yearsClaimAssets = yearsPoolLasts(result.startPoolNet, result.firstCost);
  const insToday = s.policy.enabled
    ? result.lifetimeBenefit
      ? null
      : Number(result.benefitPoolAtPurchase ?? 0)
    : 0;
  const insClaim = s.policy.enabled
    ? result.lifetimeBenefit
      ? null
      : Number(result.benefitPoolAtClaim ?? 0)
    : 0;
  const combinedToday = pool + (insToday ?? 0);
  const combinedClaim = result.startPoolNet + (insClaim ?? 0);
  const yearsCombinedToday = s.policy.enabled
    ? result.lifetimeBenefit
      ? Number.POSITIVE_INFINITY
      : yearsPoolLasts(combinedToday, todayCost)
    : yearsToday;
  const yearsCombinedClaim = s.policy.enabled
    ? result.lifetimeBenefit
      ? Number.POSITIVE_INFINITY
      : yearsPoolLasts(combinedClaim, result.firstCost)
    : yearsClaimAssets;
  const when = shortfallStart(result.rows);
  const preserved = result.endPool - selfFunded.endPool;
  const premium = targetPremium(pool, s.annualIncome ?? 0);

  const paras = [
    (() => {
      const settingPhrase = SETTING_LABELS[s.setting];
      const art = /^[aeiou]/i.test(settingPhrase.trim()) ? "an" : "a";
      const insName = !s.policy.enabled
        ? null
        : s.policy.kind === "assetBased"
          ? "Asset-Based Long-Term Care Insurance"
          : s.policy.kind === "hybridLife"
            ? "Hybrid Life and Long-Term Care Insurance"
            : s.policy.kind === "ltcAnnuity"
              ? "Long-Term Care Annuity"
              : "Traditional Long-Term Care Insurance";
      const last = insName
        ? `how long the countable assets would last with and without ${insName}`
        : "how long the countable assets would last without long-term care insurance";
      return `This is an AI-generated hypothetical generated from the information submitted through this platform. For your review and download, this is the Hypothetical Long-Term Care Asset Utilization Modeling report based on that information. Other factors taken into account were the projected future costs of care in ${art} ${settingPhrase.toLowerCase()} setting and ${last}.`;
    })(),
    `Countable assets at risk in this run are ${money(pool)}. Gross assets are ${money(grossPool)}. Primary residence of ${money(s.assets.home)} is ${s.excludeHome ? "held out of the countable pool (homestead excluded)" : "included in the countable pool"}. Spouse-excluded (excludable) assets are ${money(s.assets.excludable)}.`,
    `Care is modeled to start ${startWhen} and last ${s.duration} year${s.duration === 1 ? "" : "s"}. Today's median ${setting.toLowerCase()} cost in ${s.state} is ${money(todayCost)} per year (about ${money(daily)} per day). Care costs inflate at ${s.cpi}% per year. Taxable assets are assumed to earn ${s.roi}% gross, with a ${s.taxRate ?? 0}% tax on that return (net ${net.toFixed(2)}%). Deferred annuities, life insurance cash value, and IRA / 401(k) grow tax-deferred at their own R.O.I. (IRA / 401(k) at ${s.iraRoi ?? s.roi}%). Roth IRA grows tax-free.`,
    `Using countable assets alone at today's cost, the pool is ${formatYearsLast(yearsToday)}. At the start of claim, countable assets (net after tax) are projected at ${money(result.startPoolNet)} against a first-year care bill of ${money(result.firstCost)}; that asset pool is ${formatYearsLast(yearsClaimAssets)}. Deferred IRA / annuity / life cash value is reduced by the ${s.taxRate ?? 0}% tax rate as if distributed at claim; taxable sleeves already grew at net R.O.I.`,
  ];

  if (!s.policy.enabled) {
    paras.push(
      `No long-term care insurance is included in this run. The annual care bill is amortized from countable assets until they run out. Cumulative unpaid shortfall over the modeled years is ${result.shortfallTotal ? money(result.shortfallTotal) : "none"}. ${result.depletedYear ? `Countable assets are depleted in model year ${result.depletedYear}.` : "Countable assets are not fully depleted in the modeled window."}`,
    );
  } else {
    const structure = isLinkedKind(s.policy.kind)
      ? `a ${policyKindLabel(s.policy.kind).toLowerCase()} (premium ${money(s.policy.singlePremium)}, leverage ${s.policy.leverage}x)`
      : `a traditional reimbursement policy (daily benefit ${money(s.policy.dailyBenefit)} today, benefit period ${isLifetimeBenefit(s.policy.benefitYears) ? `${LIFETIME_BENEFIT_MARK}. ${LIFETIME_BENEFIT_NOTE}` : `${s.policy.benefitYears} years`}, ${s.policy.elimDays}-day elimination, inflation ${s.policy.inflationMethod === "none" || s.policy.benefitInflationPct <= 0 ? "level" : `${s.policy.benefitInflationPct}% ${s.policy.inflationMethod}`}, annual premium ${money(s.policy.annualPremium)})`;
    const industry = typicalPremiumHint(
      Number(s.ageToday) || 0,
      s.policy.benefitInflationPct,
      s.policy.inflationMethod,
    );
    const industryNote =
      !isLinkedKind(s.policy.kind) && industry.amount != null
        ? ` Annual premium defaults to the ${industry.band} age-bracket industry midpoint, ${money(industry.amount)}, from the 2026 AALTCI Long-Term Care Insurance Price Index. Not a quote.`
        : "";
    const agi = Math.max(0, Math.round(Number(s.annualIncome) || 0));
    const funding =
      agi > 0
        ? ` Based on your disclosed AGI, the recommended annual household premium should be no greater than ${money(Math.round(agi * TARGET_INCOME_RATE))}. Other ways to fund that premium include reallocating assets and using part of your return on investment.`
        : " Premium funding options to consider are reallocating assets and using part of your return on investment to fund household premiums.";
    paras.push(
      `This run includes ${structure}. Insurance is modeled to pay the claim first; countable assets co-pay only the leftover. LTC benefits at purchase are ${result.lifetimeBenefit ? `${LIFETIME_BENEFIT_MARK}. ${LIFETIME_BENEFIT_NOTE}` : money(result.benefitPoolAtPurchase ?? 0)}. At claim they are ${result.lifetimeBenefit ? LIFETIME_BENEFIT_MARK : money(result.benefitPoolAtClaim ?? 0)}.${industryNote}${funding}`,
    );
    paras.push(
      `The combined pool (countable assets + LTC benefits) at today's cost is ${money(combinedToday)} and is ${formatYearsLast(yearsCombinedToday)}. At claim the combined pool is ${money(combinedClaim)} against ${money(result.firstCost)} per year and is ${formatYearsLast(yearsCombinedClaim)}. Insurance paid over the modeled years is ${money(result.insuranceTotal)}. Countable assets remaining are ${money(result.endPool)}, which is ${preserved >= 0 ? money(preserved) + " higher" : money(Math.abs(preserved)) + " lower"} than if the same care had been paid from assets with no policy (${money(selfFunded.endPool)} left).`,
    );
    paras.push(
      `Cumulative unpaid shortfall after insurance and asset co-pay is ${result.shortfallTotal ? money(result.shortfallTotal) : "none"}. ${when ? `A shortfall first appears in model year ${when.year}, month ${when.monthInYear} (${when.monthsFromToday} months from today).` : "No unpaid shortfall appears in the modeled window."} ${result.depletedYear ? `Countable assets are depleted in model year ${result.depletedYear}.` : "Countable assets are not fully depleted in the modeled window."}`,
    );
  }

  paras.push(
    `A planning figure for discussion — not a quote — is a suggested traditional premium of ${money(premium)} per year (7% of adjusted gross household income when that income is entered; otherwise 2.5% of countable assets). Asset-based, annuity care, and hybrid life default the single premium to 2.5% of countable assets or $75,000, whichever is greater. Premiums vary by age, health, marital status, and state of issue.`,
  );
  paras.push(
    `Tax: there is no general federal LTC credit — only an age-capped deduction (2026: $500 to $6,200) after the 7.5% AGI medical floor if you itemize. A credit cuts tax dollar-for-dollar; a deduction only lowers taxable income. ${stateLtcTaxBreak(s.state).detail} This is not tax advice.`,
  );
  paras.push(
    `Care costs in this model compound at ${s.cpi.toFixed(1)}% (BLS CPI is a consumer market basket, not an LTC price index). Insurance riders — level, simple, or compound — grow only the daily/monthly max and are not re-priced here. Compare those riders in the inflation section. Designs compared include no policy, traditional level, traditional with inflation, traditional with Partnership, and asset-based hybrid.`,
  );
  paras.push(
    `The projections section below lists each model year. Confirm figures with a qualified long-term care insurance representative or a financial advisor who holds an LTC designation such as CLTC or LTCP. Medicaid long-term care rules, spend-down, Partnership disregard, and solvency notes for this run are in the Medicaid Information section — not in this summary.`,
  );

  return paras.join("\n\n");
}

/** Considerations for a conversation — not advice to buy or not buy a product. */
export function recommendationsNarrative(opts: ReportOpts): string[] {
  const { scenario: s, pool, result, todayCost } = opts;
  const recs: string[] = [];
  const yearsToday = yearsPoolLasts(pool, todayCost);
  const premium = targetPremium(pool, s.annualIncome ?? 0);
  const daily = todayCost / 365;
  const elimCost = s.policy.enabled ? (s.policy.elimDays / 365) * result.firstCost : 0;

  recs.push(
    "These items are for discussion with a qualified long-term care insurance representative or a financial advisor who holds CLTC or LTCP. They are not recommendations to purchase, lapse, or replace any policy.",
  );

  if (yearsToday < 1) {
    recs.push(
      `Countable assets last less than one year at today's ${SETTING_LABELS[s.setting].toLowerCase()} cost (${formatYearsLast(yearsToday)}). Ask how a tax-qualified policy or a hybrid would pay the claim first so assets are only a co-pay.`,
    );
  } else if (yearsToday < s.duration) {
    recs.push(
      `At today's cost the countable pool is ${formatYearsLast(yearsToday)}, which is shorter than the ${s.duration}-year care window in this run. Compare self-funding the gap versus insurance that pays first.`,
    );
  }

  if (!s.policy.enabled) {
    recs.push(
      `No policy is in this run. A planning figure — not a quote — is a traditional target premium of ${money(premium)} per year (7% of adjusted gross household income when entered; otherwise 2.5% of countable assets). Discuss how to fund that from cash flow versus assets.`,
    );
  } else {
    if (result.shortfallTotal > 0) {
      recs.push(
        `A modeled unpaid shortfall of ${money(result.shortfallTotal)} remains after insurance and asset co-pay. Consider a higher daily benefit, a longer benefit period, or more ready cash for the leftover cost.`,
      );
    }
    if (s.delay >= 5 && (s.policy.inflationMethod === "none" || s.policy.benefitInflationPct < s.cpi)) {
      recs.push(
        `Care is ${s.delay} years out and the benefit inflation in this run is below the ${s.cpi}% care CPI. Compare 3% and 5% compound riders to a level benefit.`,
      );
    }
    if (elimCost > pool * 0.15) {
      recs.push(
        `The ${s.policy.elimDays}-day elimination period at the first-year care cost is about ${money(elimCost)}, which is a large share of countable assets. Compare 0, 30, 90, and 180-day waits.`,
      );
    }
  }

  recs.push(
    `Compare inflation riders (level, 3%/5% simple, 3%/5% compound, and a rider that matches this run’s ${s.cpi.toFixed(1)}% care CPI). DRA Partnership often requires compound inflation if issued at age 60 or younger. Premiums for richer riders are higher — this model does not re-price them.`,
  );
  recs.push(
    `Compare long-term care insurance designs on the same assets: self-fund, traditional level, traditional with inflation, traditional with Partnership, and asset-based hybrid. Hybrids generally do not create a Medicaid asset disregard.`,
  );
  recs.push(
    `${stateLtcTaxBreak(s.state).title}. ${stateLtcTaxBreak(s.state).detail}`,
  );

  if (!s.excludeHome && s.assets.home > 0) {
    recs.push(
      `Primary residence of ${money(s.assets.home)} is counted. If it would be homestead for Medicaid, re-run with it excluded to see countable assets at risk.`,
    );
  }

  if ((s.assets.cash ?? 0) + (s.assets.savings ?? 0) < daily * 100 && todayCost > 0) {
    recs.push(
      "Ready cash and savings look thin versus about 100 days of today's care cost (a typical elimination period). Keep a liquid sleeve for the wait before any claim pays.",
    );
  }

  recs.push(
    `If you include a traditional tax-qualified policy, use the Partnership selection for ${s.state} (DRA dollar-for-dollar, or original CA/CT dollar-for-dollar, or original IN/NY dollar-for-dollar / total asset protection). That is how this model illustrates extra Medicaid asset preservation beyond claims paid. Hybrids usually do not qualify. Confirm certification with a licensed representative.`,
  );
  recs.push(
    `A Medicaid Asset Protection Trust is irrevocable, generally needs a 60-month look-back, and does not pay care during that wait. Income from the trust is still countable. Pairing a Partnership or traditional policy for the near term with attorney-drafted MAPT planning is a discussion item — this model does not create a trust.`,
  );
  recs.push(
    `Confirm ${s.state} Medicaid CSRA, home-equity, income limits, QIT, and look-back rules with a qualified Medicaid or elder-care planning attorney. This model is not a determination of eligibility. See Medicaid Information for spend-down, Partnership, and solvency notes.`,
  );
  recs.push(
    "Re-run the model when assets, health, marital status, or the state where care would be received change. Premiums vary by age, health, marital status, and state of issue.",
  );

  return recs;
}

function pdfEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text: string, max = 92): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

/** Multi-page Helvetica PDF: summary, projections, recommendations. */
export function buildScenarioPdf(opts: ReportOpts): Blob {
  const { scenario: s, grossPool, pool, result, selfFunded, todayCost } = opts;
  const pages: string[][] = [[]];
  const yStart = 742;
  let y = yStart;
  const lineH = 14;

  function add(line: string) {
    if (y < 56) {
      pages.push([]);
      y = yStart;
    }
    pages[pages.length - 1].push(line);
    y -= lineH;
  }

  function heading(t: string) {
    add("");
    add(t.toUpperCase());
  }

  function addPara(text: string) {
    for (const line of wrap(text)) add(line);
    add("");
  }

  add("Long Term Care Asset Utilization Modeling");
  add("Disclosure and Terms of Use — educational hypothetical, not a policy illustration");
  add(new Date().toLocaleString("en-US"));

  heading("1. Descriptive summary");
  for (const para of analysisNarrative(opts).split("\n\n")) addPara(para);

  heading("2. Projections");
  add(`Gross assets: ${money(grossPool)}`);
  add(`Countable assets (this run): ${money(pool)}`);
  add(
    `Primary residence: ${money(s.assets.home)}  ${s.excludeHome ? "(excluded from countable)" : "(included)"}`,
  );
  add(`Excludable assets (* Spouse Excluded Assets.): ${money(s.assets.excludable)}`);
  add(`State: ${s.state}`);
  add(`Setting: ${SETTING_LABELS[s.setting]}`);
  add(`Today's annual median: ${money(todayCost)}`);
  add(`Care starts: ${s.delay === 0 ? "now" : `in ${s.delay} years`}`);
  add(`Years of care modeled: ${s.duration}`);
  add(`Care-cost inflation: ${s.cpi}%`);
  if (s.assetRois) {
    for (const f of ASSET_FIELDS) {
      add(
        `${f.label}: ${money(s.assets[f.key] ?? 0)} at ${(s.assetRois[f.key] ?? 0).toFixed(1)}% ${f.key === "roth" ? "tax-free" : f.key === "ira" || f.key === "annuity" || f.key === "life" ? "deferred" : "gross"} R.O.I.`,
      );
    }
  }
  add(`Assumed weighted gross R.O.I. on taxable assets: ${s.roi}%`);
  add(`Tax rate on taxable R.O.I.: ${s.taxRate ?? 0}%`);
  add(`Deferred R.O.I. (annuity, life cash value, IRA / 401(k)): IRA / 401(k) ${s.iraRoi ?? s.roi}%`);
  add("");
  if (!s.policy.enabled) {
    add("No policy included in this run.");
  } else if (isLinkedKind(s.policy.kind)) {
    add(`Structure: ${policyKindLabel(s.policy.kind).toLowerCase()} (linked-benefit)`);
    add(`Single premium: ${money(s.policy.singlePremium)}`);
    add(`Leverage: ${s.policy.leverage <= 1 ? "None (face only)" : `${s.policy.leverage}x`}`);
    add(`LTC pool at purchase: ${money(result.benefitPoolAtPurchase ?? 0)}`);
    add(`Elimination: ${s.policy.elimDays} days`);
    add(`Residual death benefit floor: ${s.policy.residualPct}% of death benefit`);
    if (s.policy.csv?.enabled) {
      const m = csvMilestones(
        s.policy.singlePremium,
        s.policy.csv,
        s.delay,
        s.duration,
      );
      add(
        `Cash surrender value (${s.policy.csv.schedule === "none" ? "from illustration" : s.policy.csv.schedule === "7" ? "standard 7-year CDSC" : "standard 10-year CDSC"}${s.policy.csv.schedule !== "none" && s.policy.csv.creditPct ? `, credited ${s.policy.csv.creditPct}%` : ""}):`,
      );
      add(`  Today: ${money(m.today)}`);
      add(`  In 5 years: ${money(m.y5)}`);
      add(`  In 10 years: ${money(m.y10)}`);
      add(`  In 20 years: ${money(m.y20)}`);
      add(`  At start of care: ${money(m.atClaim)}`);
      add(`  At end of modeled care: ${money(m.atEnd)}`);
    }
  } else {
    add("Structure: traditional reimbursement");
    add(`Daily benefit today: ${money(s.policy.dailyBenefit)}`);
    add(
      `Benefit period: ${isLifetimeBenefit(s.policy.benefitYears) ? `${LIFETIME_BENEFIT_MARK}. ${LIFETIME_BENEFIT_NOTE}` : `${s.policy.benefitYears} years`}`,
    );
    add(`Elimination: ${s.policy.elimDays} days`);
    add(
      `Benefit Increase Option (i.e., Inflation Options): ${s.policy.inflationMethod === "none" || s.policy.benefitInflationPct <= 0 ? "None (level)" : `${s.policy.benefitInflationPct}% ${s.policy.inflationMethod}`}`,
    );
    add(`Annual premium: ${money(s.policy.annualPremium)}*`);
    add(
      `* Annual premiums based on reported: ${fiveYearIssueBand(s.ageToday ?? 0) ?? "age-band"} average premiums. Source: 2026 AALTCI Long-Term Care Insurance Price Index (https://www.aaltci.org/2026-AALTCI-Long-Term-Care-Insurance-Price-Index/).`,
    );
    add(`Insurance pool at purchase: ${money(result.benefitPoolAtPurchase ?? 0)}`);
  }
  add("");
  add(`Countable assets at start of care (net after tax): ${money(result.startPoolNet)}`);
  add(`First-year cost of care: ${money(result.firstCost)}`);
  add(`Insurance paid first (all modeled years): ${money(result.insuranceTotal)}`);
  add(`Countable assets remaining: ${money(result.endPool)}`);
  add(`If assets paid all care (no policy): ${money(selfFunded.endPool)}`);
  const preserved = result.endPool - selfFunded.endPool;
  add(
    `Assets preserved vs paying assets first: ${preserved >= 0 ? money(preserved) : `-${money(Math.abs(preserved))}`}`,
  );
  add(`Shortfall: ${result.shortfallTotal ? money(result.shortfallTotal) : "none"}`);
  if (s.policy.enabled && isLinkedKind(s.policy.kind)) {
    add(`Residual death benefit: ${money(result.residualDeathBenefit)}`);
    add(`Countable + death benefit at end: ${money(result.heirsTotal)}`);
  }
  if (result.depletedYear) add(`Funds depleted in year ${result.depletedYear}`);
  add("");
  add("Year  Status         Cost      Ins.1st     Co-pay     Remain   If assets 1st");
  for (const r of result.rows) {
    const sf = selfFunded.rows.find((x) => x.year === r.year);
    const status = (r.status ?? "").padEnd(12).slice(0, 12);
    add(
      `${String(r.year).padStart(2)}   ${status} ${money(r.cost).padStart(10)} ${money(r.insurance).padStart(10)} ${money(r.drawn).padStart(10)} ${money(r.remaining).padStart(10)} ${money(sf?.remaining ?? 0).padStart(12)}`,
    );
  }

  heading("3. Recommendations to consider");
  recommendationsNarrative(opts).forEach((r, i) => {
    addPara(`${i + 1}. ${r}`);
  });

  heading("4. Asset detail");
  for (const f of ASSET_FIELDS) {
    add(`${f.label}: ${money(s.assets[f.key])}`);
  }
  add(`Excludable assets (* Spouse Excluded Assets.): ${money(s.assets.excludable)}`);

  heading("5. Notes");
  for (const line of wrap(HOLD_HARMLESS_FULL)) {
    add(line);
  }

  return encodePdf(pages);
}

function encodePdf(pages: string[][]): Blob {
  const objs: string[] = [];
  const addObj = (body: string) => {
    objs.push(body);
    return objs.length;
  };

  const fontId = addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (const lines of pages) {
    const ops: string[] = ["BT", "/F1 10 Tf", "14 TL", "50 756 Td"];
    lines.forEach((line, i) => {
      if (i > 0) ops.push("T*");
      ops.push(`(${pdfEscape(line)}) Tj`);
    });
    ops.push("ET");
    const stream = ops.join("\n");
    contentIds.push(
      addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`),
    );
  }

  for (let i = 0; i < pages.length; i++) {
    pageIds.push(0);
  }
  const pagesIdPlaceholder = objs.length + pages.length + 1;

  for (let i = 0; i < pages.length; i++) {
    pageIds[i] = addObj(
      `<< /Type /Page /Parent ${pagesIdPlaceholder} 0 R /MediaBox [0 0 612 792] /Contents ${contentIds[i]} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  }

  const kids = pageIds.map((id) => `${id} 0 R`).join(" ");
  const pagesId = addObj(`<< /Type /Pages /Kids [${kids}] /Count ${pageIds.length} >>`);
  if (pagesId !== pagesIdPlaceholder) {
    throw new Error("PDF pages object id mismatch");
  }
  const catalogId = addObj(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objs.length; i++) {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n`;
  out += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer << /Size ${objs.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([out], { type: "application/pdf" });
}
