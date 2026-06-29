import type { Booking } from "@/core/domain/booking";
import type { BookingFormInput } from "@/lib/validation/booking-schema";
import { toDatetimeLocalValue } from "@/lib/format";

/** Map a domain booking to form default values. */
export function bookingToFormValues(booking: Booking): BookingFormInput {
  return {
    passengerFirstName: booking.passengerFirstName,
    passengerLastName: booking.passengerLastName,
    email: booking.email ?? "",
    phone: booking.phone ?? "",
    airline: booking.airline,
    airlineIata: booking.airlineIata ?? "",
    flightNumber: booking.flightNumber,
    departureAirport: booking.departureAirport,
    arrivalAirport: booking.arrivalAirport,
    departureCity: booking.departureCity ?? "",
    arrivalCity: booking.arrivalCity ?? "",
    departureTerminal: booking.departureTerminal ?? "",
    arrivalTerminal: booking.arrivalTerminal ?? "",
    departureGate: booking.departureGate ?? "",
    arrivalGate: booking.arrivalGate ?? "",
    departureTime: toDatetimeLocalValue(booking.departureTime),
    arrivalTime: toDatetimeLocalValue(booking.arrivalTime),
    seat: booking.seat ?? "",
    travelClass: booking.travelClass,
    baggageAllowance: booking.baggageAllowance ?? "",
    status: booking.status,
    bookingSource: booking.bookingSource,
    notes: booking.notes ?? "",
  };
}

/** Default values for a new booking form. */
export function defaultBookingFormValues(): BookingFormInput {
  const departure = new Date();
  departure.setDate(departure.getDate() + 7);
  departure.setHours(10, 0, 0, 0);
  const arrival = new Date(departure.getTime() + 8 * 60 * 60 * 1000);

  return {
    passengerFirstName: "",
    passengerLastName: "",
    email: "",
    phone: "",
    airline: "",
    airlineIata: "",
    flightNumber: "",
    departureAirport: "",
    arrivalAirport: "",
    departureCity: "",
    arrivalCity: "",
    departureTerminal: "",
    arrivalTerminal: "",
    departureGate: "",
    arrivalGate: "",
    departureTime: toDatetimeLocalValue(departure.toISOString()),
    arrivalTime: toDatetimeLocalValue(arrival.toISOString()),
    seat: "",
    travelClass: "economy",
    baggageAllowance: "1 x 23kg",
    status: "confirmed",
    bookingSource: "demo",
    notes: "",
  };
}
