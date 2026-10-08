import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DomainNote } from "@/components/subscription-links";

const MONTHLY = "https://buy.stripe.com/6oU4gydFo8PkgO68zx4Ja01";
const ANNUAL = "https://buy.stripe.com/aFa5kC9p8e9E9lEg1Z4Ja00";

export const Route = createFileRoute("/payment-selection")({
  component: PaymentSelection,
  head: () => ({
    meta: [{ title: "Payment Selection" }],
  }),
});

function openCheckout(href: string, name: string, side: "left" | "right") {
  const width = Math.max(480, Math.floor(window.screen.availWidth / 2));
  const height = window.screen.availHeight;
  const left = side === "left" ? 0 : width;
  return window.open(
    href,
    name,
    `popup=yes,width=${width},height=${height},left=${left},top=0`,
  );
}

function PaymentSelection() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const monthly = openCheckout(MONTHLY, "pay-monthly", "left");
    const annual = openCheckout(ANNUAL, "pay-annual", "right");
    if (!monthly || !annual) setBlocked(true);
  }, []);

  return (
    <main id="main-content" className="px-3 py-6 sm:px-4" tabIndex={-1}>
      <h1 className="text-center font-display text-2xl text-navy">Payment Selection</h1>
      <p className="mx-auto mt-3 max-w-3xl text-pretty text-center text-lg text-navy">
        Let us start the build of your customized Long-Term Care Asset Utilization Planning tool. Select your
        subscription option.
      </p>
      {blocked ? (
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm font-semibold text-navy">
          Select a side to open that checkout. Stripe does not allow the payment form to be drawn inside this
          page.
        </p>
      ) : (
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted">
          The monthly checkout opens on the left and the annual checkout on the right.
        </p>
      )}
      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
        <CheckoutHalf
          title="Monthly Subscription"
          price="$9.98/month"
          note="Continues until you cancel. A month already billed is not refunded."
          href={MONTHLY}
          side="left"
          windowName="pay-monthly"
        />
        <CheckoutHalf
          title="Annual Subscription"
          price="$99/year"
          note="One payment for the year. The first two months are included."
          href={ANNUAL}
          side="right"
          windowName="pay-annual"
        />
      </div>
      <DomainNote className="mx-auto mt-4 max-w-4xl text-center" />
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
  side,
  windowName,
}: {
  title: string;
  price: string;
  note: string;
  href: string;
  side: "left" | "right";
  windowName: string;
}) {
  return (
    <section className="card-xl flex min-h-80 min-w-0 flex-col p-6 sm:p-8">
      <h2 className="border-b-2 border-gold pb-2 text-center font-display text-xl text-navy">{title}</h2>
      <p className="mt-6 text-center font-display text-4xl text-navy">{price}</p>
      <p className="mt-3 text-center text-sm text-muted">{note}</p>
      <a
        className="mt-auto inline-flex h-12 items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110"
        href={href}
        onClick={(event) => {
          const opened = openCheckout(href, windowName, side);
          if (opened) event.preventDefault();
        }}
      >
        Open {title}
      </a>
    </section>
  );
}
