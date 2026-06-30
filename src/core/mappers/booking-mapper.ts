import type { Booking, Layover } from "@/core/domain/booking";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import type { BookingInsert, BookingRow, BookingUpdate } from "@/lib/supabase/types";

function parseLayovers(value: unknown): Layover[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const airport = typeof row.airport === "string" ? row.airport : null;
      const durationMinutes =
        typeof row.duration_minutes === "number"
          ? row.duration_minutes
          : typeof row.durationMinutes === "number"
            ? row.durationMinutes
            : null;
      if (!airport || durationMinutes === null) return null;
      return {
        airport,
        city: typeof row.city === "string" ? row.city : null,
        durationMinutes,
      } satisfies Layover;
    })
    .filter((item): item is Layover => item !== null);
}

function layoversToJson(layovers: Layover[]): Layover[] {
  return layovers.map((layover) => ({
    airport: layover.airport,
    city: layover.city,
    durationMinutes: layover.durationMinutes,
  }));
}

function parseNumeric(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Map a database row (snake_case) to the domain entity (camelCase). */
export function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    bookingReference: row.booking_reference,
    passengerFirstName: row.passenger_first_name,
    passengerLastName: row.passenger_last_name,
    email: row.email,
    phone: row.phone,
    airline: row.airline,
    airlineIata: row.airline_iata,
    flightNumber: row.flight_number,
    departureAirport: row.departure_airport,
    arrivalAirport: row.arrival_airport,
    departureCity: row.departure_city,
    arrivalCity: row.arrival_city,
    stops: row.stops ?? 0,
    layovers: parseLayovers(row.layovers),
    departureTerminal: row.departure_terminal,
    arrivalTerminal: row.arrival_terminal,
    departureGate: row.departure_gate,
    arrivalGate: row.arrival_gate,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    seat: row.seat,
    travelClass: row.travel_class,
    baggageAllowance: row.baggage_allowance,
    billingName: row.billing_name,
    billingEmail: row.billing_email,
    billingPhone: row.billing_phone,
    billingAddressLine1: row.billing_address_line1,
    billingAddressLine2: row.billing_address_line2,
    billingCity: row.billing_city,
    billingState: row.billing_state,
    billingPostalCode: row.billing_postal_code,
    billingCountry: row.billing_country,
    paymentMethod: row.payment_method,
    fareSubtotal: parseNumeric(row.fare_subtotal),
    taxesFees: parseNumeric(row.taxes_fees),
    totalPrice: parseNumeric(row.total_price),
    currency: row.currency ?? "USD",
    status: row.status,
    bookingSource: row.booking_source,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Map create input + generated reference to an insert row. */
export function createInputToRow(input: CreateBookingInput, reference: string): BookingInsert {
  return {
    booking_reference: reference,
    passenger_first_name: input.passengerFirstName,
    passenger_last_name: input.passengerLastName,
    email: input.email ?? null,
    phone: input.phone ?? null,
    airline: input.airline,
    airline_iata: input.airlineIata ?? null,
    flight_number: input.flightNumber,
    departure_airport: input.departureAirport,
    arrival_airport: input.arrivalAirport,
    departure_city: input.departureCity ?? null,
    arrival_city: input.arrivalCity ?? null,
    stops: input.stops ?? 0,
    layovers: layoversToJson(input.layovers ?? []),
    departure_terminal: input.departureTerminal ?? null,
    arrival_terminal: input.arrivalTerminal ?? null,
    departure_gate: input.departureGate ?? null,
    arrival_gate: input.arrivalGate ?? null,
    departure_time: input.departureTime,
    arrival_time: input.arrivalTime,
    seat: input.seat ?? null,
    travel_class: input.travelClass,
    baggage_allowance: input.baggageAllowance ?? null,
    billing_name: input.billingName ?? null,
    billing_email: input.billingEmail ?? null,
    billing_phone: input.billingPhone ?? null,
    billing_address_line1: input.billingAddressLine1 ?? null,
    billing_address_line2: input.billingAddressLine2 ?? null,
    billing_city: input.billingCity ?? null,
    billing_state: input.billingState ?? null,
    billing_postal_code: input.billingPostalCode ?? null,
    billing_country: input.billingCountry ?? null,
    payment_method: input.paymentMethod ?? null,
    fare_subtotal: input.fareSubtotal ?? null,
    taxes_fees: input.taxesFees ?? null,
    total_price: input.totalPrice ?? null,
    currency: input.currency ?? "USD",
    status: input.status,
    booking_source: input.bookingSource ?? "demo",
    notes: input.notes ?? null,
  };
}

/** Map a partial update input to a (sparse) update row. */
export function updateInputToRow(input: UpdateBookingInput): BookingUpdate {
  const row: BookingUpdate = {};
  const set = <K extends keyof BookingUpdate>(key: K, value: BookingUpdate[K] | undefined) => {
    if (value !== undefined) row[key] = value;
  };

  set("passenger_first_name", input.passengerFirstName);
  set("passenger_last_name", input.passengerLastName);
  set("email", input.email);
  set("phone", input.phone);
  set("airline", input.airline);
  set("airline_iata", input.airlineIata);
  set("flight_number", input.flightNumber);
  set("departure_airport", input.departureAirport);
  set("arrival_airport", input.arrivalAirport);
  set("departure_city", input.departureCity);
  set("arrival_city", input.arrivalCity);
  set("stops", input.stops);
  set("layovers", input.layovers ? layoversToJson(input.layovers) : undefined);
  set("departure_terminal", input.departureTerminal);
  set("arrival_terminal", input.arrivalTerminal);
  set("departure_gate", input.departureGate);
  set("arrival_gate", input.arrivalGate);
  set("departure_time", input.departureTime);
  set("arrival_time", input.arrivalTime);
  set("seat", input.seat);
  set("travel_class", input.travelClass);
  set("baggage_allowance", input.baggageAllowance);
  set("billing_name", input.billingName);
  set("billing_email", input.billingEmail);
  set("billing_phone", input.billingPhone);
  set("billing_address_line1", input.billingAddressLine1);
  set("billing_address_line2", input.billingAddressLine2);
  set("billing_city", input.billingCity);
  set("billing_state", input.billingState);
  set("billing_postal_code", input.billingPostalCode);
  set("billing_country", input.billingCountry);
  set("payment_method", input.paymentMethod);
  set("fare_subtotal", input.fareSubtotal);
  set("taxes_fees", input.taxesFees);
  set("total_price", input.totalPrice);
  set("currency", input.currency);
  set("status", input.status);
  set("booking_source", input.bookingSource);
  set("notes", input.notes);
  set("booking_reference", input.bookingReference);

  return row;
}
