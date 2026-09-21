import { fiveYearIssueBand, typicalBuyerHints } from "./calc";

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
