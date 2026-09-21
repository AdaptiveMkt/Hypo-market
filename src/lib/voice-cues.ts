import { fiveYearIssueBand, typicalBuyerHints } from "./calc";
import type { ProtectAssetsSize } from "./protect-assets";

function spokenDollars(n: number) {
  const amount = Math.abs(Math.round(Number(n) || 0)).toLocaleString("en-US");
  return `${amount} dollars`;
}

/** Spoken after Calculate Countable Assets in Section 1. */
export function section1AssetsSpoken(pool: number): string {
  return (
    `Great. You have completed section 1, and your countable assets are ${spokenDollars(pool)}. ` +
    `Now let's move to section 2, where you can let us know where and when you think you might need care. ` +
    `This is subjective, but will help in the preparation of this hypothetical report.`
  );
}

/** Spoken script for the Section 2 industry-average box after Age today is entered. */
export function section2IndustrySpoken(ageToday: number): string {
  const hints = typicalBuyerHints(ageToday);
  const band = fiveYearIssueBand(ageToday);
  const bandSpoken = band ? band.replace("–", " to ").replace("-", " to ") : "your age";
  const inf = hints.inflation.replace("%", " percent").replace("compound", "compound inflation").replace("simple", "simple inflation");
  return (
    `Based on industry averages at your age bracket, ${bandSpoken}, ` +
    `this hypothetical defaults traditional benefits to ${hints.daily.replace("$", "")} dollars a day, ` +
    `a ${hints.period.replace("-", " ")} period, a ${hints.elim.replace("-", " ")} wait, and ${inf}. ` +
    `You can change any field in Section 3.`
  );
}

/** Spoken after years of care is selected — matches the protect-assets card. */
export function section2ProtectSpoken(opts: {
  pool: number;
  ageToday: number;
  delay: number;
  claimAge: number;
  protectPct: number;
  settingLabel: string;
  size: ProtectAssetsSize;
}): string {
  const s = opts.size;
  const when =
    opts.delay === 0
      ? "this year"
      : `${opts.delay} year${opts.delay === 1 ? "" : "s"}`;
  const years = `${s.careYears} year${s.careYears === 1 ? "" : "s"}`;
  const lead =
    `If you have ${spokenDollars(opts.pool)} countable assets today at age ${opts.ageToday}, ` +
    `and care is expected in ${when} at age ${opts.claimAge}, ` +
    `this model projects about ${spokenDollars(s.assetsAtClaimNet)} countable assets, net after tax, at claim. ` +
    `To protect ${opts.protectPct} percent of that nest egg, ${spokenDollars(s.protectDollars)}, ` +
    `through ${years} of ${opts.settingLabel.toLowerCase()}, about ${spokenDollars(s.careTotal)} of inflated care costs, `;
  if (s.alreadyProtected) {
    return (
      lead +
      `assets on this run can cover the modeled bills while still leaving that share. ` +
      `Insurance is optional for this protection target. Not a quote.`
    );
  }
  const period = s.lifetime
    ? "with a lifetime benefit period"
    : `for ${s.benefitYears} year${s.benefitYears === 1 ? "" : "s"}`;
  const inflate =
    s.dailyToday !== s.dailyAtClaim
      ? ` about ${spokenDollars(s.dailyAtClaim)} a day at claim if benefits inflate with the age-based default.`
      : ".";
  const pool =
    s.lifetime
      ? `${spokenDollars(s.annualCapAtClaim)} a year, lifetime`
      : spokenDollars(s.poolNeeded);
  return (
    lead +
    `consider a traditional reimbursement design of about ${spokenDollars(s.dailyToday)} a day ${period} purchased today,` +
    inflate +
    ` That is a pool of about ${pool}. ` +
    `Assets would be asked to co-pay up to ${spokenDollars(s.spendable)}. ` +
    `Not a quote. Underwriting, state, and riders change what can actually be issued.`
  );
}
