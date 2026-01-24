# Update YouTube transcription detail page with dark theme

## Overview

Apply dark theme support to the YouTube transcription detail page (`app/youtube-transcription/[id]/page.tsx`). This task focuses on updating the transcription detail page with dark mode Tailwind variants to ensure consistent visual experience. The page contains navigation links, video thumbnail, metadata badges, action buttons, transcription content sections, and markdown rendering that must maintain WCAG AA contrast compliance in dark theme.

**Note:** This page is also mentioned in Task 7 (subtask 4.4), but this task provides a dedicated focus on the detail page implementation.

<critical>
- **ALWAYS READ** the technical docs from PRD and TechSpec before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme to navigation links (back link, channel link)
- MUST update transcription header container with dark background, borders, and shadow
- MUST ensure video thumbnail displays correctly with dark background
- MUST update transcription title with dark theme text color
- MUST apply dark theme to metadata badges (channel badge, date displays)
- MUST support dark theme for action buttons (Watch on YouTube, Delete Transcription) and their hover states
- MUST update transcription content sections (Summary, Full Transcription) with dark backgrounds and borders
- MUST ensure markdown content (ReactMarkdown) maintains readability with dark prose styling
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) for all text content
- MUST preserve existing responsive design and mobile-first layout behavior
- MUST update loading state spinner with dark theme border colors
- MUST apply dark theme to error state (error message and back link button)
</requirements>

## Subtasks

- [ ] 12.1 Update navigation section with dark theme variants for back link and channel link
- [ ] 12.2 Apply dark theme to loading state spinner with dark theme border colors
- [ ] 12.3 Update error state with dark theme (error message and back link button)
- [ ] 12.4 Update transcription header container with dark background, borders, and shadow
- [ ] 12.5 Apply dark theme to video thumbnail container background
- [ ] 12.6 Update transcription title with dark theme text color
- [ ] 12.7 Apply dark theme to metadata section (channel badge, date displays, channel ID)
- [ ] 12.8 Update action buttons (Watch on YouTube, Delete Transcription) with dark theme and hover states
- [ ] 12.9 Apply dark theme to transcription content container (background, borders, shadow)
- [ ] 12.10 Update section headings (Summary, Full Transcription) with dark theme text colors
- [ ] 12.11 Apply dark theme to markdown content (ReactMarkdown prose styling)
- [ ] 12.12 Update transcription text content with dark theme text colors

## Implementation Details

This task updates the YouTube transcription detail page with dark theme support using Tailwind's `dark:` variant system. Reference TechSpec implementation section for:
- Dark color palette tokens from `@theme` directive (defined in app/globals.css)
- Hybrid approach for applying dark variants (inline `dark:` vs CSS classes)
- Pattern for handling complex states (hover + dark, active + dark)
- Prose styling for markdown content in dark theme
- Badge color mapping for dark theme (channel badge)

Files to create/modify:
- `app/youtube-transcription/[id]/page.tsx` - Apply dark variants to all UI elements including navigation, header, thumbnail, metadata, action buttons, and content sections

Integration points:
- Dark theme colors defined in `app/globals.css` using `@theme` directive
- ThemeContext (from Task 2) provides theme state but page consumes theme passively via CSS
- YoutubeThumbnail component (updated in Task 7) should work seamlessly within dark-themed container
- ReactMarkdown prose styling must be configured for dark theme
- Loading spinners must use theme-appropriate border colors
- Error messages must maintain contrast in dark theme
- Badge colors must be mapped appropriately for dark theme (e.g., red-100/red-800 → red-900/red-200)

Testing approach:
- Test page renders correctly in both light and dark themes
- Verify all interactive elements (links, buttons) maintain contrast
- Test loading and error states display correctly in dark theme
- Verify video thumbnail renders properly with dark background
- Test metadata badges maintain readability in dark theme
- Verify markdown content maintains readability with dark prose styling
- Test action buttons maintain clear visual feedback in dark theme
- Verify navigation links maintain hover states and contrast in dark theme

### Relevant Files

- `app/youtube-transcription/[id]/page.tsx`

### Dependent Files

- `app/globals.css` - Dark theme color tokens (already defined in Task 1)
- `src/contexts/ThemeContext.tsx` - Theme state management (Task 2)
- `src/components/YoutubeThumbnail.tsx` - Thumbnail component (updated in Task 7)

## Deliverables

- Navigation section updated with dark theme support (back link, channel link)
- Loading state spinner with theme-appropriate border colors
- Error state with dark theme support (error message, back link button)
- Transcription header container with dark background, borders, and shadow
- Video thumbnail container with dark background
- Transcription title with dark theme text color
- Metadata section with dark theme (channel badge, date displays, channel ID)
- Action buttons (Watch on YouTube, Delete Transcription) with dark theme and hover states
- Transcription content container with dark background, borders, and shadow
- Section headings (Summary, Full Transcription) with dark theme text colors
- Markdown content (ReactMarkdown) with dark prose styling
- Transcription text content with dark theme text colors
- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression tests for transcription detail page in dark theme **(REQUIRED)**

## Tests

- Unit tests for component styling in dark theme:
  - [ ] Navigation links apply correct dark theme colors and hover states
  - [ ] Loading spinner uses theme-appropriate border colors
  - [ ] Error state displays with appropriate contrast in dark theme
  - [ ] Transcription header container applies dark background and border colors
  - [ ] Video thumbnail container renders with dark background
  - [ ] Transcription title applies correct dark theme text color
  - [ ] Metadata badges (channel badge) render with dark-appropriate colors
  - [ ] Action buttons maintain contrast and hover states in dark theme
  - [ ] Transcription content container applies dark background and border colors
  - [ ] Section headings render with correct dark theme text colors
  - [ ] Markdown content maintains readability with dark prose styling
- Integration tests for transcription detail page:
  - [ ] Page renders with correct dark theme colors (background, text, borders, containers)
  - [ ] Navigation links maintain hover states and contrast in dark theme
  - [ ] Video thumbnail displays correctly against dark background
  - [ ] Metadata badges maintain readability in dark theme
  - [ ] Action buttons maintain clear visual feedback in dark theme
  - [ ] Transcription content sections maintain contrast for all content in dark theme
  - [ ] Markdown content maintains readability with appropriate prose styling in dark theme
  - [ ] Loading and error states display correctly in dark theme
- Visual regression tests:
  - [ ] Screenshot comparison of transcription detail page in light vs dark theme
  - [ ] Screenshot comparison of transcription header in light vs dark theme
  - [ ] Screenshot comparison of transcription content sections in light vs dark theme
  - [ ] Automated contrast ratio validation using axe-core or pa11y (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Transcription detail page renders correctly in dark theme with proper contrast
- Navigation links maintain clear visual feedback in dark theme
- Video thumbnail displays correctly against dark background
- Metadata badges maintain readability in dark theme
- Action buttons maintain clear visual feedback in dark theme
- Transcription content sections maintain contrast and readability in dark theme
- Markdown content maintains readability with appropriate prose styling in dark theme
- Loading state and error state display correctly in dark theme
- No visual regressions in light theme after adding dark theme support
- Contrast ratio validation passes WCAG AA requirements for all text content in dark theme
- YoutubeThumbnail component integrates seamlessly within dark-themed container
