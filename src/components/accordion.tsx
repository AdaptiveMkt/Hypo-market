import { useEffect, useState, type ReactNode } from "react";

export function Accordion({
  open,
  onToggle,
  summary,
  leading,
  trailing,
  children,
  className = "",
  panelClassName = "",
}: {
  open: boolean;
  onToggle?: () => void;
  summary: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const kick = () => window.dispatchEvent(new Event("resize"));
    kick();
    const t = window.setTimeout(kick, 80);
    const t2 = window.setTimeout(kick, 420);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [open]);
  return (
    <div className={className} data-accordion={open ? "open" : "closed"}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {leading}
          <button
            type="button"
            className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-2 text-left no-print"
            aria-expanded={open}
            onClick={onToggle}
          >
            <span
              aria-hidden
              className={`mt-1 inline-block shrink-0 text-gold-ink motion-reduce:transition-none ${
                open ? "rotate-90" : "rotate-0"
              }`}
              style={{ transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              ▸
            </span>
            <span className="min-w-0 flex-1 break-words text-left">{summary}</span>
          </button>
        </div>
        {trailing ? <div className="min-w-0 sm:shrink-0 sm:pl-0 pl-7">{trailing}</div> : null}
      </div>
      <div
        className={`accordion-panel motion-reduce:transition-none ${
          open ? "overflow-visible" : "pointer-events-none overflow-hidden"
        }`}
        style={{
          maxHeight: open ? 12000 : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition:
            "max-height 380ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms ease, transform 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        aria-hidden={!open}
      >
        <div className={panelClassName}>{children}</div>
      </div>
    </div>
  );
}

export function TitleCollapse({
  title,
  children,
  defaultOpen = false,
  className = "mt-3",
  hint,
  pdfChecked,
  onPdfChange,
  pdfLocked = false,
  openOnHash,
  open: openProp,
  onOpenChange,
  extra,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  hint?: string;
  pdfChecked?: boolean;
  onPdfChange?: (checked: boolean) => void;
  pdfLocked?: boolean;
  openOnHash?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  extra?: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : internalOpen;
  function setOpen(next: boolean) {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  }
  useEffect(() => {
    if (!openOnHash) return;
    const openFromHash = (e?: Event) => {
      const fromEvent =
        e && "detail" in e ? String((e as CustomEvent).detail ?? "") : "";
      const fromLoc = window.location.hash.replace(/^#/, "");
      const hit =
        fromEvent === openOnHash || (!fromEvent && fromLoc === openOnHash);
      if (!hit) return;
      setOpen(true);
      requestAnimationFrame(() => {
        document.getElementById(openOnHash)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };
    window.addEventListener("hashchange", openFromHash);
    window.addEventListener("aum:open-disclosure", openFromHash);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      window.removeEventListener("aum:open-disclosure", openFromHash);
    };
  }, [openOnHash]);
  const pdfBox = onPdfChange || pdfLocked ? (
    <label
      className={`inline-flex items-center gap-2 text-xs font-semibold text-navy ${
        pdfLocked ? "cursor-not-allowed opacity-90" : "cursor-pointer"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className="size-4 accent-teal"
        checked={pdfLocked ? true : !!pdfChecked}
        disabled={pdfLocked}
        onChange={(e) => {
          if (pdfLocked) return;
          onPdfChange?.(e.target.checked);
        }}
        aria-label={pdfLocked ? "Required in PDF" : "Add to download PDF"}
      />
      <span className="whitespace-nowrap">{pdfLocked ? "Required in PDF" : "Add to PDF"}</span>
    </label>
  ) : undefined;
  const trailing =
    extra || pdfBox ? (
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {pdfBox}
      </div>
    ) : undefined;
  return (
    <Accordion
      open={open}
      onToggle={() => setOpen(!open)}
      className={className}
      trailing={trailing}
      panelClassName="border-t border-line pt-2"
      summary={
        <span className="block">
          <span className="font-display text-base leading-snug text-navy">{title}</span>
          {hint ? <span className="mt-1 block text-xs font-normal leading-snug text-muted">{hint}</span> : null}
        </span>
      }
    >
      {children}
    </Accordion>
  );
}
