import AddTranscriptionModal from "@/components/AddTranscriptionModal";
import { AudioBadge } from "@/components/AudioBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CustomPromptBadge } from "@/components/CustomPromptBadge";
import EditChannelCategoriesModal from "@/components/EditChannelCategoriesModal";
import FailedTranscriptionJobs from "@/components/FailedTranscriptionJobs";
import { NoteEditor } from "@/components/NoteEditor";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAudioJobs, useTranscriptions } from "@/hooks/useApi";
import type { Category } from "@/types";
import { audioJobKey, buildAudioJobMap, getAudioBadgeState } from "@/utils/audio-badge";
import { format } from "date-fns";
import { ChevronDown, Loader2, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function YoutubeTranscriptionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<{
    id: string;
    name: string;
    categories: Category[];
  } | null>(null);
  const { data, isLoading } = useTranscriptions();
  const { data: audioJobsData } = useAudioJobs();
  const videos = data?.transcriptions ?? [];

  const audioJobsBySource = useMemo(
    () => buildAudioJobMap(audioJobsData?.jobs),
    [audioJobsData],
  );

  const categoriesByChannelId = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const channel of data?.available_channels ?? []) {
      map.set(channel.id, channel.categories);
    }
    return map;
  }, [data]);

  const grouped = useMemo(() => {
    const map = new Map<string, { channelId: string; channelName: string; videos: typeof videos }>();
    for (const v of videos) {
      const existing = map.get(v.channelId);
      if (existing) {
        existing.videos.push(v);
      } else {
        map.set(v.channelId, { channelId: v.channelId, channelName: v.channelName, videos: [v] });
      }
    }
    return Array.from(map.values());
  }, [videos]);

  const [openChannels, setOpenChannels] = useState<Record<string, boolean>>({});

  const toggleChannel = (channelId: string) =>
    setOpenChannels((prev) => ({ ...prev, [channelId]: !prev[channelId] }));

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-serif text-2xl font-bold">YouTube Transcriptions</h1>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      <AddTranscriptionModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <FailedTranscriptionJobs />

      <EditChannelCategoriesModal
        channel={editingChannel}
        onOpenChange={(open) => !open && setEditingChannel(null)}
      />

      {grouped.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No transcriptions found.</p>
      )}

      <div className="space-y-4">
        {grouped.map(({ channelId, channelName, videos: channelVideos }) => {
          const channelCategories = categoriesByChannelId.get(channelId) ?? [];
          return (
            <Collapsible
              key={channelId}
              open={openChannels[channelId] === true}
              onOpenChange={() => toggleChannel(channelId)}
            >
              <div className="flex items-center gap-1 py-3 px-2 rounded-md hover:bg-muted/50 transition-colors">
                <CollapsibleTrigger className="flex flex-1 min-w-0 items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <h2 className="font-semibold text-base">{channelName}</h2>
                    <span className="text-xs text-muted-foreground">({channelVideos.length})</span>
                    {channelCategories.map((category) => (
                      <CategoryBadge key={category.id} category={category} />
                    ))}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 [[data-state=closed]>&]:rotate-[-90deg]" />
                </CollapsibleTrigger>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() =>
                    setEditingChannel({ id: channelId, name: channelName, categories: channelCategories })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit categories for {channelName}</span>
                </Button>
              </div>
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
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                            {v.videoTitle}
                          </h3>
                          {v.custom_prompt && <CustomPromptBadge />}
                          <AudioBadge
                            state={getAudioBadgeState(
                              v.has_audio,
                              audioJobsBySource.get(audioJobKey("transcription", v.id)),
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {v.postedAt ? format(new Date(v.postedAt), "MMM d, yyyy") : ""}
                        </p>
                        <NoteEditor
                          sourceType="transcription"
                          sourceId={v.id}
                          note={v.note}
                          mode="collapsed"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
