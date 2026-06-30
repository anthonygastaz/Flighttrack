import type { Booking, BookingFlightSegment, Layover } from "@/core/domain/booking";
import type { BookingSource, BookingStatus, TravelClass } from "@/core/domain/enums";
import type { BookingQuery, Paginated } from "@/core/domain/pagination";

/** Fields accepted when creating a booking (reference is generated server-side). */
export interface CreateBookingInput {
  passengerFirstName: string;
  passengerLastName: string;
  email?: string | null;
  phone?: string | null;
  airline: string;
  airlineIata?: string | null;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureCity?: string | null;
  arrivalCity?: string | null;
  stops?: number;
  layovers?: Layover[];
  flightSegments?: BookingFlightSegment[];
  departureTerminal?: string | null;
  arrivalTerminal?: string | null;
  departureGate?: string | null;
  arrivalGate?: string | null;
  departureTime: string;
  arrivalTime: string;
  seat?: string | null;
  travelClass: TravelClass;
  baggageAllowance?: string | null;
  billingName?: string | null;
  billingEmail?: string | null;
  billingPhone?: string | null;
  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingPostalCode?: string | null;
  billingCountry?: string | null;
  paymentMethod?: string | null;
  fareSubtotal?: number | null;
  taxesFees?: number | null;
  totalPrice?: number | null;
  currency?: string;
  status: BookingStatus;
  bookingSource?: BookingSource;
  notes?: string | null;
  /** Admin override on create; omit or null to auto-generate. */
  bookingReference?: string | null;
  /** When the booking was made (shown as "Booked on" to passengers). */
  createdAt?: string;
}

export type UpdateBookingInput = Partial<Omit<CreateBookingInput, "bookingReference">> & {
  bookingReference?: string;
};

/**
 * Persistence boundary for bookings. The application layer depends on this
 * interface, never on Supabase directly — enabling alternative adapters and
 * straightforward testing.
 */
export interface BookingRepository {
  findByReference(reference: string): Promise<Booking | null>;
  findById(id: string): Promise<Booking | null>;
  list(query: BookingQuery): Promise<Paginated<Booking>>;
  search(term: string, limit?: number): Promise<Booking[]>;
  referenceExists(reference: string): Promise<boolean>;
  create(input: CreateBookingInput, reference: string): Promise<Booking>;
  update(id: string, input: UpdateBookingInput): Promise<Booking | null>;
  delete(id: string): Promise<boolean>;
}
