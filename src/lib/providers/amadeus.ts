import type { FlightStatus } from "@/core/domain/enums";
import type { FlightStatusResult } from "@/core/domain/flight";
import { serverEnv } from "@/lib/env";

/**
 * Thin Amadeus Flight API provider. Handles OAuth2 client-credentials and
 * normalises the on-time/schedule response into {@link FlightStatusResult}.
 *
 * The provider is intentionally defensive: when credentials are absent or the
 * upstream fails, callers receive `null` and the flight service degrades to a
 * "status unavailable" result rather than throwing.
 */

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!serverEnv.amadeus.isConfigured) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: serverEnv.amadeus.clientId,
    client_secret: serverEnv.amadeus.clientSecret,
  });

  const response = await fetch(`${serverEnv.amadeus.baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  if (!response.ok) return null;

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 1799) * 1000,
  };
  return cachedToken.accessToken;
}

/** Parse a flight designator like "BA249" into carrier + number. */
function parseFlightNumber(value: string): { carrierCode: string; flightNumber: string } | null {
  const match = value.toUpperCase().match(/^([A-Z0-9]{2,3})\s?0*(\d{1,4})$/);
  if (!match) return null;
  return { carrierCode: match[1]!, flightNumber: match[2]! };
}

function mapAmadeusStatus(raw: string | undefined): FlightStatus {
  switch ((raw ?? "").toLowerCase()) {
    case "active":
    case "en-route":
      return "active";
    case "landed":
      return "landed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "diverted":
      return "diverted";
    case "delayed":
      return "delayed";
    case "scheduled":
      return "scheduled";
    default:
      return "unknown";
  }
}

interface AmadeusFlightPoint {
  iataCode?: string;
  timings?: { qualifier?: string; value?: string }[];
}

interface AmadeusFlightDesignator {
  carrierCode?: string;
  flightNumber?: number;
}

interface AmadeusFlightStatus {
  flightDesignator?: AmadeusFlightDesignator;
  flightPoints?: AmadeusFlightPoint[];
  legs?: { boundaryPointIataCode?: string }[];
  status?: string;
}

function timingFor(point: AmadeusFlightPoint | undefined, qualifier: "STD" | "STA" | "ETD" | "ETA") {
  return point?.timings?.find((t) => t.qualifier === qualifier)?.value ?? null;
}

/**
 * Fetch normalised live flight status. Returns `null` when not configured or
 * when no matching flight is found upstream.
 */
export async function fetchAmadeusFlightStatus(
  rawFlightNumber: string,
  date: string,
): Promise<FlightStatusResult | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const parsed = parseFlightNumber(rawFlightNumber);
  if (!parsed) return null;

  const params = new URLSearchParams({
    carrierCode: parsed.carrierCode,
    flightNumber: parsed.flightNumber,
    scheduledDepartureDate: date,
  });

  const response = await fetch(
    `${serverEnv.amadeus.baseUrl}/v2/schedule/flights?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      // Cache upstream responses for 5 minutes at the fetch layer.
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) return null;

  const json = (await response.json()) as { data?: AmadeusFlightStatus[] };
  const flight = json.data?.[0];
  if (!flight) return null;

  const origin = flight.flightPoints?.[0];
  const destination = flight.flightPoints?.[flight.flightPoints.length - 1];

  return {
    flightNumber: rawFlightNumber.toUpperCase(),
    airline: flight.flightDesignator?.carrierCode ?? parsed.carrierCode,
    origin: origin?.iataCode ?? null,
    destination: destination?.iataCode ?? null,
    scheduledDeparture: timingFor(origin, "STD"),
    scheduledArrival: timingFor(destination, "STA"),
    estimatedDeparture: timingFor(origin, "ETD"),
    estimatedArrival: timingFor(destination, "ETA"),
    status: mapAmadeusStatus(flight.status),
    source: "amadeus",
    fetchedAt: new Date().toISOString(),
  };
}
