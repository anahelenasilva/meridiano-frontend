# API Contracts

> Frontend-facing API endpoints consumed by `src/services/api.ts`. Uses native `fetch` with `Authorization: Bearer` token.

**Base URL:** `VITE_API_BASE_URL` (default: `http://localhost:3001` in development)

**Auth:** All authenticated endpoints require `Authorization: Bearer <token>` header. 401 triggers redirect to `/login`.

---

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login with email/password. Returns `{ access_token, user }`. |

---

## Profiles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/profiles` | Fetch feed profile names. Returns `string[]`. |

---

## Articles

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/articles` | List articles. Query: `page`, `perPage`, `sortBy`, `direction`, `feedProfile`, `searchTerm`, `startDate`, `endDate`, `category`. |
| GET | `/api/articles/:id` | Article detail. Query: `includeAudio` (default: true). |
| POST | `/api/articles` | Create article by URL. Body: `{ url, feedProfile?, customPrompt?, generateAudio? }`. Returns `{ id }`. |
| DELETE | `/api/articles/:id` | Delete article. Returns `{ success }`. |
| POST | `/api/articles/upload-url` | Get presigned S3 upload URL. Body: `{ articleFileName, contentType }`. Returns `{ url, fields }`. |
| POST | `/api/articles/markdown` | Add article from S3 key. Body: `{ s3Key, feedProfile?, customPrompt?, generateAudio? }`. Returns `{ jobId, message }`. |
| POST | `/api/articles/:id/audio` | Generate article audio. Returns `{ jobId, message }`. |

---

## Bookmarks

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookmarks` | List bookmarks. Query: `user_id`, `page`, `per_page`. |
| POST | `/api/bookmarks` | Add bookmark. Body: `{ user_id, article_id }`. Returns `{ id }`. |
| DELETE | `/api/bookmarks` | Remove bookmark. Query: `user_id`, `article_id`. Returns `{ success }`. |
| GET | `/api/bookmarks/check/:articleId` | Check if article is bookmarked. Query: `user_id`. Returns `{ bookmarked }`. |

---

## Briefings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/briefings` | List briefings. Query: `feedProfile`. |
| GET | `/api/briefings/:id` | Briefing detail. |

---

## YouTube Channels

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/youtube/channels` | List channels. |
| POST | `/api/youtube/channels` | Create channel. Body: `{ channelId, name, url, description?, enabled?, maxVideos? }`. |
| PATCH | `/api/youtube/channels/:channelId` | Update channel. Body: `{ enabled }`. |

---

## YouTube Transcriptions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/youtube/transcriptions` | List transcriptions. |
| GET | `/api/youtube/transcriptions/:id` | Transcription detail. Query: `includeAudio`. |
| POST | `/api/youtube/transcriptions` | Create transcription. Body: `{ url, channelId?, customPrompt?, generateAudio? }`. Returns `{ jobId, message }`. |
| DELETE | `/api/youtube/transcriptions/:id` | Delete transcription. Returns `{ success }`. |
| POST | `/api/youtube/transcriptions/:id/audio` | Generate transcription audio. Returns `{ jobId, message }`. |
