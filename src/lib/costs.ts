/** Monthly medians: home 44hr, assisted living, NH semi, NH private. CareScout 2025. */
export const STATES: Record<string, [number, number, number, number]> = {
  Alabama: [5148, 4425, 8334, 8787],
  Alaska: [7245, 9882, 27831, 36000],
  Arizona: [7245, 6250, 8365, 11437],
  Arkansas: [4767, 4637, 7452, 8060],
  California: [7627, 7000, 12167, 15178],
  Colorado: [7913, 6584, 10159, 12182],
  Connecticut: [6864, 9118, 15208, 16729],
  Delaware: [6673, 7600, 14494, 15132],
  "District of Columbia": [6673, 7500, 13500, 15000],
  Florida: [6101, 5610, 10342, 12167],
  Georgia: [6101, 5300, 8821, 9429],
  Hawaii: [7817, 12096, 15473, 16395],
  Idaho: [7341, 5175, 10494, 12167],
  Illinois: [6864, 6219, 8304, 9216],
  Indiana: [6673, 5639, 8943, 10326],
  Iowa: [7836, 5381, 9277, 10038],
  Kansas: [6435, 5975, 8669, 9064],
  Kentucky: [6197, 5528, 9718, 11254],
  Louisiana: [4957, 5163, 7604, 8076],
  Maine: [8485, 8205, 13976, 14904],
  Maryland: [6673, 7173, 12927, 14448],
  Massachusetts: [7627, 9600, 14448, 15817],
  Michigan: [6626, 5818, 11254, 11969],
  Minnesota: [8389, 6573, 10646, 13870],
  Mississippi: [4576, 4369, 9581, 9885],
  Missouri: [6292, 5400, 6741, 7604],
  Montana: [7245, 6075, 8973, 9581],
  Nebraska: [6864, 6350, 8377, 9216],
  Nevada: [7055, 6241, 11786, 14463],
  "New Hampshire": [7627, 8025, 12243, 13444],
  "New Jersey": [7245, 8710, 12775, 14448],
  "New Mexico": [5720, 5950, 9125, 10633],
  "New York": [6673, 7110, 15528, 16729],
  "North Carolina": [5720, 6496, 9733, 10798],
  "North Dakota": [6483, 4729, 11528, 12304],
  Ohio: [6483, 6103, 9186, 10389],
  Oklahoma: [6292, 6150, 7026, 7756],
  Oregon: [7627, 6875, 16760, 18448],
  Pennsylvania: [6483, 6480, 11954, 13688],
  "Rhode Island": [7627, 7781, 12106, 13383],
  "South Carolina": [5982, 5350, 9034, 9612],
  "South Dakota": [8437, 4900, 9444, 10190],
  Tennessee: [5911, 5845, 9429, 10038],
  Texas: [5720, 5666, 5627, 7604],
  Utah: [7484, 5475, 8669, 10646],
  Vermont: [8580, 8597, 14113, 15528],
  Virginia: [6673, 6945, 10250, 11680],
  Washington: [8580, 7600, 13155, 15969],
  "West Virginia": [5720, 6340, 12836, 13262],
  Wisconsin: [6912, 6540, 10646, 12319],
  Wyoming: [8771, 5325, 9916, 10923],
};

export const STATE_NAMES = Object.keys(STATES);

export type CareSetting = "al" | "nh" | "nhs" | "home24" | "memory";

export const SETTING_LABELS: Record<CareSetting, string> = {
  home24: "Home health / 24-hour home care",
  al: "Assisted Living Community Care",
  memory: "Memory Care Facility",
  nhs: "Nursing facility (semi-private room)",
  nh: "Nursing facility (private room)",
};

export const SETTING_SHORT: Record<CareSetting, string> = {
  home24: "home health / 24-hour home care",
  al: "assisted living",
  memory: "memory care facility",
  nhs: "nursing facility (semi-private room)",
  nh: "nursing facility (private room)",
};

/** CareScout 2025 does not publish memory care; A Place for Mom 2026 ~25% above AL. */
export const MEMORY_CARE_AL_FACTOR = 1.25;

/** 24-hour home care as a planning multiple of the published 44-hour monthly median. */
export const HOME24_FROM_44HR = 2.8;

export function annualCost(state: string, setting: CareSetting): number {
  const row = STATES[state];
  if (!row) return 0;
  const [home, al, nhs, nh] = row;
  if (setting === "al") return al * 12;
  if (setting === "nh") return nh * 12;
  if (setting === "nhs") return nhs * 12;
  if (setting === "memory") return al * 12 * MEMORY_CARE_AL_FACTOR;
  return home * 12 * HOME24_FROM_44HR;
}

export const NATIONAL_HOME44_ANNUAL = 80080;
export const NATIONAL_AL_ANNUAL = 74400;
export const NATIONAL_MEMORY_ANNUAL = 93000;
export const NATIONAL_NHS_ANNUAL = 114975;
export const NATIONAL_NH_ANNUAL = 129575;
export const NATIONAL_HOME24_ANNUAL = Math.round(NATIONAL_HOME44_ANNUAL * HOME24_FROM_44HR);

export const NATIONAL_COSTS: { key: CareSetting; label: string; annual: number }[] = [
  { key: "al", label: SETTING_LABELS.al, annual: NATIONAL_AL_ANNUAL },
  { key: "memory", label: SETTING_LABELS.memory, annual: NATIONAL_MEMORY_ANNUAL },
  { key: "nhs", label: SETTING_LABELS.nhs, annual: NATIONAL_NHS_ANNUAL },
  { key: "nh", label: SETTING_LABELS.nh, annual: NATIONAL_NH_ANNUAL },
  { key: "home24", label: SETTING_LABELS.home24, annual: NATIONAL_HOME24_ANNUAL },
];

export function stateCostSnapshot(state: string) {
  return (["al", "memory", "nhs", "nh", "home24"] as CareSetting[]).map((key) => ({
    key,
    label: SETTING_LABELS[key],
    annual: annualCost(state, key),
  }));
}

/**
 * National median annual costs. 44-hour home, AL, NH semi, NH private are
 * scaled 44/30). Memory care = assisted living × 1.25. Years 2016–2021 from
 * AARP PPI / Genworth; 2023–2025 from CareScout.
 */
export type CostHistoryPoint = {
  year: number;
  home44: number;
  al: number;
  memory: number;
  nhs: number;
  nh: number;
};

export const COST_HISTORY: CostHistoryPoint[] = [
  { year: 2016, home44: 46332, al: 43536, memory: 54420, nhs: 82128, nh: 92376 },
  { year: 2019, home44: 52624, al: 48612, memory: 60765, nhs: 90155, nh: 102200 },
  { year: 2021, home44: 61776, al: 54000, memory: 67500, nhs: 94900, nh: 108405 },
  { year: 2023, home44: 75504, al: 64200, memory: 80250, nhs: 104028, nh: 116796 },
  { year: 2024, home44: 77792, al: 70800, memory: 88500, nhs: 111325, nh: 127750 },
  { year: 2025, home44: 80080, al: 74400, memory: 93000, nhs: 114975, nh: 129575 },
];

export function historySpan(startYear: number, endYear: number) {
  const start = COST_HISTORY.find((p) => p.year === startYear);
  const end = COST_HISTORY.find((p) => p.year === endYear);
  if (!start || !end) return [];
  const years = endYear - startYear;
  const keys = [
    { key: "home44" as const, label: "Home health (44 hr/wk)" },
    { key: "al" as const, label: "Assisted living" },
    { key: "memory" as const, label: "Memory care" },
    { key: "nhs" as const, label: "Nursing (semi-private room)" },
    { key: "nh" as const, label: "Nursing (private)" },
  ];
  return keys.map((k) => {
    const a = start[k.key];
    const b = end[k.key];
    const pct = a > 0 ? (b / a - 1) * 100 : 0;
    const cagr = a > 0 && years > 0 ? (Math.pow(b / a, 1 / years) - 1) * 100 : 0;
    return { ...k, start: a, end: b, pct, cagr, years };
  });
}

const SETTING_TO_HISTORY: Record<CareSetting, keyof Omit<CostHistoryPoint, "year">> = {
  home24: "home44",
  al: "al",
  memory: "memory",
  nhs: "nhs",
  nh: "nh",
};

export const LTC_FIVE_YEAR = { start: 2021, end: 2025 } as const;

export const CARE_SETTING_ORDER: CareSetting[] = ["home24", "al", "memory", "nhs", "nh"];

/** Phrase used in the CPI footnote: “If home care, the rate is X%.” */
const FIVE_YEAR_IF_LABEL: Record<CareSetting, string> = {
  home24: "home care",
  al: "assisted living",
  memory: "memory care facility",
  nhs: "nursing facility (semi-private room)",
  nh: "nursing facility (private)",
};

/** 5-year Cost of Care CAGR (2021–2025) for the selected setting, 1 decimal. */
export function fiveYearLtcCagr(setting: CareSetting) {
  const rows = historySpan(LTC_FIVE_YEAR.start, LTC_FIVE_YEAR.end);
  const key = SETTING_TO_HISTORY[setting];
  const row = rows.find((r) => r.key === key);
  if (!row) {
    const avg = rows.reduce((s, r) => s + r.cagr, 0) / Math.max(1, rows.length);
    return Math.round(avg * 10) / 10;
  }
  return Math.round(row.cagr * 10) / 10;
}

export function fiveYearLtcBenchmarks() {
  return CARE_SETTING_ORDER.map((key) => ({
    key,
    ifLabel: FIVE_YEAR_IF_LABEL[key],
    cagr: fiveYearLtcCagr(key),
  }));
}

export const DEFAULT_CARE_YEARS = 5;
export const DEFAULT_CARE_SETTING: CareSetting = "al";
export const DEFAULT_CARE_CPI = fiveYearLtcCagr(DEFAULT_CARE_SETTING);
