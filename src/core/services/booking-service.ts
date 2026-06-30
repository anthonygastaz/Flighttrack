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
  isValidBookingReference,
  normalizeBookingReference,
} from "@/core/services/booking-reference";
import { formatBookingPersistenceError } from "@/core/repositories/supabase-errors";

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

  /** Create a booking, generating a collision-checked unique reference unless one is provided. */
  async create(input: CreateBookingInput): Promise<Result<Booking>> {
    try {
      let reference: string;

      if (input.bookingReference) {
        reference = normalizeBookingReference(input.bookingReference);
        if (!isValidBookingReference(reference)) {
          return err("validation_error", "Enter a valid 13-digit booking code.", {
            bookingReference: ["Booking code must be exactly 13 digits."],
          });
        }
        if (await this.repo.referenceExists(reference)) {
          return err("conflict", "This booking code is already in use.", {
            bookingReference: ["Choose a different booking code."],
          });
        }
      } else {
        reference = await generateUniqueBookingReference((candidate) =>
          this.repo.referenceExists(candidate),
        );
      }

      const booking = await this.repo.create(input, reference);
      return ok(booking);
    } catch (error) {
      console.error("[booking-service] create failed", error);
      return err("internal_error", formatBookingPersistenceError(error));
    }
  }

  async update(id: string, input: UpdateBookingInput): Promise<Result<Booking>> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) return err("not_found", "Booking not found.");

      const nextInput = { ...input };

      if (input.bookingReference !== undefined) {
        const reference = normalizeBookingReference(input.bookingReference);
        if (!isValidBookingReference(reference)) {
          return err("validation_error", "Enter a valid 13-digit booking code.", {
            bookingReference: ["Booking code must be exactly 13 digits."],
          });
        }
        if (
          reference !== existing.bookingReference &&
          (await this.repo.referenceExists(reference))
        ) {
          return err("conflict", "This booking code is already in use.", {
            bookingReference: ["Choose a different booking code."],
          });
        }
        nextInput.bookingReference = reference;
      }

      const booking = await this.repo.update(id, nextInput);
      if (!booking) return err("not_found", "Booking not found.");
      return ok(booking);
    } catch (error) {
      console.error("[booking-service] update failed", error);
      return err("internal_error", formatBookingPersistenceError(error));
    }
  }

  async remove(id: string): Promise<Result<true>> {
    try {
      const deleted = await this.repo.delete(id);
      if (!deleted) return err("not_found", "Booking not found.");
      return ok(true);
    } catch (error) {
      console.error("[booking-service] delete failed", error);
      return err("internal_error", formatBookingPersistenceError(error));
    }
  }
}
