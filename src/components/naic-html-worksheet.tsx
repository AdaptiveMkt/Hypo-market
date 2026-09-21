"use client";

import { useEffect } from "react";
import { Cite } from "@/components/source-links";
import { NaicSuitabilityForm } from "@/components/naic-suitability-form";
import { SRC } from "@/lib/sources";

export function HtmlWorksheetDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-navy/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="naic-html-title"
    >
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden card-xl shadow-[0_16px_48px_rgba(27,58,75,0.35)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-navy bg-paper px-3 text-base font-bold text-navy hover:bg-cream"
        >
          (X)
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 pr-16 pl-4">
          <p id="naic-html-title" className="font-display text-lg text-navy">
            Long-Term Care Insurance Personal Worksheet (HTML)
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={SRC.naicSuitability}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-cream"
            >
              Official source PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy hover:bg-cream"
            >
              Close
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="text-sm text-muted">
            HTML educational copy of the IIPRC / NAIC Personal Worksheet (
            <Cite href={SRC.naicSuitability}>standards_ltc_i_3_appforms.pdf</Cite>
            , Appendix A). Fill it here. Use <strong className="text-navy">Download filled PDF</strong> at the bottom to print or save. This is not a carrier application.
          </p>
          <p className="mt-3 text-sm text-navy">
            This worksheet will help you understand some important information about this type of insurance. State law requires companies issuing this policy, certificate, or rider to give you important facts about premiums and premium increases and to ask you important questions to help you and the company decide if you should buy it. Long-term care insurance can be expensive and it may not be right for everyone.
          </p>
          <p className="mt-2 text-sm font-semibold text-navy">
            The premium quoted in this worksheet isn’t guaranteed and may change during underwriting and in the future while coverage is in force.
          </p>
          <p className="mt-2 text-xs text-muted">
            You do not have to answer the income and asset questions. They’re intended to make sure you’ve thought about how you’ll pay premiums and the cost of care your insurance doesn’t cover. If you don’t want to answer these questions, understand that a company might refuse to insure you.
          </p>
          <div className="mt-4">
            <NaicSuitabilityForm />
          </div>
        </div>
      </div>
    </div>
  );
}
