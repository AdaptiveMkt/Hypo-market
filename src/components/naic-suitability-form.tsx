"use client";

import { useEffect, useState, type FormEvent } from "react";
import { STATE_NAMES } from "@/lib/costs";
import {
  ASSET_BANDS,
  INCOME_BANDS,
  NAIC_SHOPPER_PDF,
  NAIC_SUITABILITY_PDF,
  PAY_SOURCES,
  loadSuitabilityDraft,
  saveSuitabilityDraft,
  type SuitabilityForm,
} from "@/lib/naic-suitability";
import { printFilledWorksheetPdf } from "@/components/naic-filled-worksheet";
import { submitSuitability } from "@/lib/send-suitability";

const field =
  "mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink";
const label = "mt-3 block text-sm font-semibold text-navy";

function toggle(list: string[], value: string, on: boolean) {
  if (on) return list.includes(value) ? list : [...list, value];
  return list.filter((x) => x !== value);
}

export function NaicSuitabilityForm({ onClose }: { onClose?: () => void } = {}) {
  const [form, setForm] = useState<SuitabilityForm>(() => loadSuitabilityDraft());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);

  function close() {
    if (onClose) onClose();
    else setHidden(true);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch(partial: Partial<SuitabilityForm>) {
    setForm((f) => {
      const next = { ...f, ...partial };
      saveSuitabilityDraft(next);
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const res = await submitSuitability({ data: form });
      setStatus(
        res.emailed
          ? "Worksheet submitted. A copy was emailed to you and to Funding LTC Marketplace."
          : "Worksheet recorded. Email could not be sent from this environment — download or print a copy for your file.",
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not submit the worksheet.");
    } finally {
      setBusy(false);
    }
  }

  function downloadPdf() {
    saveSuitabilityDraft(form);
    printFilledWorksheetPdf(form);
  }

  if (hidden) {
    return (
      <button
        type="button"
        onClick={() => setHidden(false)}
        className="min-h-11 rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-cream"
      >
        Reopen worksheet
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5 text-sm text-muted">
      <div className="flex items-start justify-end">
        <button
          type="button"
          onClick={close}
          aria-label="Close worksheet"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-navy bg-paper px-3 text-base font-bold text-navy hover:bg-cream"
        >
          (X)
        </button>
      </div>
      <p>
        Educational copy of the{" "}
        <strong className="text-navy">Long-Term Care Insurance Personal Worksheet</strong>{" "}
        (NAIC Model Regulation #641, Appendix B / IIPRC LTC application-form standards).
        Not a carrier application, not a quote, and not a determination of suitability.{" "}
        <a href={NAIC_SUITABILITY_PDF} target="_blank" rel="noopener noreferrer" className="source-link" data-source-href={NAIC_SUITABILITY_PDF}>
          Official PDF
        </a>
        {" · "}
        <a href={NAIC_SHOPPER_PDF} target="_blank" rel="noopener noreferrer" className="source-link" data-source-href={NAIC_SHOPPER_PDF}>
          NAIC Shopper’s Guide pages 48–51 (PDF)
        </a>
        . Type is 12-point equivalent. A rule of thumb: if premiums come only from your
        own income, more than 7% of income may be hard to sustain.
      </p>

      <fieldset className="card px-4 py-3">
        <legend className="font-display text-base text-navy">Applicant</legend>
        <label className={label} htmlFor="sw-name">Name</label>
        <input id="sw-name" className={field} required value={form.applicantName} onChange={(e) => patch({ applicantName: e.target.value })} />
        <label className={label} htmlFor="sw-state">State</label>
        <select id="sw-state" className={field} value={form.applicantState} onChange={(e) => patch({ applicantState: e.target.value })}>
          <option value="">Select</option>
          {STATE_NAMES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-phone">Phone</label>
            <input id="sw-phone" className={field} value={form.applicantPhone} onChange={(e) => patch({ applicantPhone: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-email">Email</label>
            <input id="sw-email" className={field} type="email" required value={form.applicantEmail} onChange={(e) => patch({ applicantEmail: e.target.value })} />
          </div>
        </div>
        <label className={label} htmlFor="sw-role">Completed as</label>
        <select id="sw-role" className={field} value={form.role} onChange={(e) => patch({ role: e.target.value as SuitabilityForm["role"] })}>
          <option>Applicant</option>
          <option>Licensed producer</option>
        </select>
      </fieldset>

      <fieldset className="card px-4 py-3">
        <legend className="font-display text-base text-navy">Premium information</legend>
        <p className="mt-1 text-xs">The premium quoted in this worksheet isn’t guaranteed and may change during underwriting and while the coverage is in force.</p>
        <label className={label} htmlFor="sw-co">Company</label>
        <input id="sw-co" className={field} value={form.companyName} onChange={(e) => patch({ companyName: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-prem">Premium amount</label>
            <input id="sw-prem" className={field} value={form.premiumAmount} onChange={(e) => patch({ premiumAmount: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-mode">Mode</label>
            <select id="sw-mode" className={field} value={form.premiumMode} onChange={(e) => patch({ premiumMode: e.target.value as SuitabilityForm["premiumMode"] })}>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="single">One-time single premium</option>
            </select>
          </div>
        </div>
        <label className={label} htmlFor="sw-type">Type of policy & the company’s right to increase premiums</label>
        <select id="sw-type" className={field} value={form.policyType} onChange={(e) => patch({ policyType: e.target.value as SuitabilityForm["policyType"] })}>
          <option value="">Select</option>
          <option value="noncancellable">Noncancellable — the company can’t increase premiums on this coverage</option>
          <option value="guaranteed">Guaranteed renewable — the company can increase premiums for all like coverage in this state</option>
          <option value="paid-up">Paid-up — coverage is paid-up after the specified premiums</option>
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-since">Company has sold LTC insurance since (year)</label>
            <input id="sw-since" className={field} value={form.soldLtcSince} onChange={(e) => patch({ soldLtcSince: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-this">This form sold since (year)</label>
            <input id="sw-this" className={field} value={form.soldThisSince} onChange={(e) => patch({ soldThisSince: e.target.value })} />
          </div>
        </div>
        <label className={label} htmlFor="sw-hist">Premium increase history</label>
        <select id="sw-hist" className={field} value={form.increaseHistory} onChange={(e) => patch({ increaseHistory: e.target.value as SuitabilityForm["increaseHistory"] })}>
          <option value="">Select</option>
          <option value="never">Never increased premiums for any LTC coverage sold</option>
          <option value="not-10">No increase on this or similar coverage in the last 10 years</option>
          <option value="increased">Increased this or similar coverage in the last 10 years</option>
        </select>
        {form.increaseHistory === "increased" ? (
          <>
            <label className={label} htmlFor="sw-incsum">Summary of those premium increases</label>
            <textarea id="sw-incsum" className={field} rows={3} value={form.increaseSummary} onChange={(e) => patch({ increaseSummary: e.target.value })} />
          </>
        ) : null}
      </fieldset>

      <fieldset className="card px-4 py-3">
        <legend className="font-display text-base text-navy">Questions about your income</legend>
        <p className="mt-2 font-semibold text-navy">What resources will you use to pay your premium?</p>
        {PAY_SOURCES.map((s) => (
          <label key={s} className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-teal"
              checked={form.paySources.includes(s)}
              onChange={(e) => patch({ paySources: toggle(form.paySources, s, e.target.checked) })}
            />
            {s}
          </label>
        ))}
        {form.paySources.includes("Other") ? (
          <input className={field} placeholder="Other source" value={form.payOther} onChange={(e) => patch({ payOther: e.target.value })} />
        ) : null}
        <label className={label} htmlFor="sw-spouse">Could you afford to keep this coverage if your spouse or partner dies first?</label>
        <select id="sw-spouse" className={field} value={form.affordIfSpouseDies} onChange={(e) => patch({ affordIfSpouseDies: e.target.value })}>
          <option value="">Select</option>
          {["Yes", "No", "Hadn’t thought about it", "Don’t know", "Doesn’t apply"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <label className={label} htmlFor="sw-50">What would you do if the premiums went up, for example, by 50%?</label>
        <select id="sw-50" className={field} value={form.ifPremiumsUp50} onChange={(e) => patch({ ifPremiumsUp50: e.target.value })}>
          <option value="">Select</option>
          {["Pay the higher premium", "Call the company/agent", "Reduce benefits", "Drop the coverage", "Don’t know"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <label className={label} htmlFor="sw-inc">What is your household annual income from all sources?</label>
        <select id="sw-inc" className={field} value={form.householdIncome} onChange={(e) => patch({ householdIncome: e.target.value })}>
          <option value="">Select</option>
          {INCOME_BANDS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <label className={label} htmlFor="sw-incch">Do you expect your income to change over the next ten years?</label>
        <select id="sw-incch" className={field} value={form.incomeChange} onChange={(e) => patch({ incomeChange: e.target.value })}>
          <option value="">Select</option>
          <option>No</option>
          <option>Yes, expect increase</option>
          <option>Yes, expect decrease</option>
        </select>
        <label className={label} htmlFor="sw-incplan">If you plan to pay premiums from your income, have you thought about how a change in your income would affect your ability to continue to pay the premium?</label>
        <select id="sw-incplan" className={field} value={form.thoughtIncomeChange} onChange={(e) => patch({ thoughtIncomeChange: e.target.value })}>
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
          <option>Don’t know</option>
        </select>
        <label className={label} htmlFor="sw-inf">Will you buy inflation protection?</label>
        <select id="sw-inf" className={field} value={form.inflationProtection} onChange={(e) => patch({ inflationProtection: e.target.value })}>
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <p className="mt-1 text-xs">Inflation may increase the cost of long-term care in the future.</p>
        {form.inflationProtection === "No" ? (
          <>
            <p className="mt-3 font-semibold text-navy">If you don’t buy inflation protection, how will you pay for the difference between future costs and your daily benefit amount?</p>
            {["From my income", "From savings", "From investments", "Other"].map((s) => (
              <label key={s} className="mt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 accent-teal"
                  checked={form.noInflationPlan.includes(s)}
                  onChange={(e) => patch({ noInflationPlan: toggle(form.noInflationPlan, s, e.target.checked) })}
                />
                {s}
              </label>
            ))}
          </>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-elim">Elimination / waiting period (days)</label>
            <input id="sw-elim" className={field} value={form.elimDays} onChange={(e) => patch({ elimDays: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-elimc">Approximate cost of care for that period</label>
            <input id="sw-elimc" className={field} value={form.elimCost} onChange={(e) => patch({ elimCost: e.target.value })} />
          </div>
        </div>
        <p className="mt-3 font-semibold text-navy">How do you plan to pay for your care during the elimination / waiting / deductible period?</p>
        {["From my income", "From my savings/investments", "Sell other assets", "Money from my family", "My family will pay"].map((s) => (
          <label key={s} className="mt-1 flex items-center gap-2">
            <input
              type="checkbox"
              className="size-4 accent-teal"
              checked={form.payElim.includes(s)}
              onChange={(e) => patch({ payElim: toggle(form.payElim, s, e.target.checked) })}
            />
            {s}
          </label>
        ))}
      </fieldset>

      <fieldset className="card px-4 py-3">
        <legend className="font-display text-base text-navy">Questions about your savings and investments</legend>
        <label className={label} htmlFor="sw-assets">Not counting your home, about how much are all of your assets (your savings and investments) worth?</label>
        <select id="sw-assets" className={field} value={form.assetsExHome} onChange={(e) => patch({ assetsExHome: e.target.value })}>
          <option value="">Select</option>
          {ASSET_BANDS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <p className="mt-1 text-xs">If you’re buying this coverage to protect your assets and your assets are less than $50,000, experts suggest you think about other ways to pay for your long-term care.</p>
        <label className={label} htmlFor="sw-assch">Do you expect the value of your assets to change over the next ten years?</label>
        <select id="sw-assch" className={field} value={form.assetsChange} onChange={(e) => patch({ assetsChange: e.target.value })}>
          <option value="">Select</option>
          <option>No</option>
          <option>Yes, expect to increase</option>
          <option>Yes, expect to decrease</option>
        </select>
      </fieldset>

      <fieldset className="card px-4 py-3">
        <legend className="font-display text-base text-navy">Certification</legend>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="radio"
            className="mt-1 size-4 accent-teal"
            name="sw-fin"
            checked={form.completeOrDecline === "complete"}
            onChange={() => patch({ completeOrDecline: "complete" })}
          />
          The answers to the questions above describe my financial situation.
        </label>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="radio"
            className="mt-1 size-4 accent-teal"
            name="sw-fin"
            checked={form.completeOrDecline === "decline"}
            onChange={() => patch({ completeOrDecline: "decline" })}
          />
          I choose not to complete this information.
        </label>
        <label className="mt-3 flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-teal"
            required
            checked={form.reviewedWithAgent}
            onChange={(e) => patch({ reviewedWithAgent: e.target.checked })}
          />
          I agree that the company and/or its agent has reviewed this worksheet with me including the premium, premium increase history and potential for premium increases in the future. I understand the information contained in this worksheet. (This box must be checked.)
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-appsig">Applicant signature (type full name)</label>
            <input id="sw-appsig" className={field} required value={form.applicantSign} onChange={(e) => patch({ applicantSign: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-date">Date</label>
            <input id="sw-date" className={field} type="date" value={form.signedDate} onChange={(e) => patch({ signedDate: e.target.value })} />
          </div>
        </div>
        <label className={label} htmlFor="sw-prod">Producer / agent (optional)</label>
        <input id="sw-prod" className={field} value={form.producerName} onChange={(e) => patch({ producerName: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="sw-firm">Firm</label>
            <input id="sw-firm" className={field} value={form.producerFirm} onChange={(e) => patch({ producerFirm: e.target.value })} />
          </div>
          <div>
            <label className={label} htmlFor="sw-lic">License #</label>
            <input id="sw-lic" className={field} value={form.producerLicense} onChange={(e) => patch({ producerLicense: e.target.value })} />
          </div>
        </div>
        <label className={label} htmlFor="sw-prodsig">Producer signature (type name)</label>
        <input id="sw-prodsig" className={field} value={form.producerSign} onChange={(e) => patch({ producerSign: e.target.value })} />
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-lg border border-navy bg-navy px-4 py-2 font-semibold text-cream hover:bg-teal disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit worksheet"}
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          className="min-h-11 rounded-lg border border-navy px-4 py-2 font-semibold text-navy hover:bg-cream"
        >
          Download filled PDF
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 rounded-lg border border-navy px-4 py-2 font-semibold text-navy hover:bg-cream"
        >
          Print
        </button>
        <button
          type="button"
          onClick={close}
          className="min-h-11 rounded-lg border border-navy px-4 py-2 font-semibold text-navy hover:bg-cream"
        >
          Close
        </button>
      </div>
      {status ? <p className="text-sm text-navy">{status}</p> : null}
      <p className="text-xs">
        Submission emails Funding LTC Marketplace and the address you entered. This is not
        an insurance application. A licensed producer and the issuing company apply their
        own filed suitability standards.
      </p>
    </form>
  );
}