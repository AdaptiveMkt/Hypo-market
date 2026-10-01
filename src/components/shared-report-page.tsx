import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { setTheme } from "@/components/theme-toggle";
import { readShare, shareDisclaimer, type ShareView } from "@/lib/share-report";

type PrintRow = { id: string; label: string };

function reportSections(): PrintRow[] {
  const root = document.getElementById("aum-report");
  if (!root) return [];
  return Array.from(root.children).flatMap((node, i) => {
    if (!(node instanceof HTMLElement)) return [];
    if (node.classList.contains("no-print")) return [];
    const heading = node.querySelector("h1, h2, h3");
    const label = (heading?.textContent || "").replace(/\s+/g, " ").trim();
    if (!label) return [];
    return [{ id: String(i), label: label.slice(0, 160) }];
  });
}

export function SharedReportPage({ slug, code }: { slug: string; code: string }) {
  const [view, setView] = useState<ShareView | null>(null);
  const [error, setError] = useState("");
  const [picker, setPicker] = useState(false);
  const [rows, setRows] = useState<PrintRow[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTheme(false);
    let cancel = false;
    readShare({ data: { slug, code } })
      .then((next) => {
        if (!cancel) setView(next);
      })
      .catch(() => {
        if (!cancel) setError("This report link could not be opened.");
      });
    return () => {
      cancel = true;
    };
  }, [slug, code]);

  const hours = view && view.status !== "missing" ? view.hours : 72;
  const selectedCount = rows.filter((row) => picked[row.id]).length;

  function openPrintPicker() {
    const next = reportSections();
    setRows(next);
    setPicked(Object.fromEntries(next.map((row) => [row.id, true])));
    setPicker(true);
  }

  function printSelected() {
    const root = document.getElementById("aum-report");
    if (!root) return;
    const kids = Array.from(root.children);
    const opened: HTMLDetailsElement[] = [];
    kids.forEach((node, i) => {
      if (!(node instanceof HTMLElement)) return;
      const keep = picked[String(i)] !== false && Boolean(rows.find((row) => row.id === String(i)));
      const listed = rows.some((row) => row.id === String(i));
      if (listed && !keep) node.classList.add("print-omit");
      else node.classList.remove("print-omit");
      if (keep) {
        const folds = [
          ...(node instanceof HTMLDetailsElement ? [node] : []),
          ...Array.from(node.querySelectorAll("details")),
        ];
        folds.forEach((d) => {
          if (!d.open) opened.push(d);
          d.open = true;
        });
      }
    });
    setPicker(false);
    const clear = () => {
      kids.forEach((node) => node.classList.remove("print-omit"));
      opened.forEach((d) => {
        d.open = false;
      });
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.setTimeout(() => window.print(), 60);
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      {view?.status === "ready" ? (
        <article
          id="aum-report"
          className="mx-auto max-w-5xl space-y-8 bg-paper px-4 py-8 text-ink outline-none sm:px-8"
          dangerouslySetInnerHTML={{ __html: view.html }}
        />
      ) : (
        <section className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl text-navy">
            {view?.status === "expired" ? "This report link has expired" : "Report link"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {error ||
              (view?.status === "expired"
                ? `It was available for ${hours} hours after it was first opened. Print to PDF is the way to keep a copy.`
                : view?.status === "missing"
                  ? "This link is not valid, or the report is no longer available."
                  : "Opening the report…")}
          </p>
          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-navy underline">
            Return to the hypothetical
          </Link>
        </section>
      )}
      <section className="share-link-note mx-auto max-w-5xl px-4 py-6 text-sm leading-relaxed text-navy sm:px-8">
        <p className="font-semibold">Report link</p>
        <p className="mt-2">{shareDisclaimer(hours)}</p>
        {view?.status === "ready" && view.expiresAt ? (
          <p className="mt-2 text-xs text-muted">
            First opened {new Date(view.firstViewedAt).toLocaleString("en-US")}. Expires{" "}
            {new Date(view.expiresAt).toLocaleString("en-US")}.
          </p>
        ) : null}
        {view?.status === "ready" ? (
          <button
            type="button"
            className="no-print btn-block mt-4 max-w-xs rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream"
            onClick={openPrintPicker}
          >
            Print to PDF
          </button>
        ) : null}
      </section>
      {picker ? (
        <div
          className="no-print fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-print-title"
        >
          <div className="card-xl w-full max-w-3xl bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
            <h2 id="share-print-title" className="font-display text-xl text-navy">
              Select sections for the PDF
            </h2>
            <p className="mt-2 text-sm text-muted">
              Every section in this report is listed. Uncheck any you do not want in the PDF, then print.
              {rows.length ? ` ${selectedCount} of ${rows.length} selected.` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-11 rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
                onClick={() => setPicked(Object.fromEntries(rows.map((row) => [row.id, true])))}
              >
                Select all
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg border border-white bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-900"
                onClick={() => setPicked(Object.fromEntries(rows.map((row) => [row.id, false])))}
              >
                Deselect all
              </button>
            </div>
            <div className="mt-4 grid max-h-[50vh] gap-2 overflow-y-auto pr-1">
              {rows.map((row) => (
                <label key={row.id} className="flex min-h-11 cursor-pointer items-start gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-teal"
                    checked={Boolean(picked[row.id])}
                    onChange={(e) => setPicked((prev) => ({ ...prev, [row.id]: e.target.checked }))}
                  />
                  <span>{row.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="min-h-11 rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
                onClick={() => setPicked(Object.fromEntries(rows.map((row) => [row.id, true])))}
              >
                Select all
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg border border-white bg-black px-4 text-sm font-semibold text-white hover:bg-neutral-900"
                onClick={() => setPicked(Object.fromEntries(rows.map((row) => [row.id, false])))}
              >
                Deselect all
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg border border-white bg-black px-4 text-sm font-semibold text-white"
                onClick={() => setPicker(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="min-h-11 rounded-lg bg-navy px-4 text-sm font-semibold text-cream disabled:opacity-50"
                disabled={selectedCount === 0}
                onClick={printSelected}
              >
                Print to PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}