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
    if (method === "GET" && url.includes("/api/youtube/transcriptions")) {
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
      ([url]) => typeof url === "string" && url.includes("/api/youtube/transcriptions"),
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
