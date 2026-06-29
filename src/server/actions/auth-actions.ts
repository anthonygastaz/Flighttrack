"use server";

import { redirect } from "next/navigation";

import { type Result, err, ok } from "@/core/domain/result";
import { isAdminEmail } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase/server";

const credentialsSchemaError = "Enter a valid email and password.";
const supabaseSetupError =
  "Supabase is not configured. Copy .env.example to .env.local, add your URL and API keys, then restart the dev server.";

/** Sign in an admin with email + password. */
export async function signInAction(
  _prev: Result<null> | null,
  formData: FormData,
): Promise<Result<null>> {
  if (!isSupabaseConfigured) {
    return err("service_unavailable", supabaseSetupError);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return err("validation_error", credentialsSchemaError);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return err("unauthorized", "Invalid email or password.");
  }

  if (!isAdminEmail(email)) {
    await supabase.auth.signOut();
    return err("forbidden", "This account does not have admin access.");
  }

  redirect("/admin");
}

/** Sign the current user out and return to the homepage. */
export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  redirect("/");
}
