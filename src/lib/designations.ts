/** Professional designations and conferring organizations named in this hypothetical. */

export const DESIGNATION_MARKS: { match: string; name: string }[] = [
  { match: "CERTIFIED FINANCIAL PLANNER™", name: "CFP®" },
  { match: "CFP Board", name: "CFP Board" },
  { match: "CFP®", name: "CFP®" },
  { match: "ChFC®", name: "ChFC®" },
  { match: "CLU®", name: "CLU®" },
  { match: "RICP®", name: "RICP®" },
  { match: "CLTC", name: "CLTC" },
  { match: "LTCP", name: "LTCP" },
  { match: "CELA", name: "CELA" },
  { match: "enrolled agent", name: "Enrolled Agent (EA)" },
  { match: "Enrolled Agent", name: "Enrolled Agent (EA)" },
  { match: "CPA", name: "CPA" },
  { match: "AICPA", name: "AICPA" },
  { match: "NASBA", name: "NASBA" },
  { match: "NAELA", name: "NAELA" },
  { match: "NELF", name: "NELF" },
  { match: "American Bar Association", name: "American Bar Association" },
];

export const ALL_DESIGNATION_NAMES = [
  "CFP®",
  "CFP Board",
  "ChFC®",
  "CLU®",
  "RICP®",
  "CLTC",
  "LTCP",
  "CELA",
  "CPA",
  "Enrolled Agent (EA)",
  "AICPA",
  "NASBA",
  "American Bar Association",
  "state bars",
  "NAELA",
  "NELF",
];

const CATCH_ALL =
  "any other legal or tax professional organization that offers a designation";

export function designationNonEndorsement(names: string | string[]) {
  const uniq = [...new Set((Array.isArray(names) ? names : [names]).filter(Boolean))];
  const listParts = uniq.length ? [...uniq, CATCH_ALL] : [CATCH_ALL];
  const list =
    listParts.length === 1
      ? listParts[0]
      : `${listParts.slice(0, -1).join(", ")}, and ${listParts[listParts.length - 1]}`;
  return `The ${list} have not endorsed or approved this hypo tool as an official planning tool for their organizations. Contact a professionally designated advisor or consultant for legal, tax, and financial advice.`;
}

export function designationsInText(text: string): string[] {
  const found: string[] = [];
  for (const row of DESIGNATION_MARKS) {
    if (text.includes(row.match) && !found.includes(row.name)) found.push(row.name);
  }
  return found;
}

export const DESIGNATION_PDF_IDS = [
  "dhContact",
  "dhLicense",
  "dhIar",
  "dhCfp",
  "dhDesignation",
] as const;

export const DESIGNATION_PDF_NAMES: Record<string, string[]> = {
  dhContact: ALL_DESIGNATION_NAMES,
  dhLicense: ALL_DESIGNATION_NAMES,
  dhIar: ALL_DESIGNATION_NAMES,
  dhCfp: ALL_DESIGNATION_NAMES,
  dhDesignation: ALL_DESIGNATION_NAMES,
};
