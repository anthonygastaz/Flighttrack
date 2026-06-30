import { addMinutes, differenceInMinutes } from "date-fns";

import type { Booking } from "@/core/domain/booking";
import {
  formatLayoverDuration,
  passengerFullName,
  stopsLabel,
} from "@/core/domain/booking";
import type { TravelClass } from "@/core/domain/enums";
import { BOOKING_STATUS_LABELS, TRAVEL_CLASS_LABELS } from "@/core/domain/enums";
import type { FlightStatusResult } from "@/core/domain/flight";
import { findAirportByIata } from "@/lib/airports/search";
import {
  formatWallClock,
  normalizeWallClockForStorage,
  wallClockDifferenceMinutes,
  wallClockFromDisplayDate,
  wallClockToDisplayDate,
} from "@/lib/datetime/wall-clock";

export interface TripBillingDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  paymentMethod: string | null;
  formattedAddress: string | null;
}

export interface TripBaggageItem {
  name: string;
  description: string;
  included: boolean;
}

export interface TripFlightSegment {
  kind: "flight";
  flightNumber: string;
  airline: string;
  airlineIata: string | null;
  fromAirport: string;
  fromCity: string;
  fromAirportName: string;
  toAirport: string;
  toCity: string;
  toAirportName: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  travelClass: string;
  aircraft: string;
  amenities: string[];
}

export interface TripLayoverSegment {
  kind: "layover";
  airport: string;
  city: string;
  airportName: string;
  durationLabel: string;
  durationMinutes: number;
}

export type TripItineraryItem = TripFlightSegment | TripLayoverSegment;

export interface TripDetailsData {
  reference: string;
  bookedOnLabel: string;
  statusLabel: string;
  passengerName: string;
  email: string | null;
  phone: string | null;
  routeTitle: string;
  departureDateLabel: string;
  fromAirport: string;
  toAirport: string;
  totalDurationLabel: string;
  stopsLabel: string;
  layoverSummary: string | null;
  airline: string;
  airlineIata: string | null;
  flightNumber: string;
  travelClass: string;
  departureTimeLabel: string;
  arrivalTimeLabel: string;
  departureGate: string;
  departureTerminal: string;
  arrivalGate: string;
  arrivalTerminal: string;
  seat: string;
  baggageAllowance: string;
  baggageItems: TripBaggageItem[];
  itinerary: TripItineraryItem[];
  liveFlight: FlightStatusResult | null;
  billing: TripBillingDetails | null;
}

const AIRCRAFT_TYPES = ["Airbus A321", "Boeing 777-300ER", "Boeing 787-9", "Airbus A350-900"];

function airportLabel(iata: string, fallbackCity: string | null): {
  city: string;
  name: string;
} {
  const airport = findAirportByIata(iata);
  if (!airport) {
    return {
      city: fallbackCity ?? iata,
      name: fallbackCity ? `${fallbackCity} (${iata})` : iata,
    };
  }
  return {
    city: airport.city,
    name: `${airport.name} (${iata})`,
  };
}

function formatTripClock(stored: string): string {
  return formatWallClock(stored, "h:mm a");
}

function formatTripDate(stored: string): string {
  return formatWallClock(stored, "EEE, MMM d, yyyy");
}

function formatTripDateShort(stored: string): string {
  return formatWallClock(stored, "MMM d");
}

function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function amenitiesForClass(travelClass: TravelClass): string[] {
  if (travelClass === "first" || travelClass === "business") {
    return ["Wi-Fi", "In-seat power outlet", "In-flight entertainment", "Premium dining"];
  }
  if (travelClass === "premium_economy") {
    return ["In-seat power outlet", "In-flight entertainment", "Extra legroom"];
  }
  return ["In-flight entertainment"];
}

function aircraftForRoute(from: string, to: string, index: number): string {
  const key = `${from}${to}${index}`;
  const hash = key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AIRCRAFT_TYPES[hash % AIRCRAFT_TYPES.length]!;
}

function baggageItemsForBooking(booking: Booking): TripBaggageItem[] {
  const checked = booking.baggageAllowance ?? "Standard allowance";
  return [
    {
      name: "Personal item",
      description: "Purse, small backpack, or briefcase",
      included: true,
    },
    {
      name: "Carry-on bag",
      description: "Fits in the overhead bin or under the seat",
      included: true,
    },
    {
      name: "Checked bag",
      description: checked,
      included: true,
    },
  ];
}

function buildItinerary(booking: Booking): TripItineraryItem[] {
  if (booking.flightSegments.length > 0) {
    const items: TripItineraryItem[] = [];

    booking.flightSegments.forEach((segment, index) => {
      const fromMeta = airportLabel(segment.departureAirport, segment.departureCity);
      const toMeta = airportLabel(segment.arrivalAirport, segment.arrivalCity);
      const legMinutes = wallClockDifferenceMinutes(
        segment.departureTime,
        segment.arrivalTime,
      );

      items.push({
        kind: "flight",
        flightNumber: segment.flightNumber,
        airline: segment.airline,
        airlineIata: segment.airlineIata,
        fromAirport: segment.departureAirport,
        fromCity: fromMeta.city,
        fromAirportName: fromMeta.name,
        toAirport: segment.arrivalAirport,
        toCity: toMeta.city,
        toAirportName: toMeta.name,
        departureTime: normalizeWallClockForStorage(segment.departureTime),
        arrivalTime: normalizeWallClockForStorage(segment.arrivalTime),
        durationLabel: durationLabel(legMinutes),
        travelClass: TRAVEL_CLASS_LABELS[booking.travelClass],
        aircraft: segment.aircraft ?? aircraftForRoute(segment.departureAirport, segment.arrivalAirport, index),
        amenities: amenitiesForClass(booking.travelClass),
      });

      const layover = booking.layovers[index];
      if (layover) {
        const layoverMeta = airportLabel(layover.airport, layover.city);
        items.push({
          kind: "layover",
          airport: layover.airport,
          city: layoverMeta.city,
          airportName: layoverMeta.name,
          durationLabel: formatLayoverDuration(layover.durationMinutes),
          durationMinutes: layover.durationMinutes,
        });
      }
    });

    return items;
  }

  const totalMinutes = Math.max(
    wallClockDifferenceMinutes(booking.departureTime, booking.arrivalTime),
    0,
  );
  const layoverMinutes = booking.layovers.reduce((sum, layover) => sum + layover.durationMinutes, 0);
  const flightMinutes = Math.max(totalMinutes - layoverMinutes, 0);
  const segmentCount = booking.layovers.length + 1;
  const minutesPerSegment = segmentCount > 0 ? Math.floor(flightMinutes / segmentCount) : flightMinutes;

  const airports = [
    booking.departureAirport,
    ...booking.layovers.map((layover) => layover.airport),
    booking.arrivalAirport,
  ];
  const cities = [
    booking.departureCity,
    ...booking.layovers.map((layover) => layover.city),
    booking.arrivalCity,
  ];

  const items: TripItineraryItem[] = [];
  let cursor = wallClockToDisplayDate(booking.departureTime);
  const arrival = wallClockToDisplayDate(booking.arrivalTime);

  for (let index = 0; index < segmentCount; index += 1) {
    const from = airports[index]!;
    const to = airports[index + 1]!;
    const fromMeta = airportLabel(from, cities[index] ?? null);
    const toMeta = airportLabel(to, cities[index + 1] ?? null);
    const isLast = index === segmentCount - 1;
    const segmentEnd = isLast ? arrival : addMinutes(cursor, minutesPerSegment);
    const segmentStartStored = wallClockFromDisplayDate(cursor);
    const segmentEndStored = wallClockFromDisplayDate(segmentEnd);

    items.push({
      kind: "flight",
      flightNumber: booking.flightNumber,
      airline: booking.airline,
      airlineIata: booking.airlineIata,
      fromAirport: from,
      fromCity: fromMeta.city,
      fromAirportName: fromMeta.name,
      toAirport: to,
      toCity: toMeta.city,
      toAirportName: toMeta.name,
      departureTime: segmentStartStored,
      arrivalTime: segmentEndStored,
      durationLabel: durationLabel(
        differenceInMinutes(segmentEnd, cursor),
      ),
      travelClass: TRAVEL_CLASS_LABELS[booking.travelClass],
      aircraft: aircraftForRoute(from, to, index),
      amenities: amenitiesForClass(booking.travelClass),
    });

    cursor = segmentEnd;

    const layover = booking.layovers[index];
    if (layover) {
      const layoverMeta = airportLabel(layover.airport, layover.city);
      items.push({
        kind: "layover",
        airport: layover.airport,
        city: layoverMeta.city,
        airportName: layoverMeta.name,
        durationLabel: formatLayoverDuration(layover.durationMinutes),
        durationMinutes: layover.durationMinutes,
      });
      cursor = addMinutes(cursor, layover.durationMinutes);
    }
  }

  return items;
}

function formatBillingAddress(booking: Booking): string | null {
  const parts = [
    booking.billingAddressLine1,
    booking.billingAddressLine2,
    [booking.billingCity, booking.billingState, booking.billingPostalCode].filter(Boolean).join(", "),
    booking.billingCountry,
  ].filter((part) => part && part.trim().length > 0);

  return parts.length > 0 ? parts.join("\n") : null;
}

function hasBillingDetails(booking: Booking): boolean {
  return Boolean(
    booking.billingName ||
      booking.billingEmail ||
      booking.billingPhone ||
      booking.billingAddressLine1 ||
      booking.billingCity ||
      booking.paymentMethod,
  );
}

function buildBillingDetails(booking: Booking): TripBillingDetails | null {
  if (!hasBillingDetails(booking)) return null;

  return {
    name: booking.billingName,
    email: booking.billingEmail,
    phone: booking.billingPhone,
    addressLine1: booking.billingAddressLine1,
    addressLine2: booking.billingAddressLine2,
    city: booking.billingCity,
    state: booking.billingState,
    postalCode: booking.billingPostalCode,
    country: booking.billingCountry,
    paymentMethod: booking.paymentMethod,
    formattedAddress: formatBillingAddress(booking),
  };
}

/** Map a booking into the rich trip-details view model. */
export function tripDetailsFromBooking(
  booking: Booking,
  liveFlight?: FlightStatusResult | null,
): TripDetailsData {
  const fromMeta = airportLabel(booking.departureAirport, booking.departureCity);
  const toMeta = airportLabel(booking.arrivalAirport, booking.arrivalCity);
  const totalMinutes = wallClockDifferenceMinutes(
    booking.departureTime,
    booking.arrivalTime,
  );

  return {
    reference: booking.bookingReference,
    bookedOnLabel: formatTripDate(booking.createdAt),
    statusLabel: BOOKING_STATUS_LABELS[booking.status],
    passengerName: passengerFullName(booking),
    email: booking.email,
    phone: booking.phone,
    routeTitle: `${fromMeta.city} to ${toMeta.city}`,
    departureDateLabel: formatTripDate(booking.departureTime),
    fromAirport: booking.departureAirport,
    toAirport: booking.arrivalAirport,
    totalDurationLabel: durationLabel(totalMinutes),
    stopsLabel: stopsLabel(booking.stops),
    layoverSummary:
      booking.layovers.length > 0
        ? booking.layovers
            .map(
              (layover) =>
                `${formatLayoverDuration(layover.durationMinutes)} in ${airportLabel(layover.airport, layover.city).city}`,
            )
            .join(" · ")
        : null,
    airline: booking.airline,
    airlineIata: booking.airlineIata,
    flightNumber: booking.flightNumber,
    travelClass: TRAVEL_CLASS_LABELS[booking.travelClass],
    departureTimeLabel: `${formatTripClock(booking.departureTime)} · ${formatTripDateShort(booking.departureTime)}`,
    arrivalTimeLabel: `${formatTripClock(booking.arrivalTime)} · ${formatTripDateShort(booking.arrivalTime)}`,
    departureGate: booking.departureGate ?? "TBA",
    departureTerminal: booking.departureTerminal ? `Terminal ${booking.departureTerminal}` : "TBA",
    arrivalGate: booking.arrivalGate ?? "TBA",
    arrivalTerminal: booking.arrivalTerminal ? `Terminal ${booking.arrivalTerminal}` : "TBA",
    seat: booking.seat ?? "—",
    baggageAllowance: booking.baggageAllowance ?? "Standard allowance",
    baggageItems: baggageItemsForBooking(booking),
    itinerary: buildItinerary(booking),
    liveFlight: liveFlight ?? null,
    billing: buildBillingDetails(booking),
  };
}
