import { NextResponse } from "next/server";

import { findNearestAirport } from "@/lib/airports/geo";

/** GET /api/airports/nearest?lat=&lon= — nearest airport to coordinates */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const airport = findNearestAirport(lat, lon);
  if (!airport) {
    return NextResponse.json({ error: "No airport found" }, { status: 404 });
  }

  return NextResponse.json({ airport });
}
