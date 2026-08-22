import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AudioBadge } from "./AudioBadge";

describe("AudioBadge", () => {
  it("renders nothing for state 'none'", () => {
    const { container } = render(<AudioBadge state="none" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a labeled badge for the has_audio state", () => {
    render(<AudioBadge state="has_audio" />);
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByTitle("Has an Audio Summary")).toBeInTheDocument();
  });

  it("labels the generating, queued, and failed states distinctly", () => {
    const { rerender } = render(<AudioBadge state="generating" />);
    expect(screen.getByText("Generating")).toBeInTheDocument();

    rerender(<AudioBadge state="queued" />);
    expect(screen.getByText("Queued")).toBeInTheDocument();

    rerender(<AudioBadge state="failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});
