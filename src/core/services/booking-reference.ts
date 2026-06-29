import { randomInt } from "node:crypto";

import {
  BOOKING_REFERENCE_ALPHABET,
  BOOKING_REFERENCE_LENGTH,
} from "@/core/services/booking-reference-utils";

export {
  BOOKING_REFERENCE_PATTERN,
  isValidBookingReference,
  normalizeBookingReference,
} from "@/core/services/booking-reference-utils";

/** Generate a single candidate reference (not yet collision-checked). */
export function generateBookingReference(): string {
  let reference = "";
  for (let i = 0; i < BOOKING_REFERENCE_LENGTH; i += 1) {
    reference += BOOKING_REFERENCE_ALPHABET[randomInt(BOOKING_REFERENCE_ALPHABET.length)];
  }
  return reference;
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
