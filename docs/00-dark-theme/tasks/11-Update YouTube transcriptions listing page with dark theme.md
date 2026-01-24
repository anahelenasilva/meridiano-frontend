# Update YouTube transcriptions listing page with dark theme

## Overview

Apply dark theme support to the YouTube transcriptions listing page (`app/youtube-transcriptions/page.tsx`). This task focuses on updating the transcriptions listing page with dark mode Tailwind variants to ensure consistent visual experience. The page contains channel-grouped transcription cards, a modal for adding videos, collapsible channel sections, and various interactive elements that must maintain WCAG AA contrast compliance in dark theme.

<critical>
- **ALWAYS READ** the technical docs from PRD and TechSpec before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme to page header, empty state, loading state, and error state
- MUST update channel grouping containers with dark backgrounds, borders, and hover states
- MUST ensure collapsible channel headers work correctly with dark theme (chevron icons, hover states)
- MUST update transcription cards with dark backgrounds, borders, and hover shadow states
- MUST ensure all badges and metadata displays maintain readability in dark theme
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) for all text content
- MUST preserve existing responsive design and mobile-first layout behavior
- MUST ensure YoutubeThumbnail components display correctly with dark card backgrounds
- MUST support dark theme for action buttons (View Details, Watch Video, Delete) and their hover states
- MUST update "Add Video" modal with dark theme variants (background, inputs, buttons, close button)
- MUST ensure form inputs (text inputs, select dropdowns) display correctly in dark theme
- MUST update loading spinners with theme-appropriate border colors
</requirements>

## Subtasks

- [ ] 11.1 Update page header with dark theme variants for title and "Add Video" button
- [ ] 11.2 Apply dark theme to empty state component (text colors)
- [ ] 11.3 Update loading state spinner with dark theme border colors
- [ ] 11.4 Apply dark theme to error state (error message and retry button)
- [ ] 11.5 Update channel grouping containers with dark background, borders, and hover states
- [ ] 11.6 Apply dark theme to collapsible channel headers (background, text, chevron icons, hover states)
- [ ] 11.7 Update channel badge (video count) with dark-appropriate colors
- [ ] 11.8 Apply dark theme to transcription cards (background, borders, hover shadow)
- [ ] 11.9 Update transcription card content (title links, metadata text, summary preview) with dark theme text colors
- [ ] 11.10 Apply dark theme to action buttons (View Details, Watch Video, Delete) and their hover states
- [ ] 11.11 Update "Add Video" modal overlay and container with dark theme backgrounds
- [ ] 11.12 Apply dark theme to modal header (title, close button)
- [ ] 11.13 Update modal form inputs (text input, select dropdown) with dark theme variants
- [ ] 11.14 Apply dark theme to modal form labels and helper text
- [ ] 11.15 Update modal action buttons (Close, Add Video) with dark theme and loading states

## Implementation Details

This task updates the YouTube transcriptions listing page with dark theme support using Tailwind's `dark:` variant system. Reference TechSpec implementation section for:
- Dark color palette tokens from `@theme` directive (defined in app/globals.css)
- Hybrid approach for applying dark variants (inline `dark:` vs CSS classes)
- Pattern for handling complex states (hover + dark, active + dark, expanded + dark)
- Modal overlay and backdrop styling for dark theme
- Form input styling patterns for dark theme

Files to create/modify:
- `app/youtube-transcriptions/page.tsx` - Apply dark variants to all UI elements including header, empty state, loading state, error state, channel groupings, transcription cards, and modal

Integration points:
- Dark theme colors defined in `app/globals.css` using `@theme` directive
- ThemeContext (from Task 2) provides theme state but page consumes theme passively via CSS
- YoutubeThumbnail component (updated in Task 7) should work seamlessly within dark-themed cards
- Modal overlay must maintain proper backdrop visibility in dark theme
- Form inputs must have clear focus states in dark theme
- Loading spinners must use theme-appropriate border colors
- Error messages must maintain contrast in dark theme
- Collapsible sections must maintain visual feedback in dark theme

Testing approach:
- Test page renders correctly in both light and dark themes
- Verify all interactive elements (buttons, links, collapsible headers) maintain contrast
- Test loading and error states display correctly in dark theme
- Verify transcription cards render properly with dark backgrounds
- Test channel grouping containers maintain visual hierarchy in dark theme
- Verify collapsible channel headers provide clear visual feedback in dark theme
- Test modal displays correctly with dark backgrounds and maintains proper contrast
- Verify form inputs are clearly visible and usable in dark theme
- Test YoutubeThumbnail components display correctly against dark card backgrounds

### Relevant Files

- `app/youtube-transcriptions/page.tsx`

### Dependent Files

- `app/globals.css` - Dark theme color tokens (already defined in Task 1)
- `src/contexts/ThemeContext.tsx` - Theme state management (Task 2)
- `src/components/YoutubeThumbnail.tsx` - Thumbnail component (updated in Task 7)

## Deliverables

- Page header updated with dark theme support (title, Add Video button)
- Empty state component with dark theme text colors
- Loading state spinner with theme-appropriate border colors
- Error state with dark theme support (error message, retry button)
- Channel grouping containers with dark background, borders, and hover states
- Collapsible channel headers with dark theme (background, text, icons, hover states)
- Channel badges with dark-appropriate colors
- Transcription cards with dark background, borders, and hover shadow states
- Transcription card content (title links, metadata, summary) with dark theme text colors
- Action buttons (View Details, Watch Video, Delete) with dark theme and hover states
- "Add Video" modal with dark theme overlay, container, header, inputs, labels, and buttons
- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression tests for transcriptions listing page in dark theme **(REQUIRED)**

## Tests

- Unit tests for component styling in dark theme:
  - [ ] Page header applies correct dark theme colors for title and button
  - [ ] Empty state component renders with dark-appropriate text colors
  - [ ] Loading spinner uses theme-appropriate border colors
  - [ ] Error state displays with appropriate contrast in dark theme
  - [ ] Channel grouping containers apply dark background and border colors
  - [ ] Collapsible channel headers render with correct dark theme colors and hover states
  - [ ] Channel badges render with dark-appropriate colors
  - [ ] Transcription cards apply dark background and border colors
  - [ ] Action buttons maintain contrast and hover states in dark theme
  - [ ] Modal overlay and container render with correct dark theme backgrounds
  - [ ] Modal form inputs display correctly with dark theme styling
  - [ ] Modal buttons maintain contrast and loading states in dark theme
- Integration tests for transcriptions listing page:
  - [ ] Page renders with correct dark theme colors (background, text, borders, cards)
  - [ ] Channel groupings maintain visual hierarchy in dark theme
  - [ ] Collapsible channel headers provide clear visual feedback in dark theme
  - [ ] Transcription cards maintain contrast for all content sections in dark theme
  - [ ] All interactive elements (buttons, links, collapsible headers) maintain hover states and contrast in dark theme
  - [ ] Empty state, loading, and error states display correctly in dark theme
  - [ ] Modal displays correctly with dark backgrounds and maintains proper contrast
  - [ ] Form inputs are clearly visible and usable in dark theme
  - [ ] YoutubeThumbnail components render properly against dark card backgrounds
- Visual regression tests:
  - [ ] Screenshot comparison of transcriptions listing page in light vs dark theme
  - [ ] Screenshot comparison of channel groupings in light vs dark theme
  - [ ] Screenshot comparison of transcription cards in light vs dark theme
  - [ ] Screenshot comparison of "Add Video" modal in light vs dark theme
  - [ ] Automated contrast ratio validation using axe-core or pa11y (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Transcriptions listing page renders correctly in dark theme with proper contrast
- Channel groupings display with dark backgrounds and maintain visual hierarchy
- Collapsible channel headers provide clear visual feedback in dark theme
- Transcription cards display with dark backgrounds and maintain visual clarity
- All action buttons maintain clear visual feedback in dark theme
- "Add Video" modal displays correctly with dark backgrounds and maintains proper contrast
- Form inputs are clearly visible and usable in dark theme
- Empty state, loading state, and error state display correctly in dark theme
- No visual regressions in light theme after adding dark theme support
- Contrast ratio validation passes WCAG AA requirements for all text content in dark theme
- YoutubeThumbnail components display correctly against dark card backgrounds
- Modal overlay maintains proper backdrop visibility in dark theme
