import Link from "next/link";
import { Calendar, Plane, Search, XCircle } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DemoBookingActions } from "@/components/admin/demo-booking-actions";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/booking/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices } from "@/core/container";
import { passengerFullName, routeLabel } from "@/core/domain/booking";
import { formatDateTime } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        <AdminPageHeader
          title="Dashboard"
          description="Configure Supabase to enable the dashboard."
        />
      </div>
    );
  }

  const services = getServices();
  const [stats, recent, airlines] = await Promise.all([
    services.analytics.getDashboardStats(),
    services.bookings.list({ page: 1, pageSize: 5, sortBy: "created_at", sortDir: "desc" }),
    services.analytics.getPopularAirlines(5),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of bookings and activity."
      >
        <DemoBookingActions />
      </AdminPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total bookings" value={stats.totalBookings} icon={Plane} />
        <StatCard title="Today's bookings" value={stats.todayBookings} icon={Calendar} />
        <StatCard title="Upcoming flights" value={stats.upcomingFlights} icon={Plane} />
        <StatCard title="Cancelled" value={stats.cancelledFlights} icon={XCircle} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total searches"
          value={stats.totalSearches}
          icon={Search}
          description={
            stats.averageSearchMs != null
              ? `Avg. ${stats.averageSearchMs}ms response`
              : undefined
          }
        />
        <Card className="admin-panel border-zinc-200/80">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-500">Popular airlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {airlines.length === 0 ? (
              <p className="text-sm text-zinc-500">No bookings yet.</p>
            ) : (
              airlines.map(({ airline, count }) => (
                <div key={airline} className="flex justify-between text-sm">
                  <span className="text-zinc-700">{airline}</span>
                  <span className="font-medium text-zinc-900">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="admin-panel border-zinc-200/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl font-normal text-zinc-900">
            Recent bookings
          </CardTitle>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <Link href="/admin/bookings">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No bookings yet. Generate a demo booking to get started.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recent.items.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-zinc-900">
                      {booking.bookingReference}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {passengerFullName(booking)} · {routeLabel(booking)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {formatDateTime(booking.departureTime)}
                    </span>
                    <StatusBadge status={booking.status} />
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-full border-zinc-200"
                    >
                      <Link href={`/admin/bookings/${booking.id}/edit`}>Edit</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="rounded-full text-brand-green">
                      <Link href={`/booking/${booking.bookingReference}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
