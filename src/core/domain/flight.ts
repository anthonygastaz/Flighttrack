import type { FlightStatus } from "./enums";

/**
 * Normalised flight status — the standardized shape returned by the flight
 * service regardless of the upstream provider (Amadeus, cache, etc.).
 */
export interface FlightStatusResult {
  flightNumber: string;
  airline: string | null;
  origin: string | null;
  destination: string | null;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
  estimatedDeparture: string | null;
  estimatedArrival: string | null;
  status: FlightStatus;
  source: "cache" | "amadeus" | "unavailable";
  fetchedAt: string;
}
