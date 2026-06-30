import { randomInt } from "node:crypto";

export {
  BOOKING_REFERENCE_PATTERN,
  isValidBookingReference,
  normalizeBookingReference,
} from "@/core/services/booking-reference-utils";

const MIN_BOOKING_REFERENCE = 1_000_000_000_000;
const MAX_BOOKING_REFERENCE_EXCLUSIVE = 10_000_000_000_000;

/** Generate a single candidate reference (not yet collision-checked). */
export function generateBookingReference(): string {
  return String(randomInt(MIN_BOOKING_REFERENCE, MAX_BOOKING_REFERENCE_EXCLUSIVE));
}

/**
 * Generate a unique reference by retrying against an async existence check.
 * Throws after `maxAttempts` to surface a (statistically improbable) failure
 * rather than looping forever.
 */
export async function generateUniqueBookingReference(
  exists: (reference: string) => Promise<boolean>,
  maxAttempts = 10,
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateBookingReference();
    if (!(await exists(candidate))) {
      return candidate;
    }
  }
  throw new Error(
    `Could not generate a unique booking reference after ${maxAttempts} attempts.`,
  );
}
