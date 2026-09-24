"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StepperField } from "@/components/field-picker";

export type CueActionId = "industry" | "protect" | "copay-alt";

export type CueLink = {
  kicker?: string;
  label: string;
  href: string;
  external?: boolean;
};

export type CueMessage = {
  title: string;
  body: string;
  closeLabel?: string;
  applyOnClose?: boolean;
  actionLabel?: string;
  actionHint?: string;
  action?: CueActionId;
  secondaryLabel?: string;
  secondaryAction?: CueActionId;
  note?: string;
  links?: CueLink[];
  /** When set, the notice includes a co-pay percent the visitor can change before running. */
  copayPct?: number;
};

export function CuePopup({
  cue,
  onClose,
  onAction,
  onCopayChange,
}: {
  cue: CueMessage;
  onClose: () => void;
  onAction?: (id: CueActionId, extra?: { copayPct?: number }) => void;
  onCopayChange?: (pct: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);
  const [copay, setCopay] = useState(cue.copayPct ?? 80);

  function closeOnly() {
    onClose();
  }

  function closeAndUse() {
    if (cue.action) onAction?.(cue.action);
    onClose();
  }

  function setCopayPct(n: number) {
    const next = Math.min(100, Math.max(0, Math.round(n)));
    setCopay(next);
    onCopayChange?.(next);
  }

  useEffect(() => {
    setCopay(cue.copayPct ?? 80);
  }, [cue.copayPct, cue.title]);

  useEffect(() => {
    (cue.action ? actionRef.current : closeRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOnly();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cue, onClose, onAction]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/70 p-4"
      role="presentation"
      onClick={closeOnly}
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
        {cue.note ? <p className="mt-3 text-xs leading-relaxed text-muted">{cue.note}</p> : null}
        {cue.links?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {cue.links.map((link) => (
              <li key={link.href}>
                {link.kicker ? <span className="font-semibold text-navy">{link.kicker}: </span> : null}
                <a
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="source-link font-semibold text-link underline underline-offset-2"
                  onClick={
                    link.external
                      ? undefined
                      : (e) => {
                          e.preventDefault();
                          const id = link.href.replace(/^#/, "");
                          onClose();
                          window.setTimeout(() => {
                            if (window.location.hash === link.href) {
                              window.dispatchEvent(new HashChangeEvent("hashchange"));
                            } else {
                              window.location.hash = link.href;
                            }
                            document.getElementById(id)?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 40);
                        }
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {cue.copayPct != null ? (
          <div className="mt-4 rounded-lg border border-line bg-cream px-3 py-3">
            <label className="text-sm font-semibold text-navy" htmlFor="cue-copay-pct">
              Change the co-pay share, then run
            </label>
            <p className="mt-1 text-xs text-muted">
              Percent of countable assets at claim you want left. The rest can pay care the insurance does not cover.
            </p>
            <StepperField
              id="cue-copay-pct"
              value={copay}
              onChange={(raw) => setCopayPct(Number(raw) || 0)}
              step={5}
              min={0}
              max={100}
            />
          </div>
        ) : null}
        {cue.actionHint ? <p className="mt-4 text-xs font-semibold text-navy">{cue.actionHint}</p> : null}
        <div className="mt-4 flex flex-col gap-2">
          <div className={`flex flex-wrap items-center ${cue.action ? "justify-between" : "justify-end"} gap-2`}>
            <button
              ref={closeRef}
              type="button"
              onClick={cue.applyOnClose ? closeAndUse : closeOnly}
              className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
            >
              {cue.closeLabel ?? "Close"}
            </button>
            {cue.action && cue.actionLabel ? (
              <button
                ref={actionRef}
                type="button"
                onClick={closeAndUse}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-semibold text-masthead hover:brightness-105"
              >
                {cue.actionLabel}
              </button>
            ) : null}
          </div>
          {cue.secondaryAction && (cue.secondaryLabel || cue.copayPct != null) ? (
            <button
              type="button"
              onClick={() => {
                onAction?.(cue.secondaryAction!, cue.copayPct != null ? { copayPct: copay } : undefined);
                onClose();
              }}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-teal bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-105"
            >
              {cue.copayPct != null ? `RUN ${copay}% Co-Pay ALTERNATIVE` : cue.secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
