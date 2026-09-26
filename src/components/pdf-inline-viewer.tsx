"use client";

import { useEffect, useRef, useState } from "react";

type PdfJsLib = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
};

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
};

type PdfPage = {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => {
    promise: Promise<void>;
  };
};

const PDFJS_SRC = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.js";

let pdfjsLoading: Promise<PdfJsLib> | null = null;

function loadPdfJs(): Promise<PdfJsLib> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  const existing = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
  if (existing?.getDocument) {
    existing.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    return Promise.resolve(existing);
  }
  if (pdfjsLoading) return pdfjsLoading;
  pdfjsLoading = new Promise((resolve, reject) => {
    const ready = () => {
      const lib = (window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
      if (!lib?.getDocument) {
        reject(new Error("PDF.js did not load."));
        return;
      }
      lib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      resolve(lib);
    };
    const prior = document.querySelector<HTMLScriptElement>(`script[src="${PDFJS_SRC}"]`);
    if (prior) {
      if ((window as Window & { pdfjsLib?: PdfJsLib }).pdfjsLib) ready();
      else prior.addEventListener("load", ready, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = PDFJS_SRC;
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("Could not load the PDF viewer."));
    document.head.appendChild(script);
  });
  return pdfjsLoading;
}

export function PdfInlineViewer({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("Opening the PDF…");
  const [pages, setPages] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host || !url) return;

    host.replaceChildren();
    setStatus("loading");
    setMessage("Opening the PDF…");
    setPages(0);

    (async () => {
      const pdfjs = await loadPdfJs();
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not read the PDF file.");
      const data = await res.arrayBuffer();
      if (cancelled) return;
      const doc = await pdfjs.getDocument({ data }).promise;
      if (cancelled) return;
      setPages(doc.numPages);
      const width = Math.max(280, host.clientWidth || host.parentElement?.clientWidth || 320);
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      for (let n = 1; n <= doc.numPages; n++) {
        if (cancelled) return;
        setMessage(`Drawing page ${n} of ${doc.numPages}…`);
        const page = await doc.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const scale = (width / base.width) * dpr;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.background = "#fff";
        canvas.setAttribute("aria-label", `${title}, page ${n} of ${doc.numPages}`);
        const wrap = document.createElement("div");
        wrap.className = "pdf-page";
        wrap.style.margin = n === 1 ? "0" : "12px 0 0";
        wrap.style.borderRadius = "8px";
        wrap.style.overflow = "hidden";
        wrap.style.boxShadow = "0 1px 4px rgba(27,58,75,0.18)";
        wrap.appendChild(canvas);
        host.appendChild(wrap);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("This browser cannot draw the PDF.");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
      if (!cancelled) {
        setStatus("ready");
        setMessage("");
      }
    })().catch((err) => {
      if (cancelled) return;
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "The PDF could not be shown here.");
    });

    return () => {
      cancelled = true;
    };
  }, [url, title]);

  return (
    <div className={className}>
      {status !== "ready" ? (
        <p className="mb-2 text-sm text-muted" role="status">
          {message}
        </p>
      ) : pages > 1 ? (
        <p className="mb-2 text-sm text-muted">
          {pages} pages — scroll to read, same view as desktop.
        </p>
      ) : null}
      {status === "error" ? (
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="mb-2 inline-block text-sm font-semibold text-teal underline"
        >
          Open the PDF in a new tab
        </a>
      ) : null}
      <div
        ref={hostRef}
        className="max-h-[70vh] overflow-auto rounded-lg border border-line bg-[#d7d2c8] p-2 sm:p-3"
        style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y pinch-zoom" }}
      />
    </div>
  );
}
