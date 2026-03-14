import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomPromptInput } from "./CustomPromptInput";

describe("CustomPromptInput", () => {
  it("is collapsed by default", () => {
    render(<CustomPromptInput value="" onChange={vi.fn()} />);
    expect(
      screen.queryByPlaceholderText(/extract step/i)
    ).not.toBeInTheDocument();
  });

  it("expands when toggle is clicked", () => {
    render(<CustomPromptInput value="" onChange={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );

    expect(
      screen.getByPlaceholderText(/extract step/i)
    ).toBeInTheDocument();
  });

  it("calls onChange when user types", () => {
    const onChange = vi.fn();
    render(<CustomPromptInput value="" onChange={onChange} />);

    fireEvent.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );
    fireEvent.change(screen.getByPlaceholderText(/extract step/i), {
      target: { value: "Test" },
    });

    expect(onChange).toHaveBeenCalled();
  });

  it("displays character count", () => {
    render(<CustomPromptInput value="Hello" onChange={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: /add custom instruction/i })
    );

    expect(screen.getByText("5/500")).toBeInTheDocument();
  });
});
