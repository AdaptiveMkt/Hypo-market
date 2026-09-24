export const COPYRIGHT_LINE =
  "© 2026 Adaptive Marketing Group. All rights reserved.";

export const TERMS_BUTTON_LABEL = "Disclosure and Terms of Use";

export const DISCLOSURE_CARD_TITLE = "Disclosure and Terms of Use";
export const DISCLOSURE_HASH = "disclosure-terms";

export function openDisclosureCard(hash = DISCLOSURE_HASH) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("aum:open-disclosure", { detail: hash }));
}

export const HOLD_HARMLESS_TITLE = "Hold harmless — not professional advice";

export const HOLD_HARMLESS_SHORT =
  "Hold harmless: Adaptive Marketing Group does not provide tax, legal, investment, insurance, financial-planning, eldercare-planning, or Medicaid advice and does not assume a fiduciary duty. CFP® professionals cannot waive their CFP Board fiduciary duty when they provide Financial Advice. Contact the appropriate licensed professional for your individual situation. Educational hypothetical only.";

export const HOLD_HARMLESS_ACK =
  "I have read and acknowledge the Adaptive Marketing Group hold-harmless disclaimer, including that the Publishers are not my (or my client’s) fiduciary and do not provide legal advice. This PDF is educational only and is not tax, legal, investment, insurance, financial-planning, eldercare-planning, or Medicaid advice. I will contact the appropriate licensed professional for my (or my client’s) situation, including a CERTIFIED FINANCIAL PLANNER™ professional (CFP®) where financial planning is involved. I understand a CFP® professional’s fiduciary duty under CFP Board Standard A.1 cannot be waived when they provide Financial Advice.";

export const HOLD_HARMLESS_PARAS = [
  {
    heading: "Who publishes this model",
    body: "Adaptive Marketing Group (the “Publishers”) provide this Long Term Care Asset Utilization Modeling tool, the on-screen hypothetical, the View report, and any PDF solely as an educational illustration. By using the model or requesting a report, you agree to the following hold-harmless terms.",
  },
  {
    heading: "Accessibility",
    body: "This tool is built to WCAG 2.2 Level AA. A skip link jumps to main content. Form fields have visible labels. Charts include a text summary for screen readers; color is not the only way a shortfall is shown. Speech that starts automatically can be stopped on the same screen. The on-screen View is the accessible report. The Download PDF file is a print picture of that page (not a tagged PDF) — stay on View or use the browser Print dialog if you need selectable, readable text. Motion is reduced when your device asks for it.",
  },
  {
    heading: "Not advice of any kind",
    body: "This material is not tax advice, legal advice, investment advice, insurance advice, financial-planning advice, eldercare-planning advice, or Medicaid advice. It is not an illustration, offer, solicitation, recommendation, or quote of any insurance policy, security, annuity, or investment. It is not a determination of Medicaid, VA, SSI, Medicare, or tax eligibility, and it is not a substitute for an outline of coverage or a policy contract. Insurance in this model does not pay until a benefit trigger is certified and any elimination period has run — see Benefit triggers below.",
  },
  {
    heading: "AI disclosure",
    body: "This is an AI-generated hypothetical. Narrative text, including the descriptive summary and the recommendations, is assembled by software from the numbers and choices entered on this platform. Artificial intelligence can omit a fact, misstate a rule, or apply an average that does not fit the person. It is not a person, not a licensed professional, and not advice. Review every figure before relying on a report, and confirm it with the appropriate licensed professional.",
  },
  {
    heading: "Benefit triggers",
    body: "A tax-qualified long-term care policy (IRC §7702B) does not pay because of age or a diagnosis. Benefits start only after a licensed health-care practitioner certifies a benefit trigger: the insured cannot perform 2 of 6 activities of daily living (bathing, dressing, toileting, transferring, continence, eating) without substantial assistance, or has a severe cognitive impairment requiring substantial supervision, and the condition is expected to last at least 90 consecutive days. After that certification, the elimination (waiting) period on the contract must still run before benefits are payable (this model defaults to 90 days; the run uses the period you enter). Hybrid life accelerated death benefits under IRC §101(g) use a related chronic-illness definition; many 101(g) riders also require the condition to be permanent (expected to last the rest of life), and a 101(g)-only rider does not create extra LTC dollars after the face amount is exhausted. Terminal illness under §101(g) is a physician certification that death is reasonably expected within 24 months. Medicaid level of care is a separate state determination — an insurance certification does not grant Medicaid. Unlicensed or family care, preexisting conditions, and care outside the United States are commonly limited. Read the outline of coverage. This model is not a claim decision.",
  },
  {
    heading: "What consumers buy",
    body: "New sales and in-force books are not the same. LIMRA combination (life + LTC) individual premium was about $2.86 billion in 2023, versus $112.7 million of stand-alone new premium in the 2025 Milliman LTCI Survey of 2024 sales. Typical 2024 stand-alone issue (excluding one short-duration product): average initial monthly maximum $5,428 (~$178/day); 73.2% monthly determination; 3-year benefit period 55.1% (5-year 7.4%, 6-year 20.0%, lifetime* 0.1%); 89.8% used an 84–100 day elimination period; 3% compound 17.4% and FPO the majority inflation design; Shared Care on about 19% of 3-year policies. Buyers: 54.4% female; 27.2% ages 50–59 and 44.1% ages 60–69. Milliman does not publish benefit-size, period, EP, or inflation mix by gender — AALTCI Price Index premiums by age and sex are in the tables. Not a quote and not this carrier’s mix. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence.",
  },
  {
    heading: "Hold harmless",
    body: "You agree to hold Adaptive Marketing Group and its owners, officers, employees, contractors, and licensors harmless from any claim, loss, cost, or decision made in reliance on this hypothetical or any report generated from it. The Publishers have no duty to update figures after you leave the page. You — not the Publishers — are responsible for decisions about care, assets, insurance, investments, taxes, and public benefits.",
  },
  {
    heading: "No fiduciary relationship — waiver as to the Publishers",
    body: "Use of this model, the View report, or a PDF does not create a client, advisory, or fiduciary relationship with Adaptive Marketing Group. You expressly waive any claim that the Publishers are your (or your client’s) fiduciary, investment adviser, attorney, CPA, insurance agent, or elder-care planner. The Publishers do not supervise any professional who uses this tool with a client.",
  },
  {
    heading: "Not legal advice",
    body: "Nothing on this site, in a View report, or in a PDF is legal advice. No attorney-client relationship is formed with Adaptive Marketing Group or anyone solely because you used this model. Medicaid, Partnership, spend-down, QIT, MAPT, homestead, VA, SSI, estate-recovery, and tax-qualified LTC rules are summaries of publicly described programs; they are not an opinion of counsel and are not a substitute for advice from a lawyer licensed in the state whose law applies. Only that lawyer can apply the law to your facts. Do not gift, retitle, spend down, or file a claim based only on this hypothetical. This model does not assume Medicaid will still be solvent, or that any Medicaid benefit will remain the same — solvency and benefits may be adjusted by legislation, regulation, or other government action.",
  },
  {
    heading: "Contact the appropriate professional",
    body: "Figures change with the assumptions you enter and with official rate tables. Confirm every number with current sources and with the appropriate licensed professional for your individual situation. For financial planning, a CERTIFIED FINANCIAL PLANNER™ professional (CFP®); other planning designations often discussed in this field include ChFC® (Chartered Financial Consultant), CLU® (Chartered Life Underwriter), and RICP® (Retirement Income Certified Professional). Those marks are not a substitute for investment adviser registration. For investment advice, use a registered investment adviser (RIA) firm or an investment adviser representative (IAR) registered with the SEC or a state securities regulator (Form ADV / IAPD), and for brokerage a registered representative on BrokerCheck. For long-term care insurance, a licensed producer, with CLTC (Certified in Long-Term Care) or LTCP (Long-Term Care Professional) strongly recommended. For tax, a CPA, enrolled agent (EA), or tax attorney. For legal, Medicaid, and eldercare planning, an attorney licensed in the relevant state — look for a Certified Elder Law Attorney (CELA) or equivalent elder-law / Medicaid practice. For VA pension, Aid and Attendance, or disability compensation, an accredited veterans service officer (VSO). Designations show education; they do not replace a state license or SEC/state registration, and this list is not an endorsement of any person. Considering Medicaid planning: contact a qualified Medicaid or elder-care planning attorney. This model does not provide legal advice.",
  },
  {
    heading: "Investment adviser registration",
    body: "Giving investment advice for compensation generally requires the firm to be a registered investment adviser (RIA) with the U.S. Securities and Exchange Commission or a state securities regulator, and the individual to be an investment adviser representative (IAR), unless an exemption applies. Registration is disclosed on Form ADV and can be checked on the SEC Investment Adviser Public Disclosure (IAPD) site. Brokers and registered representatives are checked on FINRA BrokerCheck. A CFP®, ChFC®, CLU®, RICP®, CLTC, or LTCP designation does not, by itself, register anyone as an investment adviser. Adaptive Marketing Group is not your RIA, IAR, or broker-dealer. Confirm current registration before relying on investment advice.",
  },
  {
    heading: "CFP® Board Standards — fiduciary duty cannot be waived",
    body: "CFP Board’s Code of Ethics and Standards of Conduct (Standard A.1, https://www.cfp.net/ethics/code-of-ethics-and-standards-of-conduct) requires that at all times when providing Financial Advice to a Client, a CFP® professional must act as a fiduciary and therefore act in the Client’s best interests (Duty of Loyalty, Duty of Care, and Duty to Follow Client Instructions). Standard (Prohibition on Circumvention) provides that a CFP® professional may not do indirectly, or through another person or entity, any act the Code and Standards prohibit doing directly. A CFP® professional cannot waive, disclaim, or assign away that fiduciary duty when they provide Financial Advice. Running or sharing this hypothetical is not Financial Advice and does not satisfy, reduce, or replace that duty. Conflicts of interest must still be avoided or fully disclosed with informed consent and properly managed (Standard A.5). This tool is not a CFP Board-approved financial plan.",
  },
];

export const PRIVACY_POLICY_TITLE = "Privacy policy";

export const PRIVACY_POLICY_INTRO =
  "This privacy policy describes how Adaptive Marketing Group (the “Publishers”) handle information in connection with this Long Term Care Asset Utilization Modeling site. It is part of the terms of use. Effective September 2026.";

export const PRIVACY_POLICY_PARAS = [
  {
    heading: "Who we are",
    body: "Adaptive Marketing Group operates this educational hypothetical. Policy questions: kim@adaptivesolutionsonline.com. Advisor PDF copies are sent from info@fundingltcmarketplace.com. Contact-request forms are sent to Info@preserve-your-assets.com. This is not a Notice of Privacy Practices under HIPAA. This site is an educational calculator, not a medical record, health plan, or health-care provider portal.",
  },
  {
    heading: "If no client information is submitted, none is retained",
    body: "If you do not submit client information (no client name, email, or other client contact on the run, and no PDF or form send), no client information is collected or retained by Adaptive Marketing Group. Scenario numbers that stay in your browser or in localStorage on your device are yours. Reset or clearing site data removes that local copy.",
  },
  {
    heading: "PDF download",
    body: "Download PDF saves a print picture of the View on the end user’s device. If an advisor name and email and the end user’s contact are both on the run, a copy of that PDF is emailed to the advisor from info@fundingltcmarketplace.com. If there is no advisor email, only the end user downloads the file. Optional names or contact you typed on the run may appear in the file. Do not enter Social Security numbers, account numbers, or medical diagnoses. The PDF is not a tagged accessible file — for screen readers, use the on-screen View.",
  },
  {
    heading: "Who receives a copy of a generated report",
    body: "The end user always downloads the PDF on their device. When both the advisor’s email and the end user’s (client) information are entered, the advisor also receives the PDF as an email attachment from info@fundingltcmarketplace.com. Adaptive Marketing Group does not keep a publisher-side archive of the PDF. If no advisor email is entered, no advisor copy is sent.",
  },
  {
    heading: "What is sent when you request a PDF or submit a form",
    body: "Requesting a PDF always saves the file locally for the end user. If advisor and client contact are both present, the same file is emailed to the advisor from info@fundingltcmarketplace.com. If you ask someone to contact you (when no advisor email is on the run), the required Name, Phone, Email, and State on that form are emailed to Info@preserve-your-assets.com so a representative can follow up with the contact information of at least two long-term care professionals in your state. Do not enter Social Security numbers, account numbers, medical diagnoses, or other sensitive identifiers.",
  },
  {
    heading: "How we use information",
    body: "Optional client and advisor fields stay in that run, in any PDF the end user saves, and — when both parties are completed — in the copy emailed to the advisor. Contact-request forms go only to Info@preserve-your-assets.com. We do not sell personal information. We do not use this site to make automated eligibility, underwriting, or credit decisions.",
  },
  {
    heading: "Cookies, local storage, and hosting",
    body: "The site may use localStorage for your saved scenario and display preferences (such as dark mode). Hosting is used to deliver the page. We do not place advertising cookies for this tool.",
  },
  {
    heading: "Sharing and retention",
    body: "When an advisor email is on the run with the end user’s information, that advisor receives the PDF. Contact-request submissions are sent to Info@preserve-your-assets.com. If no client information is submitted and you do not ask to be contacted, none is retained by the Publishers. You may email Info@preserve-your-assets.com with a privacy question about this policy.",
  },
  {
    heading: "Children and state rights",
    body: "This site is not directed to children under 13, and we do not knowingly collect information from them. Depending on your state (including Florida), you may have rights regarding personal information a business holds. Because the Publishers do not retain client packets or downloaded PDFs, a request to delete a local copy is for you to remove the file from your device. Email kim@adaptivesolutionsonline.com for a policy question. We will not discriminate against you for exercising a privacy right that applies.",
  },
  {
    heading: "Changes",
    body: "We may update this privacy policy. The version on this page applies to use after the date shown. Continued use after a change is acceptance of the updated policy. This policy does not make the Publishers your covered entity, business associate, investment adviser, or attorney.",
  },
];

export const HOLD_HARMLESS_FULL = HOLD_HARMLESS_PARAS.map(
  (p) => `${p.heading}. ${p.body}`,
).join(" ");

/** Shared benefit-trigger explanation for educational cards (matches hold-harmless). */
export const BENEFIT_TRIGGER_HEADING = "Benefit triggers";
export const BENEFIT_TRIGGER_BODY =
  HOLD_HARMLESS_PARAS.find((p) => p.heading === "Benefit triggers")?.body ?? "";

export const TERMS_MAY_DO = [
  "Use this model for personal, family, or client educational planning — a hypothetical only.",
  "Run scenarios, save a PDF of your results, and share that PDF with the client or household it was prepared for.",
  "Link to this site. Do not frame it or present it as your own product.",
];

export const TERMS_MAY_NOT = [
  "Copy, scrape, republish, reverse-engineer, or redistribute the site, code, text, tables, or charts.",
  "Sell, white-label, or embed this model as your own calculator, course, or software.",
  "Remove copyright notices, logos, or disclaimers from reports or pages.",
  "Use outputs as an insurance illustration, quote, Medicaid determination, or legal/tax advice.",
];
export const TERMS_LIABILITY_SECTIONS = [
  {
    heading: "Acceptance",
    body: "By accessing this site, running a hypothetical, viewing a report, or downloading a PDF, you agree to these terms of use and to the hold-harmless disclosures on this page. If you do not agree, do not use the model. Use on behalf of a client is your use; you are responsible for what you show that client.",
  },
  {
    heading: "Provided “as is” — no warranty",
    body: "The Publishers provide the model, educational cards, rate tables, charts, View report, and PDF AS IS and AS AVAILABLE, with no warranty of any kind, express or implied, including accuracy, completeness, merchantability, fitness for a particular purpose, non-infringement, or uninterrupted or error-free operation. Figures are planning estimates. They may be rounded, delayed, incomplete, or later changed by SSA, CMS, VA, state Medicaid agencies, insurers, or survey publishers.",
  },
  {
    heading: "No professional relationship",
    body: "Use of this site does not create an attorney-client, accountant-client, insurance-agent, investment-adviser, broker-dealer, or fiduciary relationship with Adaptive Marketing Group. The Publishers are not appointed as your insurance producer unless you have a separate written appointment or client agreement with a licensed person — this website is not that agreement. No one is obligated to sell, underwrite, or issue a policy because you ran a scenario.",
  },
  {
    heading: "Not an insurance illustration, quote, or solicitation",
    body: "Outputs are not a NAIC or company policy illustration, not an outline of coverage, not a premium quote, and not an offer or solicitation to buy or sell any insurance, annuity, or security. Premium, daily benefit, inflation rider, Partnership, and hybrid figures are user-entered or simplified planning math. Real policies require underwriting, a licensed producer, and the carrier’s forms. Benefit triggers, elimination periods, exclusions, and premium-change rights apply — see the Benefit triggers section. Do not present this PDF to a client as “the policy.”",
  },
  {
    heading: "Benefit triggers",
    body: "A tax-qualified long-term care policy (IRC §7702B) does not pay because of age or a diagnosis. Benefits start only after a licensed health-care practitioner certifies a benefit trigger: the insured cannot perform 2 of 6 activities of daily living (bathing, dressing, toileting, transferring, continence, eating) without substantial assistance, or has a severe cognitive impairment requiring substantial supervision, and the condition is expected to last at least 90 consecutive days. After that certification, the elimination (waiting) period on the contract must still run before benefits are payable. Hybrid life accelerated death benefits under IRC §101(g) use a related chronic-illness definition; many 101(g) riders also require permanence, and a 101(g)-only rider does not extend benefits after the face is exhausted. Terminal illness under §101(g) is death reasonably expected within 24 months. Medicaid level of care is a separate state screen. Unlicensed or family care, preexisting conditions, and care outside the United States are commonly limited. Read the outline of coverage. This model is not a claim decision.",
  },
  {
    heading: "Not a public-benefits determination",
    body: "Nothing on this site is a determination of Medicaid, SSI, Medicare, VA pension, Aid and Attendance, disability compensation, or tax eligibility or amount. Partnership “protected” assets, CSRA, QIT, MAPT, spend-down, SSI resource limits, and VA MAPR/compensation tables are educational summaries of published rules. This model does not assume Medicaid will still be solvent, or that any Medicaid benefit, payment rate, eligibility test, or Partnership disregard will remain the same when care is needed; Congress, CMS, the state legislature, or the state Medicaid agency may reduce, increase, delay, restructure, or otherwise adjust the program through legislation, regulation, budget action, or other government action. Only the relevant agency, a court, or a qualified attorney or VSO can apply those rules to a household. Do not spend down, gift, or file a claim solely on this model.",
  },
  {
    heading: "Sources, dates, and no duty to update",
    body: "Care costs are rounded annual medians from published Cost of Care surveys (CareScout https://www.carescout.com/cost-of-care and Genworth https://www.genworth.com/aging-and-you/finances/cost-of-care , 2025 survey published 2026, where used). SSI, Medicaid spousal, SIL, and related federal figures follow SSA (https://www.ssa.gov/oact/cola/SSI.html) and CMCS (https://www.medicaid.gov/federal-policy-guidance/downloads/cib12092025.pdf) publications for the stated year. VA pension MAPR, net worth, and disability compensation follow va.gov (https://www.va.gov/pension/veterans-pension-rates/ and https://www.va.gov/disability/compensation-rates/veteran-rates/) for the stated rate period (generally December 1–November 30). Full clickable list is on the Copyright & terms Sources section. The Publishers have no duty to notify you of later changes after you leave the page. Re-check official sources before any decision.",
  },
  {
    heading: "Your inputs control the result",
    body: "Results follow the numbers and checkboxes you enter (assets, exclusions, ROI, tax rate, care setting, delay, duration, CPI, policy design, Partnership, veteran status, and optional sections). Garbage in, garbage out. The Publishers do not verify your facts, health, insurable interest, or marital status.",
  },
  {
    heading: "Licensed professionals who use this with clients",
    body: "If you are an insurance agent, investment adviser, CFP® professional, attorney, CPA, or other licensee, this tool does not replace your license, your E&O, your client agreement, or your required disclosures. You — not the Publishers — are responsible for advice you give, products you recommend, and how you describe this hypothetical. The Publishers do not supervise you. Do not remove copyright, disclaimer, or hold-harmless text from a report. A CFP® professional’s fiduciary duty under CFP Board Standard A.1 cannot be waived, disclaimed, or assigned away when they provide Financial Advice; running this model is not Financial Advice and does not satisfy that duty.",
  },
  {
    heading: "Limitation of liability",
    body: "To the maximum extent permitted by law, Adaptive Marketing Group and its owners, officers, employees, contractors, and licensors are not liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost data, lost eligibility, increased premiums, denied claims, or spend-down decisions, arising out of or related to the use of this model or any report, even if advised of the possibility. Direct damages, if any are allowed, are limited to the amount you paid the Publishers to use this website (often zero). Some jurisdictions do not allow certain limitations; those that cannot be limited by law remain.",
  },
  {
    heading: "Indemnification",
    body: "You agree to indemnify and hold harmless Adaptive Marketing Group and its owners, officers, employees, contractors, and licensors from claims, losses, costs, and reasonable attorneys’ fees arising from your use of the model, your sharing of a report, your removal or alteration of disclaimers, or your presentation of outputs as advice, a quote, an illustration, or an eligibility determination.",
  },
  {
    heading: "Governing law",
    body: "These terms are governed by the laws of the State of Florida, without regard to conflict-of-law rules, except that insurance, Medicaid, securities, and professional-conduct rules of the state where a professional is licensed or where care would be received may also apply to that professional. Venue for disputes with the Publishers, to the extent permitted, is in the state courts of Brevard County, Florida, or the federal courts of the Middle District of Florida.",
  },
  {
    heading: "Severability and changes",
    body: "If a court finds any part of these terms unenforceable, the rest remains in effect. The Publishers may update this page; the version dated on the page applies to use after that date. Continued use is acceptance of the updated terms.",
  },
  {
    heading: "Acknowledgment",
    body: "You acknowledge that you have had an opportunity to read these terms and the hold-harmless disclosures, that you understand this is an educational hypothetical only and is not legal advice, and that you will contact the appropriate licensed professional for your (or your client’s) situation before acting: a CERTIFIED FINANCIAL PLANNER™ professional (CFP®) and, as fits the issue, ChFC®, CLU®, or RICP® for financial planning; a licensed long-term care insurance producer (CLTC or LTCP recommended) for insurance; a CPA, enrolled agent, or tax attorney for tax; a qualified Medicaid or elder-care planning attorney licensed in the relevant state (CELA or equivalent where appropriate) for legal, Medicaid, and eldercare planning; and an accredited veterans service officer (VSO) for VA pension or disability.",
  },
];