import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { setTheme } from "@/components/theme-toggle";
import { readShare, shareDisclaimer, type ShareView } from "@/lib/share-report";

export function SharedReportPage({ slug, code }: { slug: string; code: string }) {
  const [view, setView] = useState<ShareView | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTheme(false);
    let cancel = false;
    readShare({ data: { slug, code } })
      .then((next) => {
        if (!cancel) setView(next);
      })
      .catch(() => {
        if (!cancel) setError("This report link could not be opened.");
      });
    return () => {
      cancel = true;
    };
  }, [slug, code]);

  const hours = view && view.status !== "missing" ? view.hours : 72;

  return (
    <main className="min-h-screen bg-cream text-ink">
      {view?.status === "ready" ? (
        <article
          id="aum-report"
          className="mx-auto max-w-5xl space-y-8 bg-paper px-4 py-8 text-ink outline-none sm:px-8"
          dangerouslySetInnerHTML={{ __html: view.html }}
        />
      ) : (
        <section className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl text-navy">
            {view?.status === "expired" ? "This report link has expired" : "Report link"}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {error ||
              (view?.status === "expired"
                ? `It was available for ${hours} hours after it was first opened. Print to PDF is the way to keep a copy.`
                : view?.status === "missing"
                  ? "This link is not valid, or the report is no longer available."
                  : "Opening the report…")}
          </p>
          <Link to="/" className="mt-6 inline-block text-sm font-semibold text-navy underline">
            Return to the hypothetical
          </Link>
        </section>
      )}
      <section className="share-link-note mx-auto max-w-5xl px-4 py-6 text-sm leading-relaxed text-navy sm:px-8">
        <p className="font-semibold">Report link</p>
        <p className="mt-2">{shareDisclaimer(hours)}</p>
        {view?.status === "ready" && view.expiresAt ? (
          <p className="mt-2 text-xs text-muted">
            First opened {new Date(view.firstViewedAt).toLocaleString("en-US")}. Expires{" "}
            {new Date(view.expiresAt).toLocaleString("en-US")}.
          </p>
        ) : null}
        {view?.status === "ready" ? (
          <button
            type="button"
            className="no-print btn-block mt-4 max-w-xs rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream"
            onClick={() => window.print()}
          >
            Print to PDF
          </button>
        ) : null}
      </section>
    </main>
  );
}
