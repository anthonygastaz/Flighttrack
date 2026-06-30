import type { Booking } from "@/core/domain/booking";
import type { BookingFormInput } from "@/lib/validation/booking-schema";
import { flightSegmentsForStops } from "@/lib/validation/flight-segment-form";
import { toDateInputValue, toDatetimeLocalValue } from "@/lib/format";
import { wallClockFromLocalDate } from "@/lib/datetime/wall-clock";

/** Map a domain booking to form default values. */
export function bookingToFormValues(booking: Booking): BookingFormInput {
  return {
    bookingReference: booking.bookingReference,
    bookedOn: toDateInputValue(booking.createdAt),
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
    flightSegments:
      booking.flightSegments.length > 0
        ? booking.flightSegments.map((segment) => ({
            airline: segment.airline,
            airlineIata: segment.airlineIata ?? "",
            flightNumber: segment.flightNumber,
            departureAirport: segment.departureAirport,
            arrivalAirport: segment.arrivalAirport,
            departureCity: segment.departureCity ?? "",
            arrivalCity: segment.arrivalCity ?? "",
            departureTime: toDatetimeLocalValue(segment.departureTime),
            arrivalTime: toDatetimeLocalValue(segment.arrivalTime),
            departureTerminal: segment.departureTerminal ?? "",
            arrivalTerminal: segment.arrivalTerminal ?? "",
            departureGate: segment.departureGate ?? "",
            arrivalGate: segment.arrivalGate ?? "",
            seat: segment.seat ?? "",
            aircraft: segment.aircraft ?? "",
          }))
        : booking.stops > 0
          ? flightSegmentsForStops(booking.stops, [], {
              airline: booking.airline,
              airlineIata: booking.airlineIata ?? "",
              flightNumber: booking.flightNumber,
              departureAirport: booking.departureAirport,
              arrivalAirport: booking.arrivalAirport,
              departureCity: booking.departureCity ?? "",
              arrivalCity: booking.arrivalCity ?? "",
              departureTime: toDatetimeLocalValue(booking.departureTime),
              arrivalTime: toDatetimeLocalValue(booking.arrivalTime),
              departureTerminal: booking.departureTerminal ?? "",
              arrivalTerminal: booking.arrivalTerminal ?? "",
              departureGate: booking.departureGate ?? "",
              arrivalGate: booking.arrivalGate ?? "",
              seat: booking.seat ?? "",
              layoverAirports: booking.layovers.map((layover) => layover.airport),
            })
          : [],
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
    bookedOn: toDateInputValue(new Date().toISOString()),
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
    flightSegments: [],
    departureTerminal: "",
    arrivalTerminal: "",
    departureGate: "",
    arrivalGate: "",
    departureTime: toDatetimeLocalValue(wallClockFromLocalDate(departure)),
    arrivalTime: toDatetimeLocalValue(wallClockFromLocalDate(arrival)),
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
  };
}
