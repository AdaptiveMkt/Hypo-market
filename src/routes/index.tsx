import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/calculator";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main id="main-content" className="mx-auto min-w-0 max-w-7xl overflow-x-clip px-3 py-4 pb-36 sm:px-6 sm:py-5 lg:pb-5" tabIndex={-1}>
      <Calculator key="cpi-follows-setting" />
    </main>
  );
}
