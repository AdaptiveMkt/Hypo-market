import { DISCLOSURE_CARD_TITLE } from "@/lib/disclaimer";
import { TitleCollapse } from "@/components/accordion";
import { DisclaimerCard } from "@/components/disclaimer-card";

/** Always printed in View and PDF as the last pages when Disclosure is selected. */
export function TermsOfUseBlocks() {
  return (
    <section className="report-block report-last-page border-l-4 border-teal bg-paper px-4 py-3 text-sm text-muted">
      <TitleCollapse title={DISCLOSURE_CARD_TITLE} className="mt-0" defaultOpen>
        <DisclaimerCard className="mt-2" />
      </TitleCollapse>
    </section>
  );
}
