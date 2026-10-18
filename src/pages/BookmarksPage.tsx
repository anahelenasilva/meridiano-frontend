import ArticleCard from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";
import LatestBriefings from "@/components/LatestBriefings";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useBriefings } from "@/hooks/useApi";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useBookmarks(1, 20);
  const { data: briefingsData } = useBriefings();

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];

  if (!user) {
    return (
      <>
        <PageHeader title="Bookmarks" />
        <p className="text-sm text-muted-foreground">Please log in to view your bookmarks.</p>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
              <ArticleCard key={bookmark.id} article={bookmark.article} />
            ))}
          </div>
        )}
      </div>

      <LatestBriefings briefings={recentBriefings} />
    </div>
  );
}
