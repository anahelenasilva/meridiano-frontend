import type { ArticlesQueryParams } from "@/types";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { useSearchParams } from "react-router-dom";

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

const presetStart: Record<DatePreset, (today: Date) => Date> = {
  yesterday: (today) => subDays(today, 1),
  week: (today) => subWeeks(today, 1),
  "30d": (today) => subDays(today, 30),
  "3m": (today) => subMonths(today, 3),
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
    ? { preset, startDate: fmt(presetStart[preset](today)), endDate: fmt(today) }
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
  const page = Math.max(1, Number(params.get("page")) || 1);

  const setFilters = (patch: Partial<ArticleFilterValues>) => {
    // Replace, so typing a search does not add a history entry per keystroke.
    setParams(toParams({ ...filters, ...patch }), { replace: true });
  };

  const setPage = (next: number) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (next === 1) updated.delete("page");
      else updated.set("page", String(next));
      return updated;
    });
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
