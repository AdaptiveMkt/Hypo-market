"use client";

import { useEffect, useRef, useState } from "react";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<{
    getViewport: (o: { scale: number }) => { width: number; height: number };
    render: (o: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void>; cancel: () => void };
  }>;
  destroy: () => Promise<void>;
};

export function PdfPageView({ url, fill = false }: { url: string; fill?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const docRef = useRef<PdfDoc | null>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState("");
  const [width, setWidth] = useState(320);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const measure = () => setWidth(Math.max(240, node.clientWidth - 16));
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError("");
    setPages(0);
    setPage(1);
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      const data = new Uint8Array(await (await fetch(url)).arrayBuffer());
      const task = pdfjs.getDocument({ data });
      const loaded = (await task.promise) as unknown as PdfDoc;
      if (cancelled) {
        await loaded.destroy().catch(() => undefined);
        return;
      }
      docRef.current = loaded;
      setPages(loaded.numPages);
    })().catch((err) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "The PDF could not be opened.");
    });
    return () => {
      cancelled = true;
      const doc = docRef.current;
      docRef.current = null;
      void doc?.destroy().catch(() => undefined);
    };
  }, [url]);

  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || !pages) return;
    let cancelRender: (() => void) | null = null;
    let dead = false;
    (async () => {
      const pdfPage = await doc.getPage(page);
      if (dead) return;
      const base = pdfPage.getViewport({ scale: 1 });
      const viewport = pdfPage.getViewport({ scale: (width / base.width) * zoom });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      cancelRender = () => task.cancel();
      await task.promise;
    })().catch(() => {
      /* A newer page render replaced this one. */
    });
    return () => {
      dead = true;
      cancelRender?.();
    };
  }, [page, pages, zoom, width]);

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-paper ${fill ? "h-full min-h-0 flex-1" : "mt-3"}`}>
      <div className="pdf-view-bar shrink-0" role="toolbar" aria-label="PDF page and zoom">
        <div className="pdf-view-bar-row">
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>
            Prev
          </button>
          <span>{pages ? `${page} / ${pages}` : "…"}</span>
          <button type="button" aria-label="Next page" disabled={!pages || page >= pages} onClick={() => setPage((n) => Math.min(pages, n + 1))}>
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
      <div ref={wrapRef} className={`min-h-0 overflow-auto bg-white ${fill ? "flex-1" : "h-[48vh] sm:h-[62vh]"}`}>
        {error ? <p className="p-4 text-sm font-semibold text-deplete">{error}</p> : null}
        <canvas ref={canvasRef} className="pdf-page-canvas mx-auto my-2 block bg-white" />
      </div>
    </div>
  );
}
