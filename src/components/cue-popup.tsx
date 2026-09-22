"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type CueMessage = {
  title: string;
  body: string;
  closeLabel?: string;
  applyOnClose?: boolean;
  actionLabel?: string;
  actionHint?: string;
  onAction?: () => void;
};

export function CuePopup({
  cue,
  onClose,
}: {
  cue: CueMessage;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  function dismiss() {
    if (cue.applyOnClose) cue.onAction?.();
    onClose();
  }

  useEffect(() => {
    (cue.onAction ? actionRef.current : closeRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cue, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/70 p-4"
      role="presentation"
      onClick={dismiss}
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
        {cue.actionHint ? <p className="mt-4 text-xs font-semibold text-navy">{cue.actionHint}</p> : null}
        <div className={`mt-4 flex flex-wrap items-center ${cue.onAction ? "justify-between" : "justify-end"} gap-2`}>
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
          >
            {cue.closeLabel ?? "Close"}
          </button>
          {cue.onAction && cue.actionLabel ? (
            <button
              ref={actionRef}
              type="button"
              onClick={() => {
                cue.onAction?.();
                onClose();
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-semibold text-masthead hover:brightness-105"
            >
              {cue.actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
