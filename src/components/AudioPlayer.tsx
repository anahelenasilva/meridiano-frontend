import { AudioData } from "@/types";
import { Music } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audio: AudioData;
}

/**
 * Formats bytes to human-readable file size
 */
function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return Math.round((bytes / (k ** i)) * 10) / 10 + ' ' + sizes[i];
}

/**
 * Formats seconds to MM:SS format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ audio }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load audio');
    };

    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('loadstart', handleLoadStart);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Music className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Audio Article
        </h3>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      ) : (
        <>
          {/* Audio Player */}
          <div className="mb-4">
            <audio
              ref={audioRef}
              src={audio.presigned_url}
              controls
              className="w-full h-10 rounded-md bg-secondary"
            />
          </div>

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
            {audio.duration_seconds !== undefined && audio.duration_seconds > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Duration:</span>
                <span>
                  {isLoading ? '...' : formatDuration(audio.duration_seconds)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">File Size:</span>
              <span>{formatFileSize(audio.file_size_bytes)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
