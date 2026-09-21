import { Link } from "@tanstack/react-router";
import { AmgName, Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";

/** Disclaimer + source links shown with the on-screen NAIC card. */
export function NaicCardDisclaimer() {
  return (
    <div className="mt-4 border-t border-line pt-3 text-sm leading-snug text-muted">
      <p>
        Official NAIC consumer materials used in this hypothetical:{" "}
        <Cite href={SRC.naicShopper}>A Shopper’s Guide to Long-Term Care Insurance (PDF)</Cite>
        {" · "}
        <Cite href={`${SRC.naicShopper}#page=48`}>Personal Worksheet and “Things You Should Know,” pages 48–51</Cite>
        {" · "}
        <Cite href={SRC.naicSuitability}>NAIC / IIPRC Personal Worksheet (suitability PDF)</Cite>
        {" · "}
        <Cite href={SRC.naicModel640}>NAIC Long-Term Care Insurance Model Act #640</Cite>
        {" · "}
        <Cite href={SRC.naicLtc}>NAIC Long-Term Care Insurance topic</Cite>
        . Many states require the Shopper’s Guide at sale. The worksheet is an educational copy — not a carrier application or a state filing.
      </p>
      <p className="mt-2 font-bold amt-red">
        The National Association of Insurance Commissioners (
        <Cite href={SRC.naicLtc}>NAIC</Cite>
        ) has not endorsed or approved this hypothetical as an official planning tool for the organization. Contact a professionally designated advisor or consultant for legal, tax, and financial advice.
      </p>
    </div>
  );
}

/** Always printed on the last pages of View and PDF. */
export function NaicLastPages() {
  return (
    <>
      <section className="report-block border-l-4 border-teal bg-paper px-4 py-3 text-sm text-muted">
        <p className="font-display text-lg text-navy">NAIC consumer materials</p>
        <p className="mt-2">
          These NAIC publications are part of the source information for this hypothetical.
          They are consumer and producer education — not a quote, not an application, and
          not <AmgName /> or Funding LTC Marketplace advice.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong className="text-navy">NAIC Shopper’s Guide to Long-Term Care Insurance. </strong>
            <Cite href={SRC.naicShopper}>Download the PDF</Cite>
            {" "}
            (benefit triggers, elimination periods, inflation options, exclusions, free-look).
            Many states require this guide at sale.
          </li>
          <li>
            <strong className="text-navy">NAIC Long-Term Care Insurance Personal Worksheet (suitability). </strong>
            <Cite href={SRC.naicSuitability}>Official PDF (IIPRC application-form standards)</Cite>
            . The Personal Worksheet and “Things You Should Know Before You Buy
            Long-Term Care Insurance” are pages 48–51 of that guide.{" "}
            <Cite href={`${SRC.naicShopper}#page=48`}>Open pages 48–51</Cite>
            . Educational copy of the personal worksheet used to discuss ability to pay,
            goals, and existing coverage. Issuers file their own worksheet with the state.
          </li>
        </ul>
        <p className="no-print mt-3">
          <Link
            to="/suitability"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy bg-navy px-4 py-2 text-sm font-semibold text-cream hover:bg-teal"
          >
            Open fillable suitability worksheet
          </Link>
        </p>
      </section>
    </>
  );
}