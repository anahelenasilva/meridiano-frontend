# Update bookmarks page with dark theme

## Overview

Apply dark theme support to the bookmarks page (`app/bookmarks/page.tsx`). This task focuses on updating the bookmarks listing page with dark mode Tailwind variants to ensure consistent visual experience. The bookmarks page contains a grid of bookmark cards with images, metadata, badges, action buttons, and pagination controls that must maintain WCAG AA contrast compliance in dark theme.

<critical>
- **ALWAYS READ** the technical docs from PRD and TechSpec before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme to bookmarks page header, empty state, loading state, and error state
- MUST update bookmark card backgrounds, borders, and hover states for dark theme
- MUST ensure all badges (feed profile, impact rating, categories) display correctly with dark-appropriate colors
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) for all text content
- MUST preserve existing responsive design and mobile-first layout behavior
- MUST ensure images display correctly with dark card backgrounds
- MUST support dark theme for action buttons (Read, Original link) and their hover states
- MUST update pagination controls with dark theme variants
- MUST ensure BookmarkButton component (already updated in Task 7) works correctly within dark-themed cards
- MUST maintain visual hierarchy and readability for bookmark metadata and content previews
</requirements>

## Subtasks

- [ ] 10.1 Update bookmarks page header with dark theme variants for title, icon, and count text
- [ ] 10.2 Apply dark theme to empty state component (background, icon, text, and call-to-action button)
- [ ] 10.3 Update loading state spinner with dark theme border colors
- [ ] 10.4 Apply dark theme to error state (error message and retry button)
- [ ] 10.5 Update bookmark card container with dark background, borders, and hover shadow states
- [ ] 10.6 Apply dark theme to bookmark card content (title links, metadata text, content preview)
- [ ] 10.7 Update badge components (feed profile, impact rating, categories) with dark-appropriate background and text colors
- [ ] 10.8 Apply dark theme to action buttons (Read button, Original link button) and their hover states
- [ ] 10.9 Update bookmark timestamp section with dark theme border and text colors
- [ ] 10.10 Apply dark theme to pagination controls (Previous/Next buttons, page indicator)

## Implementation Details

This task updates the bookmarks page with dark theme support using Tailwind's `dark:` variant system. Reference TechSpec implementation section for:
- Dark color palette tokens from `@theme` directive (defined in app/globals.css)
- Hybrid approach for applying dark variants (inline `dark:` vs CSS classes)
- Pattern for handling complex states (hover + dark, active + dark)
- Badge color mapping for dark theme (feed profile, impact rating, categories)

Files to create/modify:
- `app/bookmarks/page.tsx` - Apply dark variants to all UI elements including header, empty state, loading state, error state, bookmark cards, badges, action buttons, and pagination

Integration points:
- Dark theme colors defined in `app/globals.css` using `@theme` directive
- ThemeContext (from Task 2) provides theme state but bookmarks page consumes theme passively via CSS
- BookmarkButton component (updated in Task 7) should work seamlessly within dark-themed cards
- Badge colors must be mapped appropriately for dark theme (e.g., blue-100/blue-800 → blue-900/blue-200)
- Loading spinners must use theme-appropriate border colors
- Error messages must maintain contrast in dark theme
- Pagination buttons must have clear hover states in dark theme

Testing approach:
- Test bookmarks page renders correctly in both light and dark themes
- Verify all interactive elements (links, buttons, pagination) maintain contrast
- Test loading and error states display correctly in dark theme
- Verify bookmark cards render properly with dark backgrounds
- Test badges (feed profile, impact rating, categories) maintain readability in dark theme
- Verify images display correctly against dark card backgrounds
- Test pagination controls maintain clear visual feedback in dark theme
- Verify empty state call-to-action button works correctly in dark theme

### Relevant Files

- `app/bookmarks/page.tsx`

### Dependent Files

- `app/globals.css` - Dark theme color tokens (already defined in Task 1)
- `src/contexts/ThemeContext.tsx` - Theme state management (Task 2)
- `src/components/BookmarkButton.tsx` - Bookmark button component (updated in Task 7)

## Deliverables

- Bookmarks page header updated with dark theme support (title, icon, count text)
- Empty state component with dark theme variants (background, icon, text, button)
- Loading state spinner with theme-appropriate border colors
- Error state with dark theme support (error message, retry button)
- Bookmark cards with dark background, borders, and hover states
- Bookmark card content (title links, metadata, content preview) with dark theme text colors
- Badge components (feed profile, impact rating, categories) with dark-appropriate colors
- Action buttons (Read, Original link) with dark theme and hover states
- Bookmark timestamp section with dark theme border and text colors
- Pagination controls with dark theme variants
- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression tests for bookmarks page in dark theme **(REQUIRED)**

## Tests

- Unit tests for component styling in dark theme:
  - [ ] Bookmarks page header applies correct dark theme colors for title, icon, and count
  - [ ] Empty state component renders with dark background and appropriate text/button colors
  - [ ] Loading spinner uses theme-appropriate border colors
  - [ ] Error state displays with appropriate contrast in dark theme
  - [ ] Bookmark cards apply dark background and border colors
  - [ ] Badge components (feed profile, impact rating, categories) render with dark-appropriate colors
  - [ ] Action buttons (Read, Original link) maintain contrast and hover states in dark theme
  - [ ] Pagination controls render with correct dark theme colors and hover states
- Integration tests for bookmarks page:
  - [ ] Bookmarks page renders with correct dark theme colors (background, text, borders, cards)
  - [ ] Bookmark cards maintain contrast for all content sections in dark theme
  - [ ] All interactive elements (links, buttons, pagination) maintain hover states and contrast in dark theme
  - [ ] Empty state displays correctly in dark theme
  - [ ] Loading and error states display with appropriate contrast in dark theme
  - [ ] Images render properly against dark card backgrounds
  - [ ] BookmarkButton component works correctly within dark-themed cards
- Visual regression tests:
  - [ ] Screenshot comparison of bookmarks page in light vs dark theme
  - [ ] Screenshot comparison of empty state in light vs dark theme
  - [ ] Screenshot comparison of bookmark cards in light vs dark theme
  - [ ] Automated contrast ratio validation using axe-core or pa11y (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Bookmarks page renders correctly in dark theme with proper contrast
- Bookmark cards display with dark backgrounds and maintain visual hierarchy
- All badges (feed profile, impact rating, categories) maintain readability in dark theme
- Action buttons maintain clear visual feedback in dark theme
- Pagination controls are clearly visible and interactive in dark theme
- Empty state, loading state, and error state display correctly in dark theme
- No visual regressions in light theme after adding dark theme support
- Contrast ratio validation passes WCAG AA requirements for all text content in dark theme
- Images display correctly against dark card backgrounds
- BookmarkButton component integrates seamlessly within dark-themed cards
