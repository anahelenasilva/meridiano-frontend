import { useArchiveArticle } from "@/hooks/useApi";
import { toast } from "@/utils/toast";
import { Archive, ArchiveRestore } from "lucide-react";
import { MESSAGES } from "../constants/messages";

interface ArchiveButtonProps {
  articleId: string;
  archivedAt: string | null;
  size?: "sm" | "md" | "lg";
  // Lets a page own the post-success toast, so the list can offer Undo while
  // the detail page shows a plain confirmation.
  onArchived?: () => void;
}

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

// ArticleCard renders this at "sm" in a tight row of icon buttons, matching its
// bookmark button's plain p-1. Everywhere else it sits in the detail page's action
// row next to an h-9 Edit button, so it gets a fixed square that lines up with it.
// Note the hover fill is `secondary`, not `accent`: this theme sets --accent to the
// same orange as --primary, so bg-accent would paint the icon out of existence.
const buttonSizeClasses = {
  sm: "p-1 hover:text-primary",
  md: "h-9 w-9 justify-center rounded-full hover:bg-secondary hover:text-foreground",
  lg: "h-10 w-10 justify-center rounded-full hover:bg-secondary hover:text-foreground",
};

export default function ArchiveButton({
  articleId,
  archivedAt,
  size = "md",
  onArchived,
}: ArchiveButtonProps) {
  const archiveMutation = useArchiveArticle();
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
    archiveMutation.mutate({ id: articleId, action: isArchived ? "unarchive" : "archive" });
    if (onArchived) {
      onArchived();
    } else {
      toast.success(
        isArchived ? MESSAGES.SUCCESS.ARTICLE_UNARCHIVED : MESSAGES.SUCCESS.ARTICLE_ARCHIVED,
      );
    }
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
