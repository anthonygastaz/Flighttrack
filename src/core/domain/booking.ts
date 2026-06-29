import type { BookingSource, BookingStatus, TravelClass } from "./enums";

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
