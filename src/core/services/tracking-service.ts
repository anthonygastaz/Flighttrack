import type { Booking } from "@/core/domain/booking";
import type { FlightStatusResult } from "@/core/domain/flight";
import type { BookingService } from "@/core/services/booking-service";
import type { FlightService } from "@/core/services/flight-service";
import { normalizeBookingReference } from "@/core/services/booking-reference";
import type { AppSupabaseClient } from "@/lib/supabase/server";

type Client = AppSupabaseClient;

export type TrackResult =
  | { type: "booking"; booking: Booking; flight: FlightStatusResult | null }
  | { type: "flight"; flight: FlightStatusResult }
  | { type: "not_found"; query: string };

const FLIGHT_NUMBER_PATTERN = /^[A-Z0-9]{2,3}\d{1,4}$/;

/**
 * Implements the booking-search flow from the spec:
 *
 *   reference → search DB → found? return booking (+ enrich w/ live status)
 *                         → else flight lookup → found? return flight status
 *                                              → else "Booking Not Found"
 *
 * Never implies access to airline reservation systems: an unknown reference
 * that is not a recognisable flight number resolves to `not_found`.
 */
export class TrackingService {
  constructor(
    private readonly client: Client,
    private readonly bookings: BookingService,
    private readonly flights: FlightService,
  ) {}

  async track(rawQuery: string): Promise<TrackResult> {
    const startedAt = performance.now();
    const normalized = normalizeBookingReference(rawQuery);

    // 1. Internal booking database first.
    const booking = await this.bookings.getByReference(normalized);
    if (booking) {
      const flight = await this.safeFlightStatus(
        booking.flightNumber,
        booking.departureTime.slice(0, 10),
      );
      await this.recordSearch(rawQuery, "booking", booking.id, startedAt);
      return { type: "booking", booking, flight };
    }

    // 2. Treat the input as a flight number and attempt a live lookup.
    if (FLIGHT_NUMBER_PATTERN.test(normalized)) {
      const flight = await this.safeFlightStatus(normalized);
      if (flight && flight.source !== "unavailable") {
        await this.recordSearch(rawQuery, "flight", null, startedAt);
        return { type: "flight", flight };
      }
    }

    // 3. Nothing found.
    await this.recordSearch(rawQuery, "not_found", null, startedAt);
    return { type: "not_found", query: rawQuery };
  }

  private async safeFlightStatus(
    flightNumber: string,
    date?: string,
  ): Promise<FlightStatusResult | null> {
    try {
      return await this.flights.getStatus(flightNumber, date);
    } catch {
      return null;
    }
  }

  private async recordSearch(
    query: string,
    resultType: "booking" | "flight" | "not_found",
    matchedBookingId: string | null,
    startedAt: number,
  ): Promise<void> {
    try {
      await this.client.from("search_events").insert({
        query: query.slice(0, 120),
        matched_booking_id: matchedBookingId,
        result_type: resultType,
        duration_ms: Math.round(performance.now() - startedAt),
      });
    } catch {
      // Analytics logging must never break a user-facing search.
    }
  }
}
