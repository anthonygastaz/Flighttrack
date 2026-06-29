import { NextResponse } from "next/server";

import { getServices } from "@/core/container";
import { normalizeBookingReference } from "@/core/services/booking-reference";

interface RouteContext {
  params: Promise<{ flightNumber: string }>;
}

/** GET /api/flights/{flightNumber} — live flight status lookup. */
export async function GET(request: Request, context: RouteContext) {
  const { flightNumber: raw } = await context.params;
  const flightNumber = normalizeBookingReference(raw);
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;

  try {
    const services = getServices();
    const status = await services.flights.getStatus(flightNumber, date);

    if (!status || status.source === "unavailable") {
      return NextResponse.json({ success: false, error: "Flight not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, flight: status });
  } catch {
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}
