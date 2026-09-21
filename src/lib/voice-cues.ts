import { fiveYearIssueBand, typicalBuyerHints } from "./calc";

function spokenDollars(n: number) {
  const amount = Math.abs(Math.round(Number(n) || 0)).toLocaleString("en-US");
  return `${amount} dollars`;
}

/** Spoken after Calculate Countable Assets in Section 1. */
export function section1AssetsSpoken(pool: number, section2Open = true, floor = 0): string {
  const base =
    `Great. You have completed section 1, and your countable assets are ${spokenDollars(pool)}. `;
  if (section2Open) {
    return (
      base +
      `Now let's move to section 2, where you can let us know where and when you think you might need care. ` +
      `This is subjective, but will help in the preparation of this hypothetical report.`
    );
  }
  return (
    base +
    `Section 2 stays closed until countable assets exceed 150,000 dollars plus the value of the house, ` +
    `which is ${spokenDollars(floor)} on this run.`
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
