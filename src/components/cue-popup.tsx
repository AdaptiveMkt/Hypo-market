"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type CueMessage = { title: string; body: string };

export function CuePopup({
  cue,
  onClose,
}: {
  cue: CueMessage;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cue, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/70 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="celeste-cue-title"
        className="relative w-full max-w-lg rounded-xl border border-line bg-paper p-5 shadow-[0_16px_48px_rgba(27,58,75,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-[0.14em] text-teal">Celeste</p>
        <h2 id="celeste-cue-title" className="mt-1 font-display text-xl text-navy">
          {cue.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-navy whitespace-pre-line">{cue.body}</p>
        <div className="mt-5 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
