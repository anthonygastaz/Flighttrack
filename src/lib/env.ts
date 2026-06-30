/**
 * Centralised, validated access to environment variables.
 *
 * Public (`NEXT_PUBLIC_*`) values are safe on the client. Server-only secrets
 * are read lazily and must never be imported into a client component.
 */

import { APP_NAME } from "@/lib/brand";

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example for setup.`,
    );
  }
  return value;
}

function isPlaceholder(value: string): boolean {
  return (
    value.length === 0 ||
    value.includes("your-project-ref") ||
    value.startsWith("your-")
  );
}

/** Public configuration — safe to reference from client components. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

/**
 * Whether Supabase is configured. The UI degrades gracefully when it is not
 * (e.g. the marketing homepage still renders), instead of crashing.
 */
export const isSupabaseConfigured =
  !isPlaceholder(publicEnv.supabaseUrl) && !isPlaceholder(publicEnv.supabaseAnonKey);

/** Server-only configuration. Throws if accessed without being configured. */
export const serverEnv = {
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  get adminEmails(): string[] {
    return (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  },
  amadeus: {
    get clientId() {
      return process.env.AMADEUS_CLIENT_ID ?? "";
    },
    get clientSecret() {
      return process.env.AMADEUS_CLIENT_SECRET ?? "";
    },
    get baseUrl() {
      return process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";
    },
    get isConfigured() {
      return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
    },
  },
  resend: {
    get apiKey() {
      return process.env.RESEND_API_KEY ?? "";
    },
    get fromEmail() {
      return process.env.RESEND_FROM_EMAIL ?? `${APP_NAME} <no-reply@flighttrack.app>`;
    },
    get isConfigured() {
      return Boolean(process.env.RESEND_API_KEY);
    },
  },
  twilio: {
    get accountSid() {
      return process.env.TWILIO_ACCOUNT_SID ?? "";
    },
    get authToken() {
      return process.env.TWILIO_AUTH_TOKEN ?? "";
    },
    get fromNumber() {
      return process.env.TWILIO_FROM_NUMBER ?? "";
    },
    get isConfigured() {
      return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    },
  },
} as const;
