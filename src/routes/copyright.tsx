import { createFileRoute, Link } from "@tanstack/react-router";
import { TitleCollapse } from "@/components/accordion";
import { DisclaimerCard } from "@/components/disclaimer-card";
import { AmgName, Cite, LicenseLookupLinks, LinkedCopy, SourceLinks } from "@/components/source-links";
import { TERMS_LIABILITY_SECTIONS } from "@/lib/disclaimer";

export const Route = createFileRoute("/copyright")({
  component: CopyrightTerms,
  head: () => ({
    meta: [{ title: "Copyright and terms of use" }],
  }),
});

const YEAR = new Date().getFullYear();

function CopyrightTerms() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Copyright and terms of use
        </h2>
        <p className="text-sm text-muted">
          Long Term Care Asset Utilization Modeling · <AmgName />
        </p>
        <p className="mt-4 text-pretty">
          © {YEAR} <AmgName />. All rights
          reserved.
        </p>
        <p className="mt-3 text-pretty">
          The text, layout, charts, worksheets, formulas as presented, educational cards,
          and software that make up this site are original works of authorship. They are
          protected by United States copyright law. You do not need a © notice for that
          protection to exist; the notice is here so visitors know the owner claims those
          rights.
        </p>
        <p className="mt-3 text-pretty">
          These terms of use include the liability disclosures and hold-harmless language
          later on this page. Using the calculator, View report, or PDF is agreement to
          those terms.
        </p>
      </section>

      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          What you may do
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            Use this model for personal, family, or client educational planning — a
            hypothetical only.
          </li>
          <li>
            Run scenarios, save a PDF of <em>your</em> results, and share that PDF with
            the client or household it was prepared for.
          </li>
          <li>
            Link to this site. Do not frame it or present it as your own product.
          </li>
        </ul>
      </section>

      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          What you may not do
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            Copy, scrape, republish, reverse-engineer, or redistribute the site, code,
            text, tables, or charts.
          </li>
          <li>
            Sell, white-label, or embed this model as your own calculator, course, or
            software.
          </li>
          <li>
            Remove copyright notices, logos, or disclaimers from reports or pages.
          </li>
          <li>
            Use outputs as an insurance illustration, quote, Medicaid determination, or
            legal/tax advice.
          </li>
        </ul>
        <p className="mt-3 text-pretty">
          Permission for any other use requires written consent from <AmgName />.
        </p>
      </section>

      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Disclosure and Terms of Use
        </h2>
        <p className="mt-3 text-pretty">
          This model is not financial, legal, tax, Medicaid, or insurance advice. It is
          not an illustration, offer, solicitation, or quote of any policy. State care
          costs are rounded annual medians from published surveys. Local prices, policy
          language, underwriting, and Medicaid rules differ. Confirm with a qualified
          long-term care insurance representative or financial advisor who holds an LTC
          designation such as <Cite href="https://www.ltc-cltc.com/cltc/findCLTC/">CLTC</Cite> or{" "}
          <Cite href="https://www.ahip.org/">LTCP</Cite>, and with an elder-law or Medicaid specialist
          where eligibility is the question.
        </p>
      </section>

      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Sources
        </h2>
        <SourceLinks />
        <LicenseLookupLinks className="mt-6" />
      </section>

      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Liability disclosures and hold harmless
        </h2>
        <p className="text-pretty text-muted">
          <LinkedCopy text="The following is part of these terms of use. It is intended to make clear who this model is for, what it is not, and that Adaptive Marketing Group does not assume professional or fiduciary liability for decisions made with it. It does not replace advice from a licensed professional, and it cannot waive a CFP® professional’s fiduciary duty when they provide Financial Advice." />
        </p>
        <DisclaimerCard className="mt-4" />
        {TERMS_LIABILITY_SECTIONS.map((p) => (
          <TitleCollapse key={p.heading} title={p.heading} className="mt-3">
            <p className="text-pretty text-sm text-muted">
              <LinkedCopy text={p.body} />
            </p>
          </TitleCollapse>
        ))}
      </section>

      <section className="card-xl p-5">
        <p className="text-pretty">
          <AmgName />
        </p>
        <p className="mt-6">
          <Link to="/" className="font-semibold text-teal underline underline-offset-2">
            Back to the calculator
          </Link>
        </p>
      </section>
    </main>
  );
}
