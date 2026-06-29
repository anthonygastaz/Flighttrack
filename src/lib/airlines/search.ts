import rawAirlines from "airline-codes/airlines.json";

import type { Airline } from "@/lib/airlines/types";

export type { Airline } from "@/lib/airlines/types";
export { formatAirlineLabel } from "@/lib/airlines/format";

interface RawAirline {
  id: string;
  name: string;
  iata: string;
  country: string;
  active: string;
}

const SKIP_NAMES = new Set(["Unknown", "Private flight"]);

function isPassengerAirline(name: string): boolean {
  return !/\b(cargo|freight|charter)\b/i.test(name);
}

function pickPreferredAirline(a: RawAirline, b: RawAirline): RawAirline {
  const aPassenger = isPassengerAirline(a.name);
  const bPassenger = isPassengerAirline(b.name);
  if (aPassenger !== bPassenger) return aPassenger ? a : b;
  return Number(a.id) <= Number(b.id) ? a : b;
}

function normalizeAirline(raw: RawAirline): Airline {
  return {
    iata: raw.iata,
    name: raw.name.trim(),
    country: raw.country?.trim() || "",
  };
}

const grouped = new Map<string, RawAirline[]>();

for (const raw of rawAirlines as RawAirline[]) {
  if (raw.active !== "Y") continue;
  if (!raw.iata || !/^[A-Z0-9]{2}$/.test(raw.iata)) continue;
  if (SKIP_NAMES.has(raw.name)) continue;

  const list = grouped.get(raw.iata) ?? [];
  list.push(raw);
  grouped.set(raw.iata, list);
}

const AIRLINE_INDEX: Airline[] = [];

for (const entries of grouped.values()) {
  const best = entries.reduce(pickPreferredAirline);
  AIRLINE_INDEX.push(normalizeAirline(best));
}

AIRLINE_INDEX.sort((a, b) => a.name.localeCompare(b.name));

const BY_IATA = new Map(AIRLINE_INDEX.map((a) => [a.iata, a]));

export function findAirlineByIata(iata: string): Airline | undefined {
  return BY_IATA.get(iata.trim().toUpperCase());
}

function scoreAirline(airline: Airline, tokens: string[]): number {
  const haystack = [airline.iata, airline.name, airline.country].join(" ").toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (airline.iata.toLowerCase() === token) score += 100;
    else if (airline.name.toLowerCase().startsWith(token)) score += 50;
    else if (airline.country.toLowerCase().startsWith(token)) score += 30;
    else if (haystack.includes(token)) score += 20;
  }
  return score;
}

/** Search airlines globally by name, country, or IATA code. */
export function searchAirlinesGlobal(query: string, limit = 12): Airline[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const ranked = AIRLINE_INDEX.map((airline) => ({
    airline,
    score: scoreAirline(airline, tokens),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.airline.name.localeCompare(b.airline.name));

  return ranked.slice(0, limit).map(({ airline }) => airline);
}

export function airlineCount(): number {
  return AIRLINE_INDEX.length;
}
