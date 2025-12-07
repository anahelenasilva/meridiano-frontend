---
name: YouTube Transcriptions Feature
overview: Add a YouTube transcriptions section to the website with list and detail pages, following the same patterns as the articles section. Includes full filtering, search, pagination, and delete functionality.
todos:
  - id: add-types
    content: Add YoutubeTranscription interface and response types to src/types/api.ts
    status: pending
  - id: add-api-methods
    content: Add getYoutubeTranscriptions, getYoutubeTranscription, and deleteYoutubeTranscription methods to src/services/api.ts
    status: pending
  - id: create-list-page
    content: Create app/youtube-transcriptions/page.tsx with filtering, search, pagination, and grid layout
    status: pending
  - id: create-detail-page
    content: Create app/youtube-transcription/[id]/page.tsx with full transcription display and delete functionality
    status: pending
  - id: update-navbar
    content: Add YouTube Transcriptions link to src/components/Navbar.tsx
    status: pending
---

# YouTube Transcriptions Feature Implementation

## Overview

Create a YouTube transcriptions section similar to the articles section, with list and detail pages, filtering, search, pagination, and delete functionality.

## Implementation Steps

### 1. Add TypeScript Types (`src/types/api.ts`)

- Add `YoutubeTranscription` interface matching the provided structure
- Add `YoutubeTranscriptionsResponse` interface for list responses (similar to `ArticlesResponse`)
- Add `YoutubeTranscriptionDetailResponse` interface for detail page (similar to `ArticleDetailResponse`)

### 2. Add API Service Methods (`src/services/api.ts`)

- Add `getYoutubeTranscriptions()` method that accepts filter parameters (page, sort_by, direction, channel_id, channel_name, search, start_date, end_date)
- Add `getYoutubeTranscription(id: number)` method for fetching individual transcription
- Add `deleteYoutubeTranscription(id: number)` method for deletion

### 3. Create List Page (`app/youtube-transcriptions/page.tsx`)

- Create page component following the structure of `app/articles/page.tsx`
- Implement URL state management for filters (page, sort_by, direction, channel_id, channel_name, search, start_date, end_date, preset)
- Add debounced search input
- Add filter UI: search bar, channel filter dropdown, date range presets and inputs, sorting options
- Display transcriptions in a grid layout showing: video title, channel name, posted date, processed date, transcription summary preview
- Add pagination controls
- Add delete button for each transcription card
- Add "View Details" link to detail page

### 4. Create Detail Page (`app/youtube-transcription/[id]/page.tsx`)

- Create page component following the structure of `app/article/[id]/page.tsx`
- Display full transcription details: video title, channel info, dates, video URL link
- Show transcription text (full content)
- Show transcription summary if available
- Add "Watch on YouTube" button linking to videoUrl
- Add delete button
- Add back navigation to list page

### 5. Update Navigation (`src/components/Navbar.tsx`)

- Add new navigation link for "YouTube Transcriptions" with appropriate icon (e.g., `Youtube` from lucide-react)
- Add active state handling for `/youtube-transcriptions` route

## Key Files to Modify

- `src/types/api.ts` - Add YouTube transcription types
- `src/services/api.ts` - Add API methods
- `app/youtube-transcriptions/page.tsx` - New list page
- `app/youtube-transcription/[id]/page.tsx` - New detail page
- `src/components/Navbar.tsx` - Add navigation link

## API Endpoint Assumptions

- List endpoint: `GET /youtube/transcriptions` with query parameters
- Detail endpoint: `GET /youtube/transcriptions/:id`
- Delete endpoint: `DELETE /youtube/transcriptions/:id`
- Response format follows similar pagination structure as articles endpoint