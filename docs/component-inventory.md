# Component Inventory

> UI components in `src/components/`. Categorized by role.

---

## Layout & Navigation

| Component | Path | Purpose |
|-----------|------|---------|
| Layout | `Layout.tsx` | Main app shell with sidebar/nav |
| LayoutWrapper | `LayoutWrapper.tsx` | Route-level layout wrapper, owns the single `main` width |
| NavLink | `NavLink.tsx` | Styled router link |
| BackButton | `BackButton.tsx` | Back navigation, history-aware with a fallback route |
| PageHeader | `PageHeader.tsx` | Title, description and actions row for list and admin pages |
| EmptyState | `EmptyState.tsx` | Icon and message shown when a list has no items |

---

## Feature Components

| Component | Path | Purpose |
|-----------|------|---------|
| ArticleCard | `ArticleCard.tsx` | Article list item |
| AddArticleModal | `AddArticleModal.tsx` | Add article by URL/file |
| EditArticleModal | `EditArticleModal.tsx` | Edit article metadata (detail page) |
| AddTranscriptionModal | `AddTranscriptionModal.tsx` | Add YouTube transcription |
| ManageCategoriesModal | `ManageCategoriesModal.tsx` | Create/rename/delete YouTube channel categories |
| LatestBriefings | `LatestBriefings.tsx` | Briefings list |
| AudioSection | `AudioSection.tsx` | Article/transcription audio |
| AudioPlayer | `AudioPlayer.tsx` | Audio playback |
| YoutubeThumbnail | `YoutubeThumbnail.tsx` | YouTube video thumbnail |
| CustomPromptInput | `CustomPromptInput.tsx` | Custom prompt input |
| CustomPromptDisplay | `CustomPromptDisplay.tsx` | Custom prompt display |
| CustomPromptBadge | `CustomPromptBadge.tsx` | Custom prompt badge |
| ThemeToggle | `ThemeToggle.tsx` | Dark/light theme toggle |

---

## UI Primitives (Radix + Tailwind)

Located in `components/ui/`. shadcn/ui-style primitives:

| Category | Components |
|----------|------------|
| Form | `button`, `input`, `label`, `textarea`, `checkbox`, `select`, `switch` |
| Layout | `card` |
| Overlay | `dialog`, `popover`, `alert-dialog` |
| Navigation | `collapsible`, `pagination` |
| Data display | `badge` |
| Misc | `command` |
