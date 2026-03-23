import { AudioSection } from "@/components/AudioSection";
import { BackButton } from "@/components/BackButton";
import { CustomPromptDisplay } from "@/components/CustomPromptDisplay";
import { YoutubeThumbnail } from "@/components/YoutubeThumbnail";
import { useTranscription } from "@/hooks/useApi";
import { useAudioGeneration } from "@/hooks/useAudioGeneration";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from "react-router-dom";

export default function YoutubeTranscriptionDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useTranscription(id);
  const { generateAudio, isGenerating } = useAudioGeneration({
    sourceType: "transcription",
    sourceId: id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const video = data?.transcription;

  if (!video) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Video not found.</p>
        <Link to="/youtube-transcriptions" className="text-primary underline mt-2 inline-block">
          Back to transcriptions
        </Link>
      </div>
    );
  }

  const displayDate = video.postedAt ? format(new Date(video.postedAt), "MMM d, yyyy") : "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <BackButton to="/youtube-transcriptions" />

      <div className="flex flex-col sm:flex-row gap-6 mb-8 items-start">
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-full sm:w-72 aspect-video relative bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden group"
        >
          <YoutubeThumbnail
            videoUrl={video.videoUrl}
            alt={video.videoTitle}
            fill
            className="object-cover group-hover:opacity-80 transition-opacity"
          />
        </a>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
            {video.channelName}
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight mb-2">{video.videoTitle}</h1>
          <p className="text-sm text-muted-foreground">{displayDate}</p>
        </div>
      </div>

      <AudioSection
        audio={data?.audio}
        onGenerate={generateAudio}
        isGenerating={isGenerating}
        sectionLabel="Listen to transcription"
      />

      {video.custom_prompt && (
        <div className="mb-6">
          <CustomPromptDisplay customPrompt={video.custom_prompt} />
        </div>
      )}

      {video.transcriptionSummary && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">AI Summary</h2>

          <div className="prose-custom text-foreground/70 text-[16px] whitespace-pre-line mt-6 rounded-lg border border-border bg-card p-4 text-sm mb-6">
            <ReactMarkdown>{video.transcriptionSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
          Full Transcription
        </h2>
        <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
          {video.transcriptionText}
        </div>
      </section>
    </div>
  );
}
