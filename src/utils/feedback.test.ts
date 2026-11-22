import { describe, expect, it } from "vitest";
import { MESSAGES } from "@/constants/messages";
import { ApiError } from "@/utils/api-error";
import {
  canSubmitFeedback,
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_PAGE_CONTEXT_MAX_LENGTH,
  feedbackErrorMessage,
  feedbackPageContext,
} from "./feedback";

describe("canSubmitFeedback", () => {
  it("rejects an empty or whitespace-only message", () => {
    expect(canSubmitFeedback("")).toBe(false);
    expect(canSubmitFeedback("   \n\t ")).toBe(false);
  });

  it("accepts text up to the backend limit", () => {
    expect(canSubmitFeedback("The filters reset")).toBe(true);
    expect(canSubmitFeedback("a".repeat(FEEDBACK_MESSAGE_MAX_LENGTH))).toBe(true);
    expect(canSubmitFeedback("a".repeat(FEEDBACK_MESSAGE_MAX_LENGTH + 1))).toBe(false);
  });
});

describe("feedbackPageContext", () => {
  it("joins the path and the query string", () => {
    expect(feedbackPageContext("/articles", "?page=2")).toBe("/articles?page=2");
    expect(feedbackPageContext("/articles/123")).toBe("/articles/123");
  });

  it("drops line breaks and fits the backend limit", () => {
    expect(feedbackPageContext("/a\r\nb")).toBe("/a b");
    const long = feedbackPageContext(`/${"x".repeat(1000)}`);
    expect(long).toHaveLength(FEEDBACK_PAGE_CONTEXT_MAX_LENGTH);
  });
});

describe("feedbackErrorMessage", () => {
  it("names the rate limit on a 429", () => {
    expect(feedbackErrorMessage(new ApiError(429, "Too Many Requests", "x"))).toBe(
      MESSAGES.ERROR.FEEDBACK_RATE_LIMITED,
    );
  });

  it.each([400, 502, 503])("gives the generic failure on a %i", (status) => {
    expect(feedbackErrorMessage(new ApiError(status, "", "x"))).toBe(
      MESSAGES.ERROR.FEEDBACK_FAILED,
    );
  });

  it("gives the generic failure on a network error", () => {
    expect(feedbackErrorMessage(new TypeError("Failed to fetch"))).toBe(
      MESSAGES.ERROR.FEEDBACK_FAILED,
    );
  });
});
