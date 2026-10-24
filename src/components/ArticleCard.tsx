import type { Article } from "@/types";
import ArchiveButton from "@/components/ArchiveButton";
import { AudioBadge } from "@/components/AudioBadge";
import { CustomPromptBadge } from "@/components/CustomPromptBadge";
import { NoteEditor } from "@/components/NoteEditor";
import type { AudioBadgeState } from "@/utils/audio-badge";
import { format } from "date-fns";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router";

interface ArticleCardProps {
  article: Article;
  onToggleBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  variant?: "feed" | "compact";
  audioState?: AudioBadgeState;
}

export default function ArticleCard({
  article,
  onToggleBookmark,
  isBookmarked,
  variant = "feed",
  audioState = "none",
}: ArticleCardProps) {
  const displayDate = article.published_date
    ? format(new Date(article.published_date), "MMM d, yyyy")
    : "";
  const displaySource = article.feed_source || "";
  const displayCategory = article.categories?.[0] || "";

  if (variant === "compact") {
    return (
      <Link
        to={`/articles/${article.id}`}
        className="group flex items-start gap-3 py-3 border-b border-border last:border-0"
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{displaySource}</p>
            {article.custom_prompt && <CustomPromptBadge />}
            <AudioBadge state={audioState} />
          </div>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground">{displayDate}</p>
        </div>
        {article.image_url && (
          <img
            src={article.image_url}
            alt=""
            className="w-16 h-16 rounded-md object-cover shrink-0 bg-muted"
            loading="lazy"
          />
        )}
      </Link>
    );
  }

  // The title is a stretched link: its ::after covers the whole card, so a
  // click anywhere outside a control opens the article while the link's
  // accessible name stays the title. The controls are siblings of the link
  // rather than children, which keeps the markup valid, and z-10 lifts them
  // above the ::after so their own clicks land on them.
  return (
    <div className="group relative py-5 border-b border-border">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-primary">
                {displaySource[0] || "?"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{displaySource}</span>
            {article.custom_prompt && <CustomPromptBadge />}
            <AudioBadge state={audioState} />
          </div>
          <h3 className="text-lg font-semibold leading-snug">
            <Link
              to={`/articles/${article.id}`}
              className="transition-colors after:absolute after:inset-0 group-hover:text-primary"
            >
              {article.title}
            </Link>
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
            <div className="relative z-10 ml-auto flex items-center gap-1">
              {onToggleBookmark && (
                <button
                  type="button"
                  className="p-1 hover:text-primary transition-colors"
                  onClick={() => onToggleBookmark(article.id)}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
              )}
              <ArchiveButton
                articleId={article.id}
                archivedAt={article.archived_at ?? null}
                size="sm"
              />
            </div>
          </div>
          <div className="relative z-10">
            <NoteEditor
              sourceType="article"
              sourceId={article.id}
              note={article.note}
              mode="collapsed"
            />
          </div>
        </div>
        {article.image_url && (
          <img
            src={article.image_url}
            alt=""
            className="w-28 h-28 rounded-md object-cover shrink-0 bg-muted hidden sm:block"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
