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

const pagination = { page: 1, per_page: 20, total_pages: 0, total_articles: 0 };

// App shares one QueryClient across tests, so every endpoint the Articles page
// hits has to answer with its own shape or a later render reads the wrong
// cached body.
function emptyBodyFor(url: string) {
  if (url.includes("/api/profiles")) return [];
  if (url.includes("/api/audio/jobs")) return { jobs: [] };
  if (url.includes("/api/bookmarks")) return { bookmarks: [], pagination };
  if (url.includes("/api/briefings")) return { briefings: [], total: 0 };
  return { articles: [], pagination };
}

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
  fetchMock.mockImplementation((url: string) => {
    const body = emptyBodyFor(url);
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as Response);
  });
});

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

// App owns a BrowserRouter, so routes are exercised by pointing the real
// browser history at the path before mounting, rather than by a hand-built
// <Routes> that could drift from App.tsx's own route table.
function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("sidebar", () => {
  it("links to the Audio Library", () => {
    renderSidebarAt("/articles");

    expect(linksTo("/audio").length).toBeGreaterThan(0);
  });

  it("marks Articles as the current page on /articles", () => {
    renderSidebarAt("/articles");

    expect(linksTo("/articles").some((el) => el.getAttribute("aria-current") === "page")).toBe(
      true,
    );
  });
});

describe("routes", () => {
  it("lands on Articles from /", async () => {
    renderAppAt("/");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Articles" })).toBeInTheDocument(),
    );
  });

  it("links to the Archive from the Articles page", async () => {
    renderAppAt("/articles");

    await waitFor(() => expect(screen.getByRole("link", { name: "Archive" })).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Archive" })).toHaveAttribute("href", "/archive");
  });

  it("registers the /archive route on the real route table", async () => {
    renderAppAt("/archive");

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
