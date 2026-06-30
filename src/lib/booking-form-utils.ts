import type { Booking } from "@/core/domain/booking";
import type { BookingFormInput } from "@/lib/validation/booking-schema";
import { toDatetimeLocalValue } from "@/lib/format";

/** Map a domain booking to form default values. */
export function bookingToFormValues(booking: Booking): BookingFormInput {
  return {
    bookingReference: booking.bookingReference,
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
    stops: booking.stops,
    layovers: booking.layovers.map((layover) => ({
      airport: layover.airport,
      city: layover.city ?? "",
      durationHours: Math.floor(layover.durationMinutes / 60),
      durationMinutes: layover.durationMinutes % 60,
    })),
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
    billingName: booking.billingName ?? "",
    billingEmail: booking.billingEmail ?? "",
    billingPhone: booking.billingPhone ?? "",
    billingAddressLine1: booking.billingAddressLine1 ?? "",
    billingAddressLine2: booking.billingAddressLine2 ?? "",
    billingCity: booking.billingCity ?? "",
    billingState: booking.billingState ?? "",
    billingPostalCode: booking.billingPostalCode ?? "",
    billingCountry: booking.billingCountry ?? "",
    paymentMethod: booking.paymentMethod ?? "",
    fareSubtotal: booking.fareSubtotal ?? "",
    taxesFees: booking.taxesFees ?? "",
    totalPrice: booking.totalPrice ?? "",
    currency: booking.currency ?? "USD",
  };
}

/** Default values for a new booking form. */
export function defaultBookingFormValues(): BookingFormInput {
  const departure = new Date();
  departure.setDate(departure.getDate() + 7);
  departure.setHours(10, 0, 0, 0);
  const arrival = new Date(departure.getTime() + 8 * 60 * 60 * 1000);

  return {
    bookingReference: "",
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
    stops: 0,
    layovers: [],
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
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "",
    paymentMethod: "",
    fareSubtotal: "",
    taxesFees: "",
    totalPrice: "",
    currency: "USD",
  };
}
