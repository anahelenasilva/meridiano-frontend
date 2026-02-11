import ArticleCard from "@/components/ArticleCard";
import LatestBriefings from "@/components/LatestBriefings";
import { useAuth } from "@/contexts/AuthContext";
import { useBookmarks, useBriefings } from "@/hooks/useApi";

export default function BookmarksPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data, isLoading, error } = useBookmarks(userId, 1, 20);
  const { data: briefingsData } = useBriefings();

  const recentBriefings = briefingsData?.briefings?.slice(0, 2) ?? [];

  if (!userId) {
    return (
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-bold mb-1">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Please log in to view your bookmarks.
        </p>
      </div>
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
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-bold mb-1">Bookmarks</h1>
        <p className="text-sm text-destructive">
          Failed to load bookmarks: {error.message}
        </p>
      </div>
    );
  }

  const bookmarks = data?.bookmarks ?? [];

  return (
    <div className="max-w-6xl mx-auto flex gap-8 px-4 py-6">
      <div className="flex-1 min-w-0">
        <h1 className="font-serif text-2xl font-bold mb-1">Bookmarks</h1>
        <p className="text-sm text-muted-foreground mb-6">
          View and manage your saved articles and content.
        </p>

        {bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no bookmarks yet.
          </p>
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
