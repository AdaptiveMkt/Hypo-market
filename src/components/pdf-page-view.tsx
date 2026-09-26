"use client";

import { useState } from "react";

export function PdfPageView({ pages, fill = false }: { pages: string[]; fill?: boolean }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const total = pages.length;
  const src = pages[Math.max(0, Math.min(total - 1, page - 1))] ?? "";

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-paper ${fill ? "h-full min-h-0 flex-1" : "mt-3"}`}>
      <div className="pdf-view-bar shrink-0" role="toolbar" aria-label="PDF page and zoom">
        <div className="pdf-view-bar-row">
          <button type="button" className="bg-teal" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>
            Prev
          </button>
          <span>{total ? `${page} / ${total}` : "…"}</span>
          <button type="button" className="bg-teal" aria-label="Next page" disabled={!total || page >= total} onClick={() => setPage((n) => Math.min(total, n + 1))}>
            Next
          </button>
        </div>
        <div className="pdf-view-bar-row">
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.25) * 100) / 100))}>
            −
          </button>
          <button type="button" className="border-gold bg-gold text-masthead" aria-label="Fit page to width" onClick={() => setZoom(1)}>
            Fit {Math.round(zoom * 100)}%
          </button>
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100))}>
            +
          </button>
        </div>
      </div>
      <div className={`min-h-0 overflow-auto bg-white ${fill ? "flex-1" : "h-[48vh] sm:h-[62vh]"}`}>
        {src ? (
          <img
            src={src}
            alt={`PDF page ${page} of ${total}`}
            className="pdf-page-shot mx-auto my-2 block bg-white"
            style={{ width: `${Math.round(zoom * 100)}%`, maxWidth: "none" }}
          />
        ) : (
          <p className="p-4 text-sm font-semibold text-navy">The pages could not be drawn on this phone. Use Save PDF to this computer.</p>
        )}
      </div>
    </div>
  );
}
