import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallback: string;
  label?: string;
  className?: string;
}

// navigate(-1) when there is history, so a detail page opened from Bookmarks or
// Archive returns there instead of to the fallback.
export function BackButton({ fallback, label = "Back", className }: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== "default";

  return (
    <Link
      to={fallback}
      onClick={(e) => {
        if (!hasHistory) return;
        e.preventDefault();
        navigate(-1);
      }}
      className={cn(
        "mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
