import AddArticleModal from "@/components/AddArticleModal";
import ArticleCard from "@/components/ArticleCard";
import ArticleFilters from "@/components/ArticleFilters";
import LatestBriefings from "@/components/LatestBriefings";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useArchiveArticle,
  useArticles,
  useAudioJobs,
  useBookmarks,
  useBriefings,
  useToggleBookmark,
} from "@/hooks/useApi";
import { useArticleFilters } from "@/hooks/useArticleFilters";
import type { ArchiveScope } from "@/types";
import { MESSAGES } from "@/constants/messages";
import { toast } from "@/utils/toast";
import { audioJobKey, buildAudioJobMap, getAudioBadgeState } from "@/utils/audio-badge";
import { Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface ArticlesPageProps {
  // The Archive view is this same page with a different scope. Reusing it means
  // the archive gets search, filters, presets and pagination for free.
  archiveScope?: Extract<ArchiveScope, "active" | "archived">;
}

export default function ArticlesPage({ archiveScope = "active" }: ArticlesPageProps) {
  const isArchiveView = archiveScope === "archived";
  const { user } = useAuth();
  const { query, setPage } = useArticleFilters();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, error } = useArticles({
    ...query,
    archiveScope: isArchiveView ? "archived" : undefined,
  });

  const { data: briefingsData } = useBriefings();
  const { data: bookmarksData } = useBookmarks(1, 100);
  const { add, remove } = useToggleBookmark();
  const { data: audioJobsData } = useAudioJobs();
  const archiveMutation = useArchiveArticle();

  // Undo costs a few lines because both mutations already exist, and fast
  // triage is exactly where a mis-tap happens.
  const handleArchived = (articleId: string) => {
    toast.success(
      <span className="flex items-center gap-3">
        {isArchiveView
          ? MESSAGES.SUCCESS.ARTICLE_UNARCHIVED
          : MESSAGES.SUCCESS.ARTICLE_ARCHIVED}
        <button
          type="button"
          className="underline font-medium"
          onClick={() =>
            archiveMutation.mutate({
              id: articleId,
              action: isArchiveView ? "archive" : "unarchive",
            })
          }
        >
          Undo
        </button>
      </span>,
      // Undo needs longer than the default 3s: noticing the toast and
      // clicking it is slower than reading a plain confirmation message.
      { autoClose: 8000 },
    );
  };

  const audioJobsBySource = useMemo(
    () => buildAudioJobMap(audioJobsData?.jobs),
    [audioJobsData],
  );

  const articles = data?.articles ?? [];
  const total = data?.pagination?.total_articles ?? 0;
  const perPage = data?.pagination?.per_page ?? 20;
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;

  const bookmarkedIds = new Set(
    (bookmarksData?.bookmarks ?? []).map((bookmark) => bookmark.article.id),
  );

  const handleToggleBookmark = (articleId: string) => {
    if (!user) {
      return;
    }
    if (bookmarkedIds.has(articleId)) {
      remove.mutate(articleId);
    } else {
      add.mutate(articleId);
    }
  };

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];
  const categories = [
    ...new Set(articles.flatMap((a) => a.categories || [])),
  ].sort();
  const sources = data?.available_sources ?? [];

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  if (error) {
    return (
      <div className="py-6 px-4 mx-auto max-w-6xl">
        <h1 className="mb-1 font-serif text-2xl font-bold">
          {isArchiveView ? "Archive" : "Articles"}
        </h1>
        <p className="text-sm text-destructive">
          Failed to load articles: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 py-6 px-4 mx-auto max-w-7xl">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h1 className="font-serif text-2xl font-bold">
              {isArchiveView ? "Archive" : "Articles"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {startItem} - {endItem} of {total} articles
            </p>
          </div>
          {!isArchiveView && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="mr-1 w-4 h-4" /> Add Article
            </Button>
          )}
        </div>

        <ArticleFilters categories={categories} sources={sources} />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={bookmarkedIds.has(article.id)}
                onArchived={() => handleArchived(article.id)}
                audioState={getAudioBadgeState(
                  article.has_audio,
                  audioJobsBySource.get(audioJobKey("article", article.id)),
                )}
              />
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            {isArchiveView ? "Nothing archived." : "No articles found."}
          </p>
        )}

        {!isLoading && (
          <PageNav page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <LatestBriefings briefings={recentBriefings} />

      {!isArchiveView && (
        <AddArticleModal open={showAddModal} onOpenChange={setShowAddModal} />
      )}
    </div>
  );
}
