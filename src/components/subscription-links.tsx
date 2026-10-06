const button =
  "inline-flex h-11 items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110";

const paymentSelection = "https://www.preserve-your-assets.com/payment-selection";

export function SubscriptionLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a className={button} href={paymentSelection}>
        Monthly Subscription ($9.98/month)
      </a>
      <a className={button} href={paymentSelection}>
        Annual Subscription ($99/year)
      </a>
    </div>
  );
}