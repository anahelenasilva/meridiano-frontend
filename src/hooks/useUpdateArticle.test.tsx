import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EditArticleModal from "@/components/EditArticleModal";
import { useArticle, useBookmarks } from "@/hooks/useApi";
import type { Article } from "@/types";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" } }),
}));

vi.mock("@/utils/toast", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

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

const baseArticle: Article = {
  id: "art-1",
  title: "Original Title",
  url: "https://example.com/a",
  published_date: "2024-01-01",
  feed_source: "Original Source",
  feed_profile: "Tech",
  summary: "Summary",
  processed_content_html: "<p>x</p>",
  content_html: "<p>x</p>",
  impact_rating: 1,
  image_url: null,
  categories: ["AI"],
  audio: null,
  has_audio: false,
  archived_at: null,
};

/**
 * The server keeps serving the pre-edit article. Reads are frozen once the
 * PATCH lands so the assertions cannot be satisfied by the invalidation
 * refetch: what they observe is the cache write itself, which is the whole
 * point of the fix.
 */
function installFetchRoutes() {
  let saved = false;

  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();

    if (method === "PATCH" && url.includes("/api/articles/art-1")) {
      saved = true;
      return Promise.resolve(jsonResponse({}));
    }

    if (saved) {
      // Never settles: no read can repaint the views after the save.
      return new Promise<Response>(() => {});
    }

    if (url.includes("/api/profiles")) {
      return Promise.resolve(jsonResponse(["Tech", "World"]));
    }
    if (url.includes("/api/bookmarks")) {
      return Promise.resolve(
        jsonResponse({
          bookmarks: [
            {
              id: "bm-1",
              article_id: "art-1",
              created_at: "2024-01-02",
              article: { ...baseArticle },
            },
          ],
          total: 1,
        }),
      );
    }
    if (url.includes("/api/articles/art-1")) {
      return Promise.resolve(jsonResponse({ article: { ...baseArticle } }));
    }
    if (url.includes("/api/articles")) {
      return Promise.resolve(jsonResponse({ articles: [{ ...baseArticle }] }));
    }
    return Promise.resolve(jsonResponse({}));
  });

  return {
    hasSaved: () => saved,
  };
}

/**
 * Bookmarks list and article detail, sharing one cache with the edit modal.
 * The open Radix dialog marks its siblings aria-hidden, so the views are
 * queried by role with `hidden: true` (see bookmarksList / detailTitle).
 */
function Harness() {
  const { data: bookmarks } = useBookmarks();
  const { data: detail } = useArticle("art-1");

  return (
    <>
      <ul aria-label="Bookmarks">
        {(bookmarks?.bookmarks ?? []).map((bookmark) => (
          <li key={bookmark.id}>{bookmark.article.title}</li>
        ))}
      </ul>
      {detail ? <h1>{detail.article.title}</h1> : null}
      <EditArticleModal article={baseArticle} open onOpenChange={() => {}} />
    </>
  );
}

function renderHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 5 * 60 * 1000 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness />
    </QueryClientProvider>,
  );
}

async function saveTitle(next: string) {
  fireEvent.change(screen.getByLabelText(/title/i), { target: { value: next } });
  fireEvent.click(screen.getByRole("button", { name: /save/i }));
}

const bookmarksList = () => screen.getByRole("list", { name: "Bookmarks", hidden: true });
const detailTitle = () => screen.getByRole("heading", { level: 1, hidden: true });

describe("useUpdateArticle cache propagation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows the edited title on the bookmarks list and the detail view without a refetch", async () => {
    const routes = installFetchRoutes();
    renderHarness();

    // Both views start on the server's copy.
    await waitFor(() => expect(detailTitle()).toHaveTextContent("Original Title"));
    await waitFor(() => expect(bookmarksList()).toHaveTextContent("Original Title"));

    await saveTitle("Fixed Title");
    await waitFor(() => expect(routes.hasSaved()).toBe(true));

    await waitFor(() => expect(detailTitle()).toHaveTextContent("Fixed Title"));
    expect(bookmarksList()).toHaveTextContent("Fixed Title");
    expect(bookmarksList()).not.toHaveTextContent("Original Title");
  });
});
