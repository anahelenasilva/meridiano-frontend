import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { useArticleFilters } from "./useArticleFilters";

function renderFilters(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );
  return renderHook(() => useArticleFilters(), { wrapper }).result;
}

describe("useArticleFilters date presets", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends the previous calendar day as both bounds for 'yesterday'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T14:00:00"));

    const { query } = renderFilters("/articles?preset=yesterday").current;

    expect(query.startDate).toBe("2026-10-24");
    expect(query.endDate).toBe("2026-10-24");
  });

  it("sends a week back through today for 'week'", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T14:00:00"));

    const { query } = renderFilters("/articles?preset=week").current;

    expect(query.startDate).toBe("2026-10-18");
    expect(query.endDate).toBe("2026-10-25");
  });
});
