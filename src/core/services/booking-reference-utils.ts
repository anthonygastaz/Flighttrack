/** Unambiguous alphabet: digits 2-9 and letters A-Z minus I, O. */
export const BOOKING_REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const BOOKING_REFERENCE_LENGTH = 6;

export const BOOKING_REFERENCE_PATTERN = new RegExp(
  `^[${BOOKING_REFERENCE_ALPHABET}]{${BOOKING_REFERENCE_LENGTH}}$`,
);

/** True when `value` is a structurally valid booking reference. */
export function isValidBookingReference(value: string): boolean {
  return BOOKING_REFERENCE_PATTERN.test(value);
}

/** Normalise user input (trim, uppercase, strip spaces/dashes). */
export function normalizeBookingReference(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, "");
}
