import type { Booking } from "@/core/domain/booking";
import type { BookingQuery, Paginated } from "@/core/domain/pagination";
import { type Result, err, ok } from "@/core/domain/result";
import type {
  BookingRepository,
  CreateBookingInput,
  UpdateBookingInput,
} from "@/core/repositories/booking-repository";
import {
  generateUniqueBookingReference,
  normalizeBookingReference,
} from "@/core/services/booking-reference";

/**
 * Application service encapsulating booking business rules. Depends only on the
 * {@link BookingRepository} abstraction.
 */
export class BookingService {
  constructor(private readonly repo: BookingRepository) {}

  list(query: BookingQuery): Promise<Paginated<Booking>> {
    return this.repo.list(query);
  }

  getByReference(reference: string): Promise<Booking | null> {
    return this.repo.findByReference(normalizeBookingReference(reference));
  }

  getById(id: string): Promise<Booking | null> {
    return this.repo.findById(id);
  }

  search(term: string, limit?: number): Promise<Booking[]> {
    return this.repo.search(term.trim(), limit);
  }

  /** Create a booking, generating a collision-checked unique reference. */
  async create(input: CreateBookingInput): Promise<Result<Booking>> {
    const reference = await generateUniqueBookingReference((candidate) =>
      this.repo.referenceExists(candidate),
    );
    const booking = await this.repo.create(input, reference);
    return ok(booking);
  }

  async update(id: string, input: UpdateBookingInput): Promise<Result<Booking>> {
    const booking = await this.repo.update(id, input);
    if (!booking) return err("not_found", "Booking not found.");
    return ok(booking);
  }

  async remove(id: string): Promise<Result<true>> {
    const deleted = await this.repo.delete(id);
    if (!deleted) return err("not_found", "Booking not found.");
    return ok(true);
  }
}
