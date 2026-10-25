import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import ArticleCard from "./ArticleCard";
import type { Article } from "@/types";

vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  statusText: "OK",
  json: async () => ({}),
  text: async () => "{}",
}));

const baseArticle: Article = {
  id: "art-1",
  title: "Article One",
  url: "https://example.com/a",
  published_date: "2024-01-01",
  feed_source: "Source",
  feed_profile: "default",
  summary: "A summary the screen reader used to read as the link name",
  processed_content_html: "<p>x</p>",
  content_html: "<p>x</p>",
  impact_rating: 1,
  image_url: null,
  categories: ["news"],
  audio: null,
  has_audio: false,
  archived_at: null,
};

function renderCard(article: Partial<Article> = {}, props = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ArticleCard article={{ ...baseArticle, ...article }} {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ArticleCard", () => {
  it("puts no control inside the link", () => {
    const { container } = renderCard({}, { onToggleBookmark: vi.fn(), isBookmarked: false });

    expect(container.querySelectorAll("a button, a input, a textarea")).toHaveLength(0);
  });

  it("names its link with the article title, not the whole card", () => {
    renderCard({}, { onToggleBookmark: vi.fn(), isBookmarked: false });

    expect(screen.getByRole("link", { name: "Article One" })).toHaveAttribute(
      "href",
      "/articles/art-1",
    );
  });

  it("renders no image for an article with no image_url", () => {
    const { container } = renderCard({ image_url: null });

    expect(container.querySelector("img")).toBeNull();
  });

  it("renders the article's own image when it has one", () => {
    const { container } = renderCard({ image_url: "https://example.com/cover.png" });

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/cover.png",
    );
  });

  it("shows BookmarkCheck in primary for a bookmarked article", () => {
    const { container } = renderCard({}, { onToggleBookmark: vi.fn(), isBookmarked: true });

    expect(container.querySelector(".lucide-bookmark-check.text-primary")).not.toBeNull();
    expect(container.querySelector(".lucide-bookmark:not(.lucide-bookmark-check)")).toBeNull();
  });
});
