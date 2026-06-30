import "server-only";

import { AnalyticsRepository } from "@/core/repositories/analytics-repository";
import { SupabaseBookingRepository } from "@/core/repositories/supabase-booking-repository";
import { BookingService } from "@/core/services/booking-service";
import { FlightService } from "@/core/services/flight-service";
import { NotificationService } from "@/core/services/notification-service";
import { TrackingService } from "@/core/services/tracking-service";
import { createAdminSupabase, type AppSupabaseClient } from "@/lib/supabase/server";

export interface Services {
  bookings: BookingService;
  flights: FlightService;
  tracking: TrackingService;
  analytics: AnalyticsRepository;
  notifications: NotificationService;
}

/**
 * Wire the object graph from a single Supabase client. Composition lives here
 * so that pages, route handlers and server actions never construct
 * repositories or know about Supabase directly.
 */
export function buildServices(client: AppSupabaseClient): Services {
  const bookingRepo = new SupabaseBookingRepository(client);
  const bookings = new BookingService(bookingRepo);
  const flights = new FlightService(client);
  const tracking = new TrackingService(client, bookings, flights);
  const analytics = new AnalyticsRepository(client);
  const notifications = new NotificationService();

  return { bookings, flights, tracking, analytics, notifications };
}

/**
 * Server-side service container backed by the service-role client.
 *
 * All data access is funnelled through trusted server code (Server Actions and
 * Route Handlers); Row Level Security stays fully locked down and the anon key
 * is never used for data reads. Public-facing operations (tracking) and admin
 * operations are separated at the action layer, not the client layer.
 */
export function getServices(): Services {
  return buildServices(createAdminSupabase());
}
