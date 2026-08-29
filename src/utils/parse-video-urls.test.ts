import { describe, expect, it } from "vitest";
import { parseVideoUrls } from "./parse-video-urls";

describe("parseVideoUrls", () => {
  it("splits on newlines", () => {
    expect(
      parseVideoUrls("https://youtu.be/aaa\nhttps://youtu.be/bbb"),
    ).toEqual(["https://youtu.be/aaa", "https://youtu.be/bbb"]);
  });

  it("splits on commas and stray whitespace", () => {
    expect(
      parseVideoUrls("https://youtu.be/aaa, https://youtu.be/bbb"),
    ).toEqual(["https://youtu.be/aaa", "https://youtu.be/bbb"]);
  });

  it("drops empty lines", () => {
    expect(parseVideoUrls("https://youtu.be/aaa\n\n  \n")).toEqual([
      "https://youtu.be/aaa",
    ]);
  });

  it("drops repeated urls, keeping the first", () => {
    expect(
      parseVideoUrls("https://youtu.be/aaa\nhttps://youtu.be/aaa"),
    ).toEqual(["https://youtu.be/aaa"]);
  });

  it("keeps a numbered list to just its urls", () => {
    expect(
      parseVideoUrls("1. https://youtu.be/aaa\n2. https://youtu.be/bbb\n3. https://youtu.be/ccc"),
    ).toEqual([
      "https://youtu.be/aaa",
      "https://youtu.be/bbb",
      "https://youtu.be/ccc",
    ]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseVideoUrls("   \n  ")).toEqual([]);
  });
});
