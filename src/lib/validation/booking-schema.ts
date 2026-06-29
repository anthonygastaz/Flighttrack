import { z } from "zod";

import { BOOKING_SOURCES, BOOKING_STATUSES, TRAVEL_CLASSES } from "@/core/domain/enums";

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
  .transform((value) => (value && value.length > 0 ? value : null));

/**
 * Canonical booking form schema. Used by React Hook Form on the client and
 * re-validated on the server inside the booking service.
 */
export const bookingFormSchema = z
  .object({
    passengerFirstName: z.string().trim().min(1, "First name is required.").max(80),
    passengerLastName: z.string().trim().min(1, "Last name is required.").max(80),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value.toLowerCase() : null)),
    phone: optionalText,

    airline: z.string().trim().min(2, "Airline is required.").max(80),
    airlineIata: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2}$/, "Use a 2-character airline code (e.g. BA).")
      .optional()
      .or(z.literal(""))
      .transform((value) => (value ? value : null)),
    flightNumber,

    departureAirport: iataAirport,
    arrivalAirport: iataAirport,
    departureCity: optionalText,
    arrivalCity: optionalText,

    departureTerminal: optionalText,
    arrivalTerminal: optionalText,
    departureGate: optionalText,
    arrivalGate: optionalText,

    departureTime: z.string().min(1, "Departure time is required."),
    arrivalTime: z.string().min(1, "Arrival time is required."),

    seat: optionalText,
    travelClass: z.enum(TRAVEL_CLASSES),
    baggageAllowance: optionalText,

    status: z.enum(BOOKING_STATUSES),
    bookingSource: z.enum(BOOKING_SOURCES).default("demo"),
    notes: z.string().trim().max(1000).optional().transform((v) => (v && v.length ? v : null)),
  })
  .superRefine((data, ctx) => {
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
  });

/** Input shape (pre-transform) — what React Hook Form binds to. */
export type BookingFormInput = z.input<typeof bookingFormSchema>;
/** Output shape (post-transform) — what the service receives. */
export type BookingFormValues = z.output<typeof bookingFormSchema>;

/** Partial schema for PATCH/update operations. */
export const bookingUpdateSchema = bookingFormSchema;
