import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { setTheme } from "@/components/theme-toggle";
import { readShare, shareDisclaimer, type ShareView } from "@/lib/share-report";
import { CopyrightMark } from "@/components/source-links";
import { DisclosureTermsLink } from "@/components/disclosure-link";

type PrintRow = { id: string; label: string; opened: boolean };

function ownLabel(el: HTMLElement): string {
  const nodes = el.querySelectorAll("h1, h2, h3, summary");
  for (const node of nodes) {
    const owner = node.closest("details");
    if (el instanceof HTMLDetailsElement) {
      if (owner !== el) continue;
    } else if (owner) continue;
    const text = (node.textContent || "").replace(/\s+/g, " ").trim();
    if (text) return text.slice(0, 160);
  }
  return "";
}

function reportSections(): PrintRow[] {
  const root = document.getElementById("aum-report");
  if (!root) return [];
  const rows: PrintRow[] = [];
  let n = 0;
  const mark = (el: HTMLElement, opened: boolean) => {
    const label = ownLabel(el);
    if (!label || el.closest(".no-print")) return;
    const id = `p${n++}`;
    el.setAttribute("data-print-id", id);
    rows.push({ id, label, opened });
  };

  root.querySelectorAll("details").forEach((node) => {
    if (node instanceof HTMLDetailsElement) mark(node, node.open);
  });

  Array.from(root.children).forEach((node) => {
    if (!(node instanceof HTMLElement) || node.classList.contains("no-print")) return;
    if (node instanceof HTMLDetailsElement) return;
    const copy = node.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("details").forEach((d) => d.remove());
    const outside = (copy.textContent || "").replace(/\s+/g, " ").trim();
    if (outside.length > 24) mark(node, true);
  });
  return rows;
}

function kept(el: HTMLElement, picked: Record<string, boolean>): boolean {
  const id = el.getAttribute("data-print-id");
  if (id && picked[id]) return true;
  return Array.from(el.querySelectorAll<HTMLElement>("[data-print-id]")).some((node) => {
    const child = node.getAttribute("data-print-id");
    return Boolean(child && picked[child]);
  });
}

function unwrapForPrint(nodes: HTMLDetailsElement[]) {
  const restores: Array<() => void> = [];
  const ordered = [...nodes].sort((a, b) => (a.contains(b) ? 1 : b.contains(a) ? -1 : 0));
  ordered.forEach((det) => {
    if (!det.isConnected) return;
    const parent = det.parentNode;
    if (!parent) return;
    const marker = document.createComment("print-restore");
    parent.insertBefore(marker, det);
    const box = document.createElement("div");
    Array.from(det.attributes).forEach((attr) => {
      if (attr.name !== "open") box.setAttribute(attr.name, attr.value);
    });
    box.classList.add("print-include");
    box.classList.remove("print-omit");
    while (det.firstChild) box.appendChild(det.firstChild);
    box.querySelectorAll("summary").forEach((summary) => {
      if (summary instanceof HTMLElement) summary.style.display = "block";
    });
    parent.insertBefore(box, det);
    det.remove();
    restores.push(() => {
      box.querySelectorAll("summary").forEach((summary) => {
        if (summary instanceof HTMLElement) summary.style.display = "";
      });
      while (box.firstChild) det.appendChild(box.firstChild);
      if (marker.parentNode) marker.parentNode.insertBefore(det, marker);
      marker.remove();
      box.remove();
    });
  });
  return () => {
    restores.reverse().forEach((fn) => fn());
  };
}

function widenPremiumNotes(root: HTMLElement) {
  root.querySelectorAll("td, th").forEach((cell) => {
    if (!(cell instanceof HTMLElement)) return;
    const text = (cell.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length < 160 || !/illustrative placeholder only/i.test(text)) return;
    const table = cell.closest("table");
    const note = document.createElement("p");
    note.className = "premium-note";
    note.textContent = text;
    if (table?.parentElement) table.parentElement.insertBefore(note, table);
    else cell.parentElement?.insertBefore(note, cell);
    cell.textContent = "Illustrative planning figure";
  });
  root.querySelectorAll(".premium-note, .lg\\:grid-cols-2").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.style.width = "100%";
    node.style.maxWidth = "100%";
    node.style.textAlign = "left";
    node.style.display = "block";
    node.style.gridTemplateColumns = "1fr";
  });
}

function applyPrintVisibility(root: HTMLElement) {
  root.querySelectorAll(".print-omit").forEach((el) => el.classList.remove("print-omit"));
  root.querySelectorAll("details").forEach((node) => {
    if (!(node instanceof HTMLDetailsElement)) return;
    if (node.classList.contains("no-print") || node.closest(".no-print")) return;
    node.open = true;
    node.classList.add("print-show");
  });
  root.querySelectorAll<HTMLElement>("[data-accordion]").forEach((node) => {
    node.setAttribute("data-accordion", "open");
  });
  root.querySelectorAll<HTMLElement>("[data-medicaid-fold]").forEach((node) => {
    node.setAttribute("data-medicaid-open", "1");
  });
  let firstYear = true;
  root.querySelectorAll("h2").forEach((heading) => {
    const text = heading.textContent || "";
    if (/^instructions$/i.test(text.trim())) {
      const block = heading.closest("section, .report-block");
      block?.classList.add("print-page-start", "print-keep-with-next");
    }
    if (!/year-by-year projection/i.test(text)) return;
    if (!firstYear) return;
    firstYear = false;
    const block = heading.closest("details, .report-block");
    block?.classList.add("print-keep-with-prev");
    block?.classList.remove("print-page-start");
  });
  root.querySelectorAll("h2").forEach((heading) => {
    if (!/how the pool|explore asset allocation/i.test(heading.textContent || "")) return;
    const block = heading.closest("section, details, .report-block");
    block?.classList.add("print-page-start");
  });
}

function printCheckedSections(_picked: Record<string, boolean>, done: () => void) {
  const root = document.getElementById("aum-report");
  if (!root) return;
  widenPremiumNotes(root);
  const dialog = document.getElementById("share-print-dialog");
  const wasOpen = Array.from(root.querySelectorAll("details")).flatMap((node) =>
    node instanceof HTMLDetailsElement ? [{ node, open: node.open }] : [],
  );
  const accordions = Array.from(root.querySelectorAll<HTMLElement>("[data-accordion]"));
  const wasAcc = accordions.map((node) => node.getAttribute("data-accordion"));
  const folds = Array.from(root.querySelectorAll<HTMLElement>("[data-medicaid-fold]"));
  const wasFold = folds.map((node) => node.getAttribute("data-medicaid-open"));
  const apply = () => applyPrintVisibility(root);
  apply();
  const onBefore = () => apply();
  let cleared = false;
  const clear = () => {
    if (cleared) return;
    cleared = true;
    window.clearTimeout(backup);
    window.removeEventListener("beforeprint", onBefore);
    window.removeEventListener("afterprint", onAfter);
    root.querySelectorAll(".print-omit, .print-show").forEach((el) => {
      el.classList.remove("print-omit", "print-show");
    });
    wasOpen.forEach(({ node, open }) => {
      node.open = open;
    });
    accordions.forEach((node, i) => {
      const state = wasAcc[i];
      if (state == null) node.removeAttribute("data-accordion");
      else node.setAttribute("data-accordion", state);
    });
    folds.forEach((node, i) => {
      const state = wasFold[i];
      if (state == null) node.removeAttribute("data-medicaid-open");
      else node.setAttribute("data-medicaid-open", state);
    });
    dialog?.classList.remove("print-omit");
    done();
  };
  const started = Date.now();
  const onAfter = () => {
    if (Date.now() - started < 700) return;
    window.setTimeout(clear, 200);
  };
  const backup = window.setTimeout(clear, 60000);
  window.addEventListener("beforeprint", onBefore);
  window.addEventListener("afterprint", onAfter);
  dialog?.classList.add("print-omit");
  window.setTimeout(() => window.print(), 200);
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
    setPicked(Object.fromEntries(next.map((row) => [row.id, row.opened])));
    setPicker(true);
  }

  function printSelected() {
    printCheckedSections(picked, () => setPicker(false));
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
      <section className="share-link-note mx-auto max-w-5xl px-4 py-6 text-center text-sm leading-relaxed text-navy sm:px-8">
        <p className="font-semibold">Report link</p>
        <p className="mx-auto mt-2 max-w-3xl">{shareDisclaimer(hours)}</p>
        {view?.status === "ready" && view.expiresAt ? (
          <p className="mt-2 text-xs text-muted">
            First opened {new Date(view.firstViewedAt).toLocaleString("en-US")}. Expires{" "}
            {new Date(view.expiresAt).toLocaleString("en-US")}.
          </p>
        ) : null}
        {view?.status === "ready" ? (
          <button
            type="button"
            className="no-print btn-block mx-auto mt-4 max-w-xs rounded-lg bg-teal px-4 py-2.5 text-center text-sm font-semibold text-white hover:brightness-110"
            onClick={openPrintPicker}
          >
            Print to PDF
          </button>
        ) : null}
        <div className="no-print mt-8 border-t border-line pt-4 text-center">
          <p className="text-xs text-muted">
            <CopyrightMark />{" "}
            <DisclosureTermsLink className="font-semibold text-navy underline-offset-4 hover:underline" />
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <button
              type="button"
              className="btn-block rounded-lg border border-navy bg-navy text-cream"
              onClick={() => {
                window.close();
                window.location.href = "/";
              }}
            >
              Close
            </button>
          </div>
          <p className="mx-auto mt-3 max-w-xl text-center text-xs text-muted">
            The PDF is a print picture of this page, not a tagged accessible file. Stay on this
            View or use your browser’s Print dialog for selectable text and screen-reader
            support. Escape closes this report.
          </p>
        </div>
      </section>
      {picker ? (
        <div
          id="share-print-dialog"
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
              Sections you opened on this page are already checked, including a section such as DRA.
              Closed sections are left out unless you check them. A checked section is printed in full.
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
                className="min-h-11 rounded-lg bg-teal px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
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