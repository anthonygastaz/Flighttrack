"use server";

import { revalidatePath } from "next/cache";

import { getServices } from "@/core/container";
import type { Booking } from "@/core/domain/booking";
import { type Result, err, ok } from "@/core/domain/result";
import type {
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import { type BookingFormInput, bookingFormSchema } from "@/lib/validation/booking-schema";
import { withAdmin } from "./action-helpers";

/** Convert a datetime-local string to a UTC ISO timestamp. */
function toIso(value: string): string {
  const date = new Date(value);
  return date.toISOString();
}

function formValuesToInput(
  values: ReturnType<typeof bookingFormSchema.parse>,
): CreateBookingInput {
  return {
    passengerFirstName: values.passengerFirstName,
    passengerLastName: values.passengerLastName,
    email: values.email,
    phone: values.phone,
    airline: values.airline,
    airlineIata: values.airlineIata,
    flightNumber: values.flightNumber,
    departureAirport: values.departureAirport,
    arrivalAirport: values.arrivalAirport,
    departureCity: values.departureCity,
    arrivalCity: values.arrivalCity,
    departureTerminal: values.departureTerminal,
    arrivalTerminal: values.arrivalTerminal,
    departureGate: values.departureGate,
    arrivalGate: values.arrivalGate,
    departureTime: toIso(values.departureTime),
    arrivalTime: toIso(values.arrivalTime),
    seat: values.seat,
    travelClass: values.travelClass,
    baggageAllowance: values.baggageAllowance,
    status: values.status,
    bookingSource: values.bookingSource,
    notes: values.notes,
  };
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

    const services = getServices();
    const input: UpdateBookingInput = formValuesToInput(parsed.data);
    const result = await services.bookings.update(id, input);
    if (!result.ok) return result;

    const booking = result.data;
    revalidateBookingViews(booking.bookingReference, booking.id);
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
