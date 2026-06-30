import { differenceInMinutes, format, parseISO } from "date-fns";

import type { Booking } from "@/core/domain/booking";
import { formatLayoverDuration, passengerFullName, stopsLabel } from "@/core/domain/booking";
import { TRAVEL_CLASS_LABELS } from "@/core/domain/enums";
import { findAirportByIata } from "@/lib/airports/search";
import { formatTime } from "@/lib/format";

export interface BoardingPassData {
  reference: string;
  airline: string;
  airlineIata: string | null;
  flightNumber: string;
  departureAirport: string;
  departureLocation: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalLocation: string;
  arrivalTime: string;
  durationLabel: string;
  stopsLabel: string;
  layoverSummary: string | null;
  checkIn: string;
  gate: string;
  seats: string;
  terminal: string;
  travelClass: string;
  dateLabel: string;
  passengerName: string;
  ticketCode: string;
}

function airportLocation(iata: string, fallbackCity: string | null): string {
  const airport = findAirportByIata(iata);
  if (!airport) return fallbackCity ?? iata;
  if (airport.country) return `${airport.city}, ${airport.country}`;
  return airport.city;
}

function formatDurationLabel(departureIso: string, arrivalIso: string): string {
  try {
    const minutes = differenceInMinutes(parseISO(arrivalIso), parseISO(departureIso));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
  } catch {
    return "—";
  }
}

function formatTicketDate(iso: string): string {
  try {
    return format(parseISO(iso), "d MMM yy");
  } catch {
    return iso;
  }
}

function buildTicketCode(booking: Booking): string {
  return `${booking.bookingReference}${booking.flightNumber}`.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

/** Map a domain booking into boarding-pass display fields. */
export function boardingPassFromBooking(booking: Booking): BoardingPassData {
  return {
    reference: booking.bookingReference,
    airline: booking.airline,
    airlineIata: booking.airlineIata,
    flightNumber: booking.flightNumber,
    departureAirport: booking.departureAirport,
    departureLocation: airportLocation(booking.departureAirport, booking.departureCity),
    departureTime: formatTime(booking.departureTime),
    arrivalAirport: booking.arrivalAirport,
    arrivalLocation: airportLocation(booking.arrivalAirport, booking.arrivalCity),
    arrivalTime: formatTime(booking.arrivalTime),
    durationLabel: formatDurationLabel(booking.departureTime, booking.arrivalTime),
    stopsLabel: stopsLabel(booking.stops),
    layoverSummary:
      booking.layovers.length > 0
        ? booking.layovers
            .map(
              (layover) =>
                `via ${layover.airport}${layover.city ? ` (${layover.city})` : ""} · ${formatLayoverDuration(layover.durationMinutes)}`,
            )
            .join(" · ")
        : null,
    checkIn: booking.departureGate ?? "—",
    gate: booking.departureTerminal ?? "—",
    seats: booking.seat ?? "—",
    terminal: booking.departureTerminal ? `T${booking.departureTerminal}` : "—",
    travelClass: TRAVEL_CLASS_LABELS[booking.travelClass],
    dateLabel: formatTicketDate(booking.departureTime),
    passengerName: passengerFullName(booking),
    ticketCode: buildTicketCode(booking),
  };
}
