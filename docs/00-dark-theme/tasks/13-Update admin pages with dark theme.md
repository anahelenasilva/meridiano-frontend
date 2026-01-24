# Update admin pages with dark theme

## Overview

Apply dark theme support to the admin pages (`app/admin/youtube-channels/page.tsx` and `app/admin/youtube-channels/add/page.tsx`). This task focuses on updating both the YouTube channels admin listing page and the add channel form page with dark mode Tailwind variants to ensure consistent visual experience. These pages contain channel management cards, toggle switches, form inputs, validation messages, and various interactive elements that must maintain WCAG AA contrast compliance in dark theme.

<critical>
- **ALWAYS READ** the technical docs from PRD and TechSpec before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme to admin listing page header, empty state, loading state, and error state
- MUST update channel cards with dark backgrounds, borders, and hover shadow states
- MUST ensure toggle switches display correctly with dark theme (enabled/disabled states, loading spinner)
- MUST support dark theme for external links and action buttons
- MUST update section headers (Enabled Channels, Disabled Channels) with dark theme variants
- MUST apply dark theme to channel badges (count badges) with appropriate colors
- MUST update add channel form page header and navigation link with dark theme
- MUST support dark theme for all form inputs (text inputs, textarea, number input, checkbox)
- MUST ensure form labels, helper text, and validation error messages maintain readability in dark theme
- MUST update form action buttons (Cancel, Add Channel) with dark theme and loading states
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) for all text content
- MUST preserve existing responsive design and mobile-first layout behavior
- MUST update loading spinners with theme-appropriate border colors
- MUST ensure code blocks (channel ID display) maintain readability in dark theme
</requirements>

## Subtasks

### Admin Listing Page (app/admin/youtube-channels/page.tsx)
- [ ] 13.1 Update page header with dark theme variants for title, icon, and "Add Channel" button
- [ ] 13.2 Apply dark theme to description text
- [ ] 13.3 Update loading state spinner with dark theme border colors
- [ ] 13.4 Apply dark theme to error state (error message and retry button)
- [ ] 13.5 Update empty state with dark theme text colors
- [ ] 13.6 Apply dark theme to section headers (Enabled Channels, Disabled Channels) with dark theme text colors
- [ ] 13.7 Update channel count badges with dark-appropriate colors (green for enabled, gray for disabled)
- [ ] 13.8 Apply dark theme to channel cards (background, borders, hover shadow, disabled opacity)
- [ ] 13.9 Update channel card content (title, description, metadata) with dark theme text colors
- [ ] 13.10 Apply dark theme to code blocks (channel ID display) with dark background and text colors
- [ ] 13.11 Update external link (View Channel) with dark theme and hover states
- [ ] 13.12 Apply dark theme to toggle switches (enabled/disabled states, loading spinner)

### Add Channel Form Page (app/admin/youtube-channels/add/page.tsx)
- [ ] 13.13 Update page header with dark theme variants for back link, title, icon, and description
- [ ] 13.14 Apply dark theme to form container (background, borders, shadow)
- [ ] 13.15 Update form labels with dark theme text colors
- [ ] 13.16 Apply dark theme to form inputs (text inputs, textarea, number input) with dark borders and backgrounds
- [ ] 13.17 Update form input focus states with dark theme ring colors
- [ ] 13.18 Apply dark theme to validation error messages with appropriate contrast
- [ ] 13.19 Update checkbox input with dark theme styling
- [ ] 13.20 Apply dark theme to helper text (Max Videos description)
- [ ] 13.21 Update form action buttons (Cancel, Add Channel) with dark theme and loading states
- [ ] 13.22 Apply dark theme to form section divider (border)

## Implementation Details

This task updates both admin pages with dark theme support using Tailwind's `dark:` variant system. Reference TechSpec implementation section for:
- Dark color palette tokens from `@theme` directive (defined in app/globals.css)
- Hybrid approach for applying dark variants (inline `dark:` vs CSS classes)
- Pattern for handling complex states (hover + dark, active + dark, disabled + dark)
- Form input styling patterns for dark theme
- Toggle switch styling for dark theme
- Code block styling for dark theme

Files to create/modify:
- `app/admin/youtube-channels/page.tsx` - Apply dark variants to all UI elements including header, empty state, loading state, error state, section headers, channel cards, and toggle switches
- `app/admin/youtube-channels/add/page.tsx` - Apply dark variants to all UI elements including header, form container, inputs, labels, validation messages, and buttons

Integration points:
- Dark theme colors defined in `app/globals.css` using `@theme` directive
- ThemeContext (from Task 2) provides theme state but pages consume theme passively via CSS
- Form inputs must have clear focus states in dark theme
- Toggle switches must maintain visual clarity in both enabled and disabled states in dark theme
- Loading spinners must use theme-appropriate border colors
- Error messages must maintain contrast in dark theme
- Code blocks must maintain readability in dark theme
- Validation error messages must be clearly visible in dark theme

Testing approach:
- Test both pages render correctly in both light and dark themes
- Verify all interactive elements (buttons, links, toggle switches, form inputs) maintain contrast
- Test loading and error states display correctly in dark theme
- Verify channel cards render properly with dark backgrounds
- Test toggle switches provide clear visual feedback in dark theme
- Verify form inputs are clearly visible and usable in dark theme
- Test validation error messages maintain appropriate contrast in dark theme
- Verify code blocks maintain readability in dark theme

### Relevant Files

- `app/admin/youtube-channels/page.tsx`
- `app/admin/youtube-channels/add/page.tsx`

### Dependent Files

- `app/globals.css` - Dark theme color tokens (already defined in Task 1)
- `src/contexts/ThemeContext.tsx` - Theme state management (Task 2)

## Deliverables

### Admin Listing Page
- Page header updated with dark theme support (title, icon, Add Channel button)
- Description text with dark theme colors
- Loading state spinner with theme-appropriate border colors
- Error state with dark theme support (error message, retry button)
- Empty state with dark theme text colors
- Section headers (Enabled Channels, Disabled Channels) with dark theme text colors
- Channel count badges with dark-appropriate colors
- Channel cards with dark background, borders, hover shadow, and disabled opacity
- Channel card content (title, description, metadata) with dark theme text colors
- Code blocks (channel ID display) with dark background and text colors
- External link (View Channel) with dark theme and hover states
- Toggle switches with dark theme (enabled/disabled states, loading spinner)

### Add Channel Form Page
- Page header updated with dark theme support (back link, title, icon, description)
- Form container with dark background, borders, and shadow
- Form labels with dark theme text colors
- Form inputs (text inputs, textarea, number input) with dark borders and backgrounds
- Form input focus states with dark theme ring colors
- Validation error messages with appropriate contrast in dark theme
- Checkbox input with dark theme styling
- Helper text with dark theme colors
- Form action buttons (Cancel, Add Channel) with dark theme and loading states
- Form section divider with dark theme border

- Unit tests with 80%+ coverage **(REQUIRED)**
- Visual regression tests for both admin pages in dark theme **(REQUIRED)**

## Tests

- Unit tests for component styling in dark theme:
  - [ ] Admin listing page header applies correct dark theme colors
  - [ ] Loading spinner uses theme-appropriate border colors
  - [ ] Error state displays with appropriate contrast in dark theme
  - [ ] Section headers render with correct dark theme text colors
  - [ ] Channel count badges render with dark-appropriate colors
  - [ ] Channel cards apply dark background and border colors
  - [ ] Code blocks render with dark background and text colors
  - [ ] Toggle switches maintain visual clarity in dark theme
  - [ ] External links maintain contrast and hover states in dark theme
  - [ ] Add channel form container applies dark background and border colors
  - [ ] Form inputs display correctly with dark theme styling
  - [ ] Form labels and helper text render with dark-appropriate colors
  - [ ] Validation error messages maintain appropriate contrast in dark theme
  - [ ] Form buttons maintain contrast and loading states in dark theme
- Integration tests for admin pages:
  - [ ] Admin listing page renders with correct dark theme colors (background, text, borders, cards)
  - [ ] Channel cards maintain visual hierarchy in dark theme
  - [ ] Toggle switches provide clear visual feedback in dark theme
  - [ ] All interactive elements (buttons, links, toggle switches) maintain hover states and contrast in dark theme
  - [ ] Empty state, loading, and error states display correctly in dark theme
  - [ ] Add channel form page renders with correct dark theme colors
  - [ ] Form inputs are clearly visible and usable in dark theme
  - [ ] Validation error messages are clearly visible in dark theme
  - [ ] Form buttons maintain clear visual feedback in dark theme
- Visual regression tests:
  - [ ] Screenshot comparison of admin listing page in light vs dark theme
  - [ ] Screenshot comparison of channel cards in light vs dark theme
  - [ ] Screenshot comparison of toggle switches in light vs dark theme
  - [ ] Screenshot comparison of add channel form page in light vs dark theme
  - [ ] Screenshot comparison of form inputs in light vs dark theme
  - [ ] Automated contrast ratio validation using axe-core or pa11y (WCAG AA: 4.5:1 for normal text, 3:1 for large text/UI)
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Admin listing page renders correctly in dark theme with proper contrast
- Channel cards display with dark backgrounds and maintain visual hierarchy
- Toggle switches provide clear visual feedback in dark theme
- All action buttons and links maintain clear visual feedback in dark theme
- Add channel form page displays correctly with dark backgrounds and maintains proper contrast
- Form inputs are clearly visible and usable in dark theme
- Validation error messages maintain appropriate contrast in dark theme
- Code blocks maintain readability in dark theme
- Empty state, loading state, and error state display correctly in dark theme
- No visual regressions in light theme after adding dark theme support
- Contrast ratio validation passes WCAG AA requirements for all text content in dark theme
- Form focus states are clearly visible in dark theme
