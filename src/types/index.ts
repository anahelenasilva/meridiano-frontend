// === API Response Types (matching Meridiano NestJS API) ===

import type { components } from "./api";

export type Category = components["schemas"]["CategoryResponseDto"];
export type CategoryWithCount = components["schemas"]["CategoryWithCountResponseDto"];

export interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

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
  has_audio: boolean;
  note?: Note | null;
  // Detail-only fields
  raw_content?: string;
  processed_content?: string | null;
  custom_prompt?: string | null;
}

export interface ArticleAudio {
  id: string;
  presigned_url: string;
  duration: number;
}

export interface AudioData {
  id: string;
  s3_key: string;
  file_size_bytes: number;
  duration_seconds: number;
  presigned_url: string;
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

// Write model for editing Article metadata (camelCase, partial semantics).
export interface UpdateArticlePayload {
  title?: string;
  publishedDate?: string;
  feedSource?: string;
  feedProfile?: string;
  categories?: string[];
}

export interface Briefing {
  id: string;
  generated_at: string;
  feed_profile: string;
  is_custom?: boolean;
  isCustom?: boolean;
  custom_title?: string | null;
  customTitle?: string | null;
  // Detail-only
  brief_markdown?: string;
}

export interface BriefingsResponse {
  briefings: Briefing[];
  total: number;
}

export interface Bookmark {
  id: string;
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
  categories: Category[];
}

export interface TranscriptionAudio {
  id: string;
  s3_key: string;
  file_size_bytes: number;
  duration_seconds?: number;
  presigned_url: string;
}

export interface YouTubeTranscription {
  id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  /** Internal channel UUID — the FK target for category assignment. */
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  transcriptionText: string;
  postedAt: string;
  createdAt: string;
  has_audio: boolean;
  // Detail-only
  transcriptionSummary?: string;
  category?: string;
  impactRating?: number;
  custom_prompt?: string | null;
  note?: Note | null;
}

export interface YouTubeTranscriptionsResponse {
  transcriptions: YouTubeTranscription[];
  available_channels?: { id: string; name: string; categories: Category[] }[];
}

export interface YouTubeTranscriptionDetailResponse {
  transcription: YouTubeTranscription;
  audio?: TranscriptionAudio | null;
}

export interface AudioLibraryItem {
  audio_id: string;
  source_type: "article" | "transcription";
  source_id: string;
  title: string;
  source_label: string;
  published_at: string | null;
  audio: {
    duration_seconds?: number;
    file_size_bytes: number;
    presigned_url: string;
    created_at: string;
  };
}

export interface AudioLibraryResponse {
  audios: AudioLibraryItem[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    total_audios: number;
  };
}

export interface AudioJob {
  source_type: "article" | "transcription";
  source_id: string;
  state: "queued" | "generating" | "failed";
  error: string | null;
}

export interface AudioJobsResponse {
  jobs: AudioJob[];
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
