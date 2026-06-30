import { formatDistanceToNow, format, parseISO } from "date-fns";

import {
  formatWallClock,
  normalizeWallClockForStorage,
  wallClockToDatetimeLocalValue,
  wallClockToDisplayDate,
} from "@/lib/datetime/wall-clock";

/** Format a real UTC instant (e.g. live flight API data). */
export function formatInstantDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "EEE, MMM d · HH:mm");
  } catch {
    return iso;
  }
}

/** Format a stored booking time for display (e.g. "Mon, Jun 29 · 14:30"). */
export function formatDateTime(iso: string): string {
  return formatWallClock(iso, "EEE, MMM d · HH:mm");
}

/** Short time only (e.g. "14:30"). */
export function formatTime(iso: string): string {
  return formatWallClock(iso, "HH:mm");
}

/** 12-hour clock (e.g. "2:30 PM"). */
export function formatTime12(iso: string): string {
  return formatWallClock(iso, "h:mm a");
}

/** Relative time from a wall-clock instant (approximate; uses viewer locale). */
export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(wallClockToDisplayDate(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

/** Convert ISO to date input value (YYYY-MM-DD) using wall-clock components. */
export function toDateInputValue(iso: string): string {
  try {
    const date = parseISO(normalizeWallClockForStorage(iso));
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  } catch {
    return "";
  }
}

/** Convert date input (YYYY-MM-DD) to ISO, using UTC noon for the calendar day. */
export function dateInputToIso(dateValue: string): string {
  return normalizeWallClockForStorage(`${dateValue}T12:00`);
}

/** Convert stored booking time to datetime-local input value. */
export function toDatetimeLocalValue(iso: string): string {
  return wallClockToDatetimeLocalValue(iso);
}

/** Format a currency amount for display. */
export function formatMoney(amount: number | null | undefined, currency = "USD"): string | null {
  if (amount === null || amount === undefined) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Airline logo URL via avs.io CDN. */
export function airlineLogoUrl(iata: string | null, size = 80): string {
  const code = (iata ?? "XX").toUpperCase().slice(0, 2);
  return `https://pics.avs.io/${size}/${size}/${code}.png`;
}
