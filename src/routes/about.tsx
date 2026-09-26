import { createFileRoute, Link } from "@tanstack/react-router";
import { Cite, LicenseLookupLinks, SourceLinks } from "@/components/source-links";
import { SRC } from "@/lib/sources";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          The idea
        </h2>
        <p className="mb-3 text-pretty">
          Families often think of long-term care as a distant facility bill. This page
          treats care as a draw against a single “pool of money” — cash, investments, home
          equity, metals, annuity and life-insurance cash values, and other assets the
          person is willing to count. <strong>Excludable assets</strong> (spouse excluded
          assets) stay out of that countable pool.
        </p>
        <p className="text-pretty">
          You choose the state, the setting, when care is assumed to start, how many years
          to model, a cost-inflation rate, an investment return, and — optionally — a
          traditional reimbursement or asset-based long-term care policy. The model then
          compares care settings and inflation riders so you can see how assets would be
          used.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Cost sources
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            State figures are annualized from published monthly medians in the{" "}
            <Cite href={SRC.carescout}>CareScout</Cite> /{" "}
            <Cite href={SRC.genworth}>Genworth Cost of Care Survey 2025</Cite> (tables
            circulated in 2026).
          </li>
          <li>Assisted living uses the community monthly median × 12.</li>
          <li>Nursing facility uses private-room or semi-private monthly median × 12.</li>
          <li>
            Published “home care” is typically 44 hours per week. This model uses a
            planning estimate of <strong>2.8 × the 44-hour annual median</strong> for
            “24-hour home care.” That is a conversation starter, not a quote from an
            agency.
          </li>
        </ul>
        <SourceLinks className="mt-4" />
        <LicenseLookupLinks className="mt-4" />
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Long-term care insurance (in this model)
        </h2>
        <p className="mb-3 text-pretty">
          When <strong>Include a policy in this run</strong> is checked, choose traditional
          reimbursement or asset-based single premium. Traditional is treated as a
          tax-qualified reimbursement contract:
        </p>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            <strong>Daily / monthly benefit</strong> is entered in{" "}
            <strong>today's dollars</strong>. Monthly is daily × 365 ÷ 12.
            The annual max is daily × 365 if benefits are used every day. Daily
            benefit is limited to $100–$500.
          </li>
          <li>
            Two scenarios are always compared when a policy is included:{" "}
            <strong>level benefits</strong> (today's daily amount never
            changes) versus <strong>benefits that grow</strong> under the
            inflation rider you pick — 3% compound, 5% compound, or 5% simple.
            Compound multiplies the daily benefit each year. Simple adds a
            fixed percent of the original daily benefit each year.
          </li>
          <li>
            The policy is treated as a <strong>pool of money at purchase</strong>:
            today’s daily benefit × 365 × the benefit period (for example $130 × 365 × 5
            years). Lifetime* has no dollar cap. * Lifetime long-term care insurance may not be available. Contact a licensed insurance agent in your state of residence. If an inflation rider is selected, unused
            days are revalued at the inflated daily amount — so the remaining insurance
            pool grows until and during the claim. Insurance paid in a year is a draw on
            that pool; leftover cost is a draw on countable assets.
          </li>
          <li>
            <strong>Elimination period</strong> applies only to the first care year: those
            days are paid from the pool, then insurance begins.
          </li>
          <li>
            <strong>Annual premium</strong> is taken from countable assets each accumulation
            year after the assumed return. Premiums stop (waiver of premium) once care
            starts. A planning <strong>target premium</strong> for traditional coverage is 7%
            of adjusted gross household income when that income is entered; otherwise 2.5%
            of countable assets. Asset-based, annuity care, and hybrid life use 2.5% of that
            income as the default single premium. Premiums vary by
            age, health, marital status, and state of issue. Discuss with your LTC
            Insurance Representative or financial advisor for more insights,
            qualifications requirements and costs.
          </li>
          <li>
            Insurance never pays more than that year’s cost of care. The claim is
            applied <strong>insurance first</strong>, then leftover cost is a draw
            on countable assets. Money not drawn keeps compounding. After the
            insurance pool is used up, assets pay 100% of cost. Any leftover after
            assets are gone is a shortfall.
          </li>
        </ul>
        <p className="mt-3 text-pretty text-muted">
          Not modeled as underwriting or a claim decision: 2-of-6 ADL or cognitive
          triggers (they are described, not applied), shared-care numeric riders beyond
          the educational card, indemnity vs. reimbursement, restoration of benefits, or
          future premium-rate increases. Partnership Medicaid asset protection, spend-down,
          look-back, QIT, and MAPT are educational summaries you can turn on in section 4
          — they are not a determination of eligibility.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          <a
            href="https://fundingltcmarketplace.com/case-studies.html#georgia"
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
          >
            Tax-qualified LTC
          </a>{" "}
          policies
        </h2>
        <p className="mb-3 text-pretty">
          HIPAA (1996) created tax-qualified long-term care contracts under{" "}
          <Cite href={SRC.irc7702b}>IRC §7702B</Cite>. This model treats a traditional
          reimbursement policy as tax-qualified.
          It does not prepare a tax return.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            <strong>Benefits.</strong> Amounts paid to reimburse qualified long-term care
            services are generally excluded from income. Cash / per-diem policies are
            tax-free up to the IRS per-diem limit (<strong>$430 per day in 2026</strong>),
            or actual qualified costs if higher. Amounts above that may be taxable.
          </li>
          <li>
            <strong>Triggers.</strong> Qualified contracts typically require a licensed
            health-care practitioner to certify that the insured is unable to perform at
            least two of six activities of daily living for at least 90 days, or has a
            severe cognitive impairment, and that services are provided under a plan of
            care.
          </li>
          <li>
            <strong>Premiums.</strong> Eligible premiums may be treated as medical
            expenses, capped by age at year-end (2026 IRS: $500 age 40 or under; $930
            ages 41–50; $1,860 ages 51–60; $4,960 ages 61–70; $6,200 age 71+). Itemizers
            generally deduct medical expenses only above 7.5% of AGI. Self-employed and
            HSA rules differ. Hybrid/linked-benefit deposits usually are not deducted
            the same way; qualified LTC benefits from those contracts can still be
            received tax-free.
          </li>
          <li>
            Non-tax-qualified policies may use different triggers; benefits can be
            taxable. This page does not model NTQ contracts.
          </li>
        </ul>
        <p className="mt-3 text-pretty text-muted">
          Figures follow IRS Rev. Proc. 2025-32 for tax year 2026. Confirm with a tax
          professional. This is not tax advice.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          LTC insurance vs long-term care funds
        </h2>
        <p className="mb-3 text-pretty">
          <strong>Long-term care funds</strong> are countable assets earmarked (or simply
          available) to pay care. <strong>LTC insurance</strong> transfers part of that
          risk to a carrier. The calculator’s “no policy” run is the funds path;
          checking “include a policy” is the insurance path.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            Funds keep full control and remain for heirs if care never occurs. Care is
            paid dollar-for-dollar from the pool, including sequence-of-return and
            liquidity risk. Withdrawals from IRAs or gains may be taxable.
          </li>
          <li>
            Tax-qualified insurance pays the claim first (up to the daily or monthly
            cap). Countable assets only cover the leftover, so more of the pool can keep
            compounding. Traditional premiums are a use-it-or-lose-it cost if no claim
            occurs; asset-based designs may leave a death benefit.
          </li>
          <li>
            Insurance requires underwriting and later benefit triggers. Funds do not.
            Neither path is a Medicaid spend-down calculation.
          </li>
        </ul>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Asset-based single premium (hybrid / linked-benefit)
        </h2>
        <p className="mb-3 text-pretty">
          This option moves a lump sum from countable assets into a life insurance
          (or annuity) contract that can pay long-term care. It is not “use it or
          lose it” in the same way a traditional policy is: unused value can remain
          as a death benefit.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>
            The <strong>single premium</strong> is subtracted from countable assets
            at purchase and no longer earns the pool’s R.O.I.
          </li>
          <li>
            The <strong>LTC pool</strong> is premium × leverage (None / 1× face only, or 2×, 3×, or 4×).
            Monthly LTC is modeled at <strong>2% of the face</strong> (the premium)
            per month — a common acceleration schedule.
          </li>
          <li>
            A claim draws on that pool, subject to an elimination period (0 or 90
            days here). An optional inflation factor can grow the monthly cap.
          </li>
          <li>
            <strong>Death benefit</strong> starts at the premium and falls
            dollar-for-dollar as LTC is paid, down to the residual floor you pick
            (0%, 10%, or 20%).
          </li>
          <li>
            Leverage, monthly percent, and residual floors vary by age, health, and
            carrier. This is a planning sketch, not a quote.
          </li>
        </ul>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          The year-by-year math
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-pretty">
          <li>Start with today’s countable assets (primary residence can be excluded).</li>
          <li>Each year, the remaining pool is grown by the R.O.I. you entered.</li>
          <li>
            Until care starts, deduct the LTC premium (if a policy is included).
          </li>
          <li>
            Once care starts, that year’s cost equals today’s state median grown by CPI
            for each year from now.
          </li>
          <li>
            Insurance, if in force and still within remaining benefit days, pays the
            lesser of inflated daily benefit and daily cost, for the insurable days.
          </li>
          <li>
            The pool pays the rest, if any. Unpaid remainder is a shortfall.
          </li>
        </ol>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Policy exclusions and limitations
        </h2>
        <p className="text-pretty">
          This model assumes benefits are paid once care starts (after the elimination
          period). A real tax-qualified policy typically will not pay until a licensed
          practitioner certifies that the insured cannot perform two of six activities of
          daily living, or has a severe cognitive impairment, expected to last at least
          90 days. Contracts also commonly exclude or limit the waiting period;
          unlicensed or informal family care unless a rider allows it; preexisting
          conditions; care outside the U.S.; amounts already paid by Medicare or other
          insurance; and, in some forms, war, self-inflicted injury, or substance use.
          Underwriting can decline or rate the risk. Read the outline of coverage.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          What this does not do
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-pretty">
          <li>It does not apply taxes, surrender charges, or realtor fees.</li>
          <li>
            Homestead can be excluded from the countable pool; other exempt-vs-countable
            rules (vehicle, personal effects, community spouse resource allowance) are
            described in the Educational / Medicaid cards but are not auto-applied unless
            you enter them on the excludable line.
          </li>
          <li>It is not an illustration of any insurance or investment product.</li>
          <li>
            Real policies have exclusions, elimination periods, ADL/cognitive triggers,
            and underwriting. This model does not apply those filters to the claim.
          </li>
        </ul>
        <p className="mt-4 border-l-4 border-teal bg-paper px-4 py-3 text-sm text-muted">
          For education and discussion only. Confirm current local rates with providers. A
          licensed advisor should review any actual plan.
        </p>
      </section>
      <Link to="/" className="inline-block text-teal underline-offset-4 hover:underline">
        ← Back to calculator
      </Link>
    </main>
  );
}
