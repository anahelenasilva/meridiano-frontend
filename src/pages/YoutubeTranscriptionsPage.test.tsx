import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/utils/toast";
import YoutubeTranscriptionsPage from "./YoutubeTranscriptionsPage";

vi.mock("@/utils/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

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

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Bad Request",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

const TECH = { id: "cat-tech", name: "tech", color: "#3b82f6" };
const TRAVEL = { id: "cat-travel", name: "travel", color: "#10b981" };

const TRANSCRIPTIONS_RESPONSE = {
  transcriptions: [
    {
      id: "tr-1",
      videoId: "v1",
      videoTitle: "Video One",
      videoUrl: "https://youtube.com/watch?v=v1",
      channelId: "ch-1",
      channelName: "Augusto Galego",
      thumbnailUrl: "https://example.com/thumb1.jpg",
      postedAt: "2024-01-01",
      createdAt: "2024-01-01",
      has_audio: false,
    },
    {
      id: "tr-2",
      videoId: "v2",
      videoTitle: "Video Two",
      videoUrl: "https://youtube.com/watch?v=v2",
      channelId: "ch-2",
      channelName: "Away Together",
      thumbnailUrl: "https://example.com/thumb2.jpg",
      postedAt: "2024-01-02",
      createdAt: "2024-01-02",
      has_audio: false,
    },
  ],
  available_channels: [
    { id: "ch-1", name: "Augusto Galego", categories: [TECH] },
    { id: "ch-2", name: "Away Together", categories: [] },
  ],
};

function installFetchRoutes(overrides: Partial<Record<string, () => Promise<Response>>> = {}) {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET" && url.includes("/api/youtube/transcriptions") && !url.includes("/jobs")) {
      return overrides.list?.() ?? Promise.resolve(jsonResponse(TRANSCRIPTIONS_RESPONSE));
    }
    if (method === "GET" && url.includes("/api/youtube/categories")) {
      return Promise.resolve(jsonResponse([TECH, TRAVEL]));
    }
    if (method === "PUT" && url.includes("/categories")) {
      return overrides.setCategories?.() ?? Promise.resolve(jsonResponse([TECH, TRAVEL]));
    }
    if (method === "GET" && url.includes("/api/youtube/channels")) {
      return Promise.resolve(jsonResponse([]));
    }
    if (method === "GET" && url.includes("/api/audio/jobs")) {
      return overrides.audioJobs?.() ?? Promise.resolve(jsonResponse({ jobs: [] }));
    }
    if (method === "GET" && url.includes("/api/youtube/transcriptions/jobs/failed")) {
      return overrides.failedJobs?.() ?? Promise.resolve(jsonResponse({ jobs: [] }));
    }
    if (method === "DELETE" && url.includes("/api/youtube/transcriptions/jobs")) {
      return overrides.dismissJob?.() ?? Promise.resolve(jsonResponse({ dismissed: true }));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <YoutubeTranscriptionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("YoutubeTranscriptionsPage categories", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("renders category badges per channel from the list response, none for a channel with no categories", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Augusto Galego")).toBeInTheDocument());
    expect(screen.getByText("tech")).toBeInTheDocument();

    const awayRow = screen.getByText("Away Together").closest("div")!;
    expect(within(awayRow).queryByText("tech")).not.toBeInTheDocument();
    expect(within(awayRow).queryByText("travel")).not.toBeInTheDocument();

    // No extra per-row requests: only the transcriptions list GET.
    const listCalls = fetchMock.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/api/youtube/transcriptions") && !url.includes("/jobs"),
    );
    expect(listCalls).toHaveLength(1);
  });

  it("opens the edit modal pre-filled and saves via the replace-the-set endpoint, updating the row", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Augusto Galego")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /edit categories for augusto galego/i }));

    await waitFor(() => expect(screen.getByText("Edit Categories")).toBeInTheDocument());
    // Pre-filled with the channel's current categories.
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("tech")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("combobox"));
    await waitFor(() => expect(screen.getByText("travel")).toBeInTheDocument());
    fireEvent.click(screen.getByText("travel"));

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/youtube/channels/ch-1/categories"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ categoryNames: ["tech", "travel"] }),
        }),
      ),
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText("Edit Categories")).not.toBeInTheDocument());
  });

  it("shows an error toast and keeps the modal open when saving fails", async () => {
    installFetchRoutes({
      setCategories: () => Promise.resolve(jsonResponse({ message: "Server error" }, false, 500)),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Augusto Galego")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /edit categories for augusto galego/i }));
    await waitFor(() => expect(screen.getByText("Edit Categories")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Server error")));
    expect(screen.getByText("Edit Categories")).toBeInTheDocument();
  });
});

describe("YoutubeTranscriptionsPage audio badge", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  async function expandAugustoGalego() {
    await waitFor(() => expect(screen.getByText("Augusto Galego")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Augusto Galego"));
    await waitFor(() => expect(screen.getByText("Video One")).toBeInTheDocument());
  }

  it("shows 'Audio' for a video with has_audio true, regardless of job data", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse({
            ...TRANSCRIPTIONS_RESPONSE,
            transcriptions: TRANSCRIPTIONS_RESPONSE.transcriptions.map((t) =>
              t.id === "tr-1" ? { ...t, has_audio: true } : t,
            ),
          }),
        ),
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "transcription", source_id: "tr-1", state: "failed", error: "boom" }] }),
        ),
    });
    renderPage();
    await expandAugustoGalego();

    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
  });

  it("shows 'Generating' for a video with an active job and no persisted audio", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "transcription", source_id: "tr-1", state: "generating", error: null }] }),
        ),
    });
    renderPage();
    await expandAugustoGalego();

    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("shows 'Failed' for a video with a failed job and no persisted audio", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "transcription", source_id: "tr-1", state: "failed", error: "boom" }] }),
        ),
    });
    renderPage();
    await expandAugustoGalego();

    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders no badge for a video with no audio and no job", async () => {
    installFetchRoutes();
    renderPage();
    await expandAugustoGalego();

    expect(screen.queryByText("Audio")).not.toBeInTheDocument();
    expect(screen.queryByText("Generating")).not.toBeInTheDocument();
    expect(screen.queryByText("Queued")).not.toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
  });

  it("clicking the badge's row navigates to the transcription's detail route", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "transcription", source_id: "tr-1", state: "queued", error: null }] }),
        ),
    });
    renderPage();
    await expandAugustoGalego();

    expect(screen.getByText("Queued").closest("a")).toHaveAttribute("href", "/youtube-transcriptions/tr-1");
  });

  it("fetches /api/audio/jobs once for the whole list, not once per row", async () => {
    installFetchRoutes();
    renderPage();
    await expandAugustoGalego();

    const jobCalls = fetchMock.mock.calls.filter(
      ([url]) => typeof url === "string" && url.includes("/api/audio/jobs"),
    );
    expect(jobCalls).toHaveLength(1);
  });

  it("stops polling /api/audio/jobs once the jobs list is empty", async () => {
    vi.useFakeTimers();
    try {
      let call = 0;
      installFetchRoutes({
        audioJobs: () => {
          call += 1;
          return Promise.resolve(
            jsonResponse({
              jobs:
                call === 1
                  ? [{ source_type: "transcription", source_id: "tr-1", state: "queued", error: null }]
                  : [],
            }),
          );
        },
      });
      renderPage();

      await vi.waitFor(() => expect(screen.getByText("Augusto Galego")).toBeInTheDocument());
      fireEvent.click(screen.getByText("Augusto Galego"));
      await vi.waitFor(() => expect(screen.getByText("Video One")).toBeInTheDocument());
      await vi.waitFor(() => expect(call).toBe(1));

      await vi.advanceTimersByTimeAsync(2000);
      await vi.waitFor(() => expect(call).toBe(2));

      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(2000);
      expect(call).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
