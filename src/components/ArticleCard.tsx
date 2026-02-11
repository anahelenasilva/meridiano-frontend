import type { Article } from "@/types";
import { getArticleImage } from "@/utils/get-article-image";
import { format } from "date-fns";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";

interface ArticleCardProps {
  article: Article;
  onToggleBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  variant?: "feed" | "compact";
}

export default function ArticleCard({
  article,
  onToggleBookmark,
  isBookmarked,
  variant = "feed",
}: ArticleCardProps) {
  const displayDate = article.published_date
    ? format(new Date(article.published_date), "MMM d, yyyy")
    : "";
  const displaySource = article.feed_source || "";
  const displayCategory = article.categories?.[0] || "";
  const displayImage = getArticleImage(article);

  if (variant === "compact") {
    return (
      <Link
        to={`/articles/${article.id}`}
        className="group flex items-start gap-3 py-3 border-b border-border last:border-0"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">{displaySource}</p>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground">{displayDate}</p>
        </div>
        <img
          src={displayImage}
          alt=""
          className="w-16 h-16 rounded-md object-cover shrink-0 bg-muted"
          loading="lazy"
        />
      </Link>
    );
  }

  return (
    <Link
      to={`/articles/${article.id}`}
      className="group block py-5 border-b border-border"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">
                {displaySource[0] || "?"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{displaySource}</span>
          </div>
          <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span>{displayDate}</span>
            {displayCategory && (
              <>
                <span>·</span>
                <span className="text-primary/80">{displayCategory}</span>
              </>
            )}
            {onToggleBookmark && (
              <div className="ml-auto">
                <button
                  className="p-1 hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleBookmark(article.id);
                  }}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        <img
          src={displayImage}
          alt=""
          className="w-28 h-28 rounded-md object-cover shrink-0 bg-muted hidden sm:block"
          loading="lazy"
        />
      </div>
    </Link>
  );
}
