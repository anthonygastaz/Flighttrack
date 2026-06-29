import type { User } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

/** True when the given email is on the admin allow-list. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = serverEnv.adminEmails;
  // If no allow-list is configured, treat any authenticated user as admin in
  // development so the dashboard is reachable; production should always set it.
  if (allow.length === 0) return process.env.NODE_ENV !== "production";
  return allow.includes(email.toLowerCase());
}

export interface AdminSession {
  user: User;
}

/** Returns the current user if signed in, else null. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns an admin session, or null if not signed in / not an admin. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!isAdminEmail(user.email)) return null;
  return { user };
}

/**
 * Asserts an admin session for server actions. Throws on failure — the action
 * wrapper converts this into a typed `unauthorized`/`forbidden` Result.
 */
export class AuthorizationError extends Error {
  constructor(
    public readonly reason: "unauthorized" | "forbidden",
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthorizationError("unauthorized", "You must be signed in.");
  }
  if (!isAdminEmail(user.email)) {
    throw new AuthorizationError("forbidden", "Admin access required.");
  }
  return { user };
}
