import { MESSAGES } from '@/constants/messages';
import { Headphones, Loader2 } from 'lucide-react';

interface AudioSectionProps {
  audio: { presigned_url: string } | null | undefined;
  onGenerate: () => void;
  isGenerating: boolean;
  sectionLabel: string;
  className?: string;
}

export function AudioSection({
  audio,
  onGenerate,
  isGenerating,
  sectionLabel,
  className = 'mb-6',
}: AudioSectionProps) {
  if (audio?.presigned_url) {
    return (
      <div className={`rounded-lg border border-border bg-secondary/50 p-4 space-y-3 ${className}`}>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {sectionLabel}
        </p>
        <audio controls className="w-full" src={audio.presigned_url}>
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-border bg-secondary/50 p-4 ${className}`}>
      <p className="text-sm text-muted-foreground mb-3">
        {MESSAGES.AUDIO.NOT_AVAILABLE_RETRY}
      </p>
      <button
        type="button"
        onClick={() => void onGenerate()}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isGenerating ? 'Generating audio...' : 'Generate audio'}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Headphones className="h-4 w-4" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Generate Audio'}</span>
      </button>
    </div>
  );
}
