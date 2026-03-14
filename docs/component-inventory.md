# Component Inventory

> UI components in `src/components/`. Categorized by role.

---

## Layout & Navigation

| Component | Path | Purpose |
|-----------|------|---------|
| Layout | `Layout.tsx` | Main app shell with sidebar/nav |
| LayoutWrapper | `LayoutWrapper.tsx` | Route-level layout wrapper |
| Navbar | `Navbar.tsx` | Top navigation |
| NavLink | `NavLink.tsx` | Styled router link |
| BackButton | `BackButton.tsx` | Back navigation |
| AuthGuard | `AuthGuard.tsx` | Protected route wrapper |
| Providers | `Providers.tsx` | Context provider composition |

---

## Feature Components

| Component | Path | Purpose |
|-----------|------|---------|
| ArticleCard | `ArticleCard.tsx` | Article list item |
| BookmarkButton | `BookmarkButton.tsx` | Toggle bookmark |
| AddArticleModal | `AddArticleModal.tsx` | Add article by URL/file |
| AddTranscriptionModal | `AddTranscriptionModal.tsx` | Add YouTube transcription |
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
| Form | `button`, `input`, `label`, `textarea`, `checkbox`, `radio-group`, `select`, `switch`, `form`, `input-otp`, `calendar` |
| Layout | `card`, `separator`, `aspect-ratio`, `resizable`, `scroll-area` |
| Overlay | `dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `alert-dialog`, `dropdown-menu`, `context-menu` |
| Feedback | `toast`, `toaster`, `sonner`, `alert`, `progress`, `skeleton` |
| Navigation | `tabs`, `accordion`, `collapsible`, `breadcrumb`, `navigation-menu`, `menubar` |
| Data display | `table`, `badge`, `avatar`, `chart` |
| Misc | `command`, `carousel`, `slider`, `toggle`, `toggle-group`, `hover-card`, `pagination` |
