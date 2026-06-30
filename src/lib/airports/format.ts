import type { Airport } from "@/lib/airports/types";

export function formatAirportLabel(airport: Airport): string {
  const place = airport.country ? `${airport.city}, ${airport.country}` : airport.city;
  return `${place} (${airport.iata})`;
}
