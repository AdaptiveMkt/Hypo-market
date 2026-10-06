const button =
  "inline-flex h-11 items-center justify-center rounded-lg bg-teal px-4 text-center text-sm font-semibold text-cream hover:brightness-110";

export function SubscriptionLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <a className={button} href="https://buy.stripe.com/6oU4gydFo8PkgO68zx4Ja01">
        Monthly Subscription ($9.98/month)
      </a>
      <a className={button} href="https://buy.stripe.com/aFa5kC9p8e9E9lEg1Z4Ja00">
        Annual Subscription ($99/year)
      </a>
    </div>
  );
}
