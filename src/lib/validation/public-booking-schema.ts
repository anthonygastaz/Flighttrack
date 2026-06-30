import { z } from "zod";

import { TRAVEL_CLASSES } from "@/core/domain/enums";

export const publicBookingSchema = z
  .object({
    tripType: z.enum(["round-trip", "one-way"]),
    from: z.string().trim().toUpperCase().length(3, "Select origin airport."),
    to: z.string().trim().toUpperCase().length(3, "Select destination airport."),
    departureDate: z.string().min(1, "Select departure date."),
    returnDate: z.string().optional(),
    airlineIata: z.string().trim().toUpperCase().min(2, "Select an airline."),
    passengerFirstName: z.string().trim().min(1, "First name is required.").max(80),
    passengerLastName: z.string().trim().min(1, "Last name is required.").max(80),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v.toLowerCase() : null)),
    travelClass: z.enum(TRAVEL_CLASSES),
    adults: z.coerce.number().int().min(1).max(9),
    seats: z.array(z.string().trim().toUpperCase()).min(1, "Select at least one seat."),
  })
  .superRefine((data, ctx) => {
    if (data.seats.length !== data.adults) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seats"],
        message:
          data.adults === 1
            ? "Select your seat before continuing."
            : `Select ${data.adults} seats before continuing.`,
      });
    }
    if (data.from === data.to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["to"],
        message: "Destination must differ from origin.",
      });
    }
    if (data.tripType === "round-trip" && !data.returnDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["returnDate"],
        message: "Select a return date.",
      });
    }
    if (data.returnDate && data.departureDate) {
      const dep = new Date(data.departureDate);
      const ret = new Date(data.returnDate);
      if (ret <= dep) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["returnDate"],
          message: "Return must be after departure.",
        });
      }
    }
  });

export type PublicBookingInput = z.input<typeof publicBookingSchema>;
export type PublicBookingValues = z.output<typeof publicBookingSchema>;
