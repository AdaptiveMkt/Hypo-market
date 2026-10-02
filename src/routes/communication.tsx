import { createFileRoute, Link } from "@tanstack/react-router";

const VIDEO_URL =
  "https://1drv.ms/v/c/03a1f764a9bc1532/IQBJ7PxAhFSnSrZXAyVF5oGoAeQQP1xqXrgmO_DEDjEQHM8?e=rZU67n";

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
        <a
          href={VIDEO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative mt-2 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-line bg-navy text-cream"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-teal text-3xl text-cream group-hover:brightness-110" aria-hidden="true">
            ▶
          </span>
          <span className="sr-only">Play the Long-Term Care Asset Utilization video</span>
        </a>
        <p className="mt-3 text-pretty text-sm text-muted">
          Select the video. It opens from OneDrive. The monthly and annual license buttons are next to Light Mode.
        </p>
        <Link to="/" className="mt-5 inline-block font-semibold text-teal underline-offset-4 hover:underline">
          Return to the calculator
        </Link>
      </section>
    </main>
  );
}
