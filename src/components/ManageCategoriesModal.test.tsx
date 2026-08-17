import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/utils/toast";
import ManageCategoriesModal from "./ManageCategoriesModal";

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

const baseCategories = [
  { id: "cat-1", name: "News", color: "#ec4899", channelCount: 3 },
  { id: "cat-2", name: "Tech", color: "#3b82f6", channelCount: 0 },
];

function installFetchRoutes(overrides: Partial<Record<string, () => Promise<Response>>> = {}) {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();

    if (method === "POST" && url.includes("/api/youtube/categories")) {
      return overrides.create
        ? overrides.create()
        : Promise.resolve(
            jsonResponse({ id: "cat-3", name: "Vlogs", color: "#10b981" }),
          );
    }
    if (method === "PATCH" && url.includes("/api/youtube/categories/")) {
      return overrides.rename
        ? overrides.rename()
        : Promise.resolve(
            jsonResponse({ id: "cat-1", name: "Renamed", color: "#ec4899" }),
          );
    }
    if (method === "DELETE" && url.includes("/api/youtube/categories/")) {
      return overrides.delete
        ? overrides.delete()
        : Promise.resolve(jsonResponse({ success: true }));
    }
    if (url.includes("/api/youtube/categories")) {
      return Promise.resolve(jsonResponse(baseCategories));
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onOpenChange = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <ManageCategoriesModal open onOpenChange={onOpenChange} />
    </QueryClientProvider>,
  );
  return { ...utils, onOpenChange };
}

describe("ManageCategoriesModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installFetchRoutes();
  });

  it("lists categories with their channel counts and color swatches", async () => {
    renderModal();

    expect(await screen.findByText("News")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("creates a category and shows it in the list", async () => {
    renderModal();
    await screen.findByText("News");

    fireEvent.change(screen.getByPlaceholderText(/new category name/i), {
      target: { value: "Vlogs" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const createCall = fetchMock.mock.calls.find(
      ([url, opts]) => (opts?.method || "").toUpperCase() === "POST" && url.includes("/api/youtube/categories"),
    );
    expect(createCall).toBeDefined();
    expect(JSON.parse(createCall![1].body as string)).toEqual({ name: "Vlogs" });
  });

  it("blocks creating a category with an empty name", async () => {
    renderModal();
    await screen.findByText("News");

    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("renames a category inline", async () => {
    renderModal();
    await screen.findByText("News");

    fireEvent.click(screen.getByRole("button", { name: /rename news/i }));
    const input = screen.getByDisplayValue("News");
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    const patchCall = fetchMock.mock.calls.find(
      ([url, opts]) => (opts?.method || "").toUpperCase() === "PATCH" && url.includes("cat-1"),
    );
    expect(patchCall).toBeDefined();
    expect(JSON.parse(patchCall![1].body as string)).toEqual({ name: "Renamed" });
  });

  it("requires confirmation before deleting a category", async () => {
    renderModal();
    await screen.findByText("News");

    fireEvent.click(screen.getByRole("button", { name: /delete news/i }));
    expect(screen.getByText(/delete "news"/i)).toBeInTheDocument();

    // No delete request fired yet.
    expect(
      fetchMock.mock.calls.some(
        ([, opts]) => (opts?.method || "").toUpperCase() === "DELETE",
      ),
    ).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(
      fetchMock.mock.calls.some(
        ([url, opts]) =>
          (opts?.method || "").toUpperCase() === "DELETE" && url.includes("cat-1"),
      ),
    ).toBe(true);
  });

  it("shows an error toast when create fails", async () => {
    installFetchRoutes({
      create: () => Promise.resolve(jsonResponse({ message: "Name already exists" }, false, 400)),
    });
    renderModal();
    await screen.findByText("News");

    fireEvent.change(screen.getByPlaceholderText(/new category name/i), {
      target: { value: "News" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Name already exists")),
    );
  });
});
