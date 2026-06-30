import { airports as openFlightsAirports } from "@nwpr/airport-codes";

import type { Airport } from "@/lib/airports/types";

export type { Airport } from "@/lib/airports/types";
export { formatAirportLabel } from "@/lib/airports/format";

/** Normalised airports with valid 3-letter IATA codes (~6k worldwide). */
const AIRPORT_INDEX: Airport[] = openFlightsAirports
  .filter((a) => a.iata && /^[A-Z]{3}$/.test(a.iata))
  .map((a) => ({
    iata: a.iata!,
    city: a.city?.trim() || a.name?.trim() || a.iata!,
    name: a.name?.trim() || a.city?.trim() || a.iata!,
    country: a.country?.trim() || "",
  }));

const BY_IATA = new Map(AIRPORT_INDEX.map((a) => [a.iata, a]));

export function findAirportByIata(iata: string): Airport | undefined {
  return BY_IATA.get(iata.trim().toUpperCase());
}

function scoreAirport(airport: Airport, tokens: string[]): number {
  const haystack = [
    airport.iata,
    airport.city,
    airport.name,
    airport.country,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (airport.iata.toLowerCase() === token) score += 100;
    else if (airport.city.toLowerCase().startsWith(token)) score += 50;
    else if (airport.name.toLowerCase().startsWith(token)) score += 40;
    else if (airport.country.toLowerCase().startsWith(token)) score += 30;
    else if (haystack.includes(token)) score += 20;
  }
  return score;
}

/** Search airports globally by city, country, name, or IATA code. */
export function searchAirportsGlobal(query: string, limit = 10): Airport[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const ranked = AIRPORT_INDEX.map((airport) => ({
    airport,
    score: scoreAirport(airport, tokens),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city));

  return ranked.slice(0, limit).map(({ airport }) => airport);
}

export function airportCount(): number {
  return AIRPORT_INDEX.length;
}
