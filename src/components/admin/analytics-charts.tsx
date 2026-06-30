"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import type { AnalyticsOverview } from "@/core/domain/analytics";
import { nonZeroStatuses } from "@/core/repositories/analytics-repository";
import { Calendar, Plane, Search, TrendingUp } from "lucide-react";

const CHART_COLORS = ["#00A651", "#FF5500", "#4DD088", "#051024", "#80E0AA", "#008F45", "#007A3D"];

interface AnalyticsChartsProps {
  data: AnalyticsOverview;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { stats, statusBreakdown, popularAirlines, popularRoutes, bookingsPerDay } = data;
  const statusData = nonZeroStatuses(statusBreakdown).map((entry) => ({
    name: BOOKING_STATUS_LABELS[entry.status],
    value: entry.count,
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total bookings" value={stats.totalBookings} icon={Plane} />
        <StatCard title="Total searches" value={stats.totalSearches} icon={Search} />
        <StatCard title="Upcoming flights" value={stats.upcomingFlights} icon={Calendar} />
        <StatCard
          title="Conversion rate"
          value={
            stats.totalSearches > 0
              ? `${Math.round((stats.totalBookings / stats.totalSearches) * 100)}%`
              : "—"
          }
          icon={TrendingUp}
          description="Bookings per search (approx.)"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="admin-panel border-zinc-200/80">
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal text-zinc-900">
              Bookings per day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsPerDay.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bookingsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#00A651" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-panel border-zinc-200/80">
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal text-zinc-900">
              Status breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="admin-panel border-zinc-200/80">
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal text-zinc-900">
              Most booked airlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularAirlines.length === 0 ? (
              <p className="text-sm text-zinc-500">No data yet.</p>
            ) : (
              popularAirlines.map(({ airline, count }, i) => (
                <div key={airline} className="flex items-center gap-3">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(count / (popularAirlines[0]?.count ?? 1)) * 100}%`,
                      maxWidth: "60%",
                      background: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="flex-1 text-sm">{airline}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="admin-panel border-zinc-200/80">
          <CardHeader>
            <CardTitle className="font-display text-xl font-normal text-zinc-900">
              Most searched routes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularRoutes.length === 0 ? (
              <p className="text-sm text-zinc-500">No data yet.</p>
            ) : (
              popularRoutes.map(({ route, count }) => (
                <div key={route} className="flex justify-between text-sm">
                  <span className="font-mono">{route}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
