import type { BookingStatus, TravelClass } from "./enums";

/** Generic paginated collection envelope. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type SortDirection = "asc" | "desc";

export type BookingSortField =
  | "created_at"
  | "departure_time"
  | "booking_reference"
  | "status"
  | "airline";

/** Query parameters for listing/searching bookings in the admin table. */
export interface BookingQuery {
  search?: string;
  status?: BookingStatus;
  travelClass?: TravelClass;
  airline?: string;
  page: number;
  pageSize: number;
  sortBy: BookingSortField;
  sortDir: SortDirection;
}

export const DEFAULT_BOOKING_QUERY: BookingQuery = {
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  sortDir: "desc",
};

export function clampPageSize(size: number): number {
  if (Number.isNaN(size)) return DEFAULT_BOOKING_QUERY.pageSize;
  return Math.min(Math.max(Math.trunc(size), 1), 100);
}
