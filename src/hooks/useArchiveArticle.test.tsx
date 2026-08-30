import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useArchiveArticle } from "./useApi";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Server Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

const LIST_KEY = ["articles", { page: 1 }];

function listOf(ids: string[]) {
  return {
    articles: ids.map((id) => ({ id, title: id })),
    pagination: { page: 1, per_page: 20, total_pages: 1, total_articles: ids.length },
  };
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(LIST_KEY, listOf(["a-1", "a-2"]));

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useArchiveArticle(), { wrapper });
  return { queryClient, result };
}

describe("useArchiveArticle", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("removes the article from the cached list before the request resolves", async () => {
    let resolveRequest: (value: Response) => void = () => {};
    fetchMock.mockImplementation(
      () => new Promise<Response>((resolve) => { resolveRequest = resolve; }),
    );

    const { queryClient, result } = setup();

    act(() => {
      result.current.mutate({ id: "a-1", action: "archive" });
    });

    await waitFor(() => {
      const cached = queryClient.getQueryData<ReturnType<typeof listOf>>(LIST_KEY);
      expect(cached?.articles.map((a) => a.id)).toEqual(["a-2"]);
    });

    resolveRequest(jsonResponse({ id: "a-1", archived_at: "2026-06-01T09:00:00.000Z" }));
  });

  it("restores the cached list when the request fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "boom" }, false, 500));

    const { queryClient, result } = setup();

    act(() => {
      result.current.mutate({ id: "a-1", action: "archive" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const cached = queryClient.getQueryData<ReturnType<typeof listOf>>(LIST_KEY);
    expect(cached?.articles.map((a) => a.id)).toEqual(["a-1", "a-2"]);
  });

  it("calls DELETE for the unarchive action", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "a-1", archived_at: null }));

    const { result } = setup();

    act(() => {
      result.current.mutate({ id: "a-1", action: "unarchive" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/articles/a-1/archive");
    expect(options.method).toBe("DELETE");
  });
});
