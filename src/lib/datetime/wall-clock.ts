import { differenceInMinutes, format, parseISO } from "date-fns";

/**
 * Booking schedule times are "wall clock" values — the digits entered in admin
 * (datetime-local) are stored and shown exactly as-is, with no timezone shift.
 *
 * Storage format: ISO-8601 UTC where UTC components equal the entered local digits
 * (e.g. form "2026-07-15T14:30" → "2026-07-15T14:30:00.000Z").
 */

const DATETIME_LOCAL_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/;
const STORED_WALL_CLOCK_PATTERN =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?Z$/;

/** Normalize any booking datetime string to wall-clock UTC storage. */
export function normalizeWallClockForStorage(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const storedMatch = trimmed.match(STORED_WALL_CLOCK_PATTERN);
  if (storedMatch) {
    return `${storedMatch[1]}T${storedMatch[2]}:${storedMatch[3]}:${storedMatch[4]}.000Z`;
  }

  const localMatch = trimmed.match(DATETIME_LOCAL_PATTERN);
  if (localMatch) {
    const seconds = localMatch[4] ?? "00";
    return `${localMatch[1]}T${localMatch[2]}:${localMatch[3]}:${seconds}.000Z`;
  }

  const parsed = parseISO(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}T${pad(parsed.getUTCHours())}:${pad(parsed.getUTCMinutes())}:${pad(parsed.getUTCSeconds())}.000Z`;
  }

  return trimmed;
}

/** Date object whose local formatters render the stored wall-clock components. */
export function wallClockToDisplayDate(stored: string): Date {
  const normalized = normalizeWallClockForStorage(stored);
  const utc = parseISO(normalized);
  return new Date(utc.getTime() + utc.getTimezoneOffset() * 60_000);
}

/** Format a stored wall-clock datetime for display (timezone-independent). */
export function formatWallClock(stored: string, pattern: string): string {
  try {
    return format(wallClockToDisplayDate(stored), pattern);
  } catch {
    return stored;
  }
}

/** Minutes between two wall-clock datetimes. */
export function wallClockDifferenceMinutes(start: string, end: string): number {
  try {
    return differenceInMinutes(
      wallClockToDisplayDate(end),
      wallClockToDisplayDate(start),
    );
  } catch {
    return 0;
  }
}

/** datetime-local input value from stored wall-clock time. */
export function wallClockToDatetimeLocalValue(stored: string): string {
  try {
    const date = parseISO(normalizeWallClockForStorage(stored));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
  } catch {
    return "";
  }
}

/** Compare wall-clock datetimes (returns ms difference). */
export function compareWallClock(a: string, b: string): number {
  return (
    wallClockToDisplayDate(a).getTime() - wallClockToDisplayDate(b).getTime()
  );
}

/** Serialize a display Date (from addMinutes etc.) back to stored wall-clock. */
export function wallClockFromDisplayDate(date: Date): string {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}.000Z`;
}

/** Store the local date/time components of a Date without timezone conversion. */
export function wallClockFromLocalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return normalizeWallClockForStorage(
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`,
  );
}

/** True when the string can be parsed as a wall-clock datetime. */
export function isValidWallClock(value: string): boolean {
  try {
    const normalized = normalizeWallClockForStorage(value);
    return !Number.isNaN(parseISO(normalized).getTime());
  } catch {
    return false;
  }
}
