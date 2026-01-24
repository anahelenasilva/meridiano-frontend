# Update high-traffic pages with dark theme support

## Overview

Apply dark theme support systematically across the four high-traffic pages of the Meridiano application using Tailwind dark mode variants. These pages represent the core user experience: home page with briefings list, articles listing and search, login authentication, and briefing detail view. Each page must receive comprehensive dark theme styling for backgrounds, text, interactive elements, and loading states to ensure consistent dark theme experience.

<critical>
- **ALWAYS READ** the technical docs from the PRD and TechSpec before starting
- **REFERENCE TECHSPEC**: Implementation details for dark theme patterns (color tokens, dark: variants, Tailwind v4 @theme directive) are in TechSpec sections 5-7 - do not duplicate here
- **FOCUS ON "WHAT"**: This task describes what elements need dark theme support on each page, not how to implement the dark theme system
- **MINIMIZE CODE**: Show code only to identify current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST apply dark theme variants to all background colors, text colors, border colors, and interactive elements on each page
- MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text/UI) in dark theme
- MUST update loading states, error states, and empty states with dark theme support
- MUST ensure gradient backgrounds transition appropriately to dark equivalents
- MUST test dark theme appearance on all four pages using ThemeToggle component
- MUST preserve existing responsive design behavior in dark theme
- MUST update cards, modals, filters, and form inputs with dark theme styles
</requirements>

## Subtasks

- [ ] 4.1 Update home page (app/page.tsx) with dark theme variants for briefings list, filter section, loading states, and gradient backgrounds
- [ ] 4.2 Update articles page (app/articles/page.tsx) with dark theme variants for article cards, search filters, modal, pagination, and form inputs
- [ ] 4.3 Update login page (app/login/page.tsx) with dark theme variants for authentication form, error messages, and gradient background
- [ ] 4.4 Update briefing detail page (app/briefing/[id]/page.tsx) with dark theme variants for markdown content, navigation links, and action buttons
- [ ] 4.5 Update article detail page (app/article/[id]/page.tsx) with dark theme variants for article content, related articles section, and metadata display

## Implementation Details

Apply dark theme using Tailwind dark: variants to existing classes. Pages are client components with extensive use of gradients, cards, and interactive elements requiring comprehensive dark mode styling.

### Key Elements Requiring Dark Theme Support

**Home Page (app/page.tsx):**
- Gradient background: from-blue-50 via-white to-indigo-50
- Briefing cards: white backgrounds, gray borders, blue gradients
- Filter section: white card with gray borders, select inputs
- Loading states: blue-50 backgrounds, gray-900 text
- Error states: red-100 backgrounds, red-600 text
- Stats and badges: blue-100, green-400, blue-400 backgrounds

**Articles Page (app/articles/page.tsx):**
- Article grid cards: white backgrounds, gray-200 borders
- Search input: white background, gray-300 border, gray-500 placeholder
- Filter selects: white background, gray-300 border
- Date filter buttons: gray-100 backgrounds, blue-600 active state
- Modal: white background with gray-500 backdrop overlay
- Form inputs: white backgrounds, gray-300 borders
- Impact rating badges: red-100, yellow-100, gray-100 backgrounds
- Category badges: cyan-200 backgrounds
- Pagination buttons: gray-300 borders, gray-50 hover

**Login Page (app/login/page.tsx):**
- Gradient background: from-blue-50 via-white to-indigo-50
- Login form card: white background, gray-200 border
- Input fields: gray-300 borders, gray-900 text
- Error message: red-50 background, red-200 border, red-700 text
- Loading spinner overlay: blue-50 background
- Form labels: gray-700 text

**Briefing Detail Page (app/briefing/[id]/page.tsx):**
- Content cards: white backgrounds, gray-200 borders
- Markdown content: gray-700 text with prose styling
- Metadata: gray-600 text
- Navigation links: gray-600 text, gray-900 hover
- Profile badges: blue-100 background, blue-800 text
- Action buttons: gray-300 borders, gray-50 hover

**Article Detail Page (app/article/[id]/page.tsx):**
- Article header card: white background, gray-200 border
- Content sections: white backgrounds, gray-200 borders
- Metadata badges: blue-100, red-100, yellow-100, cyan-200 backgrounds
- Related articles cards: gray-200 borders
- Navigation links: gray-600 text, gray-900 hover
- Prose content: gray-700 text

### Integration Points

**ThemeContext Consumption:**
Pages will automatically respond to ThemeContext changes via Tailwind dark: class on html element. No direct theme state consumption required in page components.

**Component Dependencies:**
- BookmarkButton component: Requires dark theme update (separate task)
- LayoutWrapper component: Requires dark theme update (separate task)
Reference TechSpec section 8 for component update approach (hybrid dark: variants + CSS classes)

**Testing Strategy:**
Test each page in both light and dark themes using ThemeToggle component. Verify contrast ratios using browser DevTools and Lighthouse accessibility audits.

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/articles/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/login/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/briefing/[id]/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/article/[id]/page.tsx`

### Dependent Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/globals.css` (Tailwind dark color tokens defined here)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/BookmarkButton.tsx` (Component used in article pages)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx` (Theme state management)

## Deliverables

- Home page (app/page.tsx) with comprehensive dark theme support for all UI elements
- Articles page (app/articles/page.tsx) with dark theme for cards, filters, modal, and pagination
- Login page (app/login/page.tsx) with dark theme for authentication form and error states
- Briefing detail page (app/briefing/[id]/page.tsx) with dark theme for markdown content and metadata
- Article detail page (app/article/[id]/page.tsx) with dark theme for article content and related articles
- Unit tests for visual regression on each page with dark theme enabled **(REQUIRED)**
- Integration tests verifying ThemeContext integration with page components **(REQUIRED)**

## Tests

- Visual regression tests for each page:
  - [ ] Home page renders correctly in dark theme with proper contrast ratios
  - [ ] Articles page renders correctly in dark theme including filters, cards, and modal
  - [ ] Login page renders correctly in dark theme with form and error states
  - [ ] Briefing detail page renders correctly in dark theme with markdown content
  - [ ] Article detail page renders correctly in dark theme with related articles section
  - [ ] All interactive elements (buttons, links, inputs) have sufficient contrast in dark theme
  - [ ] Loading states and error states render correctly in dark theme on all pages
  - [ ] Gradient backgrounds transition appropriately to dark equivalents
  - [ ] All badges and status indicators maintain readability in dark theme
- Contrast ratio validation tests:
  - [ ] Normal text meets WCAG AA 4.5:1 contrast ratio in dark theme on all pages
  - [ ] Large text and UI elements meet WCAG AA 3:1 contrast ratio in dark theme
- Integration tests:
  - [ ] Theme toggle switches all pages between light and dark themes
  - [ ] Page-specific elements (cards, modals, filters) respond to theme changes
  - [ ] No flash of incorrect theme on page load or navigation
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- All five pages display correctly in dark theme with no visual artifacts
- Contrast ratio validation passes WCAG AA compliance on all pages (Lighthouse accessibility audit)
- ThemeToggle switches pages between light and dark themes without requiring page refresh
- Dark theme maintains visual hierarchy and content structure consistent with light theme
- No hardcoded colors remain that don't adapt to dark theme
- Responsive design behavior preserved across all breakpoints in dark theme
