import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useBriefings, useProfiles } from "@/hooks/useApi";
import {
  Loader2,
  FileText,
  Filter,
  ChevronRight,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function BriefingsPage() {
  const [selectedProfile, setSelectedProfile] = useState<string>("all");
  const { data: profilesData } = useProfiles();
  const { data, isLoading, error } = useBriefings(
    selectedProfile === "all" ? undefined : selectedProfile,
  );
  const briefings = data?.briefings ?? [];
  const profiles = profilesData ?? [];

  const uniqueProfiles = useMemo(() => {
    const fromBriefings = briefings.map((b) => b.feed_profile);
    const merged = Array.from(new Set([...profiles, ...fromBriefings]));
    return merged.sort();
  }, [briefings, profiles]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl font-bold mb-1">Briefings</h1>
        <p className="text-sm text-destructive">
          Failed to load briefings: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 mb-4">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
          News Briefings
        </h1>
        <p className="text-muted-foreground">
          AI-powered summaries and insights from your curated news feeds
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {data?.total ?? briefings.length} briefings available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {uniqueProfiles.length} profiles active
          </span>
        </div>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/15">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Filter Briefings</p>
              <p className="text-xs text-muted-foreground">
                Choose a profile to see specific content
              </p>
            </div>
          </div>
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              {uniqueProfiles.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {briefings.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {b.feed_profile}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {b.generated_at
                      ? format(new Date(b.generated_at), "MMM d, yyyy • h:mm a")
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <Button asChild>
                  <Link to={`/briefings/${b.id}`}>
                    Read Full Briefing <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to={`/articles?feedProfile=${encodeURIComponent(b.feed_profile)}`}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  View related articles <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
          {briefings.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No briefings found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
