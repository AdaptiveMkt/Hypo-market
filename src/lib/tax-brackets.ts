/** IRS tax year 2026 brackets (returns filed in 2027). Rev. Proc. 2025-32. */

export type TaxRateOption = {
  rate: number;
  group: "ltcg" | "ordinary";
  label: string;
};

export const DEFAULT_TAX_RATE = 15;

/** Long-term capital gains / qualified dividends, tax year 2026. */
export const LTCG_2026 = {
  single0: 49450,
  single15: 545500,
  mfj0: 98900,
  mfj15: 613700,
} as const;

/** Ordinary income taxable-income ceilings, tax year 2026 (single / MFJ). */
export const ORDINARY_2026: { rate: number; singleTo: number | null; mfjTo: number | null }[] = [
  { rate: 10, singleTo: 12400, mfjTo: 24800 },
  { rate: 12, singleTo: 50400, mfjTo: 100800 },
  { rate: 22, singleTo: 105700, mfjTo: 211400 },
  { rate: 24, singleTo: 201775, mfjTo: 403550 },
  { rate: 32, singleTo: 256225, mfjTo: 512450 },
  { rate: 35, singleTo: 640600, mfjTo: 768700 },
  { rate: 37, singleTo: null, mfjTo: null },
];

function band(singleTo: number | null, mfjTo: number | null) {
  if (singleTo == null || mfjTo == null) {
    return "Single over $640,600 / joint over $768,700";
  }
  return `Single to $${singleTo.toLocaleString("en-US")} / joint to $${mfjTo.toLocaleString("en-US")}`;
}

export const TAX_RATE_OPTIONS: TaxRateOption[] = [
  {
    rate: 0,
    group: "ltcg",
    label: `0% LTCG / qualified dividends — ${band(LTCG_2026.single0, LTCG_2026.mfj0)}`,
  },
  {
    rate: 15,
    group: "ltcg",
    label: `15% LTCG / qualified dividends — Single $49,451–$545,500 / joint $98,901–$613,700`,
  },
  {
    rate: 20,
    group: "ltcg",
    label: `20% LTCG / qualified dividends — Single over $545,500 / joint over $613,700`,
  },
  ...ORDINARY_2026.map((b) => ({
    rate: b.rate,
    group: "ordinary" as const,
    label: `${b.rate}% ordinary income — ${band(b.singleTo, b.mfjTo)}`,
  })),
];

export const TAX_RATE_GROUPS = [
  { key: "ltcg" as const, heading: "Long-term capital gains / qualified dividends (2026)" },
  { key: "ordinary" as const, heading: "Ordinary income brackets (2026)" },
];
