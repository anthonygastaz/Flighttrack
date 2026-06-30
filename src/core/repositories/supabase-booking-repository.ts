import type { Booking } from "@/core/domain/booking";
import type { BookingQuery, Paginated } from "@/core/domain/pagination";
import {
  createInputToRow,
  rowToBooking,
  updateInputToRow,
} from "@/core/mappers/booking-mapper";
import type {
  BookingRepository,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import type { AppSupabaseClient } from "@/lib/supabase/server";

type Client = AppSupabaseClient;

const TABLE = "bookings";

/** Escape a value for use inside a PostgREST `or(...)` ilike filter. */
function escapeFilter(value: string): string {
  return value.replace(/[%,()]/g, "");
}

/** Supabase-backed implementation of {@link BookingRepository}. */
export class SupabaseBookingRepository implements BookingRepository {
  constructor(private readonly client: Client) {}

  async findByReference(reference: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("booking_reference", reference)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToBooking(data) : null;
  }

  async findById(id: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToBooking(data) : null;
  }

  async list(query: BookingQuery): Promise<Paginated<Booking>> {
    const from = (query.page - 1) * query.pageSize;
    const to = from + query.pageSize - 1;

    let builder = this.client.from(TABLE).select("*", { count: "exact" });

    if (query.search) {
      const term = escapeFilter(query.search);
      builder = builder.or(
        [
          `booking_reference.ilike.%${term}%`,
          `passenger_first_name.ilike.%${term}%`,
          `passenger_last_name.ilike.%${term}%`,
          `flight_number.ilike.%${term}%`,
          `airline.ilike.%${term}%`,
        ].join(","),
      );
    }
    if (query.status) builder = builder.eq("status", query.status);
    if (query.travelClass) builder = builder.eq("travel_class", query.travelClass);
    if (query.airline) builder = builder.ilike("airline", `%${escapeFilter(query.airline)}%`);

    const { data, error, count } = await builder
      .order(query.sortBy, { ascending: query.sortDir === "asc" })
      .range(from, to);

    if (error) throw error;

    const total = count ?? 0;
    return {
      items: (data ?? []).map(rowToBooking),
      total,
      page: query.page,
      pageSize: query.pageSize,
      pageCount: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }

  async search(term: string, limit = 10): Promise<Booking[]> {
    const safe = escapeFilter(term);
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .or(
        [
          `booking_reference.ilike.%${safe}%`,
          `passenger_first_name.ilike.%${safe}%`,
          `passenger_last_name.ilike.%${safe}%`,
          `flight_number.ilike.%${safe}%`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []).map(rowToBooking);
  }

  async referenceExists(reference: string): Promise<boolean> {
    const { count, error } = await this.client
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("booking_reference", reference);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async create(input: CreateBookingInput, reference: string): Promise<Booking> {
    const { data, error } = await this.client
      .from(TABLE)
      .insert(createInputToRow(input, reference))
      .select("*")
      .single();

    if (error) throw error;
    return rowToBooking(data);
  }

  async update(id: string, input: UpdateBookingInput): Promise<Booking | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .update(updateInputToRow(input))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data ? rowToBooking(data) : null;
  }

  async delete(id: string): Promise<boolean> {
    const { error, count } = await this.client
      .from(TABLE)
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) throw error;
    return (count ?? 0) > 0;
  }
}
