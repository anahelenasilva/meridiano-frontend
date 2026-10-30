import ArticleCard from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import LatestBriefings from "@/components/LatestBriefings";
import { PageHeader } from "@/components/PageHeader";
import PageNav from "@/components/PageNav";
import { useBookmarks, useBriefings, useToggleBookmark } from "@/hooks/useApi";
import { usePageParam } from "@/hooks/usePageParam";
import { Bookmark, Loader2 } from "lucide-react";
import { useEffect } from "react";

const PER_PAGE = 20;

export default function BookmarksPage() {
  const { page, setPage } = usePageParam();
  const { data, isLoading, error } = useBookmarks(page, PER_PAGE);
  const { data: briefingsData } = useBriefings();
  const { remove } = useToggleBookmark();

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];
  const totalPages = data?.totalPages ?? 0;

  // Unbookmarking the last item on a page leaves the URL past the end of the
  // list. Replace rather than push, so Back does not return to the page that
  // just emptied and bounce the user forward again.
  useEffect(() => {
    if (totalPages >= 1 && page > totalPages) {
      setPage(totalPages, { replace: true });
    }
  }, [page, totalPages, setPage]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Bookmarks" />
        <p className="text-sm text-destructive">Failed to load bookmarks: {error.message}</p>
      </>
    );
  }

  const bookmarks = data?.bookmarks ?? [];

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Bookmarks"
          description="View and manage your saved articles and content."
        />

        {bookmarks.length === 0 ? (
          <EmptyState icon={Bookmark} title="You have no bookmarks yet." />
        ) : (
          <div>
            {bookmarks.map((bookmark) => (
              <ArticleCard
                key={bookmark.id}
                article={bookmark.article}
                isBookmarked
                onToggleBookmark={(id) => remove.mutate(id)}
              />
            ))}
          </div>
        )}

        <PageNav page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <LatestBriefings briefings={recentBriefings} />
    </div>
  );
}
