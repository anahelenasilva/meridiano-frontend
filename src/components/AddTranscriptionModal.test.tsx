import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/utils/toast";
import AddTranscriptionModal from "./AddTranscriptionModal";

const mutateAsync = vi.fn();

vi.mock("@/hooks/useApi", () => ({
  useChannels: () => ({
    data: [{ id: "channel-1", name: "Test Channel", enabled: true }],
  }),
  useAddTranscriptions: () => ({ mutateAsync, isPending: false }),
}));

vi.mock("@/utils/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
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

  mutateAsync.mockReset();
  vi.mocked(toast.success).mockReset();
  vi.mocked(toast.error).mockReset();
  vi.mocked(toast.info).mockReset();
});

// Fills the URL textarea, picks the only available channel, and clicks
// submit. Returns the onOpenChange spy so callers can assert on it.
async function renderAndSubmit(rawUrls = "https://youtu.be/aaa") {
  const onOpenChange = vi.fn();
  render(<AddTranscriptionModal open onOpenChange={onOpenChange} />);

  fireEvent.change(screen.getByLabelText(/video urls/i), {
    target: { value: rawUrls },
  });
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() => expect(screen.getByText("Test Channel")).toBeInTheDocument());
  fireEvent.click(screen.getByText("Test Channel"));
  fireEvent.click(screen.getByRole("button", { name: /add videos/i }));

  return onOpenChange;
}

describe("AddTranscriptionModal", () => {
  it("counts the parsed urls as you type", () => {
    render(<AddTranscriptionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText(/video urls/i), {
      target: { value: "https://youtu.be/aaa\nhttps://youtu.be/bbb" },
    });

    expect(screen.getByText("2 URLs")).toBeInTheDocument();
  });

  it("blocks submit and names the 25 limit when the paste is over the cap", () => {
    render(<AddTranscriptionModal open onOpenChange={() => {}} />);

    fireEvent.change(screen.getByLabelText(/video urls/i), {
      target: {
        value: Array.from({ length: 26 }, (_, i) => `https://youtu.be/v${i}`).join("\n"),
      },
    });

    expect(screen.getByText(/26 URLs, 25 max per batch/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add videos/i })).toBeDisabled();
  });

  it("submits the parsed array with the batch options and closes the modal", async () => {
    mutateAsync.mockResolvedValue({
      accepted: ["https://www.youtube.com/watch?v=aaa"],
      skipped: [],
      rejected: [],
    });

    const onOpenChange = await renderAndSubmit("https://youtu.be/aaa, https://youtu.be/aaa");

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        urls: ["https://youtu.be/aaa"],
        channelId: "channel-1",
        customPrompt: undefined,
        generateAudio: false,
      });
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  describe("toast summary", () => {
    it("names what was queued when the whole batch is accepted", async () => {
      mutateAsync.mockResolvedValue({
        accepted: ["https://youtu.be/aaa", "https://youtu.be/bbb"],
        skipped: [],
        rejected: [],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith("2 videos queued for transcription."),
      );
    });

    it("keeps the noun singular for a batch of one", async () => {
      mutateAsync.mockResolvedValue({
        accepted: ["https://youtu.be/aaa"],
        skipped: [],
        rejected: [],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith("1 video queued for transcription."),
      );
    });

    it("mentions skipped videos already in the library", async () => {
      mutateAsync.mockResolvedValue({
        accepted: ["https://youtu.be/aaa"],
        skipped: ["https://youtu.be/bbb"],
        rejected: [],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          "1 queued, 1 skipped (already in your library).",
        ),
      );
    });

    it("includes the first rejection's reason", async () => {
      mutateAsync.mockResolvedValue({
        accepted: ["https://youtu.be/aaa"],
        skipped: [],
        rejected: [{ url: "https://youtu.be/ccc", reason: "Invalid URL" }],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith("1 queued, 1 rejected (Invalid URL)."),
      );
    });

    it("covers skipped and rejected together", async () => {
      mutateAsync.mockResolvedValue({
        accepted: ["https://youtu.be/aaa"],
        skipped: ["https://youtu.be/bbb"],
        rejected: [{ url: "https://youtu.be/ccc", reason: "Invalid URL" }],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          "1 queued, 1 skipped (already in your library), 1 rejected (Invalid URL).",
        ),
      );
    });

    // An empty batch used to read "Queued 0." on a green success toast, which
    // told the user the opposite of what happened.
    it("reports an empty batch as info rather than success", async () => {
      mutateAsync.mockResolvedValue({
        accepted: [],
        skipped: ["https://youtu.be/aaa", "https://youtu.be/bbb"],
        rejected: [],
      });

      await renderAndSubmit();

      await waitFor(() =>
        expect(toast.info).toHaveBeenCalledWith(
          "Nothing queued, 2 skipped (already in your library).",
        ),
      );
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
