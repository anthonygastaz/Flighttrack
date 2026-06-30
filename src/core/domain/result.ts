/**
 * A lightweight Result type used by services and server actions so that
 * expected failures (validation, not-found, conflicts) are modelled as data
 * rather than thrown exceptions. Unexpected failures still throw.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export type AppErrorCode =
  | "validation_error"
  | "not_found"
  | "conflict"
  | "unauthorized"
  | "forbidden"
  | "rate_limited"
  | "service_unavailable"
  | "internal_error";

export interface AppError {
  code: AppErrorCode;
  message: string;
  /** Field-level validation messages, keyed by field path. */
  fields?: Record<string, string[]>;
}

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err(
  code: AppErrorCode,
  message: string,
  fields?: Record<string, string[]>,
): Result<never> {
  return { ok: false, error: { code, message, fields } };
}

/** Maps an AppError code to an HTTP status for route handlers. */
export function statusForError(code: AppErrorCode): number {
  switch (code) {
    case "validation_error":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "conflict":
      return 409;
    case "rate_limited":
      return 429;
    case "service_unavailable":
      return 503;
    case "internal_error":
    default:
      return 500;
  }
}
