import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useArticles,
  useCreateCustomBriefing,
  useBriefingJobStatus,
  useProfiles,
} from "@/hooks/useApi";
import { Article } from "@/types";
import { toast } from "@/utils/toast";
import { format, subDays, subMonths, subWeeks } from "date-fns";
import {
  Calendar,
  Check,
  ChevronDown,
  Loader2,
  PenLine,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type DatePreset = "yesterday" | "week" | "30d" | "3m" | null;
type Status = "idle" | "generating" | "done" | "error";

export default function CustomBriefingPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [feedProfile, setFeedProfile] = useState("all");
  const [sortBy, setSortBy] = useState("published_date");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>(null);
  const [page, setPage] = useState(1);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedFeedProfile, setSelectedFeedProfile] = useState("");

  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const { data, isLoading } = useArticles({
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
  const createCustomBriefing = useCreateCustomBriefing();
  const { data: jobData } = useBriefingJobStatus(jobId);

  const articles = data?.articles ?? [];
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;
  const profiles = profilesData ?? [];
  const categories = [...new Set(articles.flatMap((a) => a.categories || []))].sort();

  const selectedIds = useMemo(() => new Set(selectedArticles.map((a) => a.id)), [selectedArticles]);

  useEffect(() => {
    if (!jobId) return;
    if (jobData?.state === "completed") {
      setStatus("done");
      setJobId(null);
      if (jobData.result?.briefingId) {
        navigate(`/briefings/${jobData.result.briefingId}`);
      }
    } else if (jobData?.state === "failed") {
      setStatus("error");
      setJobId(null);
      toast.error(jobData.error || "Failed to generate custom briefing");
    }
  }, [jobData, jobId, navigate]);

  useEffect(() => {
    if (selectedArticles.length > 0 && !selectedFeedProfile) {
      const mostCommon = selectedArticles
        .map((a) => a.feed_profile)
        .sort((a, b) =>
          selectedArticles.filter((x) => x.feed_profile === a).length -
          selectedArticles.filter((x) => x.feed_profile === b).length,
        )
        .pop();
      setSelectedFeedProfile(mostCommon || profiles[0] || "");
    }
  }, [selectedArticles, profiles, selectedFeedProfile]);

  const toggleArticle = (article: Article) => {
    if (selectedIds.has(article.id)) {
      setSelectedArticles((prev) => prev.filter((a) => a.id !== article.id));
    } else if (selectedArticles.length < 10) {
      setSelectedArticles((prev) => [...prev, article]);
    }
  };

  const removeSelected = (id: string) => {
    setSelectedArticles((prev) => prev.filter((a) => a.id !== id));
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

  const handleGenerate = async () => {
    if (selectedArticles.length < 2) {
      toast.error("Select at least 2 articles");
      return;
    }
    if (!selectedFeedProfile) {
      toast.error("Select a feed profile");
      return;
    }

    setStatus("generating");
    try {
      const { jobId: newJobId } = await createCustomBriefing.mutateAsync({
        articleIds: selectedArticles.map((a) => a.id),
        feedProfile: selectedFeedProfile,
        customPrompt: customPrompt || undefined,
      });
      setJobId(newJobId);
    } catch (e) {
      setStatus("error");
      toast.error(e instanceof Error ? e.message : "Failed to queue briefing");
    }
  };

  const atMax = selectedArticles.length >= 10;

  return (
    <div className="flex flex-col gap-8 px-4 py-6 mx-auto max-w-7xl lg:flex-row">
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15">
              <PenLine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Custom Briefing</h1>
              <p className="text-sm text-muted-foreground">
                Hand-pick articles to generate a focused intelligence summary
              </p>
            </div>
          </div>
        </div>

        <Collapsible defaultOpen={false} className="mt-4 mb-6">
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
                    <SelectTrigger className="w-full bg-background sm:w-44">
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
                    <SelectTrigger className="w-full bg-background sm:w-44">
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

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex gap-2 items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
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

                <div className="flex flex-wrap gap-3 items-center">
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
            </CollapsibleContent>
          </div>
        </Collapsible>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => {
              const isSelected = selectedIds.has(article.id);
              const disabled = !isSelected && atMax;
              return (
                <Card
                  key={article.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !disabled && toggleArticle(article)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold leading-snug">{article.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{article.feed_source}</span>
                        <span>·</span>
                        <span>
                          {article.published_date
                            ? format(new Date(article.published_date), "MMM d, yyyy")
                            : ""}
                        </span>
                        {article.categories?.[0] && (
                          <>
                            <span>·</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {article.categories[0]}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {articles.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No articles found.
              </p>
            )}

            {totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Number(currentPage) - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => (
                      <span key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <PaginationItem>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setPage(Number(p))}
                            isActive={Number(p) === Number(currentPage)}
                            className="cursor-pointer"
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </span>
                    ))}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Number(currentPage) + 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      <div className="w-full shrink-0 space-y-4 lg:w-80">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Selected Articles</h2>
            <Badge variant={selectedArticles.length > 0 ? "default" : "secondary"}>
              {selectedArticles.length} / 10
            </Badge>
          </div>

          {selectedArticles.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              Select 2–10 articles to generate a custom briefing.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50"
                >
                  <p className="text-xs line-clamp-2 flex-1">{article.title}</p>
                  <button
                    onClick={() => removeSelected(article.id)}
                    className="shrink-0 p-1 hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {selectedArticles.length > 0 && (
          <Card className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Feed Profile</label>
              <Select
                value={selectedFeedProfile}
                onValueChange={setSelectedFeedProfile}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block">
                Custom Prompt (optional)
              </label>
              <Textarea
                placeholder="E.g., Focus on market impact and competitive analysis..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <Button
              className="w-full"
              disabled={
                selectedArticles.length < 2 ||
                status === "generating" ||
                !selectedFeedProfile
              }
              onClick={handleGenerate}
            >
              {status === "generating" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Briefing
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
