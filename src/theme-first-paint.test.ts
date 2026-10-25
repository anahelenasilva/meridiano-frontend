import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DARK_QUERY, THEME_STORAGE_KEY } from "./contexts/ThemeContext";

// These cases run the real inline script out of index.html, so they fail the moment it is
// dropped, moved out of <head>, moved behind a stylesheet link, or given a src.
const indexHtml = readFileSync(path.resolve(import.meta.dirname, "../index.html"), "utf8");
const head = indexHtml.slice(indexHtml.indexOf("<head>"), indexHtml.indexOf("</head>"));
const blockingScripts = [...head.matchAll(/<script(?![^>]*\s(?:src|type|async|defer)=)[^>]*>([\s\S]*?)<\/script>/g)];

function firstPaintScript(): string {
  if (blockingScripts.length !== 1) {
    throw new Error(
      `index.html <head> must hold exactly one blocking inline script, the theme one; found ${blockingScripts.length}`,
    );
  }
  return blockingScripts[0][1];
}

function runFirstPaintScript({ stored, prefersDark }: { stored: string | null; prefersDark: boolean }) {
  if (stored !== null) {
    localStorage.setItem(THEME_STORAGE_KEY, stored);
  }
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: prefersDark && query === DARK_QUERY, media: query })),
  );

  new Function(firstPaintScript())();
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("the first-paint theme script in index.html", () => {
  it("adds the dark class for a stored dark preference", () => {
    runFirstPaintScript({ stored: "dark", prefersDark: false });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("leaves the light theme for a stored light preference", () => {
    runFirstPaintScript({ stored: "light", prefersDark: true });

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it.each([
    ["nothing is stored", null],
    ["the stored preference is system", "system"],
    ["the stored value is not a theme", "aubergine"],
  ])("follows a dark system preference when %s", (_case, stored) => {
    runFirstPaintScript({ stored, prefersDark: true });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it.each([true, false])("falls back to a system preference of dark=%s when localStorage throws", (prefersDark) => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("The operation is insecure.");
    });

    runFirstPaintScript({ stored: null, prefersDark });

    expect(document.documentElement.classList.contains("dark")).toBe(prefersDark);
  });

  it("runs before every stylesheet link, which an inline script would otherwise wait for", () => {
    const scriptAt = head.indexOf(blockingScripts[0][0]);
    const firstStylesheetAt = head.search(/<link[^>]*\brel="stylesheet"/);

    expect(scriptAt).toBeGreaterThan(-1);
    expect(firstStylesheetAt).toBeGreaterThan(scriptAt);
  });

  it("reads the same storage key as ThemeContext", () => {
    expect(firstPaintScript()).toContain(`'${THEME_STORAGE_KEY}'`);
    expect(firstPaintScript()).toContain(`'${DARK_QUERY}'`);
  });
});
