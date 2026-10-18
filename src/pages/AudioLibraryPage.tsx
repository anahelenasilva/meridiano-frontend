import AudioPlayer from "@/components/AudioPlayer";
import PageNav from "@/components/PageNav";
import { useAudioLibrary } from "@/hooks/useApi";
import type { AudioData, AudioLibraryItem } from "@/types";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

function toAudioData(item: AudioLibraryItem): AudioData {
  return {
    id: item.audio_id,
    s3_key: "",
    file_size_bytes: item.audio.file_size_bytes,
    duration_seconds: item.audio.duration_seconds ?? 0,
    presigned_url: item.audio.presigned_url,
  };
}

function sourceHref(item: AudioLibraryItem): string {
  return item.source_type === "article"
    ? `/articles/${item.source_id}`
    : `/youtube-transcriptions/${item.source_id}`;
}

export default function AudioLibraryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAudioLibrary({ page, perPage: 20 });

  if (error) {
    return (
      <div className="py-6 px-4 mx-auto max-w-4xl">
        <h1 className="mb-1 font-serif text-2xl font-bold">Audio Library</h1>
        <p className="text-sm text-destructive">Failed to load Audio Library: {error.message}</p>
      </div>
    );
  }

  const audios = data?.audios ?? [];
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;

  return (
    <div className="py-6 px-4 mx-auto max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold">Audio Library</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : audios.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">You have no Audio Summaries yet.</p>
      ) : (
        <div className="space-y-6">
          {audios.map((item) => (
            <div key={item.audio_id} className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <Link
                  to={sourceHref(item)}
                  className="font-semibold text-base hover:text-primary transition-colors"
                >
                  {item.title}
                </Link>
                <span className="text-sm text-muted-foreground">{item.source_label}</span>
                {item.published_at && (
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(item.published_at), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <AudioPlayer audio={toAudioData(item)} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && <PageNav page={currentPage} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
