export const BOOKING_REFERENCE_LENGTH = 13;

/** Thirteen-digit numeric booking reference (no leading zero). */
export const BOOKING_REFERENCE_PATTERN = /^\d{13}$/;

/** True when `value` is a structurally valid booking reference. */
export function isValidBookingReference(value: string): boolean {
  return BOOKING_REFERENCE_PATTERN.test(value);
}

/** Normalise user input (trim, strip spaces/dashes). */
export function normalizeBookingReference(value: string): string {
  return value.trim().replace(/[\s-]/g, "");
}
