import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/utils/toast";
import AdminYoutubeChannelAddPage from "./AdminYoutubeChannelAddPage";

vi.mock("@/utils/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigateMock };
});

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Bad Request",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

function fillRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText("UC..."), { target: { value: "UC123" } });
  fireEvent.change(screen.getByPlaceholderText("Channel Name"), {
    target: { value: "My Channel" },
  });
  fireEvent.change(screen.getByPlaceholderText("https://youtube.com/channel/..."), {
    target: { value: "https://youtube.com/channel/UC123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Channel description"), {
    target: { value: "A description" },
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AdminYoutubeChannelAddPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminYoutubeChannelAddPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    navigateMock.mockReset();
    vi.mocked(toast.error).mockReset();
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/youtube/categories")) {
        return Promise.resolve(jsonResponse([]));
      }
      return Promise.resolve(jsonResponse({}));
    });
  });

  it("submits without categoryNames when no category is selected", async () => {
    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      if (url.includes("/api/youtube/categories")) {
        return Promise.resolve(jsonResponse([]));
      }
      if (
        (options.method || "GET").toUpperCase() === "POST" &&
        url.includes("/api/youtube/channels")
      ) {
        return Promise.resolve(jsonResponse({ id: "ch-1" }));
      }
      return Promise.resolve(jsonResponse({}));
    });

    renderPage();
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /add channel/i }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/admin/youtube-channels"));

    const createCall = fetchMock.mock.calls.find(
      ([url, options]) =>
        typeof url === "string" &&
        url.includes("/api/youtube/channels") &&
        (options?.method || "GET").toUpperCase() === "POST",
    );
    expect(createCall).toBeDefined();
    const body = JSON.parse((createCall![1] as RequestInit).body as string);
    expect(body.categoryNames).toBeUndefined();
  });

  it("shows an error toast and does not navigate when channel creation fails", async () => {
    fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
      if (url.includes("/api/youtube/categories")) {
        return Promise.resolve(jsonResponse([]));
      }
      if (
        (options.method || "GET").toUpperCase() === "POST" &&
        url.includes("/api/youtube/channels")
      ) {
        return Promise.resolve(jsonResponse({ message: "channelId already exists" }, false, 409));
      }
      return Promise.resolve(jsonResponse({}));
    });

    renderPage();
    fillRequiredFields();
    fireEvent.click(screen.getByRole("button", { name: /add channel/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("channelId already exists"));
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
