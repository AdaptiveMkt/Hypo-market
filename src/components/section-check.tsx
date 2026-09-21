import type { ReactNode } from "react";
import { Accordion } from "@/components/accordion";
import { DETAIL_HINTS, DETAIL_INDEX, type DetailFlags, type DetailId } from "@/lib/report-options";

export function SectionCheck({
  id,
  title,
  details,
  onChange,
  checked,
  onChecked,
  children,
  className = "mt-3",
  hintOn,
  hintOff,
  hint,
  n,
}: {
  id?: DetailId;
  title: ReactNode;
  details?: DetailFlags;
  onChange?: (next: DetailFlags) => void;
  checked?: boolean;
  onChecked?: (on: boolean) => void;
  children: ReactNode;
  className?: string;
  hintOn?: string;
  hintOff?: string;
  hint?: string;
  n?: number;
}) {
  const on = id && details ? details[id] : Boolean(checked);
  const setOn = (next: boolean) => {
    if (id && details && onChange) onChange({ ...details, [id]: next });
    else onChecked?.(next);
  };
  const num = n ?? (id ? DETAIL_INDEX[id] : undefined);
  const blurb =
    hint ??
    (id ? DETAIL_HINTS[id] : undefined) ??
    (on
      ? (hintOn ?? "Expanded · included in View and PDF.")
      : (hintOff ?? "Collapsed · not in the PDF."));
  return (
    <div
      className={`card px-4 py-4 ${on ? className : `${className} no-print`}`}
      data-section={id ?? "toggle"}
    >
      <Accordion
        open={on}
        onToggle={() => setOn(!on)}
        className="mt-0"
        panelClassName="border-t border-line pt-3"
        leading={
          <input
            type="checkbox"
            className="mt-2 size-4 shrink-0 accent-teal"
            checked={on}
            aria-label={`Include ${typeof title === "string" ? title : "this section"} in the report`}
            onChange={(e) => setOn(e.target.checked)}
          />
        }
        summary={
          <span>
            <span className="inline-flex items-baseline gap-2">
              {num ? (
                <span className="tabular-nums text-teal">{String(num).padStart(2, "0")}</span>
              ) : null}
              <span className="font-display text-base text-navy">{title}</span>
            </span>
            <span className="mt-0.5 block text-xs font-normal text-muted">
              {blurb}{" "}
              {on ? "Click the title to collapse." : "Click the title to expand."}
            </span>
          </span>
        }
      >
        {children}
      </Accordion>
    </div>
  );
}