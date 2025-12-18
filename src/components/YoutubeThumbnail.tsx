'use client';

import { getThumbnailFromVideoUrl } from '@/src/utils/youtube';
import Image from 'next/image';
import { useState } from 'react';

interface YoutubeThumbnailProps {
  videoUrl: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * YouTube thumbnail component with automatic fallback to placeholder
 * Attempts to load YouTube thumbnail, falls back to local placeholder on error
 */
export function YoutubeThumbnail({
  videoUrl,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
}: YoutubeThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const [triedHq, setTriedHq] = useState(false);

  const thumbnailUrl = hasError
    ? '/youtube-placeholder.svg'
    : triedHq
    ? getThumbnailFromVideoUrl(videoUrl, 'hqdefault')
    : getThumbnailFromVideoUrl(videoUrl, 'maxresdefault');

  const handleError = () => {
    if (!triedHq) {
      // First error: try hqdefault quality
      setTriedHq(true);
    } else {
      // Second error: use placeholder
      setHasError(true);
    }
  };

  // If we can't extract video ID, use placeholder immediately
  if (!thumbnailUrl && !hasError) {
    setHasError(true);
  }

  const finalUrl = hasError ? '/youtube-placeholder.svg' : thumbnailUrl || '/youtube-placeholder.svg';

  if (fill) {
    return (
      <Image
        src={finalUrl}
        alt={alt}
        fill
        className={className}
        onError={handleError}
        unoptimized
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={finalUrl}
      alt={alt}
      width={width || 640}
      height={height || 360}
      className={className}
      onError={handleError}
      unoptimized
      priority={priority}
    />
  );
}
