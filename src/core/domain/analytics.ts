import type { BookingStatus } from "./enums";

/** Top-line counters for the admin dashboard. */
export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  upcomingFlights: number;
  cancelledFlights: number;
  totalSearches: number;
  averageSearchMs: number | null;
}

export interface StatusBreakdown {
  status: BookingStatus;
  count: number;
}

export interface AirlineCount {
  airline: string;
  count: number;
}

export interface RouteCount {
  route: string;
  departureAirport: string;
  arrivalAirport: string;
  count: number;
}

export interface DailyCount {
  day: string; // ISO date (YYYY-MM-DD)
  count: number;
}

/** Aggregated payload for the analytics page. */
export interface AnalyticsOverview {
  stats: DashboardStats;
  statusBreakdown: StatusBreakdown[];
  popularAirlines: AirlineCount[];
  popularRoutes: RouteCount[];
  bookingsPerDay: DailyCount[];
}
