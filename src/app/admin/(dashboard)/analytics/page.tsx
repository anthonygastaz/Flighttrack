import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getServices } from "@/core/container";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AnalyticsPage() {
  if (!isSupabaseConfigured) {
    return (
      <AdminPageHeader
        title="Analytics"
        description="Configure Supabase to view analytics."
      />
    );
  }

  const services = getServices();
  const overview = await services.analytics.getOverview();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Booking trends, searches, and route popularity."
      />
      <AnalyticsCharts data={overview} />
    </div>
  );
}
