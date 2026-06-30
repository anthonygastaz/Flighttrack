import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { publicEnv, isSupabaseConfigured, serverEnv } from "@/lib/env";
import type { Database } from "./types";

const SUPABASE_SETUP_MESSAGE =
  "Supabase is not configured. Copy .env.example to .env.local, add your project URL and API keys from the Supabase dashboard, then restart the dev server.";

function assertSupabasePublicConfig(): void {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }
}

function assertSupabaseServerConfig(): void {
  assertSupabasePublicConfig();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to .env.local and restart the dev server.",
    );
  }
}

/**
 * Shared Supabase client type. Domain mappers enforce type safety at boundaries.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppSupabaseClient = SupabaseClient<any>;

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads and writes the auth session via Next's cookie store.
 */
export async function createServerSupabase(): Promise<AppSupabaseClient> {
  assertSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // `setAll` can be called from a Server Component where mutating
          // cookies is not allowed. The middleware refreshes sessions, so this
          // is safe to ignore.
        }
      },
    },
  }) as unknown as AppSupabaseClient;
}

/**
 * Service-role client — bypasses Row Level Security. Use ONLY in trusted
 * server code (admin repository) after the caller has been authorised.
 */
export function createAdminSupabase(): AppSupabaseClient {
  assertSupabaseServerConfig();
  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      cookies: { getAll: () => [], setAll: () => {} },
    },
  ) as unknown as AppSupabaseClient;
}
