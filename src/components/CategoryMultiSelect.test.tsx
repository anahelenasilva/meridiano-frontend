import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Category, CategoryWithCount } from "@/types";
import { CategoryMultiSelect } from "./CategoryMultiSelect";

// cmdk/Radix rely on APIs jsdom doesn't implement.
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

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

const CATEGORIES: CategoryWithCount[] = [
  { id: "cat-1", name: "tech", color: "#3b82f6", channelCount: 2 },
  { id: "cat-2", name: "travel", color: "#10b981", channelCount: 0 },
];

function installFetchRoutes(overrides: Partial<Record<string, () => Promise<Response>>> = {}) {
  fetchMock.mockImplementation((url: string, options: RequestInit = {}) => {
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET" && url.includes("/api/youtube/categories")) {
      return overrides.list?.() ?? Promise.resolve(jsonResponse(CATEGORIES));
    }
    if (method === "POST" && url.includes("/api/youtube/categories")) {
      return (
        overrides.create?.() ??
        Promise.resolve(jsonResponse({ id: "cat-3", name: "AI", color: "#8b5cf6" }))
      );
    }
    return Promise.resolve(jsonResponse({}));
  });
}

function renderMultiSelect(selected: Category[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const onChange = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CategoryMultiSelect selected={selected} onChange={onChange} />
    </QueryClientProvider>,
  );
  return { ...utils, onChange };
}

async function openPicker() {
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() => expect(screen.getByPlaceholderText(/search or create/i)).toBeInTheDocument());
}

describe("CategoryMultiSelect", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("lists existing categories and selects one on click", async () => {
    installFetchRoutes();
    const { onChange } = renderMultiSelect();
    await openPicker();

    await waitFor(() => expect(screen.getByText("tech")).toBeInTheDocument());
    fireEvent.click(screen.getByText("tech"));

    expect(onChange).toHaveBeenCalledWith([CATEGORIES[0]]);
  });

  it("excludes already-selected categories from the list", async () => {
    installFetchRoutes();
    renderMultiSelect([CATEGORIES[0]]);
    await openPicker();

    const listbox = screen.getByRole("listbox");
    await waitFor(() => expect(within(listbox).getByText("travel")).toBeInTheDocument());
    expect(within(listbox).queryByText("tech")).not.toBeInTheDocument();
  });

  it("renders selected categories as removable badges", () => {
    const { onChange } = renderMultiSelect([CATEGORIES[0]]);

    expect(screen.getByText("tech")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove tech/i }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("offers an inline create option for a name with no match, and creates on select", async () => {
    installFetchRoutes();
    const { onChange } = renderMultiSelect();
    await openPicker();

    fireEvent.change(screen.getByPlaceholderText(/search or create/i), {
      target: { value: "AI" },
    });

    const createOption = await screen.findByText(/create "ai"/i);
    fireEvent.click(createOption);

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([{ id: "cat-3", name: "AI", color: "#8b5cf6" }]),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/youtube/categories"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ name: "AI" }) }),
    );
  });

  it("does not offer a create option for a name that already exists", async () => {
    installFetchRoutes();
    renderMultiSelect();
    await openPicker();

    fireEvent.change(screen.getByPlaceholderText(/search or create/i), {
      target: { value: "tech" },
    });

    await waitFor(() => expect(screen.getAllByText("tech").length).toBeGreaterThan(0));
    expect(screen.queryByText(/create "tech"/i)).not.toBeInTheDocument();
  });
});
