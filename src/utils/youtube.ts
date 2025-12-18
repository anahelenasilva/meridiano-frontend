/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle youtu.be short URLs
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (youtuBeMatch) {
      return youtuBeMatch[1];
    }

    // Handle youtube.com URLs
    const urlObj = new URL(url);

    // Check for watch?v= format
    if (urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }

    // Check for embed/ format
    const embedMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) {
      return embedMatch[1];
    }

    // Check for /v/ format
    const vMatch = urlObj.pathname.match(/\/v\/([a-zA-Z0-9_-]{11})/);
    if (vMatch) {
      return vMatch[1];
    }

    return null;
  } catch (error) {
    // Invalid URL
    return null;
  }
}

/**
 * Generates a YouTube thumbnail URL for a given video ID
 * Uses maxresdefault for highest quality, with hqdefault as fallback
 */
export function getYoutubeThumbnailUrl(videoId: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Gets the YouTube thumbnail URL from a video URL
 * Returns null if the video ID cannot be extracted
 */
export function getThumbnailFromVideoUrl(videoUrl: string, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault'): string | null {
  const videoId = getYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return getYoutubeThumbnailUrl(videoId, quality);
}
