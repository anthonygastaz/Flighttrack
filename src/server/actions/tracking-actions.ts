"use server";

import { revalidatePath } from "next/cache";

import { getServices } from "@/core/container";
import { type Result, err, ok } from "@/core/domain/result";
import type { TrackResult } from "@/core/services/tracking-service";
import { generateDemoBooking } from "@/core/services/demo-generator";
import { withAdmin, withErrorHandling } from "./action-helpers";

/** Public: track a booking reference (or flight number). */
export async function trackBookingAction(query: string): Promise<Result<TrackResult>> {
  return withErrorHandling(async () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return err("validation_error", "Enter a booking reference to track.");
    }
    const services = getServices();
    const result = await services.tracking.track(trimmed);
    return ok(result);
  });
}

/**
 * Admin: create a single realistic demo booking with a unique reference.
 * Returns the generated reference so the UI can deep-link to it.
 */
export async function createDemoBookingAction(): Promise<
  Result<{ id: string; reference: string }>
> {
  return withAdmin(async () => {
    const services = getServices();
    const result = await services.bookings.create(generateDemoBooking());
    if (!result.ok) return result;
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/analytics");
    return ok({ id: result.data.id, reference: result.data.bookingReference });
  });
}

/** Admin: seed a batch of demo bookings at once. */
export async function seedDemoBookingsAction(count = 10): Promise<Result<{ created: number }>> {
  return withAdmin(async () => {
    const services = getServices();
    const total = Math.min(Math.max(count, 1), 50);
    let created = 0;
    for (let i = 0; i < total; i += 1) {
      const result = await services.bookings.create(generateDemoBooking());
      if (result.ok) created += 1;
    }
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/analytics");
    return ok({ created });
  });
}
