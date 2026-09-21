/**
 * Okabe–Ito / Wong categorical palette — distinguishable under
 * protanopia, deuteranopia, and tritanopia. Prefer blue/orange/sky/vermillion
 * for the first four series (highest pairwise contrast under CVD).
 * @see https://jfly.uni-koeln.de/color/
 */
export const CVD = {
  orange: "#E69F00",
  sky: "#56B4E9",
  bluishGreen: "#009E73",
  yellow: "#F0E442",
  blue: "#0072B2",
  vermillion: "#D55E00",
  purple: "#CC79A7",
  black: "#000000",
  grey: "#737373",
} as const;

/** Chart series — not for small text on cream (orange/sky fail WCAG 1.4.3). */
export const CHART = {
  remaining: "var(--color-teal)",
  cost: CVD.orange,
  insurance: CVD.sky,
  shortfall: CVD.vermillion,
  selfFunded: CVD.purple,
  protected: CVD.orange,
  level: CVD.grey,
  compound5: CVD.blue,
  simple5: CVD.orange,
  cpi: CVD.vermillion,
  compound3: CVD.sky,
  grid: "var(--color-chart-grid)",
  tick: "var(--color-chart-tick)",
  paper: "var(--color-card)",
  ink: "var(--color-ink)",
} as const;

/** Pie / sleeve order: cash → market → metals → other → IRA → Roth → annuity → RE → home. */
export const PIE_COLORS = [
  CVD.blue,
  CVD.sky,
  CVD.orange,
  CVD.grey,
  CVD.bluishGreen,
  CVD.yellow,
  CVD.purple,
  CVD.vermillion,
  "#1b3a4b",
] as const;