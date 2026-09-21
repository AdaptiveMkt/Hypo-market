import { medicaidProfile, SIL_2026, spendDownRules } from "./medicaid";
import { silLabel } from "./mapt";

type QitStateNote = {
  allowed: boolean;
  localName: string;
  deposit: string;
  extra: string;
};

const QIT_STATE: Record<string, QitStateNote> = {
  Alabama: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state. SIL 2026 $2,982 / month." },
  Alaska: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state. Confirm AK SSI-based SIL (higher FBR)." },
  Arizona: { allowed: true, localName: "Income-Only Trust", deposit: "Maricopa / Pima / Pinal about $8,667; other counties about $8,132 (tied to NH private-pay)", extra: "County deposit caps change with nursing-home rates." },
  Arkansas: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Also has a medically needy path for some coverage." },
  Colorado: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "Regional caps about $9,780–$11,522 / month (2026)", extra: "Region 1 (Denver metro) is the high end; confirm the county region." },
  Delaware: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "SIL modeled at 250% of SSI ($2,485), below the 300% federal ceiling." },
  Florida: { allowed: true, localName: "Qualified Income Trust (QIT)", deposit: "No published monthly deposit cap", extra: "Used for ICP / SMMC-LTC when income exceeds SIL. Also has a medically needy path for some coverage." },
  Georgia: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Also has a medically needy path for some coverage." },
  Idaho: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  Indiana: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state. Original Partnership TAP does not replace a QIT." },
  Iowa: { allowed: true, localName: "Medical Assistance Income Trust (MAIT)", deposit: "About $12,002.50 / month (eff. 7/1/26–6/30/27)", extra: "State uses the MAIT name. Confirm the current Iowa deposit cap." },
  Kentucky: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Also has a medically needy path for some coverage." },
  Mississippi: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  Missouri: { allowed: true, localName: "Qualified Income Trust (HCBS / waiver)", deposit: "No published monthly deposit cap", extra: "Often described as QIT for HCBS waivers only; nursing-facility may use a different path. Confirm with MO HealthNet." },
  Nevada: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  "New Jersey": { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Also has a medically needy path for some coverage." },
  "New Mexico": { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  Ohio: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  Oklahoma: { allowed: true, localName: "Medicaid Income Pension Trust", deposit: "About $7,637 / month (eff. 7/1/26–6/30/27)", extra: "Deposit cap is published and should be re-checked each year." },
  Oregon: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  "South Carolina": { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  "South Dakota": { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  Tennessee: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Used for TennCare LTSS / CHOICES when over SIL." },
  Texas: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "State remainder beneficiary. Couple SIL is twice the individual SIL ($5,964 in 2026) when both apply." },
  Wyoming: { allowed: true, localName: "Qualified Income Trust / Miller trust", deposit: "No published monthly deposit cap", extra: "Income-cap state." },
  "New York": { allowed: false, localName: "Pooled income trust (not a Miller QIT)", deposit: "N/A — NY is medically needy", extra: "NY generally uses a pooled income trust / medically needy spend-down, not a Miller QIT, for surplus income." },
  California: { allowed: false, localName: "Medically needy / MAGI (not a Miller QIT)", deposit: "N/A", extra: "California is not modeled as an income-cap QIT state for nursing-facility Medicaid." },
};

export function qitStateNote(state: string): QitStateNote {
  if (QIT_STATE[state]) return QIT_STATE[state];
  const spend = spendDownRules(state, medicaidProfile(state).individualLimit);
  if (spend.qit) {
    return {
      allowed: true,
      localName: "Qualified Income Trust / Miller trust",
      deposit: "Confirm deposit cap locally",
      extra: spend.title,
    };
  }
  return {
    allowed: false,
    localName: "Medically needy income spend-down (QIT generally not used)",
    deposit: "N/A",
    extra: `${state} is modeled as medically needy. Excess income is reduced by incurred medical / LTC bills rather than a Miller trust. Confirm whether any waiver group still uses a QIT.`,
  };
}

export function qitRules(state: string) {
  const p = medicaidProfile(state);
  const spend = spendDownRules(state, p.individualLimit);
  const note = qitStateNote(state);
  const needed = note.allowed
    ? `${state} allows a ${note.localName} when countable income is over SIL (${silLabel(state)} / month). Deposit rule: ${note.deposit}. ${note.extra}`
    : `${state}: ${note.extra}`;

  return {
    title: `Qualified Income Trust (Miller trust) in ${state}`,
    summary: needed,
    needed: note.allowed,
    sil: silLabel(state),
    note,
    bullets: [
      {
        heading: `${state} rule in this model`,
        body: `${note.localName}. ${note.extra} Monthly deposit: ${note.deposit}. 2026 SIL: ${silLabel(state)} / month. Pathway: ${spend.pathway === "income-cap" ? "income-cap" : spend.pathway === "both" ? "income-cap and medically needy" : "medically needy"}.`,
      },
      {
        heading: "What a QIT is — and is not",
        body: `A QIT holds only the applicant’s income (Social Security, pension, VA, etc.). It cannot be funded with savings, a house, or investments. That is the opposite of a Medicaid Asset Protection Trust. Federal SIL ceiling is $${SIL_2026.toLocaleString("en-US")} / month (300% of SSI).`,
      },
      {
        heading: "Federal conditions (42 U.S.C. § 1396p(d)(4)(B))",
        body: "Income only; the state Medicaid agency is remainder beneficiary up to benefits paid; used where the state has a special-income-level (income-cap) group. The applicant should not be the trustee. Income must be deposited each month — missing a month can break eligibility.",
      },
      {
        heading: "What the trustee pays",
        body: "Typically: personal-needs allowance, any court-ordered fees, a community-spouse MMMNA if due, then the facility or waiver providers. Leftover at death goes to the state up to Medicaid paid. A QIT does not shelter leftover income for heirs.",
      },
      {
        heading: "When more information is needed",
        body: `Ask a qualified Medicaid or elder-care planning attorney whether ${state} requires a QIT for this person, how much income must be assigned, who may serve as trustee, and how it interacts with VA pension or a Partnership policy. This model does not draft or fund a trust.`,
      },
    ],
  };
}

export function millerTrustMedicaidImpact(state: string) {
  const rules = qitRules(state);
  return {
    title: `Miller / QIT impact on Medicaid in ${state}`,
    summary: rules.needed
      ? `In ${state}, depositing income into a valid QIT can make the applicant income-eligible when gross income is over SIL. It does not protect assets, does not pay extra care, and leftover trust funds go to the state at death. Request more information for the full impact.`
      : `In ${state}, a Miller QIT is generally not the income path. Medically needy spend-down (or a pooled income trust) is modeled instead. Request more information.`,
    bullets: [
      {
        heading: "Eligibility impact",
        body: rules.needed
          ? `Without a QIT, countable income even $1 over ${rules.sil} / month can block institutional / waiver Medicaid in an income-cap state. Income assigned to a valid QIT is treated as unavailable for the SIL test, so the person can meet the income cap while still using that income for care.`
          : rules.summary,
      },
      {
        heading: "What does not change",
        body: "A QIT does not raise the resource (asset) limit, does not create a Partnership-style asset disregard, and does not shelter a house or investments (that is a MAPT, after a 60-month look-back). Functional eligibility, look-back on gifts, and CSRA rules still apply.",
      },
      {
        heading: "After eligibility — NAM",
        body: "Once Medicaid starts, the trustee still distributes income: personal-needs allowance, community-spouse MMMNA if due, then the nursing facility or waiver providers (the NAM). Medicaid pays the rest of the allowed rate only if the program is then still solvent and still covering that setting at the rate then in force. The family does not keep the surplus income. Solvency and the benefit may be adjusted by legislation, regulation, or other government action.",
      },
      {
        heading: "At death",
        body: "The state is remainder beneficiary up to Medicaid paid. Unused QIT balance is not an inheritance. That is why a QIT is an eligibility tool, not an estate-planning trust.",
      },
      {
        heading: "Monthly funding",
        body: `Missing a month’s deposit can make that month’s income countable again and interrupt eligibility. The applicant should not be the trustee. Confirm the current ${state} instrument, deposit cap, and who may serve with a qualified Medicaid or elder-care planning attorney.`,
      },
    ],
  };
}