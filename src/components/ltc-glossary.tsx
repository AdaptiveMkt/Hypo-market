import { useState } from "react";
import { Accordion, TitleCollapse } from "@/components/accordion";
import { LTC_GLOSSARY } from "@/lib/ltc-glossary";

function GlossaryTerm({ term, definition }: { term: string; definition: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Accordion
      open={open}
      onToggle={() => setOpen((v) => !v)}
      className="border-b border-line"
      panelClassName="pb-3 pt-1"
      summary={<span className="font-semibold text-navy">{term}</span>}
    >
      <p className="text-sm leading-relaxed text-muted">{definition}</p>
    </Accordion>
  );
}

export function LtcGlossaryList() {
  return (
    <dl className="divide-y divide-line">
      {LTC_GLOSSARY.map((row) => (
        <div key={row.term} className="py-2">
          <dt className="font-semibold text-navy">{row.term}</dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{row.definition}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LtcGlossaryTerms() {
  return (
    <div>
      {LTC_GLOSSARY.map((row) => (
        <GlossaryTerm key={row.term} term={row.term} definition={row.definition} />
      ))}
    </div>
  );
}

export function LtcGlossary({
  defaultOpen = false,
  className = "mt-3",
}: {
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <TitleCollapse title="Long-term care glossary of terms" defaultOpen={defaultOpen} className={className}>
      <p className="mb-2 text-xs text-muted">
        Click a word for the definition used in this hypothetical. Educational — not a
        policy contract, outline of coverage, or legal advice.
      </p>
      <LtcGlossaryTerms />
    </TitleCollapse>
  );
}
