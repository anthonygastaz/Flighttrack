import type { FlightStatusResult } from "@/core/domain/flight";
import { serverEnv } from "@/lib/env";
import { fetchAmadeusFlightStatus } from "@/lib/providers/amadeus";
import type { AppSupabaseClient } from "@/lib/supabase/server";
import type { FlightRow } from "@/lib/supabase/types";

type Client = AppSupabaseClient;

/** Treat cached flight status older than this as stale. */
const CACHE_TTL_MS = 5 * 60 * 1000;

function rowToResult(row: FlightRow): FlightStatusResult {
  return {
    flightNumber: row.flight_number,
    airline: row.airline,
    origin: row.origin,
    destination: row.destination,
    scheduledDeparture: row.scheduled_departure,
    scheduledArrival: row.scheduled_arrival,
    estimatedDeparture: row.estimated_departure,
    estimatedArrival: row.estimated_arrival,
    status: row.status,
    source: "cache",
    fetchedAt: row.cached_at,
  };
}

/**
 * Resolves live flight status with a read-through cache:
 *   1. Serve a fresh cached row if present.
 *   2. Otherwise query Amadeus (when configured), persist, and return.
 *   3. Otherwise return an `unavailable` result — never a thrown error.
 */
export class FlightService {
  constructor(private readonly client: Client) {}

  async getStatus(flightNumber: string, date?: string): Promise<FlightStatusResult> {
    const normalized = flightNumber.trim().toUpperCase();
    const departureDate = date ?? new Date().toISOString().slice(0, 10);

    const cached = await this.readCache(normalized);
    if (cached && Date.now() - new Date(cached.cached_at).getTime() < CACHE_TTL_MS) {
      return rowToResult(cached);
    }

    if (serverEnv.amadeus.isConfigured) {
      try {
        const live = await fetchAmadeusFlightStatus(normalized, departureDate);
        if (live) {
          await this.writeCache(live);
          return live;
        }
      } catch {
        // Upstream failure — fall through to cache or unavailable.
      }
    }

    if (cached) return rowToResult(cached);

    return {
      flightNumber: normalized,
      airline: null,
      origin: null,
      destination: null,
      scheduledDeparture: null,
      scheduledArrival: null,
      estimatedDeparture: null,
      estimatedArrival: null,
      status: "unknown",
      source: "unavailable",
      fetchedAt: new Date().toISOString(),
    };
  }

  private async readCache(flightNumber: string): Promise<FlightRow | null> {
    const { data, error } = await this.client
      .from("flights")
      .select("*")
      .eq("flight_number", flightNumber)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  private async writeCache(result: FlightStatusResult): Promise<void> {
    await this.client.from("flights").upsert(
      {
        flight_number: result.flightNumber,
        airline: result.airline,
        origin: result.origin,
        destination: result.destination,
        scheduled_departure: result.scheduledDeparture,
        scheduled_arrival: result.scheduledArrival,
        estimated_departure: result.estimatedDeparture,
        estimated_arrival: result.estimatedArrival,
        status: result.status,
        cached_at: new Date().toISOString(),
      },
      { onConflict: "flight_number" },
    );
  }
}
