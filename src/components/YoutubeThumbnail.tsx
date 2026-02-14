import { getThumbnailFromVideoUrl } from '@/utils/youtube';
import { useEffect, useReducer, useRef } from 'react';

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
type ThumbnailState = {
  imageLoadError: boolean;
  triedHq: boolean;
};

type ThumbnailAction =
  | { type: 'RESET' }
  | { type: 'TRY_HQ' }
  | { type: 'SET_ERROR' };

function thumbnailReducer(state: ThumbnailState, action: ThumbnailAction): ThumbnailState {
  switch (action.type) {
    case 'RESET':
      return { imageLoadError: false, triedHq: false };
    case 'TRY_HQ':
      return { ...state, triedHq: true };
    case 'SET_ERROR':
      return { ...state, imageLoadError: true };
    default:
      return state;
  }
}

export function YoutubeThumbnail({
  videoUrl,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
}: YoutubeThumbnailProps) {
  const [state, dispatch] = useReducer(thumbnailReducer, {
    imageLoadError: false,
    triedHq: false,
  });

  const prevVideoUrlRef = useRef(videoUrl);

  // Check if we can extract thumbnail URL (synchronous, no state needed)
  const canExtractThumbnail = getThumbnailFromVideoUrl(videoUrl, 'maxresdefault') !== null;

  // Reset image loading state when videoUrl changes
  useEffect(() => {
    if (prevVideoUrlRef.current !== videoUrl) {
      prevVideoUrlRef.current = videoUrl;
      dispatch({ type: 'RESET' });
    }
  }, [videoUrl]);

  // Determine thumbnail URL based on state
  let thumbnailUrl: string;
  if (!canExtractThumbnail || state.imageLoadError) {
    thumbnailUrl = '/youtube-placeholder.svg';
  } else if (state.triedHq) {
    thumbnailUrl = getThumbnailFromVideoUrl(videoUrl, 'hqdefault') || '/youtube-placeholder.svg';
  } else {
    thumbnailUrl = getThumbnailFromVideoUrl(videoUrl, 'maxresdefault') || '/youtube-placeholder.svg';
  }

  const handleError = () => {
    if (!state.triedHq) {
      // First error: try hqdefault quality
      dispatch({ type: 'TRY_HQ' });
    } else {
      // Second error: use placeholder
      dispatch({ type: 'SET_ERROR' });
    }
  };

  if (fill) {
    return (
      <img
        src={thumbnailUrl}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      width={width || 640}
      height={height || 360}
      className={className}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
