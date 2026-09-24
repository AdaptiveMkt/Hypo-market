import { fiveYearIssueBand, LIFETIME_BENEFIT_NOTE, monthlyFromDaily, typicalBuyerHints } from "./calc";
import type { ProtectAssetsSize } from "./protect-assets";
import { money, moneyCents } from "./utils";

export function section1AssetsMessage(opts: {
  pool: number;
  home: number;
  excludeHome: boolean;
}): string {
  const home = Number(opts.home) || 0;
  const homeNote = opts.excludeHome
    ? home > 0
      ? `The primary residence of ${money(home)} is exempt and is not included in that countable amount.`
      : `You elected to exempt the primary residence from countable assets. No home equity was entered.`
    : home > 0
      ? `The primary residence of ${money(home)} is not exempt and is included in that countable amount.`
      : `You did not elect to exempt the primary residence from countable assets. No home equity was entered.`;
  return (
    `Great, you have completed Section 1, and based on your input, your countable assets are ${money(opts.pool)}. ` +
    `${homeNote} ` +
    `Now let's proceed to Section 2, where you can let us know where and when you think you might need care. ` +
    `This is subjective, but will help in the preparation of this hypothetical report.`
  );
}

export function section2IndustryMessage(ageToday: number): string {
  const hints = typicalBuyerHints(ageToday);
  const band = fiveYearIssueBand(ageToday) ?? "your age";
  return (
    `Based on industry averages within your age bracket (${band}), this hypo defaults traditional long term care insurance benefits to ` +
    `${hints.daily}/day, a ${hints.period} period, a ${hints.elim} wait, and ${hints.inflation}. ` +
    `* You can change any field in Section 3 to modify both the benefits shown in the hypothetical run.`
  );
}

export function section3ProtectMessage(opts: {
  pool: number;
  ageToday: number;
  delay: number;
  claimAge: number;
  protectPct: number;
  settingLabel: string;
  cpiPct: number;
  size: ProtectAssetsSize;
}): string {
  const s = opts.size;
  const when =
    opts.delay === 0
      ? "this year"
      : `the ${opts.delay} year${opts.delay === 1 ? "" : "s"}`;
  const years = `${s.careYears} year${s.careYears === 1 ? "" : "s"}`;
  const monthlyToday = money(Math.round(monthlyFromDaily(s.dailyToday)));
  const monthlyClaim = money(Math.round(monthlyFromDaily(s.dailyAtClaim)));
  const cpi = `${Number(opts.cpiPct).toFixed(1)}%`;
  const lead =
    `Based on ${money(opts.pool)} countable assets today at age ${opts.ageToday}, and considering based on industry claim's experience, ` +
    `your care needs may occur sometime within ${when} at age ${opts.claimAge}. ` +
    `This model projects your countable assets, net after tax, at claim to be about ${moneyCents(s.assetsAtClaimNet)}. ` +
    `To protect ${opts.protectPct} percent of that nest egg, or ${moneyCents(s.protectDollars)}, through ${years} of ` +
    `${opts.settingLabel.toLowerCase()}, is projected to cost about ${moneyCents(s.careTotal)} inflated at ${cpi}. `;
  const close =
    ` If you were to proceed with insurance coverage, your rates will be based on insurance company selected, underwriting classification, state of issue, benefit designs and selected riders.\n\n` +
    `Select “Use this alternative design” and Run hypothetical. If not, simply proceed to Run hypothetical.`;
  if (s.alreadyProtected) {
    return (
      lead +
      `Assets on this run can cover the modeled bills while still leaving that share. Insurance is optional for this protection target.` +
      close
    );
  }
  const period = s.lifetime
    ? `a lifetime* benefit period. ${LIFETIME_BENEFIT_NOTE}`
    : `${s.benefitYears} year${s.benefitYears === 1 ? "" : "s"} benefit period`;
  const pool = s.lifetime
    ? `${money(s.annualCapAtClaim)} a year, lifetime*`
    : moneyCents(s.poolNeeded);
  return (
    lead +
    `Based on your countable assets and care needs, you might want to think about seeing if you can qualify for ` +
    `${money(s.dailyToday)} a day and/or ${monthlyToday} monthly for ${period} purchased today, ` +
    `which will be about ${money(s.dailyAtClaim)} a day, and/or ${monthlyClaim} monthly at the projected time of claim ` +
    `if benefits inflate with the age-based default. That is an insurance benefit pool of coverage of about ${pool}. ` +
    `Your countable assets or available income would be used to pay the additional out-of-pocket health care costs.` +
    close
  );
}
