import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import { passengerFullName, routeLabel } from "@/core/domain/booking";

/** GET /api/search?q= — search bookings by reference, name, or flight number. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  try {
    const services = getServices();
    const bookings = await services.bookings.search(q, 20);

    return NextResponse.json({
      success: true,
      results: bookings.map((b) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        passenger: passengerFullName(b),
        flightNumber: b.flightNumber,
        airline: b.airline,
        route: routeLabel(b),
        status: b.status,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
