# Data Models

> TypeScript interfaces in `src/types/`. These mirror the Meridiano NestJS API response shapes. No backend schema or migrations in this repo.

---

## Auth (`src/types/auth.ts`)

| Type | Fields |
|------|--------|
| `User` | `id`, `email`, `username` |
| `LoginResponse` | `access_token`, `user` |
| `LoginRequest` | `email`, `password` |

---

## Articles

| Type | Fields |
|------|--------|
| `Article` | `id`, `title`, `url`, `published_date`, `feed_source`, `feed_profile`, `summary`, `processed_content_html`, `content_html`, `impact_rating`, `image_url`, `categories`, `audio`, `raw_content?`, `processed_content?`, `custom_prompt?` |
| `ArticleAudio` | `id`, `presigned_url`, `duration` |
| `AudioData` | `id`, `s3_key`, `file_size_bytes`, `duration_seconds`, `presigned_url` |
| `ArticlesResponse` | `articles`, `pagination?` |
| `ArticleDetailResponse` | `article` |
| `ArticlesQueryParams` | `page?`, `perPage?`, `sortBy?`, `direction?`, `feedProfile?`, `searchTerm?`, `startDate?`, `endDate?`, `category?` |

---

## Briefings

| Type | Fields |
|------|--------|
| `Briefing` | `id`, `generated_at`, `feed_profile`, `brief_markdown?` |
| `BriefingsResponse` | `briefings`, `total` |

---

## Bookmarks

| Type | Fields |
|------|--------|
| `Bookmark` | `id`, `user_id`, `article_id`, `created_at`, `article` |
| `BookmarksResponse` | `bookmarks`, `total`, `page`, `perPage`, `totalPages` |

---

## YouTube

| Type | Fields |
|------|--------|
| `YouTubeChannel` | `id`, `channelId`, `name`, `url`, `description`, `enabled`, `maxVideos` |
| `YouTubeTranscription` | `id`, `videoId`, `videoTitle`, `videoUrl`, `channelName`, `thumbnailUrl`, `transcriptionText`, `postedAt`, `createdAt`, `transcriptionSummary?`, `category?`, `impactRating?`, `custom_prompt?` |
| `TranscriptionAudio` | `id`, `s3_key`, `file_size_bytes`, `duration_seconds?`, `presigned_url` |
| `YouTubeTranscriptionsResponse` | `transcriptions`, `available_channels?` |
| `YouTubeTranscriptionDetailResponse` | `transcription`, `audio?` |
