import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/communication")({
  component: Communication,
  head: () => ({
    meta: [{ title: "Communication" }],
  }),
});

function Communication() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Communication
        </h2>
        <p className="text-pretty text-navy">
          This page opens after a hypothetical report is saved or printed.
        </p>
        <p className="mt-3 text-pretty text-sm text-muted">
          The message on this page can be replaced when the next step is decided.
        </p>
        <Link to="/" className="mt-5 inline-block font-semibold text-teal underline-offset-4 hover:underline">
          Return to the calculator
        </Link>
      </section>
    </main>
  );
}
