import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookmarksPage from "./BookmarksPage";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

function bookmark(id: string) {
  return {
    id: `bm-${id}`,
    article: {
      id,
      title: `Article ${id}`,
      url: `https://example.com/${id}`,
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
    },
  };
}

/** Pages of 20, so page 2 of 3 holds articles 21 through 40. */
function bookmarksPage(page: number, total = 50) {
  const perPage = 20;
  const start = (page - 1) * perPage;
  const count = Math.max(0, Math.min(perPage, total - start));
  return {
    bookmarks: Array.from({ length: count }, (_, i) => bookmark(String(start + i + 1))),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

function installFetchRoutes(bookmarksFor: (page: number) => unknown) {
  fetchMock.mockImplementation((url: string) => {
    if (url.includes("/api/bookmarks")) {
      const page = Number(new URL(url).searchParams.get("page") ?? 1);
      return Promise.resolve(jsonResponse(bookmarksFor(page)));
    }
    if (url.includes("/api/briefings")) {
      return Promise.resolve(jsonResponse({ briefings: [], total: 0 }));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function LocationProbe({ onChange }: { onChange: (search: string) => void }) {
  onChange(useLocation().search);
  return null;
}

function renderPage(url = "/bookmarks", onLocation: (search: string) => void = () => {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>
        <LocationProbe onChange={onLocation} />
        <Routes>
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("BookmarksPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("pages past the first 20 bookmarks", async () => {
    installFetchRoutes((page) => bookmarksPage(page));
    renderPage();
    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument());

    fireEvent.click(screen.getByText("3"));

    await waitFor(() => expect(screen.getByText("Article 41")).toBeInTheDocument());
    expect(screen.queryByText("Article 1")).not.toBeInTheDocument();
  });

  it("reads the page from the URL, so Back from an article returns to it", async () => {
    installFetchRoutes((page) => bookmarksPage(page));
    renderPage("/bookmarks?page=2");

    await waitFor(() => expect(screen.getByText("Article 21")).toBeInTheDocument());
  });

  it("falls back to the last page when the current one has emptied", async () => {
    // 21 bookmarks, so page 2 holds one. Dropping to 20 leaves page 2 empty.
    let total = 21;
    installFetchRoutes((page) => bookmarksPage(page, total));
    let search = "";
    renderPage("/bookmarks?page=2", (next) => {
      search = next;
    });
    await waitFor(() => expect(screen.getByText("Article 21")).toBeInTheDocument());

    total = 20;
    // The card's bookmark toggle is its one button with no accessible name;
    // the archive button next to it is labelled "Archive".
    fireEvent.click(screen.getByRole("button", { name: "" }));

    await waitFor(() => expect(screen.getByText("Article 1")).toBeInTheDocument());
    expect(search).toBe("");
  });

  it("shows the Loader2 spinner while loading", () => {
    installFetchRoutes((page) => bookmarksPage(page));
    const { container } = renderPage();

    expect(container.querySelector(".animate-spin.lucide-loader-circle")).not.toBeNull();
  });
});
