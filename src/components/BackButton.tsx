import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

interface BackButtonProps {
  fallback: string;
  // Shown only when the link goes to the fallback. With history the target is
  // unknown, so the label is plain "Back".
  fallbackLabel?: string;
  className?: string;
}

function isPlainLeftClick(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

// navigate(-1) when there is history, so a detail page opened from Bookmarks or
// Archive returns there instead of to the fallback.
export function BackButton({ fallback, fallbackLabel = "Back", className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== "default";

  return (
    <Link
      to={fallback}
      onClick={(e) => {
        if (!hasHistory || !isPlainLeftClick(e)) return;
        e.preventDefault();
        navigate(-1);
      }}
      className={cn(
        "mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" /> {hasHistory ? "Back" : fallbackLabel}
    </Link>
  );
}
