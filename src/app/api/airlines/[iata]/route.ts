import { NextResponse } from "next/server";

import { findAirlineByIata } from "@/lib/airlines/search";

interface RouteContext {
  params: Promise<{ iata: string }>;
}

/** GET /api/airlines/[iata] */
export async function GET(_request: Request, context: RouteContext) {
  const { iata } = await context.params;
  const airline = findAirlineByIata(decodeURIComponent(iata));

  if (!airline) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ airline });
}
