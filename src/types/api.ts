const ArticleCategory = {
  NEWS: 'news',
  BLOG: 'blog',
  RESEARCH: 'research',
  NODEJS: 'nodejs',
  TYPESCRIPT: 'typescript',
  TUTORIAL: 'tutorial',
  OTHER: 'other',
} as const;

export type ArticleCategory = typeof ArticleCategory[keyof typeof ArticleCategory];

export interface Article {
  id: string;
  url: string;
  title: string;
  published_date: string;
  feed_source: string;
  feed_profile: string;
  content: string;
  processed_content: string;
  processed_content_html: string;
  content_html: string;
  impact_rating: number;
  image_url: string;
  created_at: string;
  categories: ArticleCategory[];
}

export interface Briefing {
  id: string;
  title: string;
  content: string;
  generated_at: string;
  feed_profile: string;
  summary: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    total_articles: number;
  };
  filters: {
    sort_by: string;
    direction: 'asc' | 'desc';
    feed_profile: string;
    search_term: string;
    start_date: string;
    end_date: string;
    preset: string;
    category: string;
  };
  available_profiles: string[];
  available_categories: string[];
}

export interface BriefingsResponse {
  briefings: Briefing[];
  current_feed_profile: string;
  available_profiles: string[];
}

export interface ArticleDetailResponse {
  article: Article;
  related_articles: Article[];
}

export interface BriefingDetailResponse {
  id: string;
  brief_markdown: string;
  generated_at: Date;
  feed_profile: string;
}

export interface YoutubeTranscription {
  id: string;
  channelId: string;
  channelName: string;
  videoTitle: string;
  postedAt?: Date;
  videoUrl: string;
  processedAt: Date;
  transcriptionText: string;
  transcriptionSummary?: string;
}

export interface YoutubeTranscriptionsResponse {
  transcriptions: YoutubeTranscription[];
  available_channels: { id: string; name: string }[];
}

export interface YoutubeTranscriptionDetailResponse {
  transcription: YoutubeTranscription;
  related_transcriptions: YoutubeTranscription[];
}

export interface YoutubeChannel {
  id: string;
  channelId: string;
  url: string;
  name: string;
  description: string;
  enabled: boolean;
  maxVideos?: number | null;
}

export interface Bookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: Date;
  article: Article;
}

export interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BookmarkCheckResponse {
  isBookmarked: boolean;
}
