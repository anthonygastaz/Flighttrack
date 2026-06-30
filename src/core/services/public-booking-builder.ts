import type { CreateBookingInput } from "@/core/repositories/booking-repository";
import { findAirlineByIata } from "@/lib/airlines/search";
import { findAirportByIata } from "@/lib/airports/search";
import type { PublicBookingValues } from "@/lib/validation/public-booking-schema";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickGate(): string {
  return `${["A", "B", "C", "D"][randomInt(0, 3)]}${randomInt(1, 40)}`;
}

function estimateDurationMinutes(from: string, to: string): number {
  // Rough long-haul vs short-haul estimate from airport pair hash.
  const key = `${from}${to}`;
  const base = key.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return 90 + (base % 720);
}

/** Build a demo booking from the public airline-style booking form. */
export function buildPublicBooking(input: PublicBookingValues): CreateBookingInput {
  const from = findAirportByIata(input.from);
  const to = findAirportByIata(input.to);
  if (!from || !to) {
    throw new Error("Invalid airport selection.");
  }
  const airline = findAirlineByIata(input.airlineIata);
  if (!airline) {
    throw new Error("Invalid airline selection.");
  }

  const departure = new Date(`${input.departureDate}T${String(randomInt(6, 20)).padStart(2, "0")}:${pick(["00", "15", "30", "45"])}:00`);
  const durationMs = estimateDurationMinutes(from.iata, to.iata) * 60 * 1000;
  const arrival = new Date(departure.getTime() + durationMs);

  return {
    passengerFirstName: input.passengerFirstName,
    passengerLastName: input.passengerLastName,
    email: input.email,
    phone: null,
    airline: airline.name,
    airlineIata: airline.iata,
    flightNumber: `${airline.iata}${randomInt(100, 999)}`,
    departureAirport: from.iata,
    arrivalAirport: to.iata,
    departureCity: from.city,
    arrivalCity: to.city,
    departureTerminal: String(randomInt(1, 5)),
    arrivalTerminal: String(randomInt(1, 5)),
    departureGate: pickGate(),
    arrivalGate: pickGate(),
    departureTime: departure.toISOString(),
    arrivalTime: arrival.toISOString(),
    seat: input.seats.join(", "),
    travelClass: input.travelClass,
    baggageAllowance: input.travelClass === "economy" ? "1 x 23kg" : "2 x 32kg",
    status: "confirmed",
    bookingSource: "demo",
    notes: input.tripType === "round-trip" ? `Return requested: ${input.returnDate}` : null,
    stops: 0,
    layovers: [],
    flightSegments: [],
    billingName: null,
    billingEmail: null,
    billingPhone: null,
    billingAddressLine1: null,
    billingAddressLine2: null,
    billingCity: null,
    billingState: null,
    billingPostalCode: null,
    billingCountry: null,
    paymentMethod: null,
    fareSubtotal: null,
    taxesFees: null,
    totalPrice: null,
    currency: "USD",
  };
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
