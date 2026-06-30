import { NextResponse } from "next/server";

import { findAirportByIata } from "@/lib/airports/search";

interface RouteContext {
  params: Promise<{ iata: string }>;
}

/** GET /api/airports/[iata] */
export async function GET(_request: Request, context: RouteContext) {
  const { iata } = await context.params;
  const airport = findAirportByIata(decodeURIComponent(iata));

  if (!airport) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ airport });
}
