import { NextResponse } from "next/server";

import { searchAirportsGlobal } from "@/lib/airports/search";

/** GET /api/airports/search?q= — global airport autocomplete */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const results = searchAirportsGlobal(q, 12);
  return NextResponse.json({ results });
}
