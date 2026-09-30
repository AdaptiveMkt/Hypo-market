import { createFileRoute, Link } from "@tanstack/react-router";
import { Cite } from "@/components/source-links";
import { HOME24_METHOD } from "@/lib/costs";
import { SRC } from "@/lib/sources";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          The question
        </h2>
        <p className="text-pretty text-lg text-navy">
          Show a client how quickly long-term care could use the assets they have
          accumulated, and what changes if insurance pays first.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          The asset pool
        </h2>
        <p className="mb-3 text-pretty">
          This model treats care as a draw against one pool of money: cash, investments,
          home equity if you choose to count it, metals, annuity and life-insurance cash
          values, and other assets you are willing to count. Excludable assets stay out of
          that pool.
        </p>
        <p className="text-pretty">
          You choose the state, the setting, when care is assumed to start, how many years
          to model, a cost-inflation rate, an investment return, and — optionally — a
          long-term care insurance design. The year-by-year run shows care cost, what
          insurance pays, and what is left for countable assets.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Assumptions
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-pretty">
          <li>Start with today’s countable assets. The primary residence can be excluded.</li>
          <li>Each year before care, the remaining pool grows at the return you enter, after the tax rate on that return.</li>
          <li>If a policy is included, the premium or deposit is a use of assets. Premiums stop once care starts.</li>
          <li>Once care starts, that year’s cost is today’s planning median grown by the inflation rate you picked.</li>
          <li>Insurance, if still in force, pays first up to the benefit. Countable assets pay the rest. Anything unpaid is a shortfall.</li>
        </ol>
        <p className="mt-4 text-pretty">
          Care prices are rounded planning medians. Confirm a location on the{" "}
          <Cite href={SRC.ltcNews}>LTC News Cost of Care Calculator</Cite>. It is a
          nationwide private-pay calculator and is not an insurance-company survey.
        </p>
        <p className="mt-3 text-pretty text-sm text-muted">{HOME24_METHOD}</p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Insurance in this model
        </h2>
        <p className="text-pretty">
          This model simplifies Long-Term Care Insurance. Actual benefits depend on policy
          language, benefit eligibility, elimination periods, reimbursement or cash
          provisions, benefit maximums, inflation provisions, and other contractual terms.
        </p>
        <p className="mt-3 text-pretty">
          A traditional benefit is modeled as a pool: today’s daily benefit × 365 × the
          benefit period. An inflation choice can grow that daily amount. An asset-based,
          annuity, or hybrid design is modeled as a deposit taken from countable assets,
          with a leverage multiple and a remaining death benefit. None of these figures is
          a quote.
        </p>
        <p className="mt-3 text-pretty">
          If a premium or deposit is left blank, the model may insert an illustrative
          placeholder. That placeholder is not a recommended premium and not an insurance
          quote. Enter the actual proposed premium or deposit when you have one. A
          separate consumer worksheet cautions that a premium above 7% of income may be
          hard to sustain. That caution is not a target for this model.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          What stays out of this page
        </h2>
        <p className="text-pretty">
          Medicaid, Medicare, VA benefits, tax rules, Partnership, life settlements, and
          professional license lookups support the report when you open those sections.
          They are not the calculator. Sources are grouped on{" "}
          <Link to="/sources" className="font-semibold text-navy underline">
            Sources and methodology
          </Link>
          . The NAIC Shopper’s Guide and Personal Worksheet are linked from Section 3 and
          can be included in the report.
        </p>
      </section>
      <Link to="/" className="inline-block text-teal underline-offset-4 hover:underline">
        ← Back to calculator
      </Link>
    </main>
  );
}
