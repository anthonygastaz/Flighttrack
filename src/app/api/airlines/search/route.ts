import { NextResponse } from "next/server";

import { searchAirlinesGlobal } from "@/lib/airlines/search";

/** GET /api/airlines/search?q= — global airline autocomplete */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const results = searchAirlinesGlobal(q, 12);
  return NextResponse.json({ results });
}
