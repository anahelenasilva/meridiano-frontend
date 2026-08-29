import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AddTranscriptionModal from "./AddTranscriptionModal";

const mutateAsync = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useChannels: () => ({
    data: [{ id: "channel-1", name: "Test Channel", enabled: true }],
  }),
  useAddTranscriptions: () => ({ mutateAsync, isPending: false }),
}));

// The Select is a Radix combobox; jsdom lacks these APIs so we stub them,
// matching the setup already used for the same component in
// YoutubeTranscriptionsPage.test.tsx.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe("AddTranscriptionModal", () => {
  it("counts the parsed urls as you type", () => {
    render(<AddTranscriptionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText(/video urls/i), {
      target: { value: "https://youtu.be/aaa\nhttps://youtu.be/bbb" },
    });

    expect(screen.getByText("2 URLs")).toBeInTheDocument();
  });

  it("submits the parsed array with the batch options", async () => {
    mutateAsync.mockResolvedValue({
      accepted: ["https://www.youtube.com/watch?v=aaa"],
      skipped: [],
      rejected: [],
    });

    render(<AddTranscriptionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText(/video urls/i), {
      target: { value: "https://youtu.be/aaa, https://youtu.be/aaa" },
    });
    fireEvent.click(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getByText("Test Channel")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Test Channel"));
    fireEvent.click(screen.getByRole("button", { name: /add videos/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        urls: ["https://youtu.be/aaa"],
        channelId: "channel-1",
        customPrompt: undefined,
        generateAudio: false,
      });
    });
  });
});
