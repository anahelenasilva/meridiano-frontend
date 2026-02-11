import { useParams, Link } from "react-router-dom";
import { useBriefing } from "@/hooks/useApi";
import { ArrowLeft, Loader2, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BriefingDetailPage() {
  const { id } = useParams();
  const { data: briefing, isLoading, error } = useBriefing(id);

  if (!id) {
    return (
      <p className="text-sm text-destructive">
        Missing briefing id in URL.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-destructive">
          Failed to load briefing: {error.message}
        </p>
        <Link to="/briefings" className="text-primary underline mt-2 inline-block">
          Back to briefings
        </Link>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p>Briefing not found.</p>
        <Link to="/briefings" className="text-primary underline mt-2 inline-block">
          Back to briefings
        </Link>
      </div>
    );
  }

  const displayDate = briefing.generated_at
    ? format(new Date(briefing.generated_at), "MMMM d, yyyy 'at' h:mm a")
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/briefings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Briefings
        </Link>
        <Link
          to={`/articles?feedProfile=${encodeURIComponent(briefing.feed_profile)}`}
          className="text-sm text-primary hover:underline"
        >
          View related articles
        </Link>
      </div>

      <Card className="p-6 mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {briefing.feed_profile}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {displayDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            <Badge variant="secondary">{briefing.feed_profile}</Badge>
          </span>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
          Executive Summary
        </h2>
        <div className="text-foreground/90 leading-[1.8] text-[17px] whitespace-pre-line">
          {briefing.brief_markdown ?? ""}
        </div>
      </Card>
    </div>
  );
}
