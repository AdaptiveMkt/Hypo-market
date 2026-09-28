import { createFileRoute, Link } from "@tanstack/react-router";
import { Cite } from "@/components/source-links";
import { HOME24_METHOD } from "@/lib/costs";
import { METHOD_SOURCE_GROUPS, SRC } from "@/lib/sources";

export const Route = createFileRoute("/sources")({
  component: SourcesPage,
  head: () => ({ meta: [{ title: "Sources and methodology" }] }),
});

function SourcesPage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Sources and methodology
        </h2>
        <p className="text-pretty">
          The calculator answers one question: how quickly long-term care could use the
          assets you count, and how an insurance design changes that draw. The links below
          are the authorities behind the supporting sections. They are not part of the
          year-by-year math.
        </p>
      </section>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-lg text-navy">
          24-hour home care
        </h2>
        <p className="text-pretty text-sm">{HOME24_METHOD}</p>
        <p className="mt-3 text-pretty text-sm">
          Facility and assisted-living figures are annualized from monthly planning medians
          (monthly amount × 12). Confirm the location on the{" "}
          <Cite href={SRC.ltcNews}>LTC News Cost of Care Calculator</Cite>.
        </p>
      </section>
      {METHOD_SOURCE_GROUPS.map((group) => (
        <section key={group.title} className="card-xl p-5">
          <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-lg text-navy">{group.title}</h2>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li key={item.href + item.label}>
                <Cite href={item.href}>{item.label}</Cite>
                {item.note ? <p className="mt-1 text-sm text-muted">{item.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-sm text-muted">
        Government program benefits, eligibility standards, and laws may change. Verify
        current requirements with the appropriate government agency or qualified professional.
      </p>
      <Link to="/" className="inline-block text-teal underline-offset-4 hover:underline">
        ← Back to calculator
      </Link>
    </main>
  );
}
