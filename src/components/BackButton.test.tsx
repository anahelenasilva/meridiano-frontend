import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import { BackButton } from "@/components/BackButton";

function Pathname() {
  return <output>{useLocation().pathname}</output>;
}

// MemoryRouter keys its first entry "default", the same key BrowserRouter gives
// a fresh page load, so initialEntries stands in for the tab's history.
function renderAt(entries: string[], fallbackLabel?: string) {
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <BackButton fallback="/articles" fallbackLabel={fallbackLabel} />
      <Pathname />
    </MemoryRouter>,
  );
}

describe("BackButton", () => {
  it("goes to the fallback when the page is the first entry in history", () => {
    renderAt(["/articles/art-1"]);

    fireEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getByRole("status")).toHaveTextContent("/articles");
  });

  it("goes back in history when there is a previous entry", () => {
    renderAt(["/bookmarks", "/articles/art-1"]);

    fireEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getByRole("status")).toHaveTextContent("/bookmarks");
  });

  it("leaves a modified click to the browser so the fallback can open in a new tab", () => {
    renderAt(["/bookmarks", "/articles/art-1"]);

    fireEvent.click(screen.getByRole("link", { name: "Back" }), { metaKey: true });

    expect(screen.getByRole("status")).toHaveTextContent("/articles/art-1");
  });

  it("shows the fallback label only when the link goes to the fallback", () => {
    renderAt(["/briefings/b-1"], "Back to Briefings");
    expect(screen.getByRole("link", { name: "Back to Briefings" })).toHaveAttribute(
      "href",
      "/articles",
    );
  });

  it("shows plain Back when there is history, whatever the fallback label", () => {
    renderAt(["/articles", "/briefings/b-1"], "Back to Briefings");
    expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument();
  });
});
