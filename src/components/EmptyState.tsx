import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
}

export function EmptyState({ icon: Icon, title }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center text-muted-foreground">
      {Icon && <Icon className="mb-3 h-10 w-10 opacity-40" aria-hidden />}
      <p className="text-sm">{title}</p>
    </div>
  );
}
