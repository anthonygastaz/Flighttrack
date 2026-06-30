import "server-only";

import { type Result, err } from "@/core/domain/result";
import { AuthorizationError, requireAdmin } from "@/lib/auth/admin";

/**
 * Runs an admin-only server action body, translating authorization failures
 * and unexpected exceptions into a typed {@link Result} so the client always
 * receives a structured response.
 */
export async function withAdmin<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    await requireAdmin();
    return await fn();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return err(error.reason, error.message);
    }
    console.error("[server-action] unexpected error", error);
    return err("internal_error", "Something went wrong. Please try again.");
  }
}

/** Wrap a public (unauthenticated) action body with uniform error handling. */
export async function withErrorHandling<T>(fn: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await fn();
  } catch (error) {
    console.error("[server-action] unexpected error", error);
    return err("internal_error", "Something went wrong. Please try again.");
  }
}
