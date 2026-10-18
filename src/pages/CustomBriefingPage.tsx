import ArticleFilters from "@/components/ArticleFilters";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import PageNav from "@/components/PageNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useArticleFilters } from "@/hooks/useArticleFilters";
import { Article } from "@/types";
import { toast } from "@/utils/toast";
import { format } from "date-fns";
import { Check, FileText, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Status = "idle" | "generating" | "done" | "error";

export default function CustomBriefingPage() {
  const navigate = useNavigate();

  const { query, setPage } = useArticleFilters();
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedFeedProfile, setSelectedFeedProfile] = useState("");

  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const { data, isLoading } = useArticles(query);

  const { data: profilesData } = useProfiles();
  const createCustomBriefing = useCreateCustomBriefing();
  const { data: jobData } = useBriefingJobStatus(jobId);

  const articles = data?.articles ?? [];
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;
  const profiles = profilesData ?? [];
  const categories = [...new Set(articles.flatMap((a) => a.categories || []))].sort();
  const sources = data?.available_sources ?? [];

  const selectedIds = useMemo(() => new Set(selectedArticles.map((a) => a.id)), [selectedArticles]);

  useEffect(() => {
    if (!jobId) return;
    if (jobData?.state === "completed") {
      setStatus("done");
      setJobId(null);
      if (jobData.result?.briefingId) {
        const customTitle =
          jobData.result.customTitle ?? jobData.result.custom_title ?? null;
        // replace: Back from the new briefing should not return to the form.
        navigate(`/briefings/${jobData.result.briefingId}`, {
          replace: true,
          state: { customTitle: customTitle?.trim() || null },
        });
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
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Custom Briefing"
          description="Hand-pick articles to generate a focused intelligence summary"
        />

        <ArticleFilters categories={categories} sources={sources} />

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
            {articles.length === 0 && <EmptyState icon={FileText} title="No articles found." />}

            <PageNav page={currentPage} totalPages={totalPages} onPageChange={setPage} />
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
