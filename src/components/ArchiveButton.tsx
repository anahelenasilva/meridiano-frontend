import { useArchiveArticle } from "@/hooks/useApi";
import { toast } from "@/utils/toast";
import { Archive, ArchiveRestore } from "lucide-react";
import { MESSAGES } from "../constants/messages";

interface ArchiveButtonProps {
  articleId: string;
  archivedAt: string | null;
  showLabel?: boolean;
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
// bookmark button's plain p-1. Everywhere else (the detail page, at "md") it sits
// next to a p-2/rounded-full/hover:bg-accent bookmark button and should match that.
const paddingClasses = {
  sm: "p-1",
  md: "p-2 rounded-full hover:bg-accent",
  lg: "p-2 rounded-full hover:bg-accent",
};

export default function ArchiveButton({
  articleId,
  archivedAt,
  showLabel = false,
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
      className={`flex items-center gap-1 ${paddingClasses[size]} transition-colors hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed`}
      title={label}
      aria-label={label}
    >
      <Icon className={iconSizeClasses[size]} />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
