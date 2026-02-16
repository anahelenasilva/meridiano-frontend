// === API Response Types (matching Meridiano NestJS API) ===

export interface Article {
  id: string;
  title: string;
  url: string;
  published_date: string;
  feed_source: string;
  feed_profile: string;
  summary: string;
  processed_content_html: string;
  content_html: string;
  impact_rating: number;
  image_url: string | null;
  categories: string[];
  audio: ArticleAudio | null;
  // Detail-only fields
  raw_content?: string;
  processed_content?: string | null;
}

export interface ArticleAudio {
  id: string;
  presigned_url: string;
  duration: number;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination?: {
    page: number;
    per_page: number;
    total_pages: number;
    total_articles: number;
  };
}

export interface ArticleDetailResponse {
  article: Article;
}

export interface Briefing {
  id: string;
  generated_at: string;
  feed_profile: string;
  // Detail-only
  brief_markdown?: string;
}

export interface BriefingsResponse {
  briefings: Briefing[];
  total: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
  article: Article;
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface YouTubeChannel {
  id: string;
  channelId: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  maxVideos: number;
}

export interface YouTubeTranscription {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channelName: string;
  thumbnailUrl: string;
  transcriptionText: string;
  postedAt: string;
  createdAt: string;
  // Detail-only
  transcriptionSummary?: string;
  category?: string;
  impactRating?: number;
}

export interface YouTubeTranscriptionsResponse {
  transcriptions: YouTubeTranscription[];
  available_channels?: { id: string; name: string }[];
}

export interface YouTubeTranscriptionDetailResponse {
  transcription: YouTubeTranscription;
}

// Query parameter types
export interface ArticlesQueryParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  feedProfile?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}
