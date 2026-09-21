import { Link } from "@tanstack/react-router";
import {
  DISCLOSURE_CARD_TITLE,
  DISCLOSURE_HASH,
  openDisclosureCard,
} from "@/lib/disclaimer";

export function DisclosureTermsLink({
  className,
  hash = DISCLOSURE_HASH,
}: {
  className?: string;
  hash?: string;
}) {
  return (
    <Link
      to="/"
      hash={hash}
      className={className}
      onClick={() => openDisclosureCard(hash)}
    >
      {DISCLOSURE_CARD_TITLE}
    </Link>
  );
}
