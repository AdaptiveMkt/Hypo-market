import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { COPYRIGHT_LINE } from "@/lib/disclaimer";

const MIN_MARGIN = 36;
const MAX_MARGIN = 72;
const BASE_MARGIN = 42;
const GAP = 12;
const FOOTER_H = 72;
const CONTENT_TOP = 48;
const FOOTER = COPYRIGHT_LINE;
const UNSUPPORTED_COLOR = /(?:oklch|oklab|lab|lch|color-mix|color)\([^)]*\)/i;

type Band = { start: number; end: number; keep: boolean };

type Fitted = { x: number; y: number; w: number; h: number; newPage: boolean };

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Pick side/top inset so the block fits the remaining page without clipping the footer. */
function autoFit(opts: {
  pageW: number;
  pageH: number;
  y: number;
  sliceH: number;
  canvasW: number;
  keep: boolean;
}): Fitted {
  const { pageW, pageH, y, sliceH, canvasW, keep } = opts;
  const aspect = sliceH / Math.max(1, canvasW);
  const floor = pageH - FOOTER_H - 12;
  const topPad = keep ? 14 : 0;
  const bottomPad = keep ? 16 : GAP;
  const preferSide = keep ? 56 : BASE_MARGIN;

  let y0 = y + (keep && y > BASE_MARGIN + 4 ? topPad : 0);
  let maxH = floor - y0 - bottomPad;
  const fullH = floor - BASE_MARGIN - (keep ? topPad + bottomPad : GAP);
  let newPage = false;
  if (preferSide * 2 < pageW) {
    const naturalH = (pageW - preferSide * 2) * aspect;
    if (naturalH > maxH + 2 && y0 > BASE_MARGIN + 8) {
      newPage = true;
      y0 = BASE_MARGIN + (keep ? topPad : 0);
      maxH = floor - y0 - bottomPad;
    }
  }

  let side = preferSide;
  let w = pageW - side * 2;
  let h = w * aspect;
  if (h > maxH) {
    w = maxH / aspect;
    const minW = pageW - MAX_MARGIN * 2;
    const maxW = pageW - MIN_MARGIN * 2;
    w = clamp(w, minW, maxW);
    h = Math.min(maxH, Math.max(fullH * 0.35, w * aspect));
    if (h > maxH) h = maxH;
    side = (pageW - w) / 2;
  }
  return { x: (pageW - w) / 2, y: y0, w, h, newPage };
}

/** Numbers are written after the last page exists, so “Page X of Y” matches the file. */
function stampPageNumbers(pdf: jsPDF) {
  const pages = pdf.getNumberOfPages();
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageW, CONTENT_TOP - 6, "F");
    pdf.rect(0, pageH - FOOTER_H, pageW, FOOTER_H, "F");
    pdf.setDrawColor(196, 163, 90);
    pdf.setLineWidth(0.5);
    pdf.line(BASE_MARGIN, CONTENT_TOP - 10, pageW - BASE_MARGIN, CONTENT_TOP - 10);
    pdf.line(BASE_MARGIN, pageH - FOOTER_H, pageW - BASE_MARGIN, pageH - FOOTER_H);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(27, 58, 75);
    pdf.text(
      i === 1
        ? "Long Term Care Asset Utilization Modeling"
        : "Long Term Care Asset Utilization Modeling — continued",
      BASE_MARGIN,
      22,
    );
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    const label = `Page ${i} of ${pages}`;
    pdf.text(label, pageW - BASE_MARGIN, 22, { align: "right" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(36, 48, 56);
    const terms =
      "Disclosure and Terms of Use: educational hypothetical only. Not a quote, illustration, or advice. Full terms are at the end of this document.";
    const lines = pdf.splitTextToSize(terms, pageW - BASE_MARGIN * 2);
    pdf.text(lines, BASE_MARGIN, pageH - FOOTER_H + 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text(FOOTER, BASE_MARGIN, pageH - 16);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(label, pageW - BASE_MARGIN, pageH - 16, { align: "right" });
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForReport(timeoutMs = 20000) {
  const start = Date.now();
  let lastCount = 0;
  let stable = 0;
  while (Date.now() - start < timeoutMs) {
    const root = document.getElementById("aum-report");
    const count = root?.querySelectorAll(".report-block").length ?? 0;
    if (root && count >= 2) {
      if (count === lastCount) stable += 1;
      else {
        lastCount = count;
        stable = 0;
      }
      if (stable >= 3) return root;
    }
    await wait(80);
  }
  throw new Error("Report is not on screen.");
}

function flattenUnsupportedColors(doc: Document) {
  const dummy = doc.createElement("span");
  dummy.style.cssText = "position:absolute;left:-9999px;visibility:hidden;";
  doc.body.appendChild(dummy);
  const view = doc.defaultView;

  function toRgb(token: string, fallback: string) {
    try {
      dummy.style.color = token;
      const out = view?.getComputedStyle(dummy).color ?? "";
      if (out && !UNSUPPORTED_COLOR.test(out)) return out;
    } catch {
      /* ignore */
    }
    return fallback;
  }

  function rewrite(css: string) {
    return css.replace(
      /(?:oklch|oklab|lab|lch|color-mix|color)\([^)]*\)/gi,
      (m) => toRgb(m, "rgb(36, 48, 56)"),
    );
  }

  doc.querySelectorAll("style").forEach((el) => {
    if (el.textContent) el.textContent = rewrite(el.textContent);
  });
  dummy.remove();
}

function isBlankRow(canvas: HTMLCanvasElement, y: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  const data = ctx.getImageData(0, y, canvas.width, 1).data;
  let ink = 0;
  for (let i = 0; i < data.length; i += 16) {
    const a = data[i + 3];
    if (a < 12) continue;
    if (data[i] < 245 || data[i + 1] < 238 || data[i + 2] < 230) ink++;
  }
  return ink < 6;
}

/** Break only in a real gap, never through a card, a line of type, or a table row. */
function findBreakY(canvas: HTMLCanvasElement, startY: number, maxY: number) {
  const minY = startY + 64;
  const limit = Math.min(maxY, canvas.height - 1);
  let run = 0;
  let runEnd = limit;
  for (let y = limit; y > minY; y -= 1) {
    if (isBlankRow(canvas, y)) {
      if (run === 0) runEnd = y;
      run += 1;
      if (run >= 14) return Math.max(minY, runEnd - 6);
    } else {
      run = 0;
    }
  }
  return -1;
}

function cardSpans(el: HTMLElement, scale: number, cssTop: number) {
  const rootTop = el.getBoundingClientRect().top;
  const spans: Array<[number, number]> = [];
  el.querySelectorAll<HTMLElement>(".card").forEach((node) => {
    if (node.offsetHeight < 4) return;
    const r = node.getBoundingClientRect();
    const top = Math.round((r.top - rootTop - cssTop) * scale);
    const bottom = Math.round((r.bottom - rootTop - cssTop) * scale);
    if (bottom > top + 4) spans.push([top, bottom]);
  });
  return spans;
}

/** If a cut would land inside a card, move it to the top of that card. -1 means start a new page. */
function snapSlice(
  cursor: number,
  target: number,
  spans: Array<[number, number]>,
  canvasH: number,
) {
  const end = Math.min(target, canvasH);
  const hit = spans.find(([top, bottom]) => end > top + 2 && end < bottom - 2);
  if (!hit) return end;
  const [top] = hit;
  if (top > cursor + 24) return top;
  return -1;
}

function savePdfFile(pdf: jsPDF, filename: string) {
  const blob = pdf.output("blob") as Blob;
  return savePdfBlob(blob, filename);
}

/** Keep an object URL for the ready dialog. The file is not saved until the visitor clicks Save. */
export function savePdfBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  void filename;
  return url;
}

export async function blobToPdfBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function cssToCanvasY(cssY: number, rootTop: number, scale: number, canvasH: number) {
  return Math.max(0, Math.min(canvasH, Math.round((cssY - rootTop) * scale)));
}

/** Title + chart stay together; a tall table under a chart can continue on the next page. */
function bandsFromBlocks(root: HTMLElement, canvas: HTMLCanvasElement): Band[] {
  const rootRect = root.getBoundingClientRect();
  const scale = canvas.height / Math.max(1, rootRect.height);
  const canvasH = canvas.height;
  const pad = Math.round(6 * scale);
  const bands: Band[] = [];

  const blocks = Array.from(root.querySelectorAll<HTMLElement>(".report-block")).filter(
    (el) => !el.closest(".no-print") && el.offsetHeight > 4,
  );

  for (const el of blocks) {
    const r = el.getBoundingClientRect();
    const start = cssToCanvasY(r.top, rootRect.top, scale, canvasH) - pad;
    const end = cssToCanvasY(r.bottom, rootRect.top, scale, canvasH) + pad;
    const charts = Array.from(
      el.querySelectorAll<HTMLElement>(".recharts-wrapper, .report-chart, .chart-frame, .recharts-surface"),
    ).filter((c) => c.offsetHeight > 4);
    if (!charts.length) {
      bands.push({ start: Math.max(0, start), end: Math.min(canvasH, end), keep: false });
      continue;
    }
    let cursor = start;
    for (const chart of charts) {
      const cr = chart.getBoundingClientRect();
      const cStart = cssToCanvasY(cr.top, rootRect.top, scale, canvasH) - pad;
      const cEnd = cssToCanvasY(cr.bottom, rootRect.top, scale, canvasH) + pad;
      if (cStart > cursor + 12) {
        bands.push({ start: Math.max(0, cursor), end: Math.min(canvasH, cStart), keep: false });
      }
      bands.push({
        start: Math.max(0, Math.min(cStart, cursor)),
        end: Math.min(canvasH, cEnd),
        keep: true,
      });
      cursor = Math.max(cursor, cEnd);
    }
    if (end > cursor + 12) {
      bands.push({ start: Math.min(canvasH, cursor), end: Math.min(canvasH, end), keep: false });
    }
  }

  return bands.filter((b) => b.end - b.start > 4);
}

/** Cover every pixel of the capture so nothing is left off a page. */
function paginateBands(bands: Band[], canvasH: number): Band[] {
  const sorted = [...bands].sort((a, b) => a.start - b.start);
  const out: Band[] = [];
  let y = 0;
  for (const band of sorted) {
    const start = Math.max(0, band.start);
    if (start > y + 6) out.push({ start: y, end: start, keep: false });
    out.push({ start: Math.max(y, start), end: Math.min(canvasH, band.end), keep: band.keep });
    y = Math.max(y, band.end);
  }
  if (y < canvasH - 4) out.push({ start: y, end: canvasH, keep: false });
  return out.filter((b) => b.end - b.start > 4);
}

function drawStrip(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  start: number,
  end: number,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const sliceH = Math.max(1, end - start);
  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = canvas.width;
  pageCanvas.height = sliceH;
  const ctx = pageCanvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  ctx.drawImage(canvas, 0, start, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
  pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.92), "JPEG", x, y, w, h);
}

const PDF_LIGHT_VARS: Record<string, string> = {
  "--color-navy": "#1b3a4b",
  "--color-teal": "#0072b2",
  "--color-gold": "#c4a35a",
  "--color-cream": "#ffffff",
  "--color-paper": "#ffffff",
  "--color-ink": "#243038",
  "--color-muted": "#536168",
  "--color-line": "#8f8068",
  "--color-good": "#005a8c",
  "--color-warn": "#8b3a00",
  "--color-deplete": "#9a4500",
  "--color-bg": "#ffffff",
  "--color-fg": "#243038",
  "--color-surface": "#ffffff",
  "--color-primary": "#c4a35a",
  "--color-border": "#8f8068",
  "--color-masthead": "#1b3a4b",
  "--color-masthead-fg": "#f6f1e8",
  "--color-gold-ink": "#7a5e20",
  "--color-card": "#ffffff",
  "--color-card-border": "#0072b2",
  "--color-accent": "#0072b2",
  "--color-amount": "#9a4500",
  "--color-remain-draw": "#009e73",
  "--color-link": "#0000ee",
  "--color-chart-grid": "#8f8068",
  "--color-chart-tick": "#536168",
};

function applyPdfLight(el: HTMLElement) {
  for (const [key, value] of Object.entries(PDF_LIGHT_VARS)) el.style.setProperty(key, value);
  el.style.colorScheme = "light";
  el.style.backgroundColor = "#ffffff";
  el.style.color = "#243038";
}

const MAX_CANVAS_EDGE = 8000;
const SLICE_CSS = 2800;

const html2opts = (scale: number, extra: Record<string, unknown> = {}) => ({
  scale,
  useCORS: true as const,
  backgroundColor: "#ffffff",
  logging: false,
  scrollX: 0,
  scrollY: 0,
  imageTimeout: 15000,
  ...extra,
  ignoreElements: (el: Element) =>
    el instanceof HTMLElement &&
    (el.classList.contains("no-print") || el.closest(".no-print") != null),
  onclone: (doc: Document, el: HTMLElement) => {
    doc.documentElement.classList.remove("dark");
    doc.documentElement.classList.add("pdf-capture");
    doc.documentElement.style.colorScheme = "light";
    applyPdfLight(el);
    flattenUnsupportedColors(doc);
    el.querySelectorAll<HTMLElement>(".kpi-value").forEach((node) => {
      node.style.color = "#9a4500";
      node.style.webkitTextFillColor = "#9a4500";
      node.style.fontFamily = "Georgia, 'Times New Roman', serif";
      node.style.fontSize = "18px";
      node.style.lineHeight = "1.35";
      node.style.display = "block";
    });
    el.querySelectorAll<HTMLElement>(".pdf-kpi, .card").forEach((node) => {
      node.style.overflow = "visible";
    });
    el.style.overflow = "visible";
    el.style.height = "auto";
    el.style.maxHeight = "none";
    el.querySelectorAll("details").forEach((d) => {
      const det = d as HTMLDetailsElement;
      if (!det.classList.contains("no-print")) det.open = true;
    });
    el.querySelectorAll(".accordion-panel").forEach((p) => {
      const panel = p as HTMLElement;
      const fold = panel.closest("[data-medicaid-fold]");
      if (fold?.getAttribute("data-medicaid-open") === "0") {
        panel.style.maxHeight = "0px";
        panel.style.opacity = "0";
        panel.style.overflow = "hidden";
        panel.style.display = "none";
        return;
      }
      panel.style.maxHeight = "none";
      panel.style.opacity = "1";
      panel.style.transform = "none";
      panel.style.overflow = "visible";
    });
    doc.querySelectorAll(".no-print").forEach((n) => {
      (n as HTMLElement).style.display = "none";
    });
  },
});

function expandLive(root: HTMLElement) {
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".accordion-panel"));
  const prev = panels.map((p) => ({
    p,
    maxH: p.style.maxHeight,
    op: p.style.opacity,
    ov: p.style.overflow,
    tf: p.style.transform,
    display: p.style.display,
  }));
  const keepMedicaidClosed = root.dataset.medicaidOpen !== "1";
  panels.forEach((p) => {
    if (keepMedicaidClosed && p.closest("[data-medicaid-fold]")) {
      p.style.maxHeight = "0px";
      p.style.opacity = "0";
      p.style.overflow = "hidden";
      p.style.display = "none";
      p.style.transform = "none";
      return;
    }
    p.style.maxHeight = "none";
    p.style.opacity = "1";
    p.style.overflow = "visible";
    p.style.transform = "none";
    p.style.pointerEvents = "auto";
    p.style.display = "";
  });
  root.querySelectorAll("details").forEach((d) => {
    if (!d.classList.contains("no-print")) (d as HTMLDetailsElement).open = true;
  });
  return () => {
    prev.forEach(({ p, maxH, op, ov, tf, display }) => {
      p.style.maxHeight = maxH;
      p.style.opacity = op;
      p.style.overflow = ov;
      p.style.transform = tf;
      p.style.display = display;
    });
  };
}

async function captureBlock(el: HTMLElement): Promise<{ canvas: HTMLCanvasElement; cssTop: number; scale: number }[]> {
  const cssH = Math.max(el.scrollHeight, el.offsetHeight, 1);
  const cssW = Math.max(el.scrollWidth, el.offsetWidth, 320);
  const out: { canvas: HTMLCanvasElement; cssTop: number; scale: number }[] = [];
  const grab = async (y: number, h: number) => {
    const scale = Math.min(1.25, MAX_CANVAS_EDGE / Math.max(h, 1), MAX_CANVAS_EDGE / cssW);
    try {
      const canvas = await html2canvas(
        el,
        html2opts(scale, {
          x: 0,
          y,
          width: cssW,
          height: h,
          windowWidth: cssW,
          windowHeight: Math.max(h, 900),
        }),
      );
      return { canvas, scale };
    } catch {
      const fallback = Math.min(0.75, scale);
      const canvas = await html2canvas(
        el,
        html2opts(fallback, {
          x: 0,
          y,
          width: cssW,
          height: Math.min(h, 1600),
          windowWidth: cssW,
          windowHeight: Math.max(Math.min(h, 1600), 900),
        }),
      );
      return { canvas, scale: fallback };
    }
  };
  try {
    if (cssH <= SLICE_CSS) {
      const shot = await grab(0, cssH);
      out.push({ canvas: shot.canvas, cssTop: 0, scale: shot.scale });
      return out.filter((c) => c.canvas.width > 0 && c.canvas.height > 0);
    }
    for (let top = 0; top < cssH; top += SLICE_CSS) {
      const h = Math.min(SLICE_CSS, cssH - top);
      const shot = await grab(top, h);
      out.push({ canvas: shot.canvas, cssTop: top, scale: shot.scale });
    }
  } catch {
    return out.filter((c) => c.canvas.width > 0 && c.canvas.height > 0);
  }
  return out.filter((c) => c.canvas.width > 0 && c.canvas.height > 0);
}

function addCanvasPages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  state: { y: number; started: boolean },
  keep = false,
  spans: Array<[number, number]> = [],
) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const usableW = pageW - BASE_MARGIN * 2;
  const usableH = pageH - CONTENT_TOP - FOOTER_H - 8;
  const pxToPt = usableW / canvas.width;
  const blockH = canvas.height * pxToPt;
  const remaining = () => CONTENT_TOP + usableH - state.y;
  const newPage = () => {
    if (state.started) pdf.addPage();
    state.started = true;
    state.y = CONTENT_TOP;
  };
  if (!state.started) newPage();
  if (keep && state.y > CONTENT_TOP + 8 && blockH <= usableH && blockH > remaining() - 8) {
    newPage();
  }

  let cursor = 0;
  while (cursor < canvas.height - 2) {
    const room = Math.floor(remaining() / pxToPt);
    if (state.y > CONTENT_TOP + 8 && room < 72) newPage();
    const maxPx = keep && blockH <= usableH ? canvas.height : Math.max(72, Math.floor(remaining() / pxToPt));
    const target = Math.min(canvas.height, cursor + maxPx);
    let sliceEnd = target;
    if (!(keep && blockH <= usableH) && target < canvas.height - 2) {
      const snapped = snapSlice(cursor, target, spans, canvas.height);
      if (snapped < 0) {
        if (state.y > CONTENT_TOP + 8) {
          newPage();
          continue;
        }
        sliceEnd = target;
      } else if (snapped <= cursor + 8) {
        sliceEnd = target;
      } else {
        sliceEnd = snapped;
      }
    }
    const h = Math.max(1, sliceEnd - cursor) * pxToPt;
    drawStrip(pdf, canvas, cursor, sliceEnd, BASE_MARGIN, state.y, usableW, h);
    state.y += h + GAP;
    cursor = sliceEnd;
    if (cursor < canvas.height - 2) newPage();
  }
}

/** Capture each report section so a full packet fits browser canvas limits, then save locally. */
export async function downloadReportPdf(
  filename: string,
  onProgress?: (msg: string) => void,
): Promise<{ filename: string; base64: string; blob: Blob; url: string }> {
  const root = await waitForReport();
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }
  await Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            }),
    ),
  );

  const overlay = root.parentElement;
  const overlayPrev = overlay
    ? {
        overflow: overlay.style.overflow,
        position: overlay.style.position,
        height: overlay.style.height,
        maxHeight: overlay.style.maxHeight,
        top: overlay.style.top,
        bottom: overlay.style.bottom,
        scroll: overlay.scrollTop,
      }
    : null;
  if (overlay) {
    overlay.style.overflow = "visible";
    overlay.style.position = "absolute";
    overlay.style.height = "auto";
    overlay.style.maxHeight = "none";
    overlay.style.top = "0";
    overlay.style.bottom = "auto";
    overlay.scrollTop = 0;
  }
  const rootOverflow = root.style.overflow;
  const rootHeight = root.style.height;
  const rootMaxHeight = root.style.maxHeight;
  root.style.overflow = "visible";
  root.style.height = "auto";
  root.style.maxHeight = "none";
  document.documentElement.classList.add("pdf-capture");
  const restoreAccordions = expandLive(root);
  window.dispatchEvent(new Event("resize"));
  await wait(280);

  try {
    const blocks = Array.from(root.querySelectorAll<HTMLElement>(".report-block")).filter(
      (el) => !el.closest(".no-print") && el.offsetHeight > 4,
    );
    if (!blocks.length) throw new Error("Report has no printable blocks.");

    const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
    const state = { y: CONTENT_TOP, started: false };

    let captured = 0;
    for (let i = 0; i < blocks.length; i++) {
      onProgress?.(`Preparing PDF… section ${i + 1} of ${blocks.length}`);
      try {
        const parts = await captureBlock(blocks[i]);
        const keep = blocks[i].dataset.pdfKeep === "1";
        for (const part of parts) {
          addCanvasPages(
            pdf,
            part.canvas,
            state,
            keep,
            cardSpans(blocks[i], part.scale, part.cssTop),
          );
        }
        if (blocks[i].dataset.pdfBreakAfter === "1" && state.started && state.y > CONTENT_TOP + 8) {
          pdf.addPage();
          state.y = CONTENT_TOP;
        }
        captured += parts.length;
      } catch {
        /* Skip a section that cannot be drawn so the rest of the file still saves. */
      }
    }
    if (!captured) throw new Error("No section could be drawn. Try Client sitting, then download again.");

    stampPageNumbers(pdf);

    const blob = pdf.output("blob") as Blob;
    const url = savePdfBlob(blob, filename);
    const base64 = await blobToPdfBase64(blob);
    return { filename, base64, blob, url };
  } finally {
    restoreAccordions();
    document.documentElement.classList.remove("pdf-capture");
    if (overlay && overlayPrev) {
      overlay.style.overflow = overlayPrev.overflow;
      overlay.style.position = overlayPrev.position;
      overlay.style.height = overlayPrev.height;
      overlay.style.maxHeight = overlayPrev.maxHeight;
      overlay.style.top = overlayPrev.top;
      overlay.style.bottom = overlayPrev.bottom;
      overlay.scrollTop = overlayPrev.scroll;
    }
    root.style.overflow = rootOverflow;
    root.style.height = rootHeight;
    root.style.maxHeight = rootMaxHeight;
  }
}
