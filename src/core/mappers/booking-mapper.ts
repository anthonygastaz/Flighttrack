import type { Booking } from "@/core/domain/booking";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import type { BookingInsert, BookingRow, BookingUpdate } from "@/lib/supabase/types";

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
    departureTerminal: row.departure_terminal,
    arrivalTerminal: row.arrival_terminal,
    departureGate: row.departure_gate,
    arrivalGate: row.arrival_gate,
    departureTime: row.departure_time,
    arrivalTime: row.arrival_time,
    seat: row.seat,
    travelClass: row.travel_class,
    baggageAllowance: row.baggage_allowance,
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
    departure_terminal: input.departureTerminal ?? null,
    arrival_terminal: input.arrivalTerminal ?? null,
    departure_gate: input.departureGate ?? null,
    arrival_gate: input.arrivalGate ?? null,
    departure_time: input.departureTime,
    arrival_time: input.arrivalTime,
    seat: input.seat ?? null,
    travel_class: input.travelClass,
    baggage_allowance: input.baggageAllowance ?? null,
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
  set("departure_terminal", input.departureTerminal);
  set("arrival_terminal", input.arrivalTerminal);
  set("departure_gate", input.departureGate);
  set("arrival_gate", input.arrivalGate);
  set("departure_time", input.departureTime);
  set("arrival_time", input.arrivalTime);
  set("seat", input.seat);
  set("travel_class", input.travelClass);
  set("baggage_allowance", input.baggageAllowance);
  set("status", input.status);
  set("booking_source", input.bookingSource);
  set("notes", input.notes);

  return row;
}
