import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ArchiveButton from "./ArchiveButton";

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

function renderButton(archivedAt: string | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ArchiveButton articleId="a-1" archivedAt={archivedAt} />
    </QueryClientProvider>,
  );
}

describe("ArchiveButton", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(jsonResponse({ id: "a-1", archived_at: null }));
  });

  it("offers Archive for an active article", () => {
    renderButton(null);
    expect(screen.getByRole("button", { name: /^archive$/i })).toBeInTheDocument();
  });

  it("offers Unarchive for an archived article", () => {
    renderButton("2026-06-01T09:00:00.000Z");
    expect(screen.getByRole("button", { name: /unarchive/i })).toBeInTheDocument();
  });

  it("POSTs when archiving", async () => {
    renderButton(null);

    fireEvent.click(screen.getByRole("button", { name: /^archive$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/articles/a-1/archive");
    expect(options.method).toBe("POST");
  });

  it("DELETEs when unarchiving", async () => {
    renderButton("2026-06-01T09:00:00.000Z");

    fireEvent.click(screen.getByRole("button", { name: /unarchive/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("DELETE");
  });

  it("does not navigate when it sits inside a link", async () => {
    const onClick = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        {/* biome-ignore lint/a11y/useValidAnchor: exercising click propagation */}
        <a href="/articles/a-1" onClick={onClick}>
          <ArchiveButton articleId="a-1" archivedAt={null} />
        </a>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /^archive$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(onClick).not.toHaveBeenCalled();
  });
});
