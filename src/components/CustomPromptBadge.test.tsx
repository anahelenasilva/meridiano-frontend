import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomPromptBadge } from "./CustomPromptBadge";

describe("CustomPromptBadge", () => {
  it("renders with default title", () => {
    render(<CustomPromptBadge />);
    expect(screen.getByText(/custom/i)).toBeInTheDocument();
    expect(screen.getByTitle("Has custom instruction")).toBeInTheDocument();
  });
});
