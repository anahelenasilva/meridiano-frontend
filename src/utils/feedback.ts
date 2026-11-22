import { MESSAGES } from "@/constants/messages";
import { ApiError } from "@/utils/api-error";

/** Mirrors `@MaxLength` on `CreateFeedbackDto.message` in the backend. */
export const FEEDBACK_MESSAGE_MAX_LENGTH = 5000;

/** Mirrors `@MaxLength` on `CreateFeedbackDto.pageContext` in the backend. */
export const FEEDBACK_PAGE_CONTEXT_MAX_LENGTH = 500;

/** A message can be sent when it has text other than whitespace and fits the backend limit. */
export function canSubmitFeedback(message: string): boolean {
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= FEEDBACK_MESSAGE_MAX_LENGTH;
}

/**
 * The route the user was on: path plus query string, so filters and pages
 * come along. The backend rejects line breaks and anything over its limit.
 */
export function feedbackPageContext(pathname: string, search: string): string {
  return `${pathname}${search}`
    .replace(/[\r\n]+/g, " ")
    .slice(0, FEEDBACK_PAGE_CONTEXT_MAX_LENGTH);
}

/** A 429 gets the rate-limit message; every other failure gets the generic one. */
export function feedbackErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return MESSAGES.ERROR.FEEDBACK_RATE_LIMITED;
  }
  return MESSAGES.ERROR.FEEDBACK_FAILED;
}
