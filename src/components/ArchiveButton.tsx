import { useArchiveArticle } from "@/hooks/useApi";
import { toast } from "@/utils/toast";
import { Archive, ArchiveRestore } from "lucide-react";
import { MESSAGES } from "../constants/messages";

interface ArchiveButtonProps {
  articleId: string;
  archivedAt: string | null;
  size?: "sm" | "md" | "lg";
}

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

// ArticleCard renders this at "sm" in a tight row of icon buttons, matching its
// bookmark button's plain p-1. Everywhere else it sits in the detail page's action
// row next to an h-9 Edit button, so it gets a fixed square that lines up with it.
const buttonSizeClasses = {
  sm: "p-1 hover:text-primary",
  md: "h-9 w-9 justify-center rounded-full hover:bg-accent hover:text-accent-foreground",
  lg: "h-10 w-10 justify-center rounded-full hover:bg-accent hover:text-accent-foreground",
};

export default function ArchiveButton({
  articleId,
  archivedAt,
  size = "md",
}: ArchiveButtonProps) {
  const archiveMutation = useArchiveArticle(articleId);
  const isArchived = archivedAt !== null;
  const label = isArchived ? "Unarchive" : "Archive";

  const handleClick = (event: React.MouseEvent) => {
    // ArticleCard wraps its body in a Link. Without this the click archives the
    // article and navigates away from the list at the same time.
    event.preventDefault();
    event.stopPropagation();

    // The optimistic removal in useArchiveArticle can unmount this button
    // (the list re-renders without the card) before the request settles, and
    // TanStack Query drops mutate-level callbacks once the observer has no
    // listeners left. Notify at mutate time instead, so the toast always fires;
    // the error toast lives on the mutation itself in useApi.ts for the same reason.
    // Undo still works after unmount: mutate itself runs without a mounted observer.
    archiveMutation.mutate(isArchived ? "unarchive" : "archive");
    toast.success(
      <span className="flex items-center gap-3">
        {isArchived ? MESSAGES.SUCCESS.ARTICLE_UNARCHIVED : MESSAGES.SUCCESS.ARTICLE_ARCHIVED}
        <button
          type="button"
          className="underline font-medium"
          onClick={() => archiveMutation.mutate(isArchived ? "archive" : "unarchive")}
        >
          Undo
        </button>
      </span>,
      // Undo needs longer than the default 3s: noticing the toast and
      // clicking it is slower than reading a plain confirmation message.
      { autoClose: 8000 },
    );
  };

  const Icon = isArchived ? ArchiveRestore : Archive;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={archiveMutation.isPending}
      className={`flex shrink-0 items-center text-muted-foreground ${buttonSizeClasses[size]} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      title={label}
      aria-label={label}
    >
      <Icon className={iconSizeClasses[size]} />
    </button>
  );
}
