import { z } from "zod";

import { BOOKING_SOURCES, BOOKING_STATUSES, TRAVEL_CLASSES } from "@/core/domain/enums";
import { isValidBookingReference, normalizeBookingReference } from "@/core/services/booking-reference-utils";

const iataAirport = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Use a 3-letter IATA airport code (e.g. LHR).");

const flightNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{2,3}\d{1,4}$/, "Enter a valid flight number (e.g. BA249).");

const optionalText = z
  .string()
  .trim()
  .max(120)
  .optional()
  .or(z.literal(""));

const optionalMoney = z
  .union([z.literal(""), z.coerce.number().min(0, "Amount cannot be negative.").max(9_999_999.99)])
  .optional()
  .or(z.literal(""));

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email.")
  .optional()
  .or(z.literal(""));

const layoverFormSchema = z.object({
  airport: iataAirport,
  city: optionalText,
  durationHours: z.coerce.number().int().min(0, "Hours cannot be negative.").max(48),
  durationMinutes: z.coerce.number().int().min(0, "Minutes cannot be negative.").max(59),
});

/**
 * Canonical booking form schema. Used by React Hook Form on the client and
 * re-validated on the server inside the booking service.
 *
 * Keep fields as form-friendly primitives (empty strings, not null) so client
 * resolver output can be safely re-parsed on the server.
 */
export const bookingFormSchema = z
  .object({
    bookingReference: z
      .string()
      .trim()
      .transform((value) => normalizeBookingReference(value))
      .optional()
      .or(z.literal("")),
    passengerFirstName: z.string().trim().min(1, "First name is required.").max(80),
    passengerLastName: z.string().trim().min(1, "Last name is required.").max(80),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .optional()
      .or(z.literal("")),
    phone: optionalText,

    airline: z.string().trim().min(2, "Airline is required.").max(80),
    airlineIata: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2}$/, "Use a 2-character airline code (e.g. BA).")
      .optional()
      .or(z.literal("")),
    flightNumber,

    departureAirport: iataAirport,
    arrivalAirport: iataAirport,
    departureCity: optionalText,
    arrivalCity: optionalText,

    stops: z.coerce.number().int().min(0).max(3).default(0),
    layovers: z.array(layoverFormSchema).default([]),

    departureTerminal: optionalText,
    arrivalTerminal: optionalText,
    departureGate: optionalText,
    arrivalGate: optionalText,

    departureTime: z.string().min(1, "Departure time is required."),
    arrivalTime: z.string().min(1, "Arrival time is required."),

    seat: optionalText,
    travelClass: z.enum(TRAVEL_CLASSES),
    baggageAllowance: optionalText,

    billingName: optionalText,
    billingEmail: optionalEmail,
    billingPhone: optionalText,
    billingAddressLine1: z.string().trim().max(160).optional().or(z.literal("")),
    billingAddressLine2: z.string().trim().max(160).optional().or(z.literal("")),
    billingCity: optionalText,
    billingState: optionalText,
    billingPostalCode: optionalText,
    billingCountry: optionalText,
    paymentMethod: optionalText,

    fareSubtotal: optionalMoney,
    taxesFees: optionalMoney,
    totalPrice: optionalMoney,
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code (e.g. USD).")
      .default("USD"),

    status: z.enum(BOOKING_STATUSES),
    bookingSource: z.enum(BOOKING_SOURCES).default("demo"),
    notes: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.bookingReference && !isValidBookingReference(data.bookingReference)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bookingReference"],
        message: "Booking code must be exactly 13 digits.",
      });
    }

    const departure = new Date(data.departureTime);
    const arrival = new Date(data.arrivalTime);

    if (Number.isNaN(departure.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departureTime"],
        message: "Invalid departure date/time.",
      });
    }
    if (Number.isNaN(arrival.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivalTime"],
        message: "Invalid arrival date/time.",
      });
    }
    if (
      !Number.isNaN(departure.getTime()) &&
      !Number.isNaN(arrival.getTime()) &&
      arrival.getTime() <= departure.getTime()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivalTime"],
        message: "Arrival must be after departure.",
      });
    }
    if (data.departureAirport === data.arrivalAirport) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivalAirport"],
        message: "Origin and destination must differ.",
      });
    }

    if (data.stops === 0 && data.layovers.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["layovers"],
        message: "Remove layover details for a non-stop flight.",
      });
    }

    if (data.stops > 0 && data.layovers.length !== data.stops) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stops"],
        message: `Add details for all ${data.stops} layover${data.stops === 1 ? "" : "s"}.`,
      });
    }

    data.layovers.forEach((layover, index) => {
      const totalMinutes = layover.durationHours * 60 + layover.durationMinutes;
      if (totalMinutes <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["layovers", index, "durationMinutes"],
          message: "Layover duration is required.",
        });
      }
      if (layover.airport === data.departureAirport || layover.airport === data.arrivalAirport) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["layovers", index, "airport"],
          message: "Layover airport must differ from origin and destination.",
        });
      }
    });
  });

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
export type BookingFormValues = BookingFormInput;

/** Partial schema for PATCH/update operations. */
export const bookingUpdateSchema = bookingFormSchema;

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function moneyToNull(value: number | "" | undefined): number | null {
  if (value === "" || value === undefined || value === null) return null;
  return value;
}

/** Map validated form values to the booking service create/update input. */
export function bookingFormValuesToInput(values: BookingFormValues) {
  const bookingReference = values.bookingReference ? values.bookingReference : null;

  return {
    bookingReference,
    passengerFirstName: values.passengerFirstName,
    passengerLastName: values.passengerLastName,
    email: emptyToNull(values.email)?.toLowerCase() ?? null,
    phone: emptyToNull(values.phone),
    airline: values.airline,
    airlineIata: emptyToNull(values.airlineIata),
    flightNumber: values.flightNumber,
    departureAirport: values.departureAirport,
    arrivalAirport: values.arrivalAirport,
    departureCity: emptyToNull(values.departureCity),
    arrivalCity: emptyToNull(values.arrivalCity),
    stops: values.stops,
    layovers:
      values.stops > 0
        ? values.layovers.map((layover) => ({
            airport: layover.airport,
            city: emptyToNull(layover.city),
            durationMinutes: layover.durationHours * 60 + layover.durationMinutes,
          }))
        : [],
    departureTerminal: emptyToNull(values.departureTerminal),
    arrivalTerminal: emptyToNull(values.arrivalTerminal),
    departureGate: emptyToNull(values.departureGate),
    arrivalGate: emptyToNull(values.arrivalGate),
    departureTime: values.departureTime,
    arrivalTime: values.arrivalTime,
    seat: emptyToNull(values.seat),
    travelClass: values.travelClass,
    baggageAllowance: emptyToNull(values.baggageAllowance),
    billingName: emptyToNull(values.billingName),
    billingEmail: emptyToNull(values.billingEmail)?.toLowerCase() ?? null,
    billingPhone: emptyToNull(values.billingPhone),
    billingAddressLine1: emptyToNull(values.billingAddressLine1),
    billingAddressLine2: emptyToNull(values.billingAddressLine2),
    billingCity: emptyToNull(values.billingCity),
    billingState: emptyToNull(values.billingState),
    billingPostalCode: emptyToNull(values.billingPostalCode),
    billingCountry: emptyToNull(values.billingCountry),
    paymentMethod: emptyToNull(values.paymentMethod),
    fareSubtotal: moneyToNull(values.fareSubtotal),
    taxesFees: moneyToNull(values.taxesFees),
    totalPrice: moneyToNull(values.totalPrice),
    currency: values.currency || "USD",
    status: values.status,
    bookingSource: values.bookingSource,
    notes: emptyToNull(values.notes),
  };
}
