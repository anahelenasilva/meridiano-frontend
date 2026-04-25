import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBriefing, useUpdateBriefingTitle } from "@/hooks/useApi";
import { getBriefingCustomTitle, getBriefingTitle, isCustomBriefing } from "@/utils/briefing-title";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Check, Loader2, Pencil, Tag, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

export default function BriefingDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { data: briefing, isLoading, error } = useBriefing(id);
  const updateTitle = useUpdateBriefingTitle();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const creationTitle =
    (location.state as { customTitle?: string } | null)?.customTitle?.trim() || null;

  if (!id) {
    return (
      <p className="text-sm text-destructive">
        Missing briefing id in URL.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        {creationTitle && (
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-6">
            {creationTitle}
          </h1>
        )}
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
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
  const customTitle = getBriefingCustomTitle(briefing);
  const briefingTitle = getBriefingTitle(briefing);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
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
        <div className="flex items-start justify-between gap-4 mb-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                className="font-serif text-xl sm:text-2xl font-bold h-auto py-1"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (id && editTitleValue.trim()) {
                    updateTitle.mutate(
                      { id, customTitle: editTitleValue.trim() },
                      {
                        onSuccess: () => setIsEditingTitle(false),
                      },
                    );
                  }
                }}
                disabled={updateTitle.isPending}
              >
                {updateTitle.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditingTitle(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              {briefingTitle}
            </h1>
          )}
          {isCustomBriefing(briefing) && !isEditingTitle && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditTitleValue(customTitle || "");
                setIsEditingTitle(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> {displayDate}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            <Badge variant="secondary">{briefing.feed_profile}</Badge>
          </span>
          {isCustomBriefing(briefing) && (
            <Badge variant="outline">Custom</Badge>
          )}
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
