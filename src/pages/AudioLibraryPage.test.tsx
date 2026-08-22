import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AudioLibraryPage from "./AudioLibraryPage";

let mockUser: { id: string } | null = { id: "u1" };

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser }),
}));

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

function audioLibraryResponse(overrides: Partial<{
  audios: unknown[];
  pagination: { page: number; per_page: number; total_pages: number; total_audios: number };
}> = {}) {
  return {
    audios: [
      {
        audio_id: "audio-1",
        source_type: "article",
        source_id: "art-1",
        title: "An Article",
        source_label: "Example Feed",
        published_at: "2024-01-01",
        audio: {
          duration_seconds: 90,
          file_size_bytes: 12345,
          presigned_url: "https://example.com/audio-1.mp3",
          created_at: "2024-02-01",
        },
      },
      {
        audio_id: "audio-2",
        source_type: "transcription",
        source_id: "tr-1",
        title: "A Video",
        source_label: "Some Channel",
        published_at: "2024-01-05",
        audio: {
          duration_seconds: 200,
          file_size_bytes: 54321,
          presigned_url: "https://example.com/audio-2.mp3",
          created_at: "2024-02-02",
        },
      },
    ],
    pagination: { page: 1, per_page: 20, total_pages: 1, total_audios: 2 },
    ...overrides,
  };
}

function installFetchRoutes(overrides: Partial<Record<string, () => Promise<Response>>> = {}) {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/api/audio")) {
      return overrides.list?.() ?? Promise.resolve(jsonResponse(audioLibraryResponse()));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AudioLibraryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AudioLibraryPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockUser = { id: "u1" };
  });

  it("renders each item's title, source label, and formatted date", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("An Article")).toBeInTheDocument());
    expect(screen.getByText("Example Feed")).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date("2024-01-01"), "MMM d, yyyy")),
    ).toBeInTheDocument();

    expect(screen.getByText("A Video")).toBeInTheDocument();
    expect(screen.getByText("Some Channel")).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date("2024-01-05"), "MMM d, yyyy")),
    ).toBeInTheDocument();
  });

  it("renders an audio element per row sourced from the item's presigned_url", async () => {
    installFetchRoutes();
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText("An Article")).toBeInTheDocument());

    const audioEls = container.querySelectorAll("audio");
    expect(audioEls).toHaveLength(2);
    expect(audioEls[0]).toHaveAttribute("src", "https://example.com/audio-1.mp3");
    expect(audioEls[1]).toHaveAttribute("src", "https://example.com/audio-2.mp3");
  });

  it("links an article row to /articles/:id and a transcription row to /youtube-transcriptions/:id", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("An Article")).toBeInTheDocument());

    expect(screen.getByRole("link", { name: /An Article/i })).toHaveAttribute("href", "/articles/art-1");
    expect(screen.getByRole("link", { name: /A Video/i })).toHaveAttribute(
      "href",
      "/youtube-transcriptions/tr-1",
    );
  });

  it("renders pagination and requests the next page when clicked", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse(
            audioLibraryResponse({
              pagination: { page: 1, per_page: 20, total_pages: 3, total_audios: 50 },
            }),
          ),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("An Article")).toBeInTheDocument());
    expect(screen.getByText("3")).toBeInTheDocument();

    fireEvent.click(screen.getByText("2"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("page=2"),
        expect.anything(),
      ),
    );
  });

  it("renders the empty state when there are no Audio Summaries", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse(
            audioLibraryResponse({
              audios: [],
              pagination: { page: 1, per_page: 20, total_pages: 0, total_audios: 0 },
            }),
          ),
        ),
    });
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("You have no Audio Summaries yet.")).toBeInTheDocument(),
    );
  });

  it("shows a login prompt and does not call GET /api/audio when logged out", async () => {
    mockUser = null;
    installFetchRoutes();
    renderPage();

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("/api/audio"))).toBe(false);
  });
});
