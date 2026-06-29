import type { Airline } from "@/lib/airlines/types";

export function formatAirlineLabel(airline: Airline): string {
  return airline.country ? `${airline.name} (${airline.iata})` : `${airline.name} (${airline.iata})`;
}
