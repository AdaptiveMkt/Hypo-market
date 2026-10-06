import { createFileRoute } from "@tanstack/react-router";

const MONTHLY = "https://buy.stripe.com/6oU4gydFo8PkgO68zx4Ja01";
const ANNUAL = "https://buy.stripe.com/aFa5kC9p8e9E9lEg1Z4Ja00";

export const Route = createFileRoute("/payment-selection")({
  component: PaymentSelection,
  head: () => ({
    meta: [{ title: "Payment Selection" }],
  }),
});

function PaymentSelection() {
  return (
    <main id="main-content" className="px-3 py-6 sm:px-4" tabIndex={-1}>
      <h1 className="text-center font-display text-2xl text-navy">Payment Selection</h1>
      <p className="mx-auto mt-3 max-w-3xl text-pretty text-center text-lg text-navy">
        Let us start the build of your customized Long-Term Care Asset Utilization Planning tool. Select your
        subscription option.
      </p>
      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
        <CheckoutHalf
          title="Monthly Subscription"
          price="$9.98/month"
          note="Continues until you cancel. A month already billed is not refunded."
          href={MONTHLY}
        />
        <CheckoutHalf
          title="Annual Subscription"
          price="$99/year"
          note="One payment for the year. The first two months are included."
          href={ANNUAL}
        />
      </div>
      <p className="mx-auto mt-4 max-w-4xl text-pretty text-center text-sm text-muted">
        The monthly subscription is $9.98 per month and continues until you cancel. You may cancel at any
        time. Cancellation stops future monthly charges. A month already billed is not refunded. The annual
        option is one payment of $99 for the year, and the first two months are included.
      </p>
    </main>
  );
}

function CheckoutHalf({
  title,
  price,
  note,
  href,
}: {
  title: string;
  price: string;
  note: string;
  href: string;
}) {
  return (
    <section className="card-xl min-w-0 p-3 sm:p-4">
      <h2 className="border-b-2 border-gold pb-2 text-center font-display text-xl text-navy">{title}</h2>
      <p className="mt-3 text-center font-display text-3xl text-navy">{price}</p>
      <p className="mt-1 text-center text-sm text-muted">{note}</p>
      <iframe
        title={title}
        src={href}
        className="mt-4 h-[780px] w-full rounded-lg border border-line bg-white"
        allow="payment *"
      />
      <a
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110"
        href={href}
      >
        Open {title}
      </a>
    </section>
  );
}
