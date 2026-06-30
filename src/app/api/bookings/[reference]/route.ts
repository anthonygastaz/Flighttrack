import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import type { Booking } from "@/core/domain/booking";
import { passengerFullName } from "@/core/domain/booking";
import { statusForError } from "@/core/domain/result";
import { TRAVEL_CLASS_LABELS, BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import { requireAdmin } from "@/lib/auth/admin";
import { normalizeBookingReference } from "@/core/services/booking-reference";
import { bookingFormSchema, bookingFormValuesToInput } from "@/lib/validation/booking-schema";

function toIso(value: string): string {
  return new Date(value).toISOString();
}

function toUpdateInput(values: ReturnType<typeof bookingFormSchema.parse>) {
  const mapped = bookingFormValuesToInput(values);
  const { bookingReference, ...rest } = mapped;
  return {
    ...rest,
    departureTime: toIso(mapped.departureTime),
    arrivalTime: toIso(mapped.arrivalTime),
    ...(bookingReference ? { bookingReference } : {}),
  };
}

function serializeBooking(booking: Booking) {
  return {
    bookingReference: booking.bookingReference,
    passenger: passengerFullName(booking),
    flightNumber: booking.flightNumber,
    airline: booking.airline,
    origin: booking.departureAirport,
    destination: booking.arrivalAirport,
    departureTime: booking.departureTime,
    arrivalTime: booking.arrivalTime,
    gate: booking.departureGate,
    terminal: booking.departureTerminal,
    seat: booking.seat,
    travelClass: TRAVEL_CLASS_LABELS[booking.travelClass],
    status: BOOKING_STATUS_LABELS[booking.status],
  };
}

interface RouteContext {
  params: Promise<{ reference: string }>;
}

/** GET /api/bookings/{reference} — track a booking. */
export async function GET(_request: Request, context: RouteContext) {
  const { reference: raw } = await context.params;
  const reference = normalizeBookingReference(raw);

  try {
    const services = getServices();
    const result = await services.tracking.track(reference);

    if (result.type === "not_found") {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    if (result.type === "flight") {
      return NextResponse.json({
        success: true,
        type: "flight",
        flight: result.flight,
      });
    }

    return NextResponse.json({
      success: true,
      type: "booking",
      booking: serializeBooking(result.booking),
      liveFlight: result.flight,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

/** PATCH /api/bookings/{reference} — update a booking (admin). */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { reference: raw } = await context.params;
  const reference = normalizeBookingReference(raw);

  try {
    const body = await request.json();
    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed" },
        { status: 400 },
      );
    }

    const services = getServices();
    const existing = await services.bookings.getByReference(reference);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const values = parsed.data;
    const result = await services.bookings.update(existing.id, toUpdateInput(values));

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: statusForError(result.error.code) },
      );
    }

    return NextResponse.json({ success: true, bookingReference: result.data.bookingReference });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}

/** DELETE /api/bookings/{reference} — delete a booking (admin). */
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { reference: raw } = await context.params;
  const reference = normalizeBookingReference(raw);

  try {
    const services = getServices();
    const existing = await services.bookings.getByReference(reference);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    const result = await services.bookings.remove(existing.id);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: statusForError(result.error.code) },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
