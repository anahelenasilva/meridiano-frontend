import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArticlesPage from "./ArticlesPage";
import { toast } from "@/utils/toast";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/utils/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

function article(overrides: Partial<{
  id: string;
  title: string;
  has_audio: boolean;
}> = {}) {
  return {
    id: "art-1",
    title: "Article One",
    url: "https://example.com/a",
    published_date: "2024-01-01",
    feed_source: "Source",
    feed_profile: "default",
    summary: "Summary",
    processed_content_html: "<p>x</p>",
    content_html: "<p>x</p>",
    impact_rating: 1,
    image_url: null,
    categories: [],
    audio: null,
    has_audio: false,
    archived_at: null,
    ...overrides,
  };
}

function articlesResponse(articles: ReturnType<typeof article>[]) {
  return {
    articles,
    pagination: { page: 1, per_page: 20, total_pages: 1, total_articles: articles.length },
  };
}

function installFetchRoutes(overrides: Partial<Record<string, () => Promise<Response>>> = {}) {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET" && url.includes("/api/articles")) {
      return overrides.list?.() ?? Promise.resolve(jsonResponse(articlesResponse([article()])));
    }
    if (method === "GET" && url.includes("/api/profiles")) {
      return Promise.resolve(jsonResponse([]));
    }
    if (method === "GET" && url.includes("/api/briefings")) {
      return Promise.resolve(jsonResponse({ briefings: [], total: 0 }));
    }
    if (method === "GET" && url.includes("/api/audio/jobs")) {
      return overrides.audioJobs?.() ?? Promise.resolve(jsonResponse({ jobs: [] }));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderPage(archiveScope?: "active" | "archived") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArticlesPage archiveScope={archiveScope} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ArticlesPage audio badge", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("shows 'Audio' for an article with has_audio true, regardless of job data", async () => {
    installFetchRoutes({
      list: () => Promise.resolve(jsonResponse(articlesResponse([article({ has_audio: true })]))),
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "article", source_id: "art-1", state: "failed", error: "boom" }] }),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
  });

  it("shows 'Generating' for an article with an active job and no persisted audio", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "article", source_id: "art-1", state: "generating", error: null }] }),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(screen.getByText("Generating")).toBeInTheDocument();
  });

  it("shows 'Failed' for an article with a failed job and no persisted audio", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "article", source_id: "art-1", state: "failed", error: "boom" }] }),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("renders no badge for an article with no audio and no job", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(screen.queryByText("Audio")).not.toBeInTheDocument();
    expect(screen.queryByText("Generating")).not.toBeInTheDocument();
    expect(screen.queryByText("Queued")).not.toBeInTheDocument();
    expect(screen.queryByText("Failed")).not.toBeInTheDocument();
  });

  it("clicking the badge's row navigates to the article's detail route", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "article", source_id: "art-1", state: "queued", error: null }] }),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Queued")).toBeInTheDocument());
    expect(screen.getByText("Queued").closest("a")).toHaveAttribute("href", "/articles/art-1");
  });

  it("keeps the badge state correct after a page change, driven by the new list response", async () => {
    installFetchRoutes({
      list: () => Promise.resolve(jsonResponse(articlesResponse([article({ id: "art-2", title: "Article Two", has_audio: true })]))),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article Two")).toBeInTheDocument());
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("fetches /api/audio/jobs once for the whole list, not once per row", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse(articlesResponse([article({ id: "art-1" }), article({ id: "art-2", title: "Article Two" })])),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

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
              jobs: call === 1 ? [{ source_type: "article", source_id: "art-1", state: "queued", error: null }] : [],
            }),
          );
        },
      });
      renderPage();

      await vi.waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
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

describe("ArticlesPage archive view", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it("requests the active scope by default", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    const listCall = fetchMock.mock.calls.find(
      ([url]) => typeof url === "string" && url.includes("/api/articles?"),
    );
    expect(listCall?.[0]).not.toContain("archive_scope");
  });

  it("requests the archived scope and titles the page Archive", async () => {
    installFetchRoutes();
    renderPage("archived");

    await waitFor(() => expect(screen.getByText("Archive")).toBeInTheDocument());

    const listCall = fetchMock.mock.calls.find(
      ([url]) => typeof url === "string" && url.includes("archive_scope=archived"),
    );
    expect(listCall).toBeDefined();
    expect(screen.queryByRole("button", { name: /add article/i })).not.toBeInTheDocument();
  });

  it("removes the card immediately when an article is archived", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse(
            articlesResponse([
              article({ id: "art-1" }),
              article({ id: "art-2", title: "Article Two" }),
            ]),
          ),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      const method = (options.method || "GET").toUpperCase();
      if (method === "POST" && url.includes("/archive")) {
        return new Promise(() => {}); // never settles, so only the optimistic update is visible
      }
      return Promise.resolve(jsonResponse({}));
    });

    fireEvent.click(screen.getAllByRole("button", { name: /^archive$/i })[0]);

    await waitFor(() =>
      expect(screen.queryByText("Article One")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Article Two")).toBeInTheDocument();
  });

  it("fires the success toast even though the optimistic update unmounts the button before the request settles", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse(
            articlesResponse([
              article({ id: "art-1" }),
              article({ id: "art-2", title: "Article Two" }),
            ]),
          ),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      const method = (options.method || "GET").toUpperCase();
      if (method === "POST" && url.includes("/archive")) {
        // A small real delay lets the optimistic removal (and the resulting
        // ArchiveButton unmount) land before the request settles, the same
        // race that dropped the mutate-level callbacks in production.
        return new Promise((resolve) => setTimeout(() => resolve(jsonResponse({})), 20));
      }
      return Promise.resolve(jsonResponse({}));
    });

    fireEvent.click(screen.getAllByRole("button", { name: /^archive$/i })[0]);

    // The card is gone (ArchiveButton has unmounted) before the toast is
    // asserted, matching how the mutate-level callbacks silently dropped
    // once the observer lost its listener.
    await waitFor(() =>
      expect(screen.queryByText("Article One")).not.toBeInTheDocument(),
    );

    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("puts the card back when the archive request fails", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      const method = (options.method || "GET").toUpperCase();
      if (method === "POST" && url.includes("/archive")) {
        // A small real delay separates the optimistic removal from the
        // rollback into two observable renders; an instantly-resolved
        // promise lets both land in the same tick, so the intermediate
        // "removed" assertion below would never actually get to see it.
        return new Promise((resolve) =>
          setTimeout(() => resolve(jsonResponse({ message: "boom" }, false, 500)), 20),
        );
      }
      if (method === "GET" && url.includes("/api/articles")) {
        return Promise.resolve(jsonResponse(articlesResponse([article()])));
      }
      return Promise.resolve(jsonResponse({}));
    });

    fireEvent.click(screen.getAllByRole("button", { name: /^archive$/i })[0]);

    // Prove the optimistic removal actually ran before asserting the rollback
    // put the card back: without this, the test can't tell a real
    // remove-then-restore cycle from optimistic removal never happening at all.
    await waitFor(() =>
      expect(screen.queryByText("Article One")).not.toBeInTheDocument(),
    );

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
  });
});
