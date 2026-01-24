# Update authentication and form pages with dark theme

## Overview

Apply dark theme styling to authentication and form pages including login page and admin YouTube channel management forms. These pages require comprehensive dark mode updates for backgrounds, input fields, labels, buttons, error states, and loading indicators to ensure WCAG AA contrast compliance and consistent user experience across all form interactions.

<critical>
- **ALWAYS READ** the technical docs from this PRD before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme styles to login page background, form container, and all form elements
- MUST ensure form input fields have proper dark mode styling with appropriate borders and focus states
- MUST update error message styling to maintain visibility and contrast in dark theme
- MUST apply dark theme to admin YouTube channel management pages including list view and add channel form
- MUST maintain WCAG AA contrast ratios for all text, labels, and interactive elements (4.5:1 for normal text, 3:1 for large text/UI)
- MUST ensure loading states and disabled states are clearly visible in dark theme
- MUST apply dark variants to buttons, links, and toggle switches
</requirements>

## Subtasks

- [ ] 4.1 Update login page styling with dark theme variants for background gradients, form container, inputs, labels, and buttons
- [ ] 4.2 Apply dark theme to error and loading states on login page
- [ ] 4.3 Update admin YouTube channels list page with dark theme for card backgrounds, text colors, and toggle switches
- [ ] 4.4 Update add YouTube channel form page with dark theme for all form fields, labels, error states, and validation messages
- [ ] 4.5 Test all form interactions in dark theme including focus states, hover states, and disabled states

## Implementation Details

Reference TechSpec for Tailwind v4 dark mode implementation using `dark:` variants. Focus on these structural updates:

**Login Page (app/login/page.tsx):**
- Background gradient from light blues to dark grays
- Form container card background and borders
- Input fields with dark backgrounds and light text
- Error messages with appropriate dark theme colors
- Loading spinner visibility in dark backgrounds
- Button styles maintaining contrast and visibility

**Admin Pages:**
- YouTube channels list (app/admin/youtube-channels/page.tsx) - card backgrounds, section headers, toggle switches, external links
- Add channel form (app/admin/youtube-channels/add/page.tsx) - all input fields, textarea, checkbox, error states, submit buttons

**Common Patterns:**
- Input fields: dark background with light text and visible borders
- Labels: light gray text for readability
- Error messages: maintain red color scheme with adjusted brightness
- Focus states: visible focus rings with sufficient contrast
- Disabled states: reduced opacity maintaining visibility
- Loading indicators: white or light colored spinners on dark backgrounds

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/login/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/admin/youtube-channels/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/admin/youtube-channels/add/page.tsx`

### Dependent Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/globals.css` (Tailwind dark color tokens)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx` (Theme state management)

## Deliverables

- Login page with complete dark theme styling for all states (default, focus, error, loading, disabled)
- Admin YouTube channels list page with dark theme applied to cards, headers, and interactive elements
- Add YouTube channel form with dark theme for all form fields and validation states
- All form elements maintain WCAG AA contrast ratios in dark theme
- Focus indicators visible and accessible in both themes
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for form interactions in dark theme **(REQUIRED)**

## Tests

- Unit tests for this feature:
  - [ ] Login form rendering in dark theme with correct styles applied
  - [ ] Error message visibility and contrast in dark theme
  - [ ] Input field focus states in dark theme
  - [ ] Loading state spinner visibility in dark backgrounds
  - [ ] Admin list page card styling in dark theme
  - [ ] Toggle switch visibility and interaction in dark theme
  - [ ] Add channel form field styling and error states in dark theme
  - [ ] Form validation message visibility in dark theme
  - [ ] Disabled button states maintain visibility in dark theme
  - [ ] All interactive elements maintain proper contrast ratios
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Login page displays correctly in dark theme with all states functional
- Admin YouTube channel pages render properly in dark theme
- All form inputs are clearly visible and usable in dark theme
- Error messages maintain visibility and proper contrast
- Focus indicators are visible in dark theme for keyboard navigation
- WCAG AA contrast validation passes for all text and interactive elements
- Manual testing confirms all form interactions work correctly in dark theme
