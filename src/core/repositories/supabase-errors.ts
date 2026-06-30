/** Shape of errors returned by the Supabase PostgREST client. */
interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function errorText(error: PostgrestLikeError): string {
  return [error.message, error.details, error.hint].filter(Boolean).join(" ");
}

function isMissingColumnError(error: PostgrestLikeError, columns: string[]): boolean {
  const text = errorText(error).toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    columns.some((column) => text.includes(`'${column}'`) || text.includes(column))
  );
}

function isReferenceLengthError(error: PostgrestLikeError): boolean {
  const text = errorText(error).toLowerCase();
  return (
    error.code === "22001" ||
    text.includes("booking_reference") ||
    text.includes("value too long") ||
    text.includes("character varying(6)")
  );
}

/** Turn a Supabase/Postgres failure into an actionable message for admins. */
export function formatBookingPersistenceError(error: unknown): string {
  if (!(error && typeof error === "object")) {
    return "Could not save the booking. Please try again.";
  }

  const pgError = error as PostgrestLikeError;
  const text = errorText(pgError);

  if (isReferenceLengthError(pgError)) {
    return "Database update required: booking references are now 13 digits. In the Supabase SQL editor, run supabase/migrations/0003_booking_reference_13_digits.sql.";
  }

  if (isMissingColumnError(pgError, ["stops", "layovers"])) {
    return "Database update required: layover fields are missing. In the Supabase SQL editor, run supabase/migrations/0004_booking_layovers.sql.";
  }

  if (isMissingColumnError(pgError, ["billing_name", "fare_subtotal", "currency"])) {
    return "Database update required: billing and price fields are missing. In the Supabase SQL editor, run supabase/migrations/0006_booking_billing_and_pricing.sql.";
  }

  if (pgError.code === "23505") {
    return "This booking code is already in use. Choose a different code.";
  }

  if (text.toLowerCase().includes("supabase_service_role_key")) {
    return "Server configuration error: SUPABASE_SERVICE_ROLE_KEY is missing.";
  }

  if (text) {
    return `Could not save the booking: ${text}`;
  }

  return "Could not save the booking. Please try again.";
}

export function shouldRetryWithoutLayoverColumns(error: unknown): boolean {
  if (!(error && typeof error === "object")) return false;
  return isMissingColumnError(error as PostgrestLikeError, ["stops", "layovers"]);
}

export function shouldRetryWithoutBillingColumns(error: unknown): boolean {
  if (!(error && typeof error === "object")) return false;
  return isMissingColumnError(error as PostgrestLikeError, [
    "billing_name",
    "fare_subtotal",
    "currency",
  ]);
}
