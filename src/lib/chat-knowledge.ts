import { HYPO_SOURCES, LICENSE_LOOKUPS } from "@/lib/sources";
import { HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";
import { IRC_101G_INTRO, IRC_101G_PER_DIEM_2026 } from "@/lib/irc-101g";
import { NAIC_LOCKOUT_ASSETS, NAIC_WARN_ASSETS } from "@/lib/naic-suitability";
import { CLAIM_CAUSES, CLAIMS_SERIES, AALTCI_2024_SAMPLE } from "@/lib/claims-history";

export type CitedSource = { label: string; url: string; aaltci: boolean };

export type KnowledgeChunk = {
  id: string;
  text: string;
  label: string;
  url?: string;
  aaltci: boolean;
};

const paid2023 = CLAIMS_SERIES.find((r) => r.year === 2023);

function isAaltci(label: string, url?: string) {
  return /aaltci/i.test(label) || /aaltci\.org/i.test(url ?? "");
}

const CORE: KnowledgeChunk[] = [
  {
    id: "hypo",
    label: "This hypothetical — Asset Utilization Modeling",
    aaltci: false,
    text:
      "This site is Long Term Care Asset Utilization Modeling — an educational hypothetical. Countable assets (cash, CDs, market investments, metals, other investable, investment real estate, annuities, life cash value, IRA/401k, Roth, LTC annuity, hybrid life) grow by each line’s ROI; taxable lines are reduced by the selected tax rate. Care costs by state and setting (home, assisted living, nursing, memory) inflate by the selected CPI / long-term care index. If a policy is included, insurance pays the claim first; assets co-pay leftover cost. Shortfall is care bill minus insurance minus remaining assets. Primary residence and spouse-excluded assets can be held out. Not a quote or advice.",
  },
  {
    id: "disclaimer",
    label: "Hold harmless — Adaptive Marketing Group",
    aaltci: false,
    text: HOLD_HARMLESS_SHORT,
  },
  {
    id: "pays-first",
    label: "This hypothetical — insurance pays first",
    aaltci: false,
    text:
      "When “include long-term care insurance in the run” is selected, the year-by-year table applies the policy benefit first (after the elimination period). Countable assets are drawn only as co-pay if that year’s care bill exceeds that year’s insurance. Unused assets keep earning the assumed R.O.I. When the policy pool is exhausted, remaining cost comes entirely from assets until those are depleted.",
  },
  {
    id: "triggers",
    label: "IRC §7702B tax-qualified long-term care",
    url: "https://www.law.cornell.edu/uscode/text/26/7702B",
    aaltci: false,
    text:
      "Tax-qualified LTCI (IRC §7702B) pays after a licensed health-care practitioner certifies 2 of 6 ADLs without substantial assistance, or severe cognitive impairment needing substantial supervision, expected to last at least 90 days — then the elimination period. Diagnosis alone is not a claim. Unlicensed/family care and care outside the U.S. are commonly limited. NAIC Shopper’s Guide and Model Act #640 describe outline-of-coverage and free-look protections.",
  },
  {
    id: "101g",
    label: "26 U.S.C. §101(g)",
    url: "https://www.law.cornell.edu/uscode/text/26/101",
    aaltci: false,
    text: `${IRC_101G_INTRO} 2026 chronic-illness indemnity cap $${IRC_101G_PER_DIEM_2026}/day (Rev. Proc. 2025-32). §101(g) only accelerates a life death benefit; it is not Partnership LTCI. Extension of benefits after the face is a §7702B-style rider.`,
  },
  {
    id: "1035",
    label: "26 U.S.C. §1035",
    url: "https://www.law.cornell.edu/uscode/text/26/1035",
    aaltci: false,
    text:
      "IRC §1035 allows tax-free exchange of life, endowment, annuity, and (after 12/31/2009, Pension Protection Act) qualified long-term care contracts. Asset-based LTCI is often funded with a single premium deposit or a 1035 exchange. Confirm tax treatment with a CPA or enrolled agent.",
  },
  {
    id: "suitability",
    label: "NAIC Shopper’s Guide / Personal Worksheet",
    url: "https://content.naic.org/sites/default/files/publication-ltc-lp-shoppers-guide-long-term.pdf",
    aaltci: false,
    text: `This model locks insurance options when countable assets are under $${NAIC_LOCKOUT_ASSETS.toLocaleString("en-US")} and warns under $${NAIC_WARN_ASSETS.toLocaleString("en-US")}. Planning floors only — not a filed NAIC statutory minimum. If adjusted gross household income is included, the suggested traditional premium is 7% of that income. Asset-based, annuity care, and hybrid life default the single premium to 2.5% of countable assets. If income is not included, the traditional planning figure is 2.5% of countable assets. Premiums vary by state, age, underwriting and rate class, marital status, benefits, and riders.`,
  },
  {
    id: "structures",
    label: "This hypothetical — four insurance structures",
    aaltci: false,
    text:
      "Four structures can be compared: Traditional reimbursement LTCI (may be DRA Partnership-certified); asset-based single premium (deposit × leverage = LTC pool, residual death benefit); hybrid life (face + §101(g) acceleration + optional §7702B extension); LTC annuity (annuity + §7702B rider, not 101(g)). Linked/hybrid/annuity forms are generally not Partnership-certified.",
  },
  {
    id: "costs",
    label: "CareScout Cost of Care",
    url: "https://www.carescout.com/cost-of-care",
    aaltci: false,
    text:
      "State care costs in this model are rounded annual medians from the CareScout Cost of Care Survey 2025 (published 2026), formerly circulated as Genworth Cost of Care. Settings: home care, assisted living, nursing facility, memory care. 24-hour home care is a planning multiple of the published 44-hour home-care median, not an agency quote. Local provider prices differ. Historical tables: Genworth Cost of Care archive.",
  },
  {
    id: "cpi",
    label: "U.S. Bureau of Labor Statistics — Consumer Price Index",
    url: "https://www.bls.gov/cpi/",
    aaltci: false,
    text:
      "Care bills compound at the selected inflation / long-term care index (defaulted to a 5-year benchmark by setting when available). This is a planning assumption, not the BLS medical-care index itself. AARP PPI LTSS material is used for healthcare-cost discussion, not as a state price list.",
  },
  {
    id: "tax",
    label: "IRS Rev. Proc. 2025-32 / Publication 502",
    url: "https://www.irs.gov/publications/p502",
    aaltci: false,
    text:
      "Taxable asset ROI uses one flat planning rate (dropdown from 2026 ordinary and capital-gain brackets in Rev. Proc. 2025-32). IRA/401k and annuity/life cash value are modeled as tax-deferred until withdrawn. Eligible LTC premium deductions are age-based under IRC §213(d)(10) / Pub. 502. Not a Form 1040.",
  },
  {
    id: "medicaid",
    label: "Medicaid.gov — Long-Term Care Partnership / spousal impoverishment",
    url: "https://www.medicaid.gov/medicaid/long-term-services-supports/medicaid-long-term-services-supports-ltss-benefits/long-term-care-partnership-program",
    aaltci: false,
    text:
      "Medicaid LTC is means-tested. Countable assets generally spend down to a small individual limit (often about $2,000; couples both applying about $3,000). CSRA, MMMNA, and home-equity caps are in the CMCS Dec. 9, 2025 bulletin and Medicaid.gov spousal-impoverishment page; they vary by state. DRA Partnership can protect assets equal to benefits paid (dollar-for-dollar) in participating states; original CA/CT/IN/NY programs differ. Reciprocity is not automatic. Confirm with an elder-law attorney. This is current-rule planning only: it does not assume Medicaid will still be solvent or that the benefit will remain the same — solvency and benefits may be adjusted by legislation, regulation, or other government action.",
  },
  {
    id: "va",
    label: "VA — Pension, Aid and Attendance, disability compensation",
    url: "https://www.va.gov/pension/aid-attendance-housebound/",
    aaltci: false,
    text:
      "Wartime VA pension, Housebound, and Aid and Attendance MAPR are shown in this hypothetical only when the wartime veteran/surviving-spouse box is selected. Eligibility, net worth, and clinical tests are on VA.gov. Disability compensation is a separate program (rating-based). SSA POMS SI 00830.308 discusses A&A in SSI income counting. Not a VA claim.",
  },
  {
    id: "buyers",
    label: "2025 Milliman Long-Term Care Insurance Survey (Broker World)",
    url: "https://brokerworldmag.com/wp-content/uploads/2025/12/2025-SurveyAnalysis-2025-12-16.pdf",
    aaltci: false,
    text:
      "Milliman 2025 survey of 2024 stand-alone LTCI sales (excluding one short-duration product): average initial monthly max about $5,428 (~$178/day); 73.2% monthly determination; 3-year period 55.1%; 89.8% used an 84–100 day elimination; buyers 54.4% female; 27.2% ages 50–59 and 44.1% ages 60–69. LIMRA combo (life+LTC) premium far exceeds stand-alone. EY quoting LIMRA 2024 combo mix: chronic-illness ADB 73%, LTC rider on life 20%, linked-benefit with extension 7%. Not a quote.",
  },
  {
    id: "aaltci-paid",
    label: "AALTCI — Paid LTCI claims increased in 2023",
    url: "https://www.aaltci.org/news/long-term-care-insurance-association-news/paid-long-term-care-insurance-claims-increased-in-2023",
    aaltci: true,
    text: `AALTCI: traditional LTCI paid about $${paid2023?.paidB} billion in 2023 to about ${paid2023?.claimantsK},000 people. Paid is not incurred (Milliman review of NAIC Experience Forms: ~$16B incurred 2023, ~$17B 2024).`,
  },
  {
    id: "aaltci-causes",
    label: "AALTCI — Top reasons for an LTC insurance claim",
    url: "https://www.aaltci.org/news/long-term-care-insurance-news/top-reasons-for-long-term-care-insurance-claim-alzheimers-cancer",
    aaltci: true,
    text: `AALTCI summarizing new-claim causes within the sources this model will cite: Alzheimer’s/dementia ${CLAIM_CAUSES.overall[0].pct}% of new claims; stroke, arthritis, injury, circulatory each about 9%; cancer 8%. Under 65, cancer and injury are over-represented; at 75+ Alzheimer’s dominates. Connecticut Partnership 2024 sample mean claim age ${AALTCI_2024_SAMPLE.claimAgeMean} (${AALTCI_2024_SAMPLE.claimAgeRange}); 59% female.`,
  },
  {
    id: "aaltci-declines",
    label: "Milliman — 2024 underwriting declines",
    url: "https://brokerworldmag.com/wp-content/uploads/2025/12/2025-SurveyAnalysis-2025-12-16.pdf",
    aaltci: false,
    text: `2025 Milliman LTCI Survey of 2024 applications: individual decline about 18% at 40–49, 24% at 50–59, 33% at 60–64, 43% at 65–69, 50% at 70–74. Build, insulin diabetes, stroke/TIA, cognitive change, and existing ADL limits commonly close a file. Decline studies from 2019 and earlier are not cited.`,
  },
  {
    id: "aaltci-price",
    label: "2026 AALTCI Long-Term Care Insurance Price Index",
    url: "https://www.aaltci.org/2026-AALTCI-Long-Term-Care-Insurance-Price-Index/",
    aaltci: true,
    text:
      "AALTCI 2026 Long-Term Care Insurance Price Index: published average premiums by age and inflation design for a sample traditional policy (Illinois examples). This hypothetical uses those published/scaled cells as industry context, not a carrier quote.",
  },
];

const CATALOG: KnowledgeChunk[] = [...HYPO_SOURCES, ...LICENSE_LOOKUPS].map((s, i) => ({
  id: `catalog-${i}`,
  label: s.label,
  url: s.href,
  aaltci: isAaltci(s.label, s.href),
  text: `${s.topic}. ${s.label}. ${s.note}`,
}));

export const KNOWLEDGE: KnowledgeChunk[] = [...CORE, ...CATALOG];

function score(q: string, chunk: KnowledgeChunk) {
  const words = q.toLowerCase().split(/[^a-z0-9$%]+/).filter((w) => w.length > 3);
  let n = 0;
  const hay = `${chunk.text} ${chunk.label} ${chunk.id}`.toLowerCase();
  for (const w of words) if (hay.includes(w)) n += 1;
  if (chunk.aaltci && /aaltci|price index|claims paid|decline/.test(q.toLowerCase())) n += 2;
  return n;
}

export function uniqueSources(chunks: KnowledgeChunk[]): CitedSource[] {
  const out: CitedSource[] = [];
  const seen = new Set<string>();
  for (const c of chunks) {
    if (!c.url) continue;
    const key = c.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label: c.label, url: c.url, aaltci: c.aaltci });
  }
  return out;
}

export function retrieveKnowledge(question: string, limit = 14) {
  const always = CORE.filter((c) => c.id === "hypo" || c.id === "disclaimer");
  const rest = KNOWLEDGE.filter((c) => c.id !== "hypo" && c.id !== "disclaimer")
    .map((c) => ({ c, s: score(question, c) }))
    .sort((a, b) => b.s - a.s)
    .filter((x) => x.s > 0)
    .slice(0, limit)
    .map((x) => x.c);
  const seen = new Set<string>();
  const chunks: KnowledgeChunk[] = [];
  for (const c of [...always, ...rest]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    chunks.push(c);
  }
  if (rest.length === 0) {
    for (const c of CORE) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      chunks.push(c);
    }
  }
  return { chunks, sources: uniqueSources(chunks) };
}

export function formatSourceFooter(sources: CitedSource[]) {
  if (!sources.length) {
    return {
      text: "Sources: this hypothetical’s educational cards. Confirm current figures with the cited publishers. Not a quote.",
      spoken: "Sources: this hypothetical’s educational cards. Confirm current figures with the cited publishers. Not a quote.",
    };
  }
  const lines = sources.map((s) => `${s.label} — ${s.url}`);
  const names = sources.map((s) => s.label).join("; ");
  const aaltci = sources.some((s) => s.aaltci)
    ? " AALTCI.org figures are from the American Association for Long-Term Care Insurance and must be confirmed on their site."
    : "";
  return {
    text: `Sources used from this hypothetical:${aaltci}\n${lines.join("\n")}\nConfirm current data with those publishers. Not a quote or a determination of eligibility.`,
    spoken: `Sources used from this hypothetical: ${names}.${aaltci} Confirm current data with those publishers. Not a quote.`,
  };
}

export function ensureSourceDisclosure(answer: string, sources: CitedSource[]) {
  const footer = formatSourceFooter(sources);
  const usedAaltci = sources.some((s) => s.aaltci);
  let text = answer.trim();
  if (usedAaltci && !/aaltci/i.test(text)) {
    text = `${text}\n\nAccording to the American Association for Long-Term Care Insurance (AALTCI.org), the figures above are published industry snapshots.`;
  }
  if (!/sources used from this hypothetical/i.test(text) && !/^sources:/im.test(text)) {
    text = `${text}\n\n${footer.text}`;
  }
  const spoken = `${text}\n${footer.spoken}`;
  return { text, spoken, usedAaltci, sources, footer };
}
