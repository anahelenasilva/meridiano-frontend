import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// These cases read the real index.html, so renaming or deleting a file in public/ fails here
// instead of 404ing in a browser or in an unfurler's crawler.
const projectRoot = path.resolve(import.meta.dirname, "..");
const indexHtml = readFileSync(path.join(projectRoot, "index.html"), "utf8");
const head = new DOMParser().parseFromString(indexHtml, "text/html").head;

function iconHref(selector: string): string | null | undefined {
  return head.querySelector(selector)?.getAttribute("href");
}

function metaContent(selector: string): string | null | undefined {
  return head.querySelector(selector)?.getAttribute("content");
}

const localAssetPaths = [
  ...[...head.querySelectorAll('link[href^="/"]')].map((link) => link.getAttribute("href")!),
  ...[...head.querySelectorAll('meta[content^="/"]')].map((meta) => meta.getAttribute("content")!),
];

describe("the head of index.html", () => {
  it("links the icon files as an SVG, a PNG fallback and the apple touch icon", () => {
    expect(iconHref('link[rel="icon"][type="image/svg+xml"]')).toBe("/favicon.svg");
    expect(iconHref('link[rel="icon"][type="image/png"][sizes="512x512"]')).toBe("/icon-512.png");
    expect(iconHref('link[rel="apple-touch-icon"]')).toBe("/apple-touch-icon.png");
  });

  it("gives a shared link a preview image with alt text", () => {
    expect(metaContent('meta[property="og:image"]')).toBe("/icon-512.png");
    expect(metaContent('meta[property="og:image:alt"]')).toBeTruthy();
  });

  it("references only files that exist in public/", () => {
    expect(localAssetPaths.length).toBeGreaterThan(0);

    for (const assetPath of new Set(localAssetPaths)) {
      expect(existsSync(path.join(projectRoot, "public", assetPath)), `public${assetPath} is missing`).toBe(true);
    }
  });

  it("describes the app rather than repeating its name", () => {
    expect(metaContent('meta[property="og:title"]')).toBe("Meridiano: news briefings and article summaries");
    expect(metaContent('meta[property="og:description"]')).toBe(
      "AI news briefings and article summaries from curated feeds, with bookmarks and YouTube transcriptions.",
    );
  });

  it("repeats og:description as name=description", () => {
    expect(metaContent('meta[name="description"]')).toBe(metaContent('meta[property="og:description"]'));
  });
});
