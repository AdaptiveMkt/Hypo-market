import { createFileRoute } from "@tanstack/react-router";

const button =
  "inline-flex h-11 items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110";

export const Route = createFileRoute("/subscribe-now")({
  component: SubscribeNow,
  head: () => ({
    meta: [{ title: "Subscribe Now" }],
  }),
});

function SubscribeNow() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">Subscribe Now</h2>
        <p className="text-pretty text-lg text-navy">
          Let us start the build of your customized Long-Term Care Asset Utilization Planning tool.
        </p>
        <p className="mt-3 text-pretty font-semibold text-navy">Select Your Subscription Option.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a className={button} href="https://buy.stripe.com/6oU4gydFo8PkgO68zx4Ja01">
            Monthly Subscription ($9.98/month)
          </a>
          <a className={button} href="https://buy.stripe.com/aFa5kC9p8e9E9lEg1Z4Ja00">
            Annual Subscription ($99/year)
          </a>
        </div>
        <p className="mt-4 text-pretty text-sm text-muted">
          The monthly subscription is $9.98 per month and continues until you cancel. You may cancel at any
          time. Cancellation stops future monthly charges. A month already billed is not refunded. The annual
          option is one payment of $99 for the year, and the first two months are included.
        </p>
      </section>
    </main>
  );
}
