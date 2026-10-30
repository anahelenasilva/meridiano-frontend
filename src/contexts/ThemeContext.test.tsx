import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

// Records what the provider hands its children on every render pass, so the
// test can assert the very first one rather than the settled value.
const renderedThemes: string[] = [];

function ThemeProbe() {
  const { resolvedTheme } = useTheme();
  renderedThemes.push(resolvedTheme);
  return null;
}

beforeEach(() => {
  renderedThemes.length = 0;
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  // jsdom has no matchMedia; the provider's system-theme listener needs it.
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("ThemeProvider", () => {
  it("resolves the stored dark theme on the first render, so the first paint is dark", () => {
    localStorage.setItem("theme-preference", "dark");

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(renderedThemes[0]).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
