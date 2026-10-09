import { createFileRoute } from "@tanstack/react-router";

const URL =
  "https://www.preserve-your-assets.com/start?utm_source=facebook&utm_medium=paid&utm_campaign=agents";

const AD_ONE = `This cannot wait until the next blank appointment.

A licensed agent sat with a couple last week. The couple had saved for a long time. The old talk started with a premium. This talk started with a picture.

The picture showed the assets. Then it showed care. Home care. Assisted living. A nursing home. Same money. Three different speeds.

Then the picture showed what changes when a policy pays first.

The room got quiet. Then came a smile. The need was plain. Protect the assets. Or let the assets pay the care.

That is the whole job. And the next sit-down is the deadline.

Care can touch millions of retirees. Most talks still start on the wrong number. This picture starts on the assets. An agent who opens it this week can use it in the very next meeting.

We built this for a licensed life or long-term care agent. A person with decades in long-term care did the work. Not as a brand speech. Not as a fancy promise.

It shows a client the money path. In one sitting. The client can see a need to protect assets. Or the client can see that the assets can cover the bills.

The same run can show traditional coverage. An asset-based plan. Annuity care. Or a hybrid life plan. One care bill. Four ways insurance can pay first.

A report can go home with the client. Change the state. Change the setting. Change the copay. Run it again the same day.

No quote. No promise of benefits. A carrier picture still comes from the agent.

The license is $9.98 a month. Stop any time. Or $99 for the year. The year plan includes the first two months.

Run it with a client today. Or run it first with no personal details at all.

The agents who move first will walk into the next appointment with the picture already open. Click now. See what they are doing.`;

const AD_TWO = `Stop scrolling. This update is live for licensed agents right now.

Millions of retirees will face long-term care. A licensed agent now has a simple picture for that talk. The time to open it is before the next client sits down.

The picture starts with the assets. Not the premium. It shows home care. Assisted living. A nursing home. Same nest egg. Three speeds.

Then it shows what changes when insurance pays first.

A client can see the need to protect those assets. Or a client can see that the assets can cover the care. Either way, the next step is clear. Waiting keeps the meeting on a blank page.

We built this for the agent in the chair. Life agents. Long-term care agents. Financial professionals who hold the insurance license. The person behind it has spent decades around long-term care. The tool does not sell a brand. It shows a yes or a no.

The same sit-down can compare a traditional plan, an asset-based plan, annuity care, and a hybrid. One bill. Four paths.

It is a hypothetical. Not a quote. Not a promise. Carrier numbers still come from the agent.

An agent can run it in the meeting today. Or run it first with no names and no personal details.

The license is $9.98 a month. Or $99 for the year, with the first two months included.

Do not save this for later. Agents who want the next sit to turn into a plan are opening the picture now. Click and see it.`;

export const Route = createFileRoute("/facebook-ads")({
  component: FacebookAds,
  head: () => ({
    meta: [
      { title: "Facebook ads — licensed agents" },
      {
        name: "description",
        content: "Urgent Facebook ads for licensed insurance agents. Images, copy, and targeting in one place.",
      },
    ],
  }),
});

function AdCard({
  kicker,
  image,
  alt,
  copy,
  headline,
  description,
}: {
  kicker: string;
  image: string;
  alt: string;
  copy: string;
  headline: string;
  description: string;
}) {
  return (
    <article className="card-xl overflow-hidden">
      <img src={image} alt={alt} className="w-full bg-black" />
      <div className="space-y-4 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">{kicker}</p>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-navy">{copy}</p>
        <dl className="space-y-2 border-t border-line pt-4 text-sm">
          <div>
            <dt className="font-semibold text-navy">Headline</dt>
            <dd>{headline}</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy">Description</dt>
            <dd>{description}</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy">Button</dt>
            <dd>Learn more</dd>
          </div>
          <div>
            <dt className="font-semibold text-navy">Link</dt>
            <dd>
              <a className="break-all font-semibold text-teal underline underline-offset-2" href={URL}>
                {URL}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function FacebookAds() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6" tabIndex={-1}>
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">Urgent · licensed agents only</p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-navy">Facebook ads</h1>
        <p className="mt-3 text-lg leading-relaxed">
          Two ads for the Adaptive Marketing Group page. Both push a licensed agent to open the
          picture before the next sit-down.
        </p>
      </header>

      <section className="card-xl p-5">
        <h2 className="font-display text-2xl text-navy">Who sees the ads</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            "Location: United States. Age 30–64. English.",
            "Job titles: Insurance Agent, Life Insurance Agent, Insurance Broker.",
            "Also include Financial Advisor and Financial Planner.",
            "Interests: life insurance and long-term care insurance.",
            "Turn Advantage+ audience off for this first test so the titles stay in place.",
            "Placements: Facebook Feed and Instagram Feed only.",
            "One ad set. About $20 a day. Keep the ad with the higher click rate.",
            "Button: Learn more. Pixel 1851734376258650.",
          ].map((item) => (
            <li key={item} className="rounded-lg border border-line bg-paper px-4 py-3 text-navy">
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Page: facebook.com/adaptivemktgroup. Ad account 968505022971734. If Meta asks for a
          special ad category, this is a tool for licensed professionals, not a policy offer.
          Confirm the prompt before publishing.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <AdCard
          kicker="Ad 1 · pattern interrupt"
          image="/facebook-ads/whisper.jpg"
          alt="A grey-haired man looks aside while a woman in a circle holds a finger to her lips."
          copy={AD_ONE}
          headline="Open This Before The Next Sit-Down"
          description="Licensed agents. The picture is live this week."
        />
        <AdCard
          kicker="Ad 2 · breaking news"
          image="/facebook-ads/breaking.jpg"
          alt="Breaking news layout: a grey-haired man, a woman whispering in a circle, and a headline about a simple asset picture."
          copy={AD_TWO}
          headline="Agents, Open This Picture Today"
          description="Use it before the next client sits down."
        />
      </div>
    </main>
  );
}
