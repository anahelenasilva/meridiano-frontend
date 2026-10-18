import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Authenticated by default so App renders its Routes instead of LoginPage;
// the gate test flips it. AuthProvider is a passthrough since App wraps
// AppContent in it.
const auth = vi.hoisted(() => ({ isAuthenticated: true }));
const mockUser = { id: "u1", email: "a@example.com", username: "a" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: auth.isAuthenticated ? mockUser : null,
    isAuthenticated: auth.isAuthenticated,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useUser: () => mockUser,
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const emptyList = {
  articles: [],
  pagination: { page: 1, per_page: 20, total_pages: 0, total_articles: 0 },
};

beforeEach(() => {
  auth.isAuthenticated = true;
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

// Layout owns the sidebar the app actually ships. Navbar.tsx also defines a nav
// but nothing imports it, so asserting against that one would prove nothing.
function renderSidebarAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <Layout>
          <div />
        </Layout>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

// Queried by href, not by accessible name: the rail collapses to icons only and
// drops the label span, so the links carry no accessible name in that state.
// Layout also renders them twice, for the desktop rail and the mobile drawer,
// so each of these matches every copy.
const linksTo = (href: string) =>
  Array.from(document.querySelectorAll<HTMLAnchorElement>(`a[href="${href}"]`));

describe("archive navigation", () => {
  it("offers an Archive link in the sidebar", () => {
    renderSidebarAt("/articles");

    expect(linksTo("/archive").length).toBeGreaterThan(0);
  });

  it("marks Archive as the current page on /archive, and Articles as not", () => {
    renderSidebarAt("/archive");

    expect(linksTo("/archive").some((el) => el.getAttribute("aria-current") === "page")).toBe(
      true,
    );
    expect(linksTo("/articles").every((el) => el.getAttribute("aria-current") === null)).toBe(
      true,
    );
  });

  it("marks Articles as the current page on /articles, and Archive as not", () => {
    renderSidebarAt("/articles");

    expect(linksTo("/articles").some((el) => el.getAttribute("aria-current") === "page")).toBe(
      true,
    );
    expect(linksTo("/archive").every((el) => el.getAttribute("aria-current") === null)).toBe(
      true,
    );
  });

  it("registers the /archive route on the real route table", async () => {
    // App owns a BrowserRouter, so the route is exercised by pointing the real
    // browser history at /archive before mounting, rather than by a hand-built
    // <Routes> that could drift from App.tsx's own route table.
    window.history.pushState({}, "", "/archive");

    render(<App />);

    // Match the heading, not bare text: the sidebar also has an "Archive" link.
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

describe("auth gate", () => {
  it("shows the login form at the requested URL when logged out", () => {
    auth.isAuthenticated = false;
    window.history.pushState({}, "", "/articles/abc");

    render(<App />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/articles/abc");
  });
});
