import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfiles } from "@/hooks/useApi";
import { DATE_PRESETS, type DatePreset, useArticleFilters } from "@/hooks/useArticleFilters";
import { Calendar, ChevronDown, Search } from "lucide-react";

const PRESET_LABELS: Record<DatePreset, string> = {
  yesterday: "yesterday",
  week: "Last week",
  "30d": "Last 30d",
  "3m": "Last 3m",
};

// Radix Select has no empty item value, so "all" stands in for an unset filter.
const ALL = "all";
const fromSelect = (v: string) => (v === ALL ? "" : v);

interface ArticleFiltersProps {
  categories: string[];
  sources: string[];
}

/**
 * Collapsible filter panel for an article list. Reads and writes the URL
 * through useArticleFilters, so the page pairs it with the same hook to get
 * its query.
 */
export default function ArticleFilters({ categories, sources }: ArticleFiltersProps) {
  const { filters, setFilters, isFiltered } = useArticleFilters();
  const { data: profiles = [] } = useProfiles();

  return (
    <Collapsible defaultOpen={isFiltered} className="mt-4 mb-6">
      <div className="rounded-lg border border-border bg-card">
        <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 rounded-t-lg hover:bg-muted/50 transition-colors">
          <span className="text-sm font-medium">Filters</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-9 bg-background"
                />
              </div>
              <Select
                value={filters.feedProfile || ALL}
                onValueChange={(v) => setFilters({ feedProfile: fromSelect(v) })}
              >
                <SelectTrigger className="w-full bg-background sm:w-44">
                  <SelectValue placeholder="All Profiles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Profiles</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.category || ALL}
                onValueChange={(v) => setFilters({ category: fromSelect(v) })}
              >
                <SelectTrigger className="w-full bg-background sm:w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.feedSource || ALL}
                onValueChange={(v) => setFilters({ feedSource: fromSelect(v) })}
              >
                <SelectTrigger className="w-full bg-background sm:w-56">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All Sources</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Date Range:</span>
              </div>
              {DATE_PRESETS.map((p) => (
                <Badge
                  key={p}
                  variant={filters.preset === p ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    filters.preset === p
                      ? setFilters({ preset: null, startDate: "", endDate: "" })
                      : setFilters({ preset: p })
                  }
                >
                  {PRESET_LABELS[p]}
                </Badge>
              ))}
              <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
                <label className="flex gap-2 items-center text-sm">
                  <span className="w-10 text-muted-foreground sm:w-auto">From</span>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ startDate: e.target.value, preset: null })}
                    className="flex-1 bg-background sm:w-40 sm:flex-none"
                  />
                </label>
                <label className="flex gap-2 items-center text-sm">
                  <span className="w-10 text-muted-foreground sm:w-auto">To</span>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ endDate: e.target.value, preset: null })}
                    className="flex-1 bg-background sm:w-40 sm:flex-none"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <span className="col-span-2 whitespace-nowrap text-sm text-muted-foreground sm:col-span-1">Sort by:</span>
              <Select
                value={filters.sortBy}
                onValueChange={(v) => setFilters({ sortBy: v })}
              >
                <SelectTrigger className="w-full bg-background sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published_date">Date</SelectItem>
                  <SelectItem value="impact_rating">Impact</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.direction}
                onValueChange={(v) => setFilters({ direction: v === "asc" ? "asc" : "desc" })}
              >
                <SelectTrigger className="w-full bg-background sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
