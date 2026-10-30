import AddArticleModal from "@/components/AddArticleModal";
import ArticleCard from "@/components/ArticleCard";
import ArticleFilters from "@/components/ArticleFilters";
import { BackButton } from "@/components/BackButton";
import { EmptyState } from "@/components/EmptyState";
import LatestBriefings from "@/components/LatestBriefings";
import { PageHeader } from "@/components/PageHeader";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import {
  useArticles,
  useAudioJobs,
  useBriefings,
  useToggleBookmark,
} from "@/hooks/useApi";
import { useArticleFilters } from "@/hooks/useArticleFilters";
import type { ArchiveScope, Article } from "@/types";
import { audioJobKey, buildAudioJobMap, getAudioBadgeState } from "@/utils/audio-badge";
import { Archive, FileText, Loader2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

interface ArticlesPageProps {
  // The Archive view is this same page with a different scope. Reusing it means
  // the archive gets search, filters, presets and pagination for free.
  archiveScope?: Extract<ArchiveScope, "active" | "archived">;
}

export default function ArticlesPage({ archiveScope = "active" }: ArticlesPageProps) {
  const isArchiveView = archiveScope === "archived";
  const { query, setPage } = useArticleFilters();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, error } = useArticles({
    ...query,
    archiveScope: isArchiveView ? "archived" : undefined,
  });

  const { data: briefingsData } = useBriefings();
  const { add, remove } = useToggleBookmark();
  const { data: audioJobsData } = useAudioJobs();

  const audioJobsBySource = useMemo(
    () => buildAudioJobMap(audioJobsData?.jobs),
    [audioJobsData],
  );

  const articles = data?.articles ?? [];
  const total = data?.pagination?.total_articles ?? 0;
  const perPage = data?.pagination?.per_page ?? 20;
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;

  // The flag comes off the article the list response gave us, so the toggle is
  // right at any bookmark count. Reading it out of a page of /api/bookmarks
  // broke past the first 100.
  const handleToggleBookmark = (article: Article) => {
    if (article.is_bookmarked) {
      remove.mutate(article.id);
    } else {
      add.mutate(article.id);
    }
  };

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];
  const sources = data?.available_sources ?? [];

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  const title = isArchiveView ? "Archive" : "Articles";

  if (error) {
    return (
      <>
        <PageHeader title={title} />
        <p className="text-sm text-destructive">
          Failed to load articles: {error.message}
        </p>
      </>
    );
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        {isArchiveView && <BackButton fallback="/articles" />}
        <PageHeader
          title={title}
          description={`Showing ${startItem} - ${endItem} of ${total} articles`}
          actions={
            !isArchiveView && (
              <>
                <Button variant="outline" asChild>
                  <Link to="/archive">
                    <Archive className="w-4 h-4" /> Archive
                  </Link>
                </Button>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4" /> Add Article
                </Button>
              </>
            )
          }
        />

        <ArticleFilters sources={sources} />

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
                onToggleBookmark={() => handleToggleBookmark(article)}
                isBookmarked={article.is_bookmarked}
                audioState={getAudioBadgeState(
                  article.has_audio,
                  audioJobsBySource.get(audioJobKey("article", article.id)),
                )}
              />
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <EmptyState
            icon={isArchiveView ? Archive : FileText}
            title={isArchiveView ? "Nothing archived." : "No articles found."}
          />
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
