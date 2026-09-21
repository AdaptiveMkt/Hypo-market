/** Educational notes on BLS CPI vs this model's care-cost compounding. */

export const CPI_METHODS = [
  {
    title: "What BLS is measuring",
    body: "The Consumer Price Index tracks the change in prices urban households pay for a fixed-quality market basket. CPI-U covers about 90% of the population (the headline number). CPI-W is a wage-earner subset used for Social Security COLAs. Chained CPI-U (C-CPI-U) lets the basket shift when relative prices change.",
  },
  {
    title: "How the index is built",
    body: "Weights come from the Consumer Expenditure Survey (annual reweighting since 2023). Prices are collected monthly in dozens of urban areas. Upper-level aggregation is a modified Laspeyres formula (quantities held fixed between weight updates). Most lower-level item indexes use a geometric mean, which allows some substitution inside a category. The published index is usually 1982–84 = 100.",
  },
  {
    title: "Headline CPI vs medical-care CPI",
    body: "Medical care is only one CPI major group (services + commodities: hospitals, physicians, health insurance, drugs). Hospital services can run hotter than headline CPI; drugs and insurance methodology are different from a nursing-home private-pay bill. BLS CPI is out-of-pocket consumer prices — employer- and government-paid care shows up more in PCE than in CPI.",
  },
  {
    title: "CPI is not an LTC price index",
    body: "Nursing facility, assisted living, and 24-hour home care are barely in the CPI basket. CareScout / Genworth cost-of-care surveys and AARP LTSS studies are the usual LTC yardsticks. Those have recently run from about 2–3% (cooler 2025 survey) to about 5–8% (2019–2024 assisted living and home care). This model lets you pick one annual rate and apply it to the selected setting.",
  },
];

export function careCostCompound(today: number, ratePct: number, years: number) {
  const r = (Number(ratePct) || 0) / 100;
  const y = Math.max(0, Number(years) || 0);
  return today * Math.pow(1 + r, y);
}

export function careCostSimple(today: number, ratePct: number, years: number) {
  const r = (Number(ratePct) || 0) / 100;
  const y = Math.max(0, Number(years) || 0);
  return today * (1 + r * y);
}

export const HEALTHCARE_CPI = {
  blsMedicalCareYoy: 1.7,
  blsMedicalCareAsOf: "July 2026",
  blsMedicalCareSeries: "CUSR0000SAM",
  blsMedicalServicesYoy: 2.48,
  blsMedicalServicesAsOf: "August 2026",
  carescout: [
    { label: "Home health / non-medical caregiver", yoy: 3 },
    { label: "Assisted living", yoy: 5 },
    { label: "Nursing facility (semi-private room)", yoy: 2 },
    { label: "Nursing facility (private room)", yoy: 1 },
  ],
  source:
    "Long-term care index uses CareScout / Genworth Cost of Care Survey year-over-year (released March 2026). BLS Medical Care CPI (CUSR0000SAM) and medical care services are shown for comparison only — they measure out-of-pocket consumer medical prices, not facility or home-care private-pay rates.",
} as const;
