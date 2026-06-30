import type { Booking, BookingFlightSegment, Layover } from "@/core/domain/booking";
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

function parseFlightSegments(value: unknown): BookingFlightSegment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const airline = typeof row.airline === "string" ? row.airline : null;
      const flightNumber = typeof row.flightNumber === "string"
        ? row.flightNumber
        : typeof row.flight_number === "string"
          ? row.flight_number
          : null;
      const departureAirport = typeof row.departureAirport === "string"
        ? row.departureAirport
        : typeof row.departure_airport === "string"
          ? row.departure_airport
          : null;
      const arrivalAirport = typeof row.arrivalAirport === "string"
        ? row.arrivalAirport
        : typeof row.arrival_airport === "string"
          ? row.arrival_airport
          : null;
      const departureTime = typeof row.departureTime === "string"
        ? row.departureTime
        : typeof row.departure_time === "string"
          ? row.departure_time
          : null;
      const arrivalTime = typeof row.arrivalTime === "string"
        ? row.arrivalTime
        : typeof row.arrival_time === "string"
          ? row.arrival_time
          : null;

      if (!airline || !flightNumber || !departureAirport || !arrivalAirport || !departureTime || !arrivalTime) {
        return null;
      }

      return {
        airline,
        airlineIata:
          typeof row.airlineIata === "string"
            ? row.airlineIata
            : typeof row.airline_iata === "string"
              ? row.airline_iata
              : null,
        flightNumber,
        departureAirport,
        arrivalAirport,
        departureCity:
          typeof row.departureCity === "string"
            ? row.departureCity
            : typeof row.departure_city === "string"
              ? row.departure_city
              : null,
        arrivalCity:
          typeof row.arrivalCity === "string"
            ? row.arrivalCity
            : typeof row.arrival_city === "string"
              ? row.arrival_city
              : null,
        departureTime,
        arrivalTime,
        departureTerminal:
          typeof row.departureTerminal === "string"
            ? row.departureTerminal
            : typeof row.departure_terminal === "string"
              ? row.departure_terminal
              : null,
        arrivalTerminal:
          typeof row.arrivalTerminal === "string"
            ? row.arrivalTerminal
            : typeof row.arrival_terminal === "string"
              ? row.arrival_terminal
              : null,
        departureGate:
          typeof row.departureGate === "string"
            ? row.departureGate
            : typeof row.departure_gate === "string"
              ? row.departure_gate
              : null,
        arrivalGate:
          typeof row.arrivalGate === "string"
            ? row.arrivalGate
            : typeof row.arrival_gate === "string"
              ? row.arrival_gate
              : null,
        seat: typeof row.seat === "string" ? row.seat : null,
        aircraft: typeof row.aircraft === "string" ? row.aircraft : null,
      } satisfies BookingFlightSegment;
    })
    .filter((item): item is BookingFlightSegment => item !== null);
}

function flightSegmentsToJson(segments: BookingFlightSegment[]): BookingFlightSegment[] {
  return segments.map((segment) => ({
    airline: segment.airline,
    airlineIata: segment.airlineIata,
    flightNumber: segment.flightNumber,
    departureAirport: segment.departureAirport,
    arrivalAirport: segment.arrivalAirport,
    departureCity: segment.departureCity,
    arrivalCity: segment.arrivalCity,
    departureTime: segment.departureTime,
    arrivalTime: segment.arrivalTime,
    departureTerminal: segment.departureTerminal,
    arrivalTerminal: segment.arrivalTerminal,
    departureGate: segment.departureGate,
    arrivalGate: segment.arrivalGate,
    seat: segment.seat,
    aircraft: segment.aircraft,
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
    flightSegments: parseFlightSegments(row.flight_segments),
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
    flight_segments: flightSegmentsToJson(input.flightSegments ?? []),
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
    ...(input.createdAt ? { created_at: input.createdAt } : {}),
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
  set(
    "flight_segments",
    input.flightSegments ? flightSegmentsToJson(input.flightSegments) : undefined,
  );
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
  set("created_at", input.createdAt);

  return row;
}
