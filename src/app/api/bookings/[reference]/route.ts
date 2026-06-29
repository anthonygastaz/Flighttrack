import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import type { Booking } from "@/core/domain/booking";
import { passengerFullName } from "@/core/domain/booking";
import { statusForError } from "@/core/domain/result";
import { TRAVEL_CLASS_LABELS, BOOKING_STATUS_LABELS } from "@/core/domain/enums";
import { requireAdmin } from "@/lib/auth/admin";
import { normalizeBookingReference } from "@/core/services/booking-reference";
import { bookingFormSchema } from "@/lib/validation/booking-schema";

function toIso(value: string): string {
  return new Date(value).toISOString();
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
    const result = await services.bookings.update(existing.id, {
      passengerFirstName: values.passengerFirstName,
      passengerLastName: values.passengerLastName,
      email: values.email,
      phone: values.phone,
      airline: values.airline,
      airlineIata: values.airlineIata,
      flightNumber: values.flightNumber,
      departureAirport: values.departureAirport,
      arrivalAirport: values.arrivalAirport,
      departureCity: values.departureCity,
      arrivalCity: values.arrivalCity,
      departureTerminal: values.departureTerminal,
      arrivalTerminal: values.arrivalTerminal,
      departureGate: values.departureGate,
      arrivalGate: values.arrivalGate,
      departureTime: toIso(values.departureTime),
      arrivalTime: toIso(values.arrivalTime),
      seat: values.seat,
      travelClass: values.travelClass,
      baggageAllowance: values.baggageAllowance,
      status: values.status,
      bookingSource: values.bookingSource,
      notes: values.notes,
    });

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
