import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CustomPromptDisplay } from "./CustomPromptDisplay";

describe("CustomPromptDisplay", () => {
  const prompt = "Extract step-by-step instructions";

  it("shows label but hides content by default", () => {
    render(<CustomPromptDisplay customPrompt={prompt} />);
    expect(
      screen.getByRole("button", { name: /custom instruction used/i })
    ).toBeInTheDocument();
    expect(screen.queryByText(prompt)).not.toBeInTheDocument();
  });

  it("reveals content on click", () => {
    render(<CustomPromptDisplay customPrompt={prompt} />);

    fireEvent.click(
      screen.getByRole("button", { name: /custom instruction used/i })
    );

    expect(screen.getByText(prompt)).toBeInTheDocument();
  });
});
