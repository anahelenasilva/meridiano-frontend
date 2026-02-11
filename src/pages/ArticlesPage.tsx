import AddArticleModal from "@/components/AddArticleModal";
import ArticleCard from "@/components/ArticleCard";
import LatestBriefings from "@/components/LatestBriefings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import {
  useArticles,
  useBookmarks,
  useBriefings,
  useProfiles,
  useToggleBookmark,
} from "@/hooks/useApi";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import { Calendar, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type DatePreset = "yesterday" | "week" | "30d" | "3m" | null;

export default function ArticlesPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [searchParams] = useSearchParams();
  const feedProfileFromUrl = searchParams.get("feedProfile");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [feedProfile, setFeedProfile] = useState(
    feedProfileFromUrl ?? "all",
  );

  useEffect(() => {
    if (feedProfileFromUrl) setFeedProfile(feedProfileFromUrl);
  }, [feedProfileFromUrl]);
  const [sortBy, setSortBy] = useState("published_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, error } = useArticles({
    searchTerm: search || undefined,
    category: category !== "all" ? category : undefined,
    feedProfile: feedProfile !== "all" ? feedProfile : undefined,
    sortBy,
    direction,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    perPage: 20,
  });

  const { data: profilesData } = useProfiles();
  const { data: briefingsData } = useBriefings();
  const { data: bookmarksData } = useBookmarks(userId, 1, 100);
  const { add, remove } = useToggleBookmark(userId);

  const articles = data?.articles ?? [];
  const total = data?.total ?? 0;
  const perPage = data?.perPage ?? 20;
  const profiles = profilesData ?? [];

  const bookmarkedIds = new Set(
    (bookmarksData?.bookmarks ?? []).map((bookmark) => bookmark.article.id),
  );

  const handleToggleBookmark = (articleId: string) => {
    if (bookmarkedIds.has(articleId)) {
      remove.mutate(articleId);
    } else {
      add.mutate(articleId);
    }
  };

  const applyDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    const fmt = (d: Date) => format(d, "yyyy-MM-dd");
    setEndDate(fmt(today));
    switch (preset) {
      case "yesterday":
        setStartDate(fmt(subDays(today, 1)));
        break;
      case "week":
        setStartDate(fmt(subWeeks(today, 1)));
        break;
      case "30d":
        setStartDate(fmt(subDays(today, 30)));
        break;
      case "3m":
        setStartDate(fmt(subMonths(today, 3)));
        break;
      default:
        setStartDate("");
        setEndDate("");
    }
    setPage(1);
  };

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];
  const categories = [
    ...new Set(articles.flatMap((a) => a.categories || [])),
  ].sort();

  const startItem = (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, total);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold mb-1">Articles</h1>
        <p className="text-sm text-destructive">
          Failed to load articles: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex gap-8 px-4 py-6">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="font-serif text-2xl font-bold">Articles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {startItem} - {endItem} of {total} articles
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Article
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 mb-6 mt-4 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background"
              />
            </div>
            <Select
              value={feedProfile}
              onValueChange={(v) => {
                setFeedProfile(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="All Profiles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profiles</SelectItem>
                {profiles.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-44 bg-background">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Date Range:</span>
            </div>
            {(["yesterday", "week", "30d", "3m"] as DatePreset[]).map((p) => (
              <Badge
                key={p}
                variant={datePreset === p ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  applyDatePreset(datePreset === p ? null : p)
                }
              >
                {p === "yesterday"
                  ? "yesterday"
                  : p === "week"
                    ? "Last week"
                    : p === "30d"
                      ? "Last 30d"
                      : "Last 3m"}
              </Badge>
            ))}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset(null);
                setPage(1);
              }}
              className="w-40 bg-background"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset(null);
                setPage(1);
              }}
              className="w-40 bg-background"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published_date">Date</SelectItem>
                <SelectItem value="impact_rating">Impact</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={direction}
              onValueChange={(v) => {
                setDirection(v as "asc" | "desc");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.has(article.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No articles found.
          </p>
        )}
      </div>

      <LatestBriefings briefings={recentBriefings} />

      <AddArticleModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
