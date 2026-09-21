import {
  DAILY_BENEFIT_MAX,
  clampDailyBenefit,
  inflateDaily,
  typicalPurchaseForAge,
  type InflationMethod,
} from "./calc";

export const DEFAULT_PROTECT_PCT = 80;

export type ProtectAssetsSize = {
  assetsAtClaimNet: number;
  protectDollars: number;
  spendable: number;
  careYears: number;
  careTotal: number;
  poolNeeded: number;
  dailyAtClaim: number;
  dailyToday: number;
  benefitYears: number;
  lifetime: boolean;
  annualCapAtClaim: number;
  alreadyProtected: boolean;
};

/** Total inflated care bills over `careYears`, starting at first-year cost. */
export function inflatedCareTotal(firstYearCost: number, cpiPct: number, careYears: number) {
  const n = Math.max(1, Math.round(Number(careYears) || 1));
  const r = (Number(cpiPct) || 0) / 100;
  const c0 = Math.max(0, Number(firstYearCost) || 0);
  let sum = 0;
  for (let i = 0; i < n; i++) sum += c0 * Math.pow(1 + r, i);
  return sum;
}

/**
 * Size a traditional reimbursement pool so that after modeled care, about
 * `protectPct` of countable assets at claim can remain (assets only co-pay
 * the leftover after insurance). Not a quote.
 */
export function sizeInsuranceToProtectAssets(opts: {
  assetsAtClaimNet: number;
  protectPct: number;
  firstYearCost: number;
  cpiPct: number;
  careYears: number;
  delayYears: number;
  ageToday: number;
}): ProtectAssetsSize {
  const net = Math.max(0, Number(opts.assetsAtClaimNet) || 0);
  const pct = Math.min(100, Math.max(0, Number(opts.protectPct) || 0));
  const careYears = Math.max(1, Math.round(Number(opts.careYears) || 1));
  const protectDollars = net * (pct / 100);
  const spendable = Math.max(0, net - protectDollars);
  const careTotal = inflatedCareTotal(opts.firstYearCost, opts.cpiPct, careYears);
  const poolNeeded = Math.max(0, careTotal - spendable);
  const alreadyProtected = poolNeeded <= 0;

  const typical = typicalPurchaseForAge(opts.ageToday);
  let benefitYears = Math.min(Math.max(careYears, 1), 10);
  let dailyAtClaim = alreadyProtected ? 0 : poolNeeded / (365 * benefitYears);
  let lifetime = false;
  if (!alreadyProtected && dailyAtClaim > DAILY_BENEFIT_MAX) {
    benefitYears = Math.ceil(poolNeeded / (DAILY_BENEFIT_MAX * 365));
    if (benefitYears > 10) {
      lifetime = true;
      benefitYears = 50;
      dailyAtClaim = DAILY_BENEFIT_MAX;
    } else {
      dailyAtClaim = DAILY_BENEFIT_MAX;
    }
  }
  if (!alreadyProtected) dailyAtClaim = clampDailyBenefit(dailyAtClaim);

  const delay = Math.max(0, Number(opts.delayYears) || 0);
  const method = typical.inflationMethod as InflationMethod;
  const infPct = typical.benefitInflationPct;
  const grown = inflateDaily(1, delay, infPct, method);
  const dailyToday = alreadyProtected
    ? 0
    : clampDailyBenefit(grown > 0 ? dailyAtClaim / grown : dailyAtClaim);

  return {
    assetsAtClaimNet: net,
    protectDollars,
    spendable,
    careYears,
    careTotal,
    poolNeeded: alreadyProtected
      ? 0
      : lifetime
        ? dailyAtClaim * 365 * 10
        : dailyAtClaim * 365 * benefitYears,
    dailyAtClaim,
    dailyToday,
    benefitYears,
    lifetime,
    annualCapAtClaim: dailyAtClaim * 365,
    alreadyProtected,
  };
}
