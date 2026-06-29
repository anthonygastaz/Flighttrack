import type {
  AirlineCount,
  AnalyticsOverview,
  DailyCount,
  DashboardStats,
  RouteCount,
  StatusBreakdown,
} from "@/core/domain/analytics";
import { BOOKING_STATUSES, type BookingStatus } from "@/core/domain/enums";
import type { AppSupabaseClient } from "@/lib/supabase/server";

type Client = AppSupabaseClient;

/**
 * Read-only aggregation queries powering the dashboard and analytics page.
 * Heavy group-by work is delegated to SQL functions (see migration 0003) so
 * aggregation happens in the database rather than the application.
 */
export class AnalyticsRepository {
  constructor(private readonly client: Client) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const nowIso = new Date().toISOString();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, today, upcoming, cancelled, searches] = await Promise.all([
      this.runCount(this.countQuery()),
      this.runCount(this.countQuery().gte("created_at", startOfToday.toISOString())),
      this.runCount(this.countQuery().gte("departure_time", nowIso).neq("status", "cancelled")),
      this.runCount(this.countQuery().eq("status", "cancelled")),
      this.countSearches(),
    ]);

    return {
      totalBookings: total,
      todayBookings: today,
      upcomingFlights: upcoming,
      cancelledFlights: cancelled,
      totalSearches: searches.count,
      averageSearchMs: searches.averageMs,
    };
  }

  async getStatusBreakdown(): Promise<StatusBreakdown[]> {
    const counts = await Promise.all(
      BOOKING_STATUSES.map(async (status): Promise<StatusBreakdown> => ({
        status,
        count: await this.runCount(this.countQuery().eq("status", status)),
      })),
    );
    return counts;
  }

  async getPopularAirlines(limit = 6): Promise<AirlineCount[]> {
    const { data, error } = await this.client.rpc("popular_airlines", { limit_count: limit });
    if (error) throw error;
    return (data ?? []).map((row: { airline: string; count: number }) => ({
      airline: row.airline,
      count: Number(row.count),
    }));
  }

  async getPopularRoutes(limit = 6): Promise<RouteCount[]> {
    const { data, error } = await this.client.rpc("popular_routes", { limit_count: limit });
    if (error) throw error;
    return (data ?? []).map(
      (row: { departure_airport: string; arrival_airport: string; count: number }) => ({
        route: `${row.departure_airport} → ${row.arrival_airport}`,
        departureAirport: row.departure_airport,
        arrivalAirport: row.arrival_airport,
        count: Number(row.count),
      }),
    );
  }

  async getBookingsPerDay(days = 14): Promise<DailyCount[]> {
    const { data, error } = await this.client.rpc("bookings_per_day", { day_count: days });
    if (error) throw error;
    return (data ?? []).map((row: { day: string; count: number }) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }

  async getOverview(): Promise<AnalyticsOverview> {
    const [stats, statusBreakdown, popularAirlines, popularRoutes, bookingsPerDay] =
      await Promise.all([
        this.getDashboardStats(),
        this.getStatusBreakdown(),
        this.getPopularAirlines(),
        this.getPopularRoutes(),
        this.getBookingsPerDay(),
      ]);

    return { stats, statusBreakdown, popularAirlines, popularRoutes, bookingsPerDay };
  }

  // --- helpers -------------------------------------------------------------

  /** A head-only `exact` count query over the bookings table. */
  private countQuery() {
    return this.client.from("bookings").select("id", { count: "exact", head: true });
  }

  private async runCount(
    query: PromiseLike<{ count: number | null; error: unknown }>,
  ): Promise<number> {
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
  }

  private async countSearches(): Promise<{ count: number; averageMs: number | null }> {
    const { data, count, error } = await this.client
      .from("search_events")
      .select("duration_ms", { count: "exact" });

    if (error) {
      // search_events is optional analytics; never block the dashboard on it.
      return { count: 0, averageMs: null };
    }

    const durations = (data ?? [])
      .map((row: { duration_ms: number | null }) => row.duration_ms)
      .filter((value: number | null): value is number => typeof value === "number");
    const averageMs =
      durations.length > 0
        ? Math.round(durations.reduce((sum: number, value: number) => sum + value, 0) / durations.length)
        : null;

    return { count: count ?? 0, averageMs };
  }
}

/** Status display order for charts (excludes zero-noise). */
export function nonZeroStatuses(breakdown: StatusBreakdown[]): StatusBreakdown[] {
  return breakdown.filter((entry) => entry.count > 0) as Array<{
    status: BookingStatus;
    count: number;
  }>;
}
