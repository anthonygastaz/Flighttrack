import type { BookingSource, BookingStatus, TravelClass } from "./enums";

/** A layover between flight segments. */
export interface Layover {
  airport: string;
  city: string | null;
  durationMinutes: number;
}

/**
 * The Booking aggregate root — the central domain entity. Field names use
 * camelCase; the Supabase repository maps to/from the snake_case columns.
 */
export interface Booking {
  id: string;
  bookingReference: string;

  // Passenger (primary contact)
  passengerFirstName: string;
  passengerLastName: string;
  email: string | null;
  phone: string | null;

  // Flight
  airline: string;
  airlineIata: string | null;
  flightNumber: string;

  // Route
  departureAirport: string;
  arrivalAirport: string;
  departureCity: string | null;
  arrivalCity: string | null;

  // Stops & layovers (empty when non-stop)
  stops: number;
  layovers: Layover[];

  // Terminals & gates
  departureTerminal: string | null;
  arrivalTerminal: string | null;
  departureGate: string | null;
  arrivalGate: string | null;

  // Schedule (ISO-8601 strings in UTC)
  departureTime: string;
  arrivalTime: string;

  // Seat & fare
  seat: string | null;
  travelClass: TravelClass;
  baggageAllowance: string | null;

  // Billing
  billingName: string | null;
  billingEmail: string | null;
  billingPhone: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingState: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  paymentMethod: string | null;

  // Pricing
  fareSubtotal: number | null;
  taxesFees: number | null;
  totalPrice: number | null;
  currency: string;

  // State
  status: BookingStatus;
  bookingSource: BookingSource;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

/** Full passenger name convenience helper. */
export function passengerFullName(booking: Pick<Booking, "passengerFirstName" | "passengerLastName">) {
  return `${booking.passengerFirstName} ${booking.passengerLastName}`.trim();
}

/** A route label such as "LHR → JFK". */
export function routeLabel(booking: Pick<Booking, "departureAirport" | "arrivalAirport">) {
  return `${booking.departureAirport} → ${booking.arrivalAirport}`;
}

/** Human-readable stops label for tickets and summaries. */
export function stopsLabel(stops: number): string {
  if (stops <= 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

/** Format layover duration as "2h 15m". */
export function formatLayoverDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
