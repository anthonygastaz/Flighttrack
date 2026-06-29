import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Refreshes the Supabase auth session on every request and returns both the
 * mutated response (with refreshed cookies) and the resolved user. Used by the
 * root middleware to protect admin routes.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return { response, user: null };
  }

  let mutableResponse = response;

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          mutableResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            mutableResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: mutableResponse, user };
}
