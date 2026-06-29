"use server";

import { revalidatePath } from "next/cache";

import type { Booking } from "@/core/domain/booking";
import { getServices } from "@/core/container";
import { buildPublicBooking } from "@/core/services/public-booking-builder";
import { type Result, err, ok } from "@/core/domain/result";
import { isSupabaseConfigured } from "@/lib/env";
import {
  type PublicBookingInput,
  publicBookingSchema,
} from "@/lib/validation/public-booking-schema";
import { withErrorHandling } from "./action-helpers";

export type PublicBookingResult = Result<{ reference: string; id: string; booking: Booking }>;

/** Public: book a demo flight and receive a unique tracking reference. */
export async function createPublicBookingAction(
  raw: PublicBookingInput,
): Promise<PublicBookingResult> {
  return withErrorHandling(async () => {
    if (!isSupabaseConfigured) {
      return err(
        "service_unavailable",
        "Booking is temporarily unavailable. Please try again later.",
      );
    }

    const parsed = publicBookingSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        "validation_error",
        "Please check your booking details.",
        parsed.error.flatten().fieldErrors as Record<string, string[]>,
      );
    }

    const services = getServices();
    const result = await services.bookings.create(buildPublicBooking(parsed.data));
    if (!result.ok) return result;

    const booking = result.data;
    revalidatePath("/");
    revalidatePath("/admin/bookings");
    revalidatePath(`/booking/${booking.bookingReference}`);

    return ok({ reference: booking.bookingReference, id: booking.id, booking });
  });
}
