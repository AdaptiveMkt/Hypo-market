import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SharedReportPage } from "@/components/shared-report-page";

export const Route = createFileRoute("/$slug")({
  component: SlugLayout,
});

function SlugLayout() {
  const { slug } = Route.useParams();
  if (/^incognito-[a-z0-9]{16}$/.test(slug)) {
    return <SharedReportPage slug={slug} code="" />;
  }
  return <Outlet />;
}
