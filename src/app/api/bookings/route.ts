import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import { statusForError } from "@/core/domain/result";
import { requireAdmin } from "@/lib/auth/admin";
import { bookingFormSchema } from "@/lib/validation/booking-schema";

function toIso(value: string): string {
  return new Date(value).toISOString();
}

/** POST /api/bookings — create a booking (admin). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = bookingFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const values = parsed.data;
    const services = getServices();
    const result = await services.bookings.create({
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

    return NextResponse.json({
      success: true,
      bookingReference: result.data.bookingReference,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
