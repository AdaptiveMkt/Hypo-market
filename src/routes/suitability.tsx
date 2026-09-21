import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { NaicSuitabilityForm } from "@/components/naic-suitability-form";

export const Route = createFileRoute("/suitability")({
  component: SuitabilityPage,
  head: () => ({
    meta: [{ title: "NAIC Long-Term Care Insurance Personal Worksheet" }],
  }),
});

function SuitabilityPage() {
  const navigate = useNavigate();
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          NAIC Long-Term Care Insurance Personal Worksheet
        </h2>
        <p className="text-sm text-muted">
          Fillable educational form for discussion and submission.{" "}
          <Link to="/" className="font-semibold text-navy underline underline-offset-2">
            Back to the calculator
          </Link>
          .
        </p>
      </section>
      <section className="card-xl p-5">
        <NaicSuitabilityForm onClose={() => void navigate({ to: "/" })} />
      </section>
    </main>
  );
}