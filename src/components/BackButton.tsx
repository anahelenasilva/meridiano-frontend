import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
  className?: string;
}

/**
 * Goes back in history, so the previous list keeps its filters and page.
 * Falls back to `to` when the page was opened directly.
 */
export function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
  const location = useLocation();
  const navigate = useNavigate();
  // React Router marks the first entry of a session with key "default".
  const hasHistory = location.key !== "default";

  return (
    <Link
      to={to}
      onClick={(e) => {
        if (!hasHistory) return;
        e.preventDefault();
        navigate(-1);
      }}
      className={`inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
