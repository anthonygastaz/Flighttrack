import { airports as openFlightsAirports } from "@nwpr/airport-codes";

import type { Airport } from "@/lib/airports/types";

interface AirportWithCoords extends Airport {
  latitude: number;
  longitude: number;
}

const AIRPORTS_WITH_COORDS: AirportWithCoords[] = openFlightsAirports
  .filter(
    (a) =>
      a.iata &&
      /^[A-Z]{3}$/.test(a.iata) &&
      typeof a.latitude === "number" &&
      typeof a.longitude === "number",
  )
  .map((a) => ({
    iata: a.iata!,
    city: a.city?.trim() || a.name?.trim() || a.iata!,
    name: a.name?.trim() || a.city?.trim() || a.iata!,
    country: a.country?.trim() || "",
    latitude: a.latitude as number,
    longitude: a.longitude as number,
  }));

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Find the closest commercial airport to a geographic point. */
export function findNearestAirport(latitude: number, longitude: number): Airport | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  let nearest: AirportWithCoords | null = null;
  let minDistance = Infinity;

  for (const airport of AIRPORTS_WITH_COORDS) {
    const distance = haversineKm(latitude, longitude, airport.latitude, airport.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = airport;
    }
  }

  if (!nearest) return null;

  return {
    iata: nearest.iata,
    city: nearest.city,
    name: nearest.name,
    country: nearest.country,
  };
}

/** Default origin when geolocation is unavailable. */
export const DEFAULT_ORIGIN_IATA = "JFK";

const BY_IATA = new Map(AIRPORTS_WITH_COORDS.map((a) => [a.iata, a]));

export function getAirportCoords(iata: string): { latitude: number; longitude: number } | null {
  const airport = BY_IATA.get(iata.trim().toUpperCase());
  if (!airport) return null;
  return { latitude: airport.latitude, longitude: airport.longitude };
}

/** Distance in km between two IATA airports; null if either is unknown. */
export function airportDistanceKm(fromIata: string, toIata: string): number | null {
  const from = getAirportCoords(fromIata);
  const to = getAirportCoords(toIata);
  if (!from || !to) return null;
  return haversineKm(from.latitude, from.longitude, to.latitude, to.longitude);
}
