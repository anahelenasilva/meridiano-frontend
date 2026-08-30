import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ArticlesPage from "@/pages/ArticlesPage";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false, logout: vi.fn() }),
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const emptyList = {
  articles: [],
  pagination: { page: 1, per_page: 20, total_pages: 0, total_articles: 0 },
};

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  // jsdom has no matchMedia; ThemeProvider's system-theme listener needs it.
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  fetchMock.mockReset();
  fetchMock.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => emptyList,
      text: async () => JSON.stringify(emptyList),
    } as Response),
  );
});

describe("archive navigation", () => {
  it("offers an Archive link in the navbar", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  it("marks Archive as the current page on /archive, and Articles as not", () => {
    render(
      <MemoryRouter initialEntries={["/archive"]}>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /^archive$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: /^articles$/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Articles as the current page on /articles, and Archive as not", () => {
    render(
      <MemoryRouter initialEntries={["/articles"]}>
        <ThemeProvider>
          <Navbar />
        </ThemeProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /^articles$/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: /^archive$/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders the archive view at /archive", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/archive"]}>
          <Routes>
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/archive" element={<ArticlesPage archiveScope="archived" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("Archive")).toBeInTheDocument());
    expect(
      fetchMock.mock.calls.some(
        ([url]) => typeof url === "string" && url.includes("archive_scope=archived"),
      ),
    ).toBe(true);
  });
});
