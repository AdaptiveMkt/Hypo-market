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
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-paper ${fill ? "h-full flex-1" : "mt-3"}`}>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-line bg-cream px-2 py-2">
        <button type="button" className="shrink-0 whitespace-nowrap rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>
          Previous
        </button>
        <span className="min-w-24 shrink-0 text-center text-sm font-semibold text-navy">
          {pages ? `Page ${page} of ${pages}` : "Opening…"}
        </span>
        <button type="button" className="shrink-0 whitespace-nowrap rounded-lg border border-navy px-3 py-2 text-sm font-semibold text-navy disabled:opacity-40" disabled={!pages || page >= pages} onClick={() => setPage((n) => Math.min(pages, n + 1))}>
          Next
        </button>
        <button type="button" className="shrink-0 whitespace-nowrap rounded-lg border border-gold px-3 py-2 text-sm font-semibold text-navy" onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10))}>
          Zoom out
        </button>
        <button type="button" className="shrink-0 whitespace-nowrap rounded-lg border border-gold bg-gold px-3 py-2 text-sm font-semibold text-masthead" onClick={() => setZoom(1)}>
          Fit width
        </button>
        <button type="button" className="shrink-0 whitespace-nowrap rounded-lg border border-gold px-3 py-2 text-sm font-semibold text-navy" onClick={() => setZoom((z) => Math.min(2.4, Math.round((z + 0.2) * 10) / 10))}>
          Zoom in
        </button>
      </div>
      <div ref={wrapRef} className={`overflow-auto bg-white ${fill ? "min-h-0 flex-1" : "max-h-[70vh]"}`}>
        {error ? <p className="p-4 text-sm font-semibold text-deplete">{error}</p> : null}
        <canvas ref={canvasRef} className="pdf-page-canvas mx-auto my-2 block bg-white" />
      </div>
    </div>
  );
}
