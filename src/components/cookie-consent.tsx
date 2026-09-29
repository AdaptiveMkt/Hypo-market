"use client";

import { useEffect, useState } from "react";
import { readConsent, writeConsent, type ConsentChoice } from "@/lib/cookie-consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() == null);
    const reopen = () => setOpen(true);
    window.addEventListener("aum-cookie-settings", reopen);
    return () => window.removeEventListener("aum-cookie-settings", reopen);
  }, []);

  if (!open) return null;

  function choose(choice: ConsentChoice) {
    writeConsent(choice);
    setOpen(false);
  }

  return (
    <div
      className="no-print fixed inset-x-0 bottom-0 z-[45] p-3 sm:p-4"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-body"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-gold bg-paper p-4 text-ink shadow-[var(--shadow-card)] sm:p-5">
        <h2 id="cookie-consent-title" className="font-display text-lg text-navy">
          Cookies on this site
        </h2>
        <p id="cookie-consent-body" className="mt-2 text-sm leading-relaxed text-navy">
          A necessary cookie keeps your fact-finder answers on this device if you leave and come back.
          An optional analytics cookie (Google Analytics) shows which pages are used. We do not use
          advertising cookies.{" "}
          <a href="/copyright#privacy-policy" className="font-semibold text-teal underline underline-offset-2">
            Privacy
          </a>
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-navy bg-paper px-4 py-2 text-sm font-semibold text-navy hover:bg-cream"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-masthead hover:brightness-105"
            onClick={() => choose("analytics")}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
