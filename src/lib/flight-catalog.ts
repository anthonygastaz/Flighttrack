/** Shared airline data for booking forms and demo generation. */

import { findAirlineByIata } from "@/lib/airlines/search";
import { findAirportByIata } from "@/lib/airports/search";
import type { Airport } from "@/lib/airports/types";
import type { Airline } from "@/lib/airlines/types";

export type { Airport } from "@/lib/airports/types";
export type { Airline } from "@/lib/airlines/types";

/** Popular carriers used for admin demo booking generation. */
export const POPULAR_AIRLINES: Airline[] = [
  { name: "EVA Air", iata: "BR", country: "Taiwan" },
  { name: "British Airways", iata: "BA", country: "United Kingdom" },
  { name: "Emirates", iata: "EK", country: "United Arab Emirates" },
  { name: "Lufthansa", iata: "LH", country: "Germany" },
  { name: "Qatar Airways", iata: "QR", country: "Qatar" },
  { name: "Singapore Airlines", iata: "SQ", country: "Singapore" },
  { name: "Delta Air Lines", iata: "DL", country: "United States" },
  { name: "KLM", iata: "KL", country: "Netherlands" },
  { name: "Air France", iata: "AF", country: "France" },
  { name: "Cathay Pacific", iata: "CX", country: "Hong Kong" },
  { name: "Japan Airlines", iata: "JL", country: "Japan" },
  { name: "ANA", iata: "NH", country: "Japan" },
  { name: "Turkish Airlines", iata: "TK", country: "Turkey" },
  { name: "United Airlines", iata: "UA", country: "United States" },
  { name: "American Airlines", iata: "AA", country: "United States" },
];

/** @deprecated Use POPULAR_AIRLINES */
export const AIRLINES = POPULAR_AIRLINES;

/** Popular hubs used for admin demo booking generation. */
export const POPULAR_AIRPORTS: Pick<Airport, "iata" | "city" | "name">[] = [
  { iata: "LHR", city: "London", name: "Heathrow" },
  { iata: "JFK", city: "New York", name: "JFK" },
  { iata: "DXB", city: "Dubai", name: "Dubai Intl" },
  { iata: "SIN", city: "Singapore", name: "Changi" },
  { iata: "FRA", city: "Frankfurt", name: "Frankfurt" },
  { iata: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { iata: "AMS", city: "Amsterdam", name: "Schiphol" },
  { iata: "DOH", city: "Doha", name: "Hamad Intl" },
  { iata: "LAX", city: "Los Angeles", name: "LAX" },
  { iata: "HND", city: "Tokyo", name: "Haneda" },
  { iata: "TPE", city: "Taipei", name: "Taoyuan Intl" },
];

/** @deprecated Use POPULAR_AIRPORTS */
export const AIRPORTS = POPULAR_AIRPORTS;

export function findAirport(iata: string): Airport | undefined {
  return findAirportByIata(iata);
}

export function findAirline(iata: string): Airline | undefined {
  return findAirlineByIata(iata);
}
