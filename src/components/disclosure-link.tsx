import { DISCLOSURE_CARD_TITLE } from "@/lib/disclaimer";

export function DisclosureTermsLink({
  className,
}: {
  className?: string;
  hash?: string;
}) {
  return (
    <a
      href="/copyright"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {DISCLOSURE_CARD_TITLE}
    </a>
  );
}
