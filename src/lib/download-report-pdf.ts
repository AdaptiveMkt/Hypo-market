import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { COPYRIGHT_LINE, TERMS_BUTTON_LABEL } from "@/lib/disclaimer";

const MIN_MARGIN = 36;
const MAX_MARGIN = 72;
const BASE_MARGIN = 42;
const GAP = 12;
const FOOTER_H = 56;
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

function stampFooter(pdf: jsPDF, pageW: number, pageH: number, page: number, pages: number) {
  pdf.setDrawColor(196, 163, 90);
  pdf.setLineWidth(0.6);
  pdf.line(BASE_MARGIN, pageH - FOOTER_H, pageW - BASE_MARGIN, pageH - FOOTER_H);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(27, 58, 75);
  pdf.text(FOOTER, pageW / 2, pageH - 34, { align: "center" });
  pdf.setFontSize(8);
  pdf.text(TERMS_BUTTON_LABEL, BASE_MARGIN, pageH - 20, { align: "left" });
  pdf.text(`Page ${page} of ${pages}`, pageW - BASE_MARGIN, pageH - 20, { align: "right" });
}

function stampContinuedHeader(pdf: jsPDF, pageW: number) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(27, 58, 75);
  pdf.text("Long Term Care Asset Utilization Modeling — continued", pageW / 2, BASE_MARGIN - 16, {
    align: "center",
  });
  pdf.setDrawColor(196, 163, 90);
  pdf.setLineWidth(0.4);
  pdf.line(BASE_MARGIN, BASE_MARGIN - 10, pageW - BASE_MARGIN, BASE_MARGIN - 10);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForReport(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const root = document.getElementById("aum-report");
    if (root?.querySelector(".report-block")) return root;
    await wait(60);
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

function findBreakY(canvas: HTMLCanvasElement, startY: number, maxY: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return maxY;
  const w = canvas.width;
  const minY = startY + 48;
  for (let y = Math.min(maxY, canvas.height - 1); y > minY; y -= 3) {
    const data = ctx.getImageData(0, y, w, 1).data;
    let ink = 0;
    for (let i = 0; i < data.length; i += 24) {
      const a = data[i + 3];
      if (a < 12) continue;
      if (data[i] < 245 || data[i + 1] < 238 || data[i + 2] < 230) ink++;
    }
    if (ink < 8) return y;
  }
  return Math.min(maxY, canvas.height);
}

function savePdfFile(pdf: jsPDF, filename: string) {
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 8000);
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

/** Capture the report once, then place whole chart+caption blocks so graphics never split. */
export async function downloadReportPdf(filename: string): Promise<{ filename: string; base64: string }> {
  const root = await waitForReport();
  try {
    await document.fonts?.ready;
  } catch {
    /* ignore */
  }

  const overlay = root.parentElement;
  const overlayOverflow = overlay?.style.overflow ?? "";
  const rootOverflow = root.style.overflow;
  const overlayScroll = overlay?.scrollTop ?? 0;
  if (overlay) {
    overlay.style.overflow = "visible";
    overlay.scrollTop = 0;
  }
  root.style.overflow = "visible";
  document.documentElement.classList.add("pdf-capture");

  try {
    await wait(80);
    const canvas = await html2canvas(root, {
      scale: 1.25,
      useCORS: true,
      backgroundColor: "#fffdf8",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: Math.max(root.scrollWidth, 960),
      ignoreElements: (el) =>
        el instanceof HTMLElement &&
        (el.classList.contains("no-print") || el.closest(".no-print") != null),
      onclone: (doc, el) => {
        flattenUnsupportedColors(doc);
        const node = el as HTMLElement;
        node.style.overflow = "visible";
        node.style.height = "auto";
        node.style.maxHeight = "none";
        node.querySelectorAll("details").forEach((d) => {
          const det = d as HTMLDetailsElement;
          if (!det.classList.contains("no-print")) det.open = true;
        });
        node.querySelectorAll(".accordion-panel").forEach((p) => {
          const el = p as HTMLElement;
          el.style.maxHeight = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.overflow = "visible";
        });
        doc.querySelectorAll(".no-print").forEach((n) => {
          (n as HTMLElement).style.display = "none";
        });
      },
    });

    if (!canvas.width || !canvas.height) {
      throw new Error("Could not capture the report.");
    }

    const pdf = new jsPDF({ unit: "pt", format: "letter", compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const usableW = pageW - BASE_MARGIN * 2;
    const usableH = pageH - BASE_MARGIN - FOOTER_H - 10;
    const pxToPt = usableW / canvas.width;

    const rawBands = bandsFromBlocks(root, canvas);
    const bands = paginateBands(rawBands.length ? rawBands : [{ start: 0, end: canvas.height, keep: false }], canvas.height);
    let y = BASE_MARGIN;
    let pageStarted = false;

    const newPage = () => {
      if (pageStarted) pdf.addPage();
      pageStarted = true;
      y = BASE_MARGIN;
    };

    const remaining = () => BASE_MARGIN + usableH - y;

    if (!bands.length) {
      throw new Error("Report has no printable blocks.");
    }

    newPage();

    for (const band of bands) {
      const sliceH = band.end - band.start;
      const fit = autoFit({
        pageW,
        pageH,
        y,
        sliceH,
        canvasW: canvas.width,
        keep: band.keep,
      });
      if (fit.newPage) newPage();
      const placed = fit.newPage
        ? autoFit({
            pageW,
            pageH,
            y: BASE_MARGIN,
            sliceH,
            canvasW: canvas.width,
            keep: band.keep,
          })
        : fit;

      if (band.keep) {
        drawStrip(pdf, canvas, band.start, band.end, placed.x, placed.y, placed.w, placed.h);
        y = placed.y + placed.h + GAP;
        continue;
      }

      const drawH = sliceH * pxToPt;
      if (drawH <= remaining() - 2 && !placed.newPage) {
        drawStrip(pdf, canvas, band.start, band.end, BASE_MARGIN, y, usableW, drawH);
        y += drawH + GAP;
        continue;
      }

      if (y > BASE_MARGIN + 8 && drawH <= usableH) {
        newPage();
        drawStrip(pdf, canvas, band.start, band.end, BASE_MARGIN, y, usableW, drawH);
        y += drawH + GAP;
        continue;
      }

      let cursor = band.start;
      while (cursor < band.end - 2) {
        if (y > BASE_MARGIN + 8 && remaining() < 64) newPage();
        const maxPx = Math.floor(remaining() / pxToPt);
        const sliceEnd = Math.min(
          band.end,
          findBreakY(canvas, cursor, Math.min(band.end, cursor + maxPx)),
        );
        const h = Math.max(1, sliceEnd - cursor) * pxToPt;
        drawStrip(pdf, canvas, cursor, sliceEnd, BASE_MARGIN, y, usableW, h);
        y += h + GAP;
        cursor = sliceEnd;
        if (cursor < band.end - 2) newPage();
      }
    }

    const pages = pdf.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      if (i > 1) stampContinuedHeader(pdf, pageW);
      stampFooter(pdf, pageW, pageH, i, pages);
    }

    savePdfFile(pdf, filename);
    const dataUri = pdf.output("datauristring") as string;
    const base64 = dataUri.includes(",") ? dataUri.split(",")[1]! : "";
    return { filename, base64 };
  } finally {
    document.documentElement.classList.remove("pdf-capture");
    if (overlay) {
      overlay.style.overflow = overlayOverflow;
      overlay.scrollTop = overlayScroll;
    }
    root.style.overflow = rootOverflow;
  }
}
