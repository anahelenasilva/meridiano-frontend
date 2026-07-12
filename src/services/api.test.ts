import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkBookmark, fetchBookmarks, removeBookmark } from "./api";

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

  it("uses camelCase query params for bookmark listing", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ bookmarks: [] }));

    await fetchBookmarks("user-123", 1, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks?userId=user-123&page=1&perPage=20"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("uses camelCase query params for bookmark checks", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ bookmarked: false }));

    await checkBookmark("article-123", "user-123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks/check/article-123?userId=user-123"),
      expect.any(Object),
    );
  });

  it("uses camelCase query params for bookmark removal", async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({ success: true }));

    await removeBookmark("user-123", "article-123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookmarks?userId=user-123&articleId=article-123"),
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});
