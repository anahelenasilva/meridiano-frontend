import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useTranscriptions } from "@/hooks/useApi";
import { format } from "date-fns";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function YoutubeTranscriptionsPage() {
  const { data, isLoading } = useTranscriptions();
  const videos = data?.transcriptions ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof videos>();
    for (const v of videos) {
      const list = map.get(v.channelName) ?? [];
      list.push(v);
      map.set(v.channelName, list);
    }
    return Array.from(map.entries());
  }, [videos]);

  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});

  const toggleChannel = (name: string) =>
    setOpenChannels((prev) => ({ ...prev, [name]: !prev[name] }));

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="font-serif text-2xl font-bold mb-6">YouTube Transcriptions</h1>

      {grouped.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No transcriptions found.</p>
      )}

      <div className="space-y-4">
        {grouped.map(([channelName, channelVideos]) => (
          <Collapsible
            key={channelName}
            open={openChannels[channelName] === true}
            onOpenChange={() => toggleChannel(channelName)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-3 px-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base">{channelName}</h2>
                <span className="text-xs text-muted-foreground">({channelVideos.length})</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=closed]>&]:rotate-[-90deg]" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-0 pl-2">
                {channelVideos.map((v) => (
                  <Link
                    key={v.id}
                    to={`/youtube-transcriptions/${v.id}`}
                    className="group flex items-start gap-4 py-4 border-b border-border"
                  >
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="w-28 h-20 rounded-md object-cover shrink-0 bg-muted hidden sm:block"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                        {v.videoTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {v.postedAt ? format(new Date(v.postedAt), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
