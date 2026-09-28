import { createFileRoute } from "@tanstack/react-router";
import { SharedReportPage } from "@/components/shared-report-page";

export const Route = createFileRoute("/$slug/$code")({
  component: NamedSharePage,
});

function NamedSharePage() {
  const { slug, code } = Route.useParams();
  return <SharedReportPage slug={slug} code={code} />;
}
