import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FailedTranscriptionJobs from "./FailedTranscriptionJobs";

const dismiss = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useFailedTranscriptionJobs: () => ({
    data: {
      jobs: [
        {
          jobId: "channel-1:aaa",
          videoUrl: "https://www.youtube.com/watch?v=aaa",
          channelName: "Test Channel",
          reason: "No transcript available",
        },
      ],
    },
  }),
  useDismissTranscriptionJob: () => ({ mutate: dismiss, isPending: false }),
}));

describe("FailedTranscriptionJobs", () => {
  it("shows the url, channel and reason", () => {
    render(<FailedTranscriptionJobs />);

    expect(
      screen.getByText("https://www.youtube.com/watch?v=aaa"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Test Channel/)).toBeInTheDocument();
    expect(screen.getByText(/No transcript available/)).toBeInTheDocument();
  });

  it("dismisses by job id", () => {
    render(<FailedTranscriptionJobs />);

    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(dismiss).toHaveBeenCalledWith("channel-1:aaa");
  });
});
