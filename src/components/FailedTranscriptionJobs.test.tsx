import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FailedTranscriptionJobs from "./FailedTranscriptionJobs";

const useFailedTranscriptionJobs = vi.fn();
const dismiss = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useFailedTranscriptionJobs: () => useFailedTranscriptionJobs(),
  useDismissTranscriptionJob: () => ({ mutate: dismiss, isPending: false }),
}));

describe("FailedTranscriptionJobs", () => {
  beforeEach(() => {
    dismiss.mockReset();
    useFailedTranscriptionJobs.mockReturnValue({
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
    });
  });

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

  it("renders nothing when there are no failed jobs", () => {
    useFailedTranscriptionJobs.mockReturnValue({ data: { jobs: [] } });
    const { container } = render(<FailedTranscriptionJobs />);

    expect(container.firstChild).toBeNull();
  });
});
