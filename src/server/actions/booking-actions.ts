"use server";

import { revalidatePath } from "next/cache";

import { getServices } from "@/core/container";
import type { Booking } from "@/core/domain/booking";
import { type Result, err, ok } from "@/core/domain/result";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import { type BookingFormInput, bookingFormSchema, bookingFormValuesToInput } from "@/lib/validation/booking-schema";
import { withAdmin } from "./action-helpers";

function formValuesToInput(
  values: ReturnType<typeof bookingFormSchema.parse>,
): CreateBookingInput {
  return bookingFormValuesToInput(values);
}

function revalidateBookingViews(reference?: string, id?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/analytics");
  if (reference) revalidatePath(`/booking/${reference}`);
  if (id) revalidatePath(`/admin/bookings/${id}/edit`);
}

export type BookingActionResult = Result<{ id: string; reference: string }>;

/** Create a booking (admin only). Generates a unique reference. */
export async function createBookingAction(raw: BookingFormInput): Promise<BookingActionResult> {
  return withAdmin(async () => {
    const parsed = bookingFormSchema.safeParse(raw);
    if (!parsed.success) {
      return err("validation_error", "Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
    }

    const services = getServices();
    const result = await services.bookings.create(formValuesToInput(parsed.data));
    if (!result.ok) return result;

    const booking: Booking = result.data;
    revalidateBookingViews(booking.bookingReference);
    void services.notifications.notify("booking_created", booking);

    return ok({ id: booking.id, reference: booking.bookingReference });
  });
}

/** Update an existing booking (admin only). */
export async function updateBookingAction(
  id: string,
  raw: BookingFormInput,
): Promise<BookingActionResult> {
  return withAdmin(async () => {
    const parsed = bookingFormSchema.safeParse(raw);
    if (!parsed.success) {
      return err("validation_error", "Please fix the highlighted fields.", parsed.error.flatten().fieldErrors);
    }

    if (!parsed.data.bookingReference) {
      return err("validation_error", "Booking code is required.", {
        bookingReference: ["Enter the 13-digit booking code."],
      });
    }

    const services = getServices();
    const existing = await services.bookings.getById(id);
    if (!existing) {
      return err("not_found", "Booking not found.");
    }

    const input: UpdateBookingInput = {
      ...formValuesToInput(parsed.data),
      bookingReference: parsed.data.bookingReference || undefined,
    };
    const result = await services.bookings.update(id, input);
    if (!result.ok) return result;

    const booking = result.data;
    revalidateBookingViews(booking.bookingReference, booking.id);
    if (existing.bookingReference !== booking.bookingReference) {
      revalidatePath(`/booking/${existing.bookingReference}`);
    }
    void services.notifications.notify("booking_updated", booking);

    return ok({ id: booking.id, reference: booking.bookingReference });
  });
}

/** Delete a booking (admin only). */
export async function deleteBookingAction(id: string): Promise<Result<true>> {
  return withAdmin(async () => {
    const services = getServices();
    const result = await services.bookings.remove(id);
    if (!result.ok) return result;
    revalidateBookingViews();
    return ok(true);
  });
}
