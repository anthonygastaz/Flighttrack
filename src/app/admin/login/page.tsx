import type { Metadata } from "next";

import { BrandLogo } from "@/components/layout/brand-logo";
import { LoginForm } from "./login-form";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

/** Always read fresh env — never statically cache this page. */
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = isSupabaseConfigured;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-navy p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/hero-header-bg.png')" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-navy/40 via-brand-navy/80 to-brand-navy" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandLogo
            href="/"
            variant="on-dark"
            size="lg"
            nameClassName="text-2xl text-white"
            className="mx-auto mb-6 justify-center"
          />
          <h1 className="font-display text-3xl font-normal tracking-tight text-white">Admin sign in</h1>
          <p className="mt-2 text-sm text-white/60">
            Sign in to manage bookings and view analytics.
          </p>
        </div>

        {!configured && (
          <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="font-medium">Supabase not configured</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-amber-100/80">
              <li>
                Copy <code className="rounded bg-black/20 px-1">.env.example</code> to{" "}
                <code className="rounded bg-black/20 px-1">.env.local</code>
              </li>
              <li>
                Add your URL, anon key, and service role key from{" "}
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Supabase API settings
                </a>
              </li>
              <li>
                Set <code className="rounded bg-black/20 px-1">ADMIN_EMAILS</code> to your admin
                email
              </li>
              <li>
                Restart <code className="rounded bg-black/20 px-1">npm run dev</code>
              </li>
            </ol>
          </div>
        )}

        <div className="admin-panel rounded-2xl p-8">
          <LoginForm disabled={!configured} />
        </div>
      </div>
    </div>
  );
}
