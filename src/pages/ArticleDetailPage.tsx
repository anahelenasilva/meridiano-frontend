import ArticleCard from "@/components/ArticleCard";
import { useAuth } from "@/contexts/AuthContext";
import { useArticle, useArticles, useBookmarkCheck, useToggleBookmark } from "@/hooks/useApi";
import { getArticleImage } from "@/utils/get-article-image";
import { format } from "date-fns";
import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function ArticleDetail() {
  const { id } = useParams();
  const { data, isLoading } = useArticle(id);

  const { user } = useAuth();
  const userId = user?.id;

  const { data: bookmarkStatus } = useBookmarkCheck(id, userId);
  const { add, remove } = useToggleBookmark(userId);
  const isBookmarked = bookmarkStatus?.bookmarked ?? false;

  const handleToggleBookmark = () => {
    if (!id) {
      return;
    }
    if (isBookmarked) {
      remove.mutate(id);
    } else {
      add.mutate(id);
    }
  };

  // Fetch all articles for prev/next and related
  const { data: allData } = useArticles({ perPage: 50 });
  const allArticles = allData?.articles ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const article = data?.article;
  const audio = article?.audio;

  if (!article) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Article not found.</p>
        <Link to="/articles" className="text-primary underline mt-2 inline-block">
          Back to articles
        </Link>
      </div>
    );
  }

  const articleIndex = allArticles.findIndex((a) => a.id === id);
  const prevArticle = articleIndex > 0 ? allArticles[articleIndex - 1] : null;
  const nextArticle = articleIndex < allArticles.length - 1 ? allArticles[articleIndex + 1] : null;
  const primaryCategory = article.categories?.[0];
  const related = allArticles
    .filter((a) => a.id !== article.id && primaryCategory && a.categories?.includes(primaryCategory))
    .slice(0, 3);

  const content = article.processed_content || article.raw_content || "";
  const displayDate = article.published_date ? format(new Date(article.published_date), "MMM d, yyyy") : "";
  const displayImage = getArticleImage(article);

  return (
    <div className="max-w-6xl mx-auto flex gap-8 px-4 py-6">
      {/* Prev/Next nav */}
      <div className="hidden lg:flex flex-col items-center pt-16 gap-2 w-12 shrink-0">
        {prevArticle ? (
          <Link
            to={`/articles/${prevArticle.id}`}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ChevronUp className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/30">
            <ChevronUp className="h-4 w-4" />
          </div>
        )}
        {nextArticle ? (
          <Link
            to={`/articles/${nextArticle.id}`}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground/30">
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Main content */}
      <article className="flex-1 min-w-0 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-primary mb-4">{article.feed_source}</p>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">{article.title}</h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-4">{article.summary}</p>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{article.feed_source?.[0] || "?"}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{article.feed_source}</p>
            <p className="text-xs text-muted-foreground">
              {displayDate}
              {primaryCategory && ` · ${primaryCategory}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleBookmark}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            {isBookmarked ? (
              <Bookmark className="h-5 w-5 text-primary" />
            ) : (
              <BookmarkCheck className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>

        <div className="border-t border-border pt-6 mb-6">
          <img src={displayImage} alt={article.title} className="w-full rounded-lg object-cover mb-6 max-h-96" />
        </div>

        {audio?.presigned_url && (
          <div className="rounded-lg border border-border bg-secondary/50 p-4 space-y-3 mb-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Listen to article</p>
            <audio controls className="w-full" src={audio.presigned_url}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">AI Summary</h2>

          <div className="prose-custom text-foreground/70 text-[17px] whitespace-pre-line mt-6 rounded-lg border border-border bg-card p-4 text-sm mb-6"
            dangerouslySetInnerHTML={{ __html: article.processed_content_html }}
          />
        </div>

        {article.content_html && (
          <div className="prose-custom text-foreground/90 leading-[1.8] text-[17px] whitespace-pre-line mt-6"
            dangerouslySetInnerHTML={{ __html: article.content_html }}>
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-10 pt-6 border-t border-border">
            <h2 className="font-serif text-xl font-bold mb-4">More in {primaryCategory}</h2>
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </section>
        )}
      </article>

      <div className="hidden lg:block w-12 shrink-0" />
    </div>
  );
}
