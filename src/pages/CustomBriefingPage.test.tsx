import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import CustomBriefingPage from "./CustomBriefingPage";

const article = {
  id: "a1",
  title: "Article 1",
  summary: "Summary",
  feed_source: "Source",
  feed_profile: "default",
  published_date: "2024-01-01",
  categories: [],
};

function bodyFor(url: string) {
  if (url.includes("/api/profiles")) return ["default"];
  if (url.includes("/api/articles")) {
    return { articles: [article], pagination: { page: 1, total_pages: 1 }, available_sources: [] };
  }
  return {};
}

vi.stubGlobal(
  "fetch",
  vi.fn((url: string) => {
    const body = bodyFor(url);
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as Response);
  }),
);

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/briefings/custom"]}>
        <CustomBriefingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CustomBriefingPage", () => {
  it("caps the custom prompt at the API's 500 characters and shows the count", async () => {
    renderPage();
    // The prompt box appears once an article is selected.
    fireEvent.click(await screen.findByText("Article 1"));
    const box = screen.getByPlaceholderText(/focus on market impact/i);

    fireEvent.change(box, { target: { value: "Hello" } });

    expect(box).toHaveAttribute("maxlength", "500");
    expect(screen.getByText("5/500")).toBeInTheDocument();
  });
});
