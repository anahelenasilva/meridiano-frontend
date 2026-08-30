import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Article } from "@/types";
import { toast } from "@/utils/toast";
import EditArticleModal from "./EditArticleModal";

vi.mock("@/utils/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
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

// Route fetch by method/url so the service function + hooks run for real.
function installFetchRoutes() {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();
    if (method === "PATCH" && url.includes("/api/articles/art-1")) {
      return Promise.resolve(jsonResponse({ article: { ...baseArticle } }));
    }
    if (url.includes("/api/profiles")) {
      return Promise.resolve(jsonResponse(["Tech", "World", "Science"]));
    }
    if (url.includes("/api/articles")) {
      return Promise.resolve(
        jsonResponse({
          articles: [
            { ...baseArticle, categories: ["AI", "Politics", "Economy"] },
          ],
        }),
      );
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderModal(article: Article = baseArticle) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const onOpenChange = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <EditArticleModal article={article} open onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  );
  return { ...utils, invalidateSpy, onOpenChange };
}

function lastPatchBody(): Record<string, unknown> | null {
  const calls = fetchMock.mock.calls.filter(
    ([, opts]) => (opts?.method || "").toUpperCase() === "PATCH",
  );
  if (calls.length === 0) return null;
  const body = calls[calls.length - 1][1].body as string;
  return JSON.parse(body);
}

describe("EditArticleModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    installFetchRoutes();
  });

  it("prefills the form from the passed Article", () => {
    renderModal();
    expect(screen.getByLabelText(/title/i)).toHaveValue("Original Title");
    expect(screen.getByLabelText(/published date/i)).toHaveValue("2024-01-01");
    expect(screen.getByLabelText(/^source$/i)).toHaveValue("Original Source");
    // Current category is rendered and checked.
    const aiCheckbox = screen.getByRole("checkbox", { name: "AI" });
    expect(aiCheckbox).toBeChecked();
  });

  it("editing one field sends a PATCH with only that field, camelCased", async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Fixed Title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(lastPatchBody()).not.toBeNull());
    expect(lastPatchBody()).toEqual({ title: "Fixed Title" });
  });

  it("editing multiple fields sends all changed fields in one request", async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Fixed Title" },
    });
    fireEvent.change(screen.getByLabelText(/^source$/i), {
      target: { value: "Fixed Source" },
    });
    // toggle an extra category on (vocabulary comes from the articles list)
    await waitFor(() =>
      expect(screen.getByRole("checkbox", { name: "Politics" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Politics" }));

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(lastPatchBody()).not.toBeNull());
    const body = lastPatchBody()!;
    expect(body.title).toBe("Fixed Title");
    expect(body.feedSource).toBe("Fixed Source");
    expect(body.categories).toEqual(expect.arrayContaining(["AI", "Politics"]));
    expect(Object.keys(body).sort()).toEqual(
      ["categories", "feedSource", "title"].sort(),
    );
  });

  it("disables Save while inputs are invalid", () => {
    renderModal();
    // no changes yet -> nothing to save
    const save = screen.getByRole("button", { name: /save/i });
    expect(save).toBeDisabled();

    // empty title -> invalid
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "" } });
    expect(save).toBeDisabled();

    // future published date -> invalid
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Valid" },
    });
    fireEvent.change(screen.getByLabelText(/published date/i), {
      target: { value: "2999-01-01" },
    });
    expect(save).toBeDisabled();
  });

  it("clearing Categories sends an empty array", async () => {
    renderModal();
    fireEvent.click(screen.getByRole("checkbox", { name: "AI" }));
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(lastPatchBody()).not.toBeNull());
    expect(lastPatchBody()).toEqual({ categories: [] });
  });

  it("on success shows a success toast and invalidates the article and list queries", async () => {
    const { invalidateSpy, onOpenChange } = renderModal();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Fixed Title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["article", "art-1"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["articles"] });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("on a failed save shows an error toast and does not close", async () => {
    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      const method = (options.method || "GET").toUpperCase();
      if (method === "PATCH") {
        return Promise.resolve(
          jsonResponse({ message: "Server rejected" }, false, 400),
        );
      }
      if (url.includes("/api/profiles")) {
        return Promise.resolve(jsonResponse(["Tech"]));
      }
      return Promise.resolve(jsonResponse({ articles: [] }));
    });

    const { onOpenChange } = renderModal();
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "Fixed Title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Server rejected"));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    // dialog still on screen
    expect(
      within(screen.getByRole("dialog")).getByLabelText(/title/i),
    ).toBeInTheDocument();
  });
});
