"use client";

import { useState } from "react";
import { Cite } from "@/components/source-links";
import { NaicSuitabilityForm } from "@/components/naic-suitability-form";
import { SRC } from "@/lib/sources";

const PAGES = [48, 49, 50, 51] as const;

export function NaicWorksheetPages({ compact = false, embedForm = true }: { compact?: boolean; embedForm?: boolean }) {
  const [page, setPage] = useState<(typeof PAGES)[number]>(48);

  return (
    <div className="min-w-0">
      <p className="font-display text-base text-navy">NAIC Shopper’s Guide pages 48–51 (HTML)</p>
      <p className="mt-1 text-xs text-muted">
        Educational HTML copy of the printed Shopper’s Guide pages. Pages 48–49 are the fillable Personal Worksheet. Pages 50–51 are “Things You Should Know Before You Buy Long-Term Care Insurance.” Not a carrier filing.{" "}
        <Cite href={`${SRC.naicShopper}#page=48`}>Official Shopper’s Guide PDF</Cite>
        {" · "}
        <Cite href={SRC.naicSuitability}>IIPRC source PDF</Cite>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {PAGES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            className={
              page === n
                ? "min-h-11 rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-cream"
                : "min-h-11 rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-paper"
            }
          >
            Page {n}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-line bg-paper px-4 py-4 text-sm leading-relaxed text-navy">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-ink">Shopper’s Guide · page {page} of 51</p>
        {page === 48 ? <Page48 /> : null}
        {page === 49 ? <Page49 embedForm={embedForm && !compact} /> : null}
        {page === 50 ? <Page50 /> : null}
        {page === 51 ? <Page51 /> : null}
      </div>
    </div>
  );
}

function Page48() {
  return (
    <div className="mt-2 space-y-3">
      <h3 className="font-display text-xl">Long-Term Care Insurance Personal Worksheet</h3>
      <p>
        This worksheet will help you understand some important information about this type of insurance. State law requires companies issuing this policy, certificate, or rider to give you important facts about premiums and premium increases and to ask you important questions to help you and the company decide if you should buy it. Long-term care insurance can be expensive and it may not be right for everyone.
      </p>
      <p className="font-semibold">Premium information</p>
      <p>
        The premium quoted in this worksheet isn’t guaranteed and may change during underwriting and in the future while coverage is in force.
      </p>
      <p className="font-semibold">Type of policy and the company’s right to increase premiums</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Noncancellable — the company can’t increase your premiums on this coverage.</li>
        <li>Guaranteed renewable — the company can increase premiums in the future if it increases premiums for all like coverage in this state.</li>
        <li>Paid-up — coverage is paid-up after you have paid the premiums specified in the contract.</li>
      </ul>
      <p className="font-semibold">Premium increase history</p>
      <p>
        The company discloses whether it has sold long-term care insurance, how long this form has been sold, and whether premiums on this or similar coverage increased in the last ten years. A summary of increases, if any, belongs with this worksheet.
      </p>
      <p className="text-xs text-muted">Continue on page 49 for income, assets, and signatures. Use the fillable HTML form to answer.</p>
    </div>
  );
}

function Page49({ embedForm }: { embedForm: boolean }) {
  return (
    <div className="mt-2 space-y-3">
      <h3 className="font-display text-xl">Personal Worksheet (continued) — questions about income and assets</h3>
      <p>
        You do not have to answer the questions that follow. They’re intended to make sure you’ve thought about how you’ll pay premiums and the cost of care your insurance doesn’t cover. If you don’t want to answer these questions, understand that a company might refuse to insure you.
      </p>
      <p>
        If you’ll be paying premiums only from your own income, a rule of thumb is that you may not be able to afford this coverage if the premiums will be more than seven percent (7%) of your income.
      </p>
      <p>
        Inflation may increase the cost of long-term care in the future. If you don’t buy inflation protection, consider how you will pay the difference between future costs and your daily or monthly benefit.
      </p>
      <p>
        If you’re buying this coverage to protect your assets and your assets are less than $50,000, experts suggest you think about other ways to pay for long-term care.
      </p>
      <p>
        Certification: either the answers describe your financial situation, or you choose not to complete this information. You must confirm that the company and/or its agent reviewed this worksheet with you, including the premium, premium-increase history, and the potential for future increases.
      </p>
      {embedForm ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="mb-2 font-semibold">Fillable HTML worksheet (answers save on this device)</p>
          <NaicSuitabilityForm />
        </div>
      ) : (
        <p className="text-xs text-muted">Open “Complete the fillable suitability worksheet” or Page 49 in this card to enter answers.</p>
      )}
    </div>
  );
}

function Page50() {
  return (
    <div className="mt-2 space-y-3">
      <h3 className="font-display text-xl">Things You Should Know Before You Buy Long-Term Care Insurance</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>A long-term care insurance policy may pay most of the costs for your care in a nursing home. Many policies also pay for care at home or in other community settings. Coverage varies. Find out which policies are available in your state and how they work with Medicare, Medicaid, and other insurance you have.</li>
        <li>You should not buy this insurance unless you can afford to pay the premiums every year. Remember that the company can increase premiums in the future.</li>
        <li>The personal worksheet is to help you and your agent discuss how the policy will work and how it will fit with your other insurance and your financial objectives.</li>
        <li>
          Federal income tax: some policies are tax-qualified under IRC §7702B. If you itemize deductions, you may be able to deduct some or all of the premiums as a medical expense, and benefits generally are not taxed as income. Confirm with a tax professional. See{" "}
          <Cite href={SRC.irs502}>IRS Publication 502</Cite>.
        </li>
        <li>Medicare does not pay for most long-term care.</li>
        <li>Medicaid may pay for long-term care if you have very limited countable assets and income. Rules vary by state. This worksheet is not a Medicaid determination.</li>
      </ul>
    </div>
  );
}

function Page51() {
  return (
    <div className="mt-2 space-y-3">
      <h3 className="font-display text-xl">Things You Should Know (continued) and shopping tips</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>Check the financial strength of the insurance company with independent rating services.</li>
        <li>Read the outline of coverage and this Shopper’s Guide before you buy.</li>
        <li>Compare this policy with other policies — benefits, elimination period, inflation options, exclusions, and premium.</li>
        <li>Make sure you have a free-look period (often 30 days) to return the policy for a full premium refund.</li>
        <li>Ask about the company’s history of rate increases on this and similar forms.</li>
        <li>Confirm the agent is licensed to sell long-term care insurance in your state. Use{" "}
          <Cite href={SRC.naicLookup}>NAIC State Based Systems — Licensee Lookup</Cite>
          {" "}and your{" "}
          <Cite href={SRC.naicStates}>state insurance department</Cite>.
        </li>
        <li>Know the benefit triggers (typically 2 of 6 ADLs or severe cognitive impairment), the elimination period, and what care settings are covered.</li>
        <li>Know how to file a claim and how to file a complaint with the company and your state insurance department.</li>
      </ul>
      <p className="text-xs text-muted">
        In the printed 2022 Shopper’s Guide, a list of state insurance departments, agencies on aging, and SHIP programs begins on this page. Use the NAIC state insurance department directory linked above for current contacts. Educational copy — NAIC has not endorsed this hypothetical as an official planning tool.
      </p>
    </div>
  );
}
