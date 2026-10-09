import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DomainNote } from "@/components/subscription-links";

const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

export const Route = createFileRoute("/start")({
  component: Start,
  head: () => ({
    meta: [
      { title: "Show the drawdown before you show a premium" },
      {
        name: "description",
        content:
          "A one-sitting long-term care asset model for licensed insurance professionals. Show how fast care can use a client's assets, and what changes if insurance pays first.",
      },
      { property: "og:title", content: "Show the drawdown before you show a premium" },
      {
        property: "og:description",
        content:
          "For licensed insurance professionals. Run a long-term care asset hypothetical your client can follow, then license a branded version.",
      },
      { property: "og:url", content: "https://www.preserve-your-assets.com/start" },
    ],
  }),
});

function campaignHref(path: string, search: string) {
  const incoming = new URLSearchParams(search);
  const next = new URLSearchParams();
  CAMPAIGN_KEYS.forEach((key) => {
    const value = incoming.get(key);
    if (value) next.set(key, value);
  });
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}

function CampaignLink({
  to,
  className,
  children,
}: {
  to: string;
  className: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(to);
  useEffect(() => {
    setHref(campaignHref(to, window.location.search));
  }, [to]);
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

const primary =
  "inline-flex min-h-12 items-center justify-center rounded-lg bg-teal px-5 text-center text-base font-bold text-cream hover:brightness-110";
const secondary =
  "inline-flex min-h-12 items-center justify-center rounded-lg border border-teal px-5 text-center text-base font-bold text-teal hover:bg-teal/10";

function Ctas({ id }: { id?: string }) {
  return (
    <div id={id} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <CampaignLink to="/" className={primary}>
        Run the assessment
      </CampaignLink>
      <CampaignLink to="/payment-selection" className={secondary}>
        License it — $9.98/mo or $99/yr
      </CampaignLink>
    </div>
  );
}

function Start() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6" tabIndex={-1}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
        For licensed insurance and financial professionals
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight text-navy sm:text-5xl">
        Show a client, in one sitting, how fast long-term care can spend a lifetime of assets.
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-navy">
        Before a carrier illustration. Before you guess which benefit to recommend. And before
        the appointment ends with “let me think about it.”
      </p>
      <div className="mt-6">
        <Ctas id="run" />
      </div>
      <p className="mt-3 text-sm text-muted">
        You can run it now, with a client or without their personal information. Licensing is optional.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-navy">The meeting stalls on the wrong number</h2>
        <p className="mt-3 leading-relaxed">
          Your client already worries about care. What they do not have is a picture of their own
          money leaving. A premium answers “what does this cost me?” It does not answer “what
          happens to the assets if I do nothing?”
        </p>
        <ul className="mt-4 space-y-2 text-navy">
          <li>A brochure names a setting. It does not show the year the pool runs out.</li>
          <li>Home care, assisted living, and a nursing home draw on the same assets at different speeds.</li>
          <li>If you cannot show that draw, the conversation stays polite and the plan stays unfinished.</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-navy">Start with their assets. Then show insurance paying first.</h2>
        <p className="mt-3 leading-relaxed">
          Preserve Your Assets is a long-term care asset utilization model. Enter the countable
          assets, where care would be received, and when you think it might start. The run shows
          the year-by-year cost, what insurance pays, the copay from assets, and what is left.
        </p>
        <p className="mt-3 leading-relaxed">
          Compare traditional long-term care insurance, an asset-based design, annuity care, and a
          hybrid life and long-term care policy. It is a hypothetical, not a quote and not a
          promise that the assets will be protected. Carrier illustrations still come from you.
        </p>
      </section>

      <section className="mt-12 card-xl p-5">
        <h2 className="font-display text-2xl text-navy">Built for the appointment, not a brochure</h2>
        <ul className="mt-4 space-y-3">
          <li>Care costs are pulled from the LTC News Cost of Care Calculator, not from a carrier brand.</li>
          <li>Run it with the client, or incognito while you prepare.</li>
          <li>The report is something they can take with them.</li>
          <li>
            Questions about a branded version: call or text{" "}
            <a className="font-semibold text-teal underline underline-offset-2" href="tel:3217957516">
              321-795-7516
            </a>{" "}
            or visit{" "}
            <a
              className="font-semibold text-teal underline underline-offset-2"
              href="https://www.adaptivemarketingresources.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Adaptive Marketing Group
            </a>
            .
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-navy">What changes in the appointment</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Open with their assets, not your product.",
            "See the unpaid shortfall in the year it happens.",
            "Put four insurance designs next to the same care bill.",
            "Change the state, the setting, or the copay and run it again.",
            "Leave personal information off the page when you are only preparing.",
            "Hand them a report instead of a speech.",
          ].map((item) => (
            <li key={item} className="rounded-lg border border-line bg-paper px-4 py-3 text-navy">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-navy">What they actually see</h2>
        <ol className="mt-4 space-y-3">
          {[
            "Countable assets at risk, and whether the home is in or out.",
            "Where and when care is assumed to start.",
            "The insurance design, or the run with no policy.",
            "A year-by-year: cost, insurance paid, copay, and what remains.",
          ].map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-cream">
                {index + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 rounded-xl border-2 border-teal p-5">
        <h2 className="font-display text-2xl text-navy">Run it today. Brand it only if you want it as your own.</h2>
        <p className="mt-3 leading-relaxed">
          Use the model on this site now. If you want the same tool with your name and your
          agency on the report, we brand it and build your information in.
        </p>
        <h3 className="mt-6 font-display text-xl text-navy">Included when you license it</h3>
        <ul className="mt-3 space-y-2">
          <li>The asset utilization model, ready for the next appointment.</li>
          <li>Your advisor information on the report.</li>
          <li>Traditional, asset-based, annuity care, and hybrid designs.</li>
          <li>Incognito runs when you are preparing, not presenting.</li>
          <li>A commission view for what a year of these conversations can mean to the practice.</li>
        </ul>
        <p className="mt-6 text-lg font-semibold text-navy">
          $9.98 a month, and you can stop when you no longer need it. Or $99 for the year, with
          the first two months included.
        </p>
        <DomainNote className="mt-2" />
        <p className="mt-4 text-sm leading-relaxed text-muted">
          There is no fake countdown. The deadline is the next client sitting across from you.
          Until this is yours, that meeting still starts from a blank page.
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          Run the model before you pay. The monthly license stops when you stop it. You are not
          asked to buy insurance, and you are not asked to bring a client’s file to the first run.
        </p>
        <div className="mt-6">
          <Ctas />
        </div>
        <h3 className="mt-8 font-display text-xl text-navy">What happens when you click</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>You open the model.</li>
          <li>You enter the assumptions, or you run it without a client’s personal information.</li>
          <li>You read the year-by-year with them, or on your own.</li>
          <li>If you want it branded, you choose monthly or annual and we start the build.</li>
        </ol>
      </section>

      <section className="mt-12 border-t border-line pt-6">
        <h2 className="font-display text-2xl text-navy">P.S.</h2>
        <p className="mt-3 leading-relaxed">
          The premium is not the first number they need. The first number is how fast care can
          use the assets they already have. Show that. Then talk about insurance.
        </p>
        <div className="mt-6">
          <Ctas />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted">
          Educational hypothetical only. Not a quote, illustration, or a promise of benefits.
          Actual premiums, underwriting, and policy language come from the carrier and from you.{" "}
          <Link to="/copyright" className="text-teal underline underline-offset-2">
            Disclosure and terms
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
