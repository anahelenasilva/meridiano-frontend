import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { useArticleFilters } from "./useArticleFilters";

function renderFilters(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => useArticleFilters(), { wrapper }).result;
}

// 22:00 on 2026-10-25 in Sao Paulo, already 2026-10-26 in Lisbon. Any instant
// inside the last three hours of a Brazilian day splits the two calendars, and
// that is the only window where a preset can read the browser's zone and get
// away with it.
const LATE_ON_OCT_25_IN_SAO_PAULO = new Date("2026-10-26T01:00:00Z");

describe("useArticleFilters date presets", () => {
  const hostZone = process.env.TZ;

  // The spec pins its own zone so it fails on a Brazilian machine too.
  beforeAll(() => {
    process.env.TZ = "Europe/Lisbon";
  });

  afterAll(() => {
    process.env.TZ = hostZone;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function presetWindow(preset: string) {
    vi.useFakeTimers();
    vi.setSystemTime(LATE_ON_OCT_25_IN_SAO_PAULO);

    const { query } = renderFilters(`/articles?preset=${preset}`).current;

    return { startDate: query.startDate, endDate: query.endDate };
  }

  it("sends the previous Sao Paulo day as both bounds for 'yesterday'", () => {
    expect(presetWindow("yesterday")).toEqual({
      startDate: "2026-10-24",
      endDate: "2026-10-24",
    });
  });

  it("sends a week back through the current Sao Paulo day for 'week'", () => {
    expect(presetWindow("week")).toEqual({
      startDate: "2026-10-18",
      endDate: "2026-10-25",
    });
  });

  it("sends 30 days back through the current Sao Paulo day for '30d'", () => {
    expect(presetWindow("30d")).toEqual({
      startDate: "2026-09-25",
      endDate: "2026-10-25",
    });
  });

  it("sends 3 months back through the current Sao Paulo day for '3m'", () => {
    expect(presetWindow("3m")).toEqual({
      startDate: "2026-07-25",
      endDate: "2026-10-25",
    });
  });

  it("passes a typed start and end date through untouched", () => {
    const { query } = renderFilters("/articles?startDate=2026-01-02&endDate=2026-01-09").current;

    expect(query.startDate).toBe("2026-01-02");
    expect(query.endDate).toBe("2026-01-09");
  });
});
