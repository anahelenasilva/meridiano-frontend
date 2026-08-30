import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";

// isAuthenticated: true so App renders its Routes immediately instead of
// LoginPage; AuthProvider is a passthrough since App wraps AppContent in it.
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", email: "a@example.com", username: "a" },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
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

  it("registers the /archive route on the real route table", async () => {
    // App owns a BrowserRouter, so the route is exercised by pointing the
    // real browser history at /archive before mounting, rather than by a
    // hand-built <Routes> that could drift from App.tsx's own route table.
    window.history.pushState({}, "", "/archive");

    render(<App />);

    // getByRole, not getByText: the navbar also has an "Archive" link, so a
    // plain text match would be ambiguous with two matches on this page.
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Archive" })).toBeInTheDocument(),
    );
    expect(
      fetchMock.mock.calls.some(
        ([url]) => typeof url === "string" && url.includes("archive_scope=archived"),
      ),
    ).toBe(true);
  });
});
