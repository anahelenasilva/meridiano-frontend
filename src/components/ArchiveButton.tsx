import { useArchiveArticle } from "@/hooks/useApi";
import { getErrorMessage } from "@/utils/api-error";
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

    archiveMutation.mutate(
      { id: articleId, action: isArchived ? "unarchive" : "archive" },
      {
        onSuccess: () => {
          if (onArchived) {
            onArchived();
            return;
          }
          toast.success(
            isArchived
              ? MESSAGES.SUCCESS.ARTICLE_UNARCHIVED
              : MESSAGES.SUCCESS.ARTICLE_ARCHIVED,
          );
        },
        onError: (error: Error) => {
          toast.error(
            `${isArchived ? MESSAGES.ERROR.ARTICLE_UNARCHIVE : MESSAGES.ERROR.ARTICLE_ARCHIVE} ${getErrorMessage(error)}`,
          );
        },
      },
    );
  };

  const Icon = isArchived ? ArchiveRestore : Archive;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={archiveMutation.isPending}
      className="flex items-center gap-1 p-1 transition-colors hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      title={label}
      aria-label={label}
    >
      <Icon className={iconSizeClasses[size]} />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
