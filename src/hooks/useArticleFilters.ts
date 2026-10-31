import { usePageParam } from "@/hooks/usePageParam";
import type { ArticlesQueryParams } from "@/types";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { useSearchParams } from "react-router";

export const DATE_PRESETS = ["yesterday", "week", "30d", "3m"] as const;
export type DatePreset = (typeof DATE_PRESETS)[number];

export interface ArticleFilterValues {
  search: string;
  category: string;
  feedProfile: string;
  feedSource: string;
  sortBy: string;
  direction: "asc" | "desc";
  preset: DatePreset | null;
  startDate: string;
  endDate: string;
}

const DEFAULTS: ArticleFilterValues = {
  search: "",
  category: "",
  feedProfile: "",
  feedSource: "",
  sortBy: "published_date",
  direction: "desc",
  preset: null,
  startDate: "",
  endDate: "",
};

const fmt = (d: Date) => format(d, "yyyy-MM-dd");

type DateWindow = { startDate: string; endDate: string };

/** One calendar day: both bounds are that day. */
const calendarDay = (day: Date): DateWindow => ({ startDate: fmt(day), endDate: fmt(day) });
/** A window that ends today and reaches back to `start`. */
const trailing = (start: Date, today: Date): DateWindow => ({
  startDate: fmt(start),
  endDate: fmt(today),
});

// Each preset names both of its bounds, so a new one has to pick an end date
// instead of inheriting today.
const presetWindow: Record<DatePreset, (today: Date) => DateWindow> = {
  yesterday: (today) => calendarDay(subDays(today, 1)),
  week: (today) => trailing(subWeeks(today, 1), today),
  "30d": (today) => trailing(subDays(today, 30), today),
  "3m": (today) => trailing(subMonths(today, 3), today),
};

function isPreset(value: string | null): value is DatePreset {
  return DATE_PRESETS.some((p) => p === value);
}

function readFilters(params: URLSearchParams): ArticleFilterValues {
  const preset = params.get("preset");
  // A preset stays relative in the URL, so a shared "Last week" link means
  // last week whenever it is opened.
  const today = new Date();
  const dates = isPreset(preset)
    ? { preset, ...presetWindow[preset](today) }
    : {
        preset: null,
        startDate: params.get("startDate") ?? "",
        endDate: params.get("endDate") ?? "",
      };

  return {
    search: params.get("search") ?? "",
    category: params.get("category") ?? "",
    feedProfile: params.get("feedProfile") ?? "",
    feedSource: params.get("feedSource") ?? "",
    sortBy: params.get("sortBy") ?? DEFAULTS.sortBy,
    direction: params.get("direction") === "asc" ? "asc" : "desc",
    ...dates,
  };
}

function toParams(filters: ArticleFilterValues): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULTS) as (keyof ArticleFilterValues)[]) {
    const value = filters[key];
    if (!value || value === DEFAULTS[key]) continue;
    if (filters.preset && (key === "startDate" || key === "endDate")) continue;
    params.set(key, value);
  }
  return params;
}

/**
 * Article list filters and page, stored in the URL so Back, reload and shared
 * links keep them. Every caller on the same route reads the same values.
 * Changing a filter resets the page.
 */
export function useArticleFilters() {
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const { page, setPage } = usePageParam();

  const setFilters = (patch: Partial<ArticleFilterValues>) => {
    // Filter edits replace the history entry, so Back leaves the list instead
    // of stepping through every keystroke and select change. Page changes push.
    setParams((prev) => toParams({ ...readFilters(prev), ...patch }), { replace: true });
  };

  const query: ArticlesQueryParams = {
    searchTerm: filters.search || undefined,
    category: filters.category || undefined,
    feedProfile: filters.feedProfile || undefined,
    feedSource: filters.feedSource || undefined,
    sortBy: filters.sortBy,
    direction: filters.direction,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page,
    perPage: 20,
  };

  const isFiltered = toParams(filters).toString() !== "";

  return { filters, setFilters, page, setPage, query, isFiltered };
}
