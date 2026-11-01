import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArticlesPage from "./ArticlesPage";
import { ARTICLE_CATEGORIES } from "@/constants/categories";
import { toast } from "@/utils/toast";

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
  categories: string[];
  is_bookmarked: boolean;
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
    is_bookmarked: false,
    ...overrides,
  };
}

function articlesResponse(articles: ReturnType<typeof article>[]) {
  return {
    articles,
    pagination: { page: 1, per_page: 20, total_pages: 1, total_articles: articles.length },
    available_sources: [] as string[],
  };
}

function installFetchRoutes(
  overrides: Partial<Record<string, (url: string) => Promise<Response>>> = {},
) {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET" && url.includes("/api/articles")) {
      return overrides.list?.(url) ?? Promise.resolve(jsonResponse(articlesResponse([article()])));
    }
    if (method === "GET" && url.includes("/api/profiles")) {
      return Promise.resolve(jsonResponse([]));
    }
    if (method === "GET" && url.includes("/api/briefings")) {
      return Promise.resolve(jsonResponse({ briefings: [], total: 0 }));
    }
    if (method === "GET" && url.includes("/api/audio/jobs")) {
      return overrides.audioJobs?.(url) ?? Promise.resolve(jsonResponse({ jobs: [] }));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderPage(archiveScope?: "active" | "archived", url = "/articles") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
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

  // The badge sits next to the card's stretched link rather than inside it,
  // so the route is read off the link the badge shares a card with.
  it("sits on a card whose link points at the article's detail route", async () => {
    installFetchRoutes({
      audioJobs: () =>
        Promise.resolve(
          jsonResponse({ jobs: [{ source_type: "article", source_id: "art-1", state: "queued", error: null }] }),
        ),
    });
    renderPage();

    await waitFor(() => expect(screen.getByText("Queued")).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Article One" })).toHaveAttribute(
      "href",
      "/articles/art-1",
    );
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

describe("ArticlesPage bookmark state", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  // The card's bookmark control has no accessible name, so it is reached
  // through the icon it renders, the same way ArticleCard.test.tsx does.
  function bookmarkButton(container: HTMLElement) {
    const icon = container.querySelector(".lucide-bookmark-check, .lucide-bookmark");
    return icon?.closest("button") as HTMLButtonElement;
  }

  const bookmarkCalls = (method: string) =>
    fetchMock.mock.calls.filter(
      ([url, options = {}]) =>
        typeof url === "string" &&
        url.includes("/api/bookmarks") &&
        ((options as RequestInit).method ?? "GET").toUpperCase() === method,
    );

  it("shows the filled icon for an article the list reports as bookmarked", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(jsonResponse(articlesResponse([article({ is_bookmarked: true })]))),
    });
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(container.querySelector(".lucide-bookmark-check")).not.toBeNull();
  });

  it("shows the empty icon for an article the list reports as not bookmarked", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(jsonResponse(articlesResponse([article({ is_bookmarked: false })]))),
    });
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(container.querySelector(".lucide-bookmark-check")).toBeNull();
    expect(container.querySelector(".lucide-bookmark")).not.toBeNull();
  });

  // The bug this issue is about: state used to come from the first page of
  // /api/bookmarks, so an article bookmarked past the 100th looked unbookmarked
  // and the toggle added it again instead of removing it.
  it("removes the bookmark of a bookmarked article instead of adding it again", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(jsonResponse(articlesResponse([article({ is_bookmarked: true })]))),
    });
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    fireEvent.click(bookmarkButton(container));

    await waitFor(() => expect(bookmarkCalls("DELETE")).toHaveLength(1));
    expect(bookmarkCalls("DELETE")[0][0]).toContain("article_id=art-1");
    expect(bookmarkCalls("POST")).toHaveLength(0);
  });

  it("adds the bookmark of an unbookmarked article", async () => {
    installFetchRoutes();
    const { container } = renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    fireEvent.click(bookmarkButton(container));

    await waitFor(() => expect(bookmarkCalls("POST")).toHaveLength(1));
    expect(bookmarkCalls("DELETE")).toHaveLength(0);
  });

  // Only an invalidation of ["articles"] refetches the list the flag lives on,
  // so without it the icon keeps the state the first response carried.
  it("switches the icon after a toggle, off the refetched articles list", async () => {
    let listCall = 0;
    installFetchRoutes({
      list: () => {
        listCall += 1;
        return Promise.resolve(
          jsonResponse(articlesResponse([article({ is_bookmarked: listCall === 1 })])),
        );
      },
    });
    const { container } = renderPage();

    await waitFor(() => expect(container.querySelector(".lucide-bookmark-check")).not.toBeNull());
    fireEvent.click(bookmarkButton(container));

    await waitFor(() => expect(container.querySelector(".lucide-bookmark-check")).toBeNull());
  });

  it("asks for no page of /api/bookmarks", async () => {
    installFetchRoutes();
    renderPage();

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(bookmarkCalls("GET")).toHaveLength(0);
  });
});

describe("ArticlesPage source filter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("offers the sources the API returns and requests the picked one", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse({
            ...articlesResponse([article()]),
            available_sources: ["Fabio Akita", "Will Larson"],
          }),
        ),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("All Sources"));
    await waitFor(() => expect(screen.getByText("Will Larson")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Will Larson"));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(
        ([url]) => typeof url === "string" && url.includes("feedSource=Will+Larson"),
      );
      expect(call).toBeDefined();
    });
  });
});

describe("ArticlesPage category filter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("lists every category even when this page of articles only has one", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(jsonResponse(articlesResponse([article({ categories: ["news"] })]))),
    });
    renderPage();
    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("All Categories"));

    for (const category of ARTICLE_CATEGORIES) {
      expect(await screen.findByRole("option", { name: category })).toBeInTheDocument();
    }
  });
});

describe("ArticlesPage filters in the URL", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  const listUrls = () =>
    fetchMock.mock.calls
      .map(([url]) => url)
      .filter((url): url is string => typeof url === "string" && url.includes("/api/articles?"));

  it("requests the filters and page the URL holds", async () => {
    installFetchRoutes();
    renderPage(undefined, "/articles?feedSource=Will+Larson&page=3");

    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());
    expect(listUrls()[0]).toContain("feedSource=Will+Larson");
    expect(listUrls()[0]).toContain("page=3");
  });

  it("goes back to page 1 when a filter changes", async () => {
    installFetchRoutes({
      list: () =>
        Promise.resolve(
          jsonResponse({ ...articlesResponse([article()]), available_sources: ["Will Larson"] }),
        ),
    });
    renderPage(undefined, "/articles?page=3");
    await waitFor(() => expect(screen.getByText("Article One")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Filters"));
    fireEvent.click(screen.getByText("All Sources"));
    await waitFor(() => expect(screen.getByText("Will Larson")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Will Larson"));

    await waitFor(() => {
      const picked = listUrls().find((url) => url.includes("feedSource=Will+Larson"));
      expect(picked).toContain("page=1");
    });
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

describe("ArticlesPage page past the end of the list", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  /**
   * Answers /api/articles the way the API does: echoes the requested page,
   * computes total_pages from the total, and returns an empty slice past the
   * end. `total` is a function so a test can shrink the list mid-run.
   */
  function pagedList(total: () => number) {
    const perPage = 20;
    return (url: string) => {
      const page = Number(new URL(url).searchParams.get("page") ?? 1);
      const start = (page - 1) * perPage;
      const count = Math.max(0, Math.min(perPage, total() - start));
      return Promise.resolve(
        jsonResponse({
          articles: Array.from({ length: count }, (_, i) =>
            article({ id: `art-${start + i + 1}`, title: `Article ${start + i + 1}` }),
          ),
          pagination: {
            page,
            per_page: perPage,
            total_pages: Math.ceil(total() / perPage),
            total_articles: total(),
          },
          available_sources: [] as string[],
        }),
      );
    };
  }

  const requestedPages = () =>
    fetchMock.mock.calls
      .filter(([url]) => typeof url === "string" && url.includes("/api/articles?"))
      .map(([url]) => new URL(url as string).searchParams.get("page"));

  function LocationProbe({ onChange }: { onChange: (location: string) => void }) {
    const { pathname, search } = useLocation();
    onChange(pathname + search);
    return null;
  }

  function GoBack() {
    const navigate = useNavigate();
    return <button onClick={() => navigate(-1)}>go back</button>;
  }

  /** Entered from /briefings, so Back has somewhere to land that is not the list. */
  function renderList(url: string, archiveScope?: "active" | "archived") {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    let location = "";
    const view = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/briefings", url]} initialIndex={1}>
          <LocationProbe
            onChange={(next) => {
              location = next;
            }}
          />
          <GoBack />
          <Routes>
            <Route path="/briefings" element={<p>Briefings</p>} />
            <Route path="/articles" element={<ArticlesPage archiveScope={archiveScope} />} />
            <Route path="/archive" element={<ArticlesPage archiveScope={archiveScope} />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
    return { ...view, location: () => location };
  }

  it("settles on the last page when the URL asks for one past the end", async () => {
    // 20 articles, so the ?page=2 the user was on after archiving the 21st is
    // empty and the pager has hidden itself.
    installFetchRoutes({ list: pagedList(() => 20) });
    const view = renderList("/articles?page=2");

    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument());
    expect(view.location()).toBe("/articles");
  });

  it("replaces the out-of-range entry, so Back leaves the list", async () => {
    installFetchRoutes({ list: pagedList(() => 20) });
    const view = renderList("/articles?page=2");
    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument());

    fireEvent.click(screen.getByText("go back"));

    // Pushing instead would step Back onto ?page=2 and clamp forward again,
    // leaving the user on /articles.
    await waitFor(() => expect(view.location()).toBe("/briefings"));
  });

  it("settles the Archive view the same way", async () => {
    installFetchRoutes({ list: pagedList(() => 20) });
    const view = renderList("/archive?page=2", "archived");

    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument());
    expect(view.location()).toBe("/archive");
  });

  it("holds the page when nothing matches at all, rather than asking for page 0", async () => {
    installFetchRoutes({ list: pagedList(() => 0) });
    const view = renderList("/articles?page=2");

    await waitFor(() => expect(screen.getByText("No articles found.")).toBeInTheDocument());
    expect(view.location()).toBe("/articles?page=2");
    expect(requestedPages()).toEqual(["2"]);
  });

  it("leaves a page that is within range alone", async () => {
    installFetchRoutes({ list: pagedList(() => 50) });
    const view = renderList("/articles?page=2");

    await waitFor(() => expect(screen.getByText("Article 21")).toBeInTheDocument());
    expect(view.location()).toBe("/articles?page=2");
  });

  it("counts from 0 rather than backwards when the list is empty", async () => {
    installFetchRoutes({ list: pagedList(() => 0) });
    renderList("/articles");

    await waitFor(() =>
      expect(screen.getByText("Showing 0 - 0 of 0 articles")).toBeInTheDocument(),
    );
  });
});
