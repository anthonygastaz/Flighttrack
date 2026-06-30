import type { BookingStatus, TravelClass } from "@/core/domain/enums";
import type { CreateBookingInput } from "@/core/repositories/booking-repository";
import { wallClockFromLocalDate } from "@/lib/datetime/wall-clock";
import { AIRLINES, AIRPORTS } from "@/lib/flight-catalog";

const FIRST_NAMES = ["Amelia", "Noah", "Olivia", "Liam", "Sophia", "Omar", "Aisha", "Mateo", "Yuki", "Priya"];
const LAST_NAMES = ["Carter", "Khan", "Nguyen", "Rossi", "Andersson", "Okafor", "Silva", "Tanaka", "Patel", "Müller"];
const TRAVEL_CLASSES: TravelClass[] = ["economy", "premium_economy", "business", "first"];
const STATUSES: BookingStatus[] = ["confirmed", "checked_in", "boarding", "departed"];
const BAGGAGE = ["1 x 23kg", "2 x 23kg", "1 x 32kg", "Cabin only"];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickPair<T extends { iata: string }>(items: readonly T[]): [T, T] {
  const a = pick(items);
  let b = pick(items);
  while (b.iata === a.iata) b = pick(items);
  return [a, b];
}

/** Build a single realistic demo booking input (no reference — generated later). */
export function generateDemoBooking(): CreateBookingInput {
  const airline = pick(AIRLINES);
  const [from, to] = pickPair(AIRPORTS);

  const departure = new Date();
  departure.setDate(departure.getDate() + randomInt(1, 30));
  departure.setHours(randomInt(5, 22), pick([0, 15, 30, 45]), 0, 0);

  const arrival = new Date(departure.getTime() + randomInt(90, 14 * 60) * 60 * 1000);
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);

  return {
    passengerFirstName: firstName,
    passengerLastName: lastName,
    email: null,
    phone: null,
    airline: airline.name,
    airlineIata: airline.iata,
    flightNumber: `${airline.iata}${randomInt(10, 1999)}`,
    departureAirport: from.iata,
    arrivalAirport: to.iata,
    departureCity: from.city,
    arrivalCity: to.city,
    departureTerminal: String(randomInt(1, 5)),
    arrivalTerminal: String(randomInt(1, 5)),
    departureGate: `${pick(["A", "B", "C", "D"])}${randomInt(1, 40)}`,
    arrivalGate: `${pick(["A", "B", "C", "D"])}${randomInt(1, 40)}`,
    departureTime: wallClockFromLocalDate(departure),
    arrivalTime: wallClockFromLocalDate(arrival),
    seat: `${randomInt(1, 45)}${pick(["A", "B", "C", "D", "E", "F"])}`,
    travelClass: pick(TRAVEL_CLASSES),
    baggageAllowance: pick(BAGGAGE),
    status: pick(STATUSES),
    bookingSource: "demo",
    notes: null,
    stops: 0,
    layovers: [],
    flightSegments: [],
    billingName: `${firstName} ${lastName}`,
    billingEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    billingPhone: `+1 555 ${randomInt(100, 999)} ${randomInt(1000, 9999)}`,
    billingAddressLine1: `${randomInt(100, 9999)} Main Street`,
    billingAddressLine2: null,
    billingCity: pick(["London", "New York", "Singapore", "Dubai"]),
    billingState: pick(["CA", "NY", "TX", "ENG"]),
    billingPostalCode: String(randomInt(10000, 99999)),
    billingCountry: pick(["United States", "United Kingdom", "UAE"]),
    paymentMethod: pick(["Visa ending 4242", "Mastercard ending 8210", "American Express ending 1005"]),
  };
}
