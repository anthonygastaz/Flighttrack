/**
 * Domain enumerations. These mirror the constrained columns in PostgreSQL
 * (see supabase/migrations) and are the single source of truth used by both
 * the Zod schemas and the UI.
 */

export const BOOKING_STATUSES = [
  "confirmed",
  "checked_in",
  "boarding",
  "departed",
  "delayed",
  "cancelled",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const TRAVEL_CLASSES = ["economy", "premium_economy", "business", "first"] as const;

export type TravelClass = (typeof TRAVEL_CLASSES)[number];

export const BOOKING_SOURCES = ["demo", "imported", "api"] as const;

export type BookingSource = (typeof BOOKING_SOURCES)[number];

export const FLIGHT_STATUSES = [
  "scheduled",
  "active",
  "landed",
  "delayed",
  "cancelled",
  "diverted",
  "unknown",
] as const;

export type FlightStatus = (typeof FLIGHT_STATUSES)[number];

/** Human-readable labels for UI rendering. */
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  checked_in: "Checked In",
  boarding: "Boarding",
  departed: "Departed",
  delayed: "Delayed",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const TRAVEL_CLASS_LABELS: Record<TravelClass, string> = {
  economy: "Economy",
  premium_economy: "Premium Economy",
  business: "Business",
  first: "First",
};
