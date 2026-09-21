"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SRC } from "@/lib/sources";
import { Cite } from "@/components/source-links";
import { TitleCollapse } from "@/components/accordion";
import { NaicWorksheetPages } from "@/components/naic-worksheet-pages";
import { NaicSuitabilityForm } from "@/components/naic-suitability-form";
import { HtmlWorksheetDialog } from "@/components/naic-html-worksheet";

function PdfReader({
  title,
  href,
  downloadName,
  onClose,
}: {
  title: string;
  href: string;
  downloadName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-navy/70 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="naic-pdf-title"
    >
      <div className="relative flex w-full max-w-5xl flex-col overflow-hidden card-xl shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-navy bg-paper px-3 text-base font-bold text-navy hover:bg-cream"
        >
          (X)
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-3 pr-16 pl-4">
          <p id="naic-pdf-title" className="font-display text-lg text-navy">
            {title}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy hover:bg-cream"
            >
              Open in new tab
            </a>
            <a
              href={href}
              download={downloadName}
              className="inline-flex min-h-11 items-center rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-masthead hover:brightness-105"
            >
              Download PDF
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
        <iframe title={title} src={`${href}#toolbar=1&navpanes=0`} className="min-h-[70vh] w-full flex-1 bg-paper" />
      </div>
    </div>
  );
}

function CoverBook({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 w-full flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        className="group w-full max-w-[260px] overflow-hidden rounded-md border border-gold shadow-[0_8px_24px_rgba(27,58,75,0.18)] outline-none focus-visible:ring-2 focus-visible:ring-teal"
        aria-label={label}
      >
        {children}
      </button>
    </div>
  );
}

export function NaicGuideCoverRow() {
  const [open, setOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  return (
    <>
      <div className="grid min-w-0 grid-cols-2 items-start justify-items-center gap-4">
        <CoverBook onClick={() => setOpen(true)} label="Open NAIC Shopper’s Guide cover to read">
          <div className="flex aspect-[8.5/11] w-full flex-col bg-navy px-3 py-4 text-left text-masthead-fg sm:px-4 sm:py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold sm:text-[10px] sm:tracking-[0.2em]">
              National Association of Insurance Commissioners
            </p>
            <div className="mt-4 h-px w-10 bg-gold" />
            <p className="mt-3 font-display text-lg leading-tight text-paper sm:text-xl">
              A Shopper’s Guide
              <br />
              to Long-Term Care
              <br />
              Insurance
            </p>
            <p className="mt-auto pt-6 text-[10px] uppercase tracking-wider text-gold">NAIC · 2022</p>
          </div>
        </CoverBook>
        <CoverBook onClick={() => setWsOpen(true)} label="Open NAIC suitability worksheet cover">
          <div className="flex aspect-[8.5/11] w-full flex-col bg-paper px-3 py-4 text-left text-navy sm:px-4 sm:py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-ink sm:text-[10px]">
              NAIC · Model #641 · Appendix B
            </p>
            <div className="mt-4 h-px w-10 bg-gold" />
            <p className="mt-3 font-display text-lg leading-tight sm:text-xl">
              Long-Term Care
              <br />
              Insurance
              <br />
              Personal Worksheet
            </p>
            <p className="mt-auto pt-6 text-[10px] uppercase tracking-wider text-gold-ink">Suitability worksheet</p>
          </div>
        </CoverBook>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-masthead hover:brightness-105"
        >
          Open to read
        </button>
        <a
          href={SRC.naicShopper}
          target="_blank"
          rel="noopener noreferrer"
          download="NAIC-Shoppers-Guide-Long-Term-Care-Insurance.pdf"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
        >
          Download PDF
        </a>
        <button
          type="button"
          onClick={() => setWsOpen(true)}
          className="min-h-11 rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
        >
          Open worksheet (HTML)
        </button>
      </div>
      {open ? (
        <PdfReader
          title="NAIC Shopper’s Guide to Long-Term Care Insurance"
          href={SRC.naicShopper}
          downloadName="NAIC-Shoppers-Guide-Long-Term-Care-Insurance.pdf"
          onClose={() => setOpen(false)}
        />
      ) : null}
      {wsOpen ? <HtmlWorksheetDialog onClose={() => setWsOpen(false)} /> : null}
    </>
  );
}

export function NaicShopperCover({
  pdfChecked,
  onPdfChange,
  startOpen = true,
  framed = true,
}: {
  pdfChecked?: boolean;
  onPdfChange?: (checked: boolean) => void;
  startOpen?: boolean;
  framed?: boolean;
} = {}) {
  return (
    <div className={framed ? "card px-4 py-3" : "min-w-0"}>
      <TitleCollapse
        title="NAIC Shopper’s Guide to Long-Term Care Insurance"
        defaultOpen={startOpen}
        className="mt-0"
        pdfChecked={pdfChecked}
        onPdfChange={onPdfChange}
      >
        <p className="text-xs text-muted">
          Official <Cite href={SRC.naicLtc}>NAIC</Cite> consumer booklet (2022). Many states require this guide at
          sale.{" "}
          <Cite href={SRC.naicShopper}>Open or download A Shopper’s Guide to Long-Term Care Insurance (PDF)</Cite>.
        </p>
      </TitleCollapse>
    </div>
  );
}

export function NaicSuitabilityCover({
  pdfChecked,
  onPdfChange,
  startOpen = false,
  framed = true,
}: {
  pdfChecked?: boolean;
  onPdfChange?: (checked: boolean) => void;
  startOpen?: boolean;
  framed?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={framed ? "card px-4 py-3" : "min-w-0"}>
        <TitleCollapse
          title="NAIC Long-Term Care Insurance Personal Worksheet"
          defaultOpen={startOpen}
          className="mt-0"
          pdfChecked={pdfChecked}
          onPdfChange={onPdfChange}
        >
          <p className="text-xs text-muted">
            Suitability worksheet (
            <Cite href={SRC.naicSuitability}>Model Regulation #641, Appendix B / IIPRC PDF</Cite>
            ). Pages 48–51 of the{" "}
            <Cite href={`${SRC.naicShopper}#page=48`}>NAIC Shopper’s Guide</Cite> print this worksheet and “Things You Should Know
            Before You Buy Long-Term Care Insurance.”
          </p>
          <div className="mt-3">
            <NaicWorksheetPages compact />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/suitability"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-masthead hover:brightness-105"
            >
              Open to complete
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="min-h-11 rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
            >
              Open to read (HTML)
            </button>
            <a
              href={SRC.naicSuitability}
              target="_blank"
              rel="noopener noreferrer"
              download="NAIC-LTC-Personal-Worksheet.pdf"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-paper"
            >
              Download PDF
            </a>
          </div>
          <TitleCollapse title="Complete the fillable suitability worksheet" className="mt-3" defaultOpen={false} hint="HTML fillable form. Download a filled PDF when you are done.">
            <p className="mb-3 text-xs text-muted">
              Same NAIC Model #641 Appendix B fields as before: income, assets, reasons for buying, and whether a policy appears suitable. Educational copy — not a carrier application.
            </p>
            <NaicSuitabilityForm />
          </TitleCollapse>
        </TitleCollapse>
      </div>
      {open ? <HtmlWorksheetDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}
