import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Format an ISO timestamp for display (e.g. "Mon, Jun 29 · 14:30"). */
export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "EEE, MMM d · HH:mm");
  } catch {
    return iso;
  }
}

/** Short time only (e.g. "14:30"). */
export function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return iso;
  }
}

/** Relative time (e.g. "in 3 days"). */
export function formatRelative(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

/** Convert ISO to datetime-local input value. */
export function toDatetimeLocalValue(iso: string): string {
  try {
    const date = parseISO(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
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
