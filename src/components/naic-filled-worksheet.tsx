"use client";

import { loadSuitabilityDraft, suitabilityPairs, type SuitabilityForm } from "@/lib/naic-suitability";
import { COPYRIGHT_LINE, HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";

export function FilledNaicWorksheet({ form }: { form?: SuitabilityForm }) {
  const data = form ?? (typeof window === "undefined" ? null : loadSuitabilityDraft());
  const rows = data ? suitabilityPairs(data).filter(([, v]) => v) : [];
  if (!rows.length) {
    return (
      <p className="text-sm text-muted">
        No answers yet. Complete the HTML fillable Personal Worksheet, then include it in the PDF.
      </p>
    );
  }
  return (
    <table className="mt-2 w-full min-w-0 border-collapse text-sm">
      <tbody>
        {rows.map(([q, a]) => (
          <tr key={q} className="border-b border-line/70 align-top">
            <th className="w-[42%] py-1.5 pr-3 text-left font-semibold text-navy">{q}</th>
            <td className="py-1.5 text-ink">{a}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function printFilledWorksheetPdf(form: SuitabilityForm) {
  const rows = suitabilityPairs(form);
  const body = rows
    .map(([q, a]) => {
      const question = escapeHtml(q);
      const answer = escapeHtml(a || "—");
      return `<tr><th style="text-align:left;padding:6px 10px 6px 0;width:42%;vertical-align:top;color:#1b3a4b">${question}</th><td style="padding:6px 0;vertical-align:top">${answer}</td></tr>`;
    })
    .join("");
  const html = [
    "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>NAIC LTC Personal Worksheet</title>",
    "<style>body{font-family:Georgia,serif;color:#1a1a1a;padding:24px;max-width:800px;margin:0 auto}h1{font-size:20px;color:#1b3a4b}h2{font-size:16px;color:#1b3a4b;margin-top:28px}p{font-size:12px;color:#333}table{width:100%;border-collapse:collapse;font-size:13px}tr{border-bottom:1px solid #d8c9a6;break-inside:avoid}.xclose{position:fixed;top:12px;right:12px;min-height:44px;min-width:44px;font-weight:700;border:1px solid #1b3a4b;background:#fff;border-radius:8px;cursor:pointer}@page{size:letter;margin:0.65in 0.55in 0.8in}@media print{.xclose{display:none}@page{@bottom-right{content:\"Page \" counter(page) \" of \" counter(pages);font-size:9pt;color:#1b3a4b}}}</style></head><body>",
    "<button class=\"xclose\" type=\"button\" onclick=\"window.close()\">(X) Close</button>",
    "<h1>NAIC Long-Term Care Insurance Personal Worksheet</h1>",
    "<p>Educational HTML copy of NAIC Model Regulation #641, Appendix B. Not a carrier application or a quote. The National Association of Insurance Commissioners has not endorsed this hypothetical as an official planning tool.</p>",
    `<table>${body}</table>`,
    "<h2>Disclosure and Terms of Use</h2>",
    `<p>${escapeHtml(HOLD_HARMLESS_SHORT)}</p>`,
    `<p>${escapeHtml(COPYRIGHT_LINE)} Educational hypothetical only. Not a quote, illustration, or advice.</p>`,
    "</body></html>",
  ].join("");
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 250);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}
