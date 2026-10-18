import AudioPlayer from "@/components/AudioPlayer";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAudioLibrary } from "@/hooks/useApi";
import type { AudioData, AudioLibraryItem } from "@/types";
import { format } from "date-fns";
import { Headphones, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
      <>
        <PageHeader title="Audio Library" />
        <p className="text-sm text-destructive">Failed to load Audio Library: {error.message}</p>
      </>
    );
  }

  const audios = data?.audios ?? [];
  const totalPages = data?.pagination?.total_pages ?? 0;
  const currentPage = data?.pagination?.page ?? 1;

  return (
    <div>
      <PageHeader title="Audio Library" />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : audios.length === 0 ? (
        <EmptyState icon={Headphones} title="You have no Audio Summaries yet." />
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

      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <PaginationItem>
                      <span className="px-2">...</span>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setPage(p)}
                      isActive={p === currentPage}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                </span>
              ))}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
