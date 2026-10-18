import { describe, expect, it } from "vitest";
import { parseErrorResponse } from "./api-error";

describe("parseErrorResponse", () => {
  it("joins a NestJS ValidationPipe message array instead of falling back to the error label", () => {
    const body = JSON.stringify({
      statusCode: 400,
      message: ["source_id must be a valid UUID", "title should not be empty"],
      error: "Bad Request",
    });

    const error = parseErrorResponse(400, "Bad Request", body);

    expect(error.message).toBe("source_id must be a valid UUID. title should not be empty");
  });
});
