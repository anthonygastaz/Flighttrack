import { z } from "zod";

import { BOOKING_SOURCES, BOOKING_STATUSES, TRAVEL_CLASSES } from "@/core/domain/enums";
import type { BookingFlightSegment } from "@/core/domain/booking";
import { isValidBookingReference, normalizeBookingReference } from "@/core/services/booking-reference-utils";
import { dateInputToIso } from "@/lib/format";
import {
  compareWallClock,
  isValidWallClock,
  normalizeWallClockForStorage,
} from "@/lib/datetime/wall-clock";
import { flightSegmentFormSchema } from "@/lib/validation/flight-segment-form";

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
    bookedOn: z.string().min(1, "Booking date is required."),
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
    flightSegments: z.array(flightSegmentFormSchema).default([]),

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

    const bookedOn = new Date(`${data.bookedOn}T12:00:00`);
    if (Number.isNaN(bookedOn.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bookedOn"],
        message: "Invalid booking date.",
      });
    }

    if (!isValidWallClock(data.departureTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["departureTime"],
        message: "Invalid departure date/time.",
      });
    }
    if (!isValidWallClock(data.arrivalTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["arrivalTime"],
        message: "Invalid arrival date/time.",
      });
    }
    if (
      isValidWallClock(data.departureTime) &&
      isValidWallClock(data.arrivalTime) &&
      compareWallClock(data.arrivalTime, data.departureTime) <= 0
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

    if (data.stops === 0 && data.flightSegments.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["flightSegments"],
        message: "Remove flight legs for a non-stop journey.",
      });
    }

    if (data.stops > 0) {
      const expectedLegs = data.stops + 1;
      if (data.flightSegments.length !== expectedLegs) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["flightSegments"],
          message: `Add flight details for all ${expectedLegs} legs.`,
        });
      }

      data.flightSegments.forEach((segment, index) => {
        if (
          isValidWallClock(segment.departureTime) &&
          isValidWallClock(segment.arrivalTime) &&
          compareWallClock(segment.arrivalTime, segment.departureTime) <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flightSegments", index, "arrivalTime"],
            message: "Arrival must be after departure for this leg.",
          });
        }

        if (index === 0 && segment.departureAirport !== data.departureAirport) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flightSegments", index, "departureAirport"],
            message: "First leg must depart from the journey origin.",
          });
        }

        const lastIndex = data.flightSegments.length - 1;
        if (index === lastIndex && segment.arrivalAirport !== data.arrivalAirport) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flightSegments", index, "arrivalAirport"],
            message: "Final leg must arrive at the journey destination.",
          });
        }

        const layover = data.layovers[index];
        if (layover && segment.arrivalAirport !== layover.airport) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flightSegments", index, "arrivalAirport"],
            message: `Leg ${index + 1} must arrive at layover airport ${layover.airport}.`,
          });
        }

        const nextSegment = data.flightSegments[index + 1];
        if (layover && nextSegment && nextSegment.departureAirport !== layover.airport) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flightSegments", index + 1, "departureAirport"],
            message: `Leg ${index + 2} must depart from layover airport ${layover.airport}.`,
          });
        }
      });
    }
  });

export type BookingFormInput = z.infer<typeof bookingFormSchema>;
export type BookingFormValues = BookingFormInput;

/** Partial schema for PATCH/update operations. */
export const bookingUpdateSchema = bookingFormSchema;

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapFlightSegment(values: BookingFormValues["flightSegments"][number]): BookingFlightSegment {
  return {
    airline: values.airline,
    airlineIata: emptyToNull(values.airlineIata),
    flightNumber: values.flightNumber,
    departureAirport: values.departureAirport,
    arrivalAirport: values.arrivalAirport,
    departureCity: emptyToNull(values.departureCity),
    arrivalCity: emptyToNull(values.arrivalCity),
    departureTime: normalizeWallClockForStorage(values.departureTime),
    arrivalTime: normalizeWallClockForStorage(values.arrivalTime),
    departureTerminal: emptyToNull(values.departureTerminal),
    arrivalTerminal: emptyToNull(values.arrivalTerminal),
    departureGate: emptyToNull(values.departureGate),
    arrivalGate: emptyToNull(values.arrivalGate),
    seat: emptyToNull(values.seat),
    aircraft: emptyToNull(values.aircraft),
  };
}

/** Map validated form values to the booking service create/update input. */
export function bookingFormValuesToInput(values: BookingFormValues) {
  const bookingReference = values.bookingReference ? values.bookingReference : null;
  const flightSegments =
    values.stops > 0
      ? values.flightSegments.map((segment) => mapFlightSegment(segment))
      : [];
  const firstLeg = values.stops > 0 ? values.flightSegments[0] : null;
  const lastLeg =
    values.stops > 0 ? values.flightSegments[values.flightSegments.length - 1] : null;

  return {
    bookingReference,
    createdAt: dateInputToIso(values.bookedOn),
    passengerFirstName: values.passengerFirstName,
    passengerLastName: values.passengerLastName,
    email: emptyToNull(values.email)?.toLowerCase() ?? null,
    phone: emptyToNull(values.phone),
    airline: firstLeg?.airline ?? values.airline,
    airlineIata: emptyToNull(firstLeg?.airlineIata ?? values.airlineIata),
    flightNumber: firstLeg?.flightNumber ?? values.flightNumber,
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
    flightSegments,
    departureTerminal: emptyToNull(firstLeg?.departureTerminal ?? values.departureTerminal),
    arrivalTerminal: emptyToNull(lastLeg?.arrivalTerminal ?? values.arrivalTerminal),
    departureGate: emptyToNull(firstLeg?.departureGate ?? values.departureGate),
    arrivalGate: emptyToNull(lastLeg?.arrivalGate ?? values.arrivalGate),
    departureTime: normalizeWallClockForStorage(firstLeg?.departureTime ?? values.departureTime),
    arrivalTime: normalizeWallClockForStorage(lastLeg?.arrivalTime ?? values.arrivalTime),
    seat: emptyToNull(firstLeg?.seat ?? values.seat),
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
    status: values.status,
    bookingSource: values.bookingSource,
    notes: emptyToNull(values.notes),
  };
}
