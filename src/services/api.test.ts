import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkBookmark, fetchBookmarks, removeBookmark, saveNote } from "./api";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

function mockJsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
  } as Response;
}

describe("bookmark API helpers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
  });

  it("omits user identifiers from bookmark listing requests", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ bookmarks: [] }));

    await fetchBookmarks(1, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks?page=1&per_page=20"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("omits user identifiers from bookmark checks", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ bookmarked: false }));

    await checkBookmark("article-123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks/check/article-123"),
      expect.any(Object),
    );
  });

  it("omits user identifiers from bookmark removal", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ success: true }));

    await removeBookmark("article-123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks?article_id=article-123"),
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});

describe("saveNote", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
  });

  it("POSTs to /api/notes with the source and content", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ note: null }));

    await saveNote("article", "article-123", "hello");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/notes"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          source_type: "article",
          source_id: "article-123",
          content: "hello",
        }),
      }),
    );
  });
});
