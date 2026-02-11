import { format } from "date-fns";
import { Link } from "react-router-dom";
import type { Briefing } from "@/types";

interface LatestBriefingsProps {
  briefings: Briefing[];
}

export default function LatestBriefings({ briefings }: LatestBriefingsProps) {
  return (
    <aside className="hidden lg:block w-80 shrink-0">
      <div className="sticky top-6 space-y-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Latest Briefings</h2>
            <Link to="/briefings" className="text-xs text-primary hover:underline">
              See all
            </Link>
          </div>
          {briefings.map((b) => (
            <Link
              key={b.id}
              to={`/briefings/${b.id}`}
              className="group flex items-start gap-3 py-3 border-b border-border last:border-0"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {b.feed_profile}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {b.generated_at
                    ? format(new Date(b.generated_at), "MMM d, yyyy")
                    : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
