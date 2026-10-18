import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BackButton } from "@/components/BackButton";

function Pathname() {
  return <output>{useLocation().pathname}</output>;
}

// MemoryRouter keys its first entry "default", the same key BrowserRouter gives
// a fresh page load, so initialEntries stands in for the tab's history.
function renderAt(entries: string[]) {
  render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <BackButton fallback="/articles" />
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
});
