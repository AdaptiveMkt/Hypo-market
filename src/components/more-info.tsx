import { useState, type ReactNode } from "react";
import { Accordion } from "@/components/accordion";

/** Expand-in-place “more information” for educational cards. */
export function MoreInfo({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 card px-3 py-2 text-sm text-muted">
      <Accordion
        open={open}
        onToggle={() => setOpen((v) => !v)}
        panelClassName="pt-2"
        summary={
          <span className="font-display text-base text-navy">
            <span className="underline decoration-gold decoration-2 underline-offset-4">{title}</span>
            <span className="ml-2 text-xs font-sans font-normal text-muted">— more information</span>
          </span>
        }
      >
        <p>{summary}</p>
        {children}
      </Accordion>
    </div>
  );
}