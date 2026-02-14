import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
