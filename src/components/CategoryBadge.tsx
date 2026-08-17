import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/types";

interface CategoryBadgeProps {
  category: Category;
  onRemove?: () => void;
}

/** Renders a category as a badge swatched in its assigned palette color. */
export function CategoryBadge({ category, onRemove }: CategoryBadgeProps) {
  return (
    <Badge
      style={{ backgroundColor: category.color }}
      className="gap-1 border-transparent text-white hover:opacity-90"
    >
      {category.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${category.name}`}
          className="rounded-full outline-none hover:bg-black/20 focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
