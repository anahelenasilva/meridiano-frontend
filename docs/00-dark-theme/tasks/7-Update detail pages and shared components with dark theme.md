# Update detail pages and shared components with dark theme

## Overview

Apply dark theme support to all detail pages (briefing, article, YouTube transcription) and shared components (LayoutWrapper, BookmarkButton, YoutubeThumbnail). This task focuses on updating existing components with dark mode Tailwind variants to ensure consistent visual experience across all content pages. Detail pages contain significant text content, rich media, and interactive elements that must maintain WCAG AA contrast compliance in dark theme.

<critical>
- **ALWAYS READ** the technical docs from PRD and TechSpec before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme to three detail pages: briefing detail, article detail, YouTube transcription detail
- MUST update LayoutWrapper background to support dark theme across entire application
- MUST ensure BookmarkButton interactive states (hover, active, bookmarked) work in dark theme
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) in all detail page content
- MUST preserve existing responsive design and mobile-first layout behavior
- MUST maintain visual hierarchy and readability for long-form content in dark theme
- MUST ensure images and thumbnails display correctly with dark backgrounds
- MUST support dark theme for badges, tags, metadata displays, and navigation links
</requirements>

## Subtasks

- [ ] 4.1 Update LayoutWrapper component with dark background and theme-aware styling
- [ ] 4.2 Apply dark theme to briefing detail page (app/briefing/[id]/page.tsx) including header, metadata, and markdown content
- [ ] 4.3 Apply dark theme to article detail page (app/article/[id]/page.tsx) including image display, content sections, and action buttons
- [ ] 4.4 Apply dark theme to YouTube transcription detail page (app/youtube-transcription/[id]/page.tsx) including video thumbnail, transcription text, and navigation
- [ ] 4.5 Update BookmarkButton component with dark theme variants for all states (default, bookmarked, loading, disabled)
- [ ] 4.6 Update YoutubeThumbnail component placeholder and error states for dark theme

## Implementation Details

This task updates existing detail pages and shared components with dark theme support using Tailwind's `dark:` variant system. Reference TechSpec implementation section for:
- Dark color palette tokens from `@theme` directive (defined in app/globals.css)
- Hybrid approach for applying dark variants (inline `dark:` vs CSS classes)
- Pattern for handling complex states (bookmarked + hover + dark)

Files to create/modify:
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/LayoutWrapper.tsx` - Update background color
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/briefing/[id]/page.tsx` - Apply dark variants to all UI elements
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/article/[id]/page.tsx` - Apply dark variants to all UI elements
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/youtube-transcription/[id]/page.tsx` - Apply dark variants to all UI elements
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/BookmarkButton.tsx` - Update button states and loading spinner
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/YoutubeThumbnail.tsx` - Update placeholder background if needed

Integration points:
- Dark theme colors defined in `app/globals.css` using `@theme` directive
- ThemeContext (from Task 2) provides theme state but detail pages consume theme passively via CSS
- Loading spinners must use theme-appropriate border colors
- Error messages must maintain contrast in dark theme
- Badges and tags (impact rating, categories, feed profile) must use dark-appropriate background/text colors

Testing approach:
- Test each detail page renders correctly in both light and dark themes
- Verify all interactive elements (buttons, links, bookmarks) maintain contrast
- Test loading states (spinners) display correctly in dark theme
- Verify images and thumbnails render properly against dark backgrounds
- Test markdown/HTML content maintains readability with dark prose styling

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/LayoutWrapper.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/briefing/[id]/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/article/[id]/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/youtube-transcription/[id]/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/BookmarkButton.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/YoutubeThumbnail.tsx`

### Dependent Files

- `app/globals.css` - Dark theme color tokens (already defined in Task 1)
- `src/contexts/ThemeContext.tsx` - Theme state management (Task 2)

## Deliverables

- LayoutWrapper component updated with `dark:bg-gray-900` or similar background
- Briefing detail page with dark theme support for all sections (header, metadata, markdown content, navigation)
- Article detail page with dark theme support including image display, content sections, action buttons, related articles
- YouTube transcription detail page with dark theme support including thumbnail, metadata, transcription content
- BookmarkButton component with dark theme variants for all states (default, hover, active, bookmarked, loading, disabled)
- YoutubeThumbnail component verified to work with dark backgrounds
- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression tests for all detail pages in dark theme **(REQUIRED)**

## Tests

- Unit tests for component styling in dark theme:
  - [ ] LayoutWrapper applies dark background class when dark theme active
  - [ ] BookmarkButton renders correct colors for all states in dark theme (not bookmarked, bookmarked, hover, disabled, loading)
  - [ ] Loading spinners use theme-appropriate border colors
  - [ ] Badge components (impact rating, categories, feed profile) render with dark-appropriate colors
- Integration tests for detail pages:
  - [ ] Briefing detail page renders with correct dark theme colors (background, text, borders, badges)
  - [ ] Article detail page maintains contrast for all content sections in dark theme
  - [ ] YouTube transcription detail page displays thumbnail and content correctly against dark background
  - [ ] Navigation links maintain hover states and contrast in dark theme
  - [ ] Error states display with appropriate contrast in dark theme
- Visual regression tests:
  - [ ] Screenshot comparison of each detail page in light vs dark theme
  - [ ] Automated contrast ratio validation using axe-core or pa11y (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- All three detail pages render correctly in dark theme with proper contrast
- LayoutWrapper background changes from gray-50 to gray-900 in dark theme
- BookmarkButton maintains visual clarity in all states across both themes
- No visual regressions in light theme after adding dark theme support
- Contrast ratio validation passes WCAG AA requirements for all text content in dark theme
- Loading states and error messages clearly visible in both themes
- Markdown and HTML content maintains readability with appropriate prose styling in dark theme
