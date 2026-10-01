import { ApiError } from "@/lib/http/api-error";
import type { Messages } from "./messages/en";

type ApiErrorCode = keyof Messages["apiErrors"];

/**
 * What to tell the user about a failed request: the reason, translated, when
 * the API answered with a code the interface knows (or never answered);
 * otherwise `fallback`, a sentence about what was being attempted.
 */
export function errorMessage(error: unknown, t: Messages, fallback: string): string {
  if (error instanceof ApiError && error.code && Object.hasOwn(t.apiErrors, error.code)) {
    return t.apiErrors[error.code as ApiErrorCode];
  }
  return fallback;
}
