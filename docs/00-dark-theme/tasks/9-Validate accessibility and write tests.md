# Validate accessibility and write tests

## Overview

Validate WCAG AA accessibility compliance for the dark theme implementation and write comprehensive test coverage for ThemeContext, ThemeToggle component, and the complete theme application flow. This task ensures the dark theme meets accessibility standards with proper contrast ratios, keyboard navigation, screen reader support, and provides confidence through thorough automated testing.

<critical>
- **ALWAYS READ** the technical docs from this PRD before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST validate WCAG AA contrast ratios for all text and UI elements in dark theme
- MUST achieve minimum 4.5:1 contrast ratio for normal text (14-18px)
- MUST achieve minimum 3:1 contrast ratio for large text and UI components
- MUST validate keyboard navigation for ThemeToggle component (Tab, Enter, Space)
- MUST validate screen reader compatibility with proper ARIA labels
- MUST achieve 80%+ test coverage for ThemeContext and ThemeToggle
- MUST write unit tests for all theme state management logic
- MUST write integration tests for complete theme application flow
- MUST validate focus indicators are visible in both light and dark themes
- MUST test localStorage persistence and fallback mechanisms
- MUST test media query listener lifecycle and cleanup
- MUST validate theme toggle functionality across all pages
</requirements>

## Subtasks

- [ ] 9.1 Set up testing infrastructure and install required dependencies
- [ ] 9.2 Validate contrast ratios for all text and UI elements using automated tools
- [ ] 9.3 Write unit tests for ThemeContext state management
- [ ] 9.4 Write unit tests for ThemeToggle component interactions
- [ ] 9.5 Write integration tests for theme application flow
- [ ] 9.6 Validate keyboard navigation and screen reader compatibility
- [ ] 9.7 Create visual regression test suite for light and dark themes

## Implementation Details

This task validates accessibility compliance and provides comprehensive test coverage for the dark theme implementation. Reference TechSpec Testing Approach section for technical guidance on test structure, mocking strategies, and coverage requirements.

### Testing Infrastructure

The project currently lacks a testing framework. Set up Jest or Vitest with React Testing Library for component testing. Install required dependencies for accessibility validation.

Required testing dependencies:
- Jest or Vitest (test runner)
- @testing-library/react and @testing-library/jest-dom (React component testing)
- @testing-library/user-event (user interaction simulation)
- @axe-core/react or jest-axe (accessibility validation)

### Accessibility Validation Focus Areas

Validate the following elements meet WCAG AA standards:
- Dark theme background colors (should be ~#121212 per Material Design)
- Body text on dark background (minimum 4.5:1 contrast)
- Navigation links and buttons in both themes
- Form inputs and labels
- Focus indicators (3px solid ring)
- ThemeToggle button states
- Error messages and toast notifications
- All interactive elements

### Test Files to Create

Unit tests:
- `src/contexts/ThemeContext.test.tsx` - Theme state management, localStorage, media query listener
- `src/components/ThemeToggle.test.tsx` - Component rendering, click handlers, keyboard accessibility

Integration tests:
- `__tests__/integration/theme-flow.test.tsx` - Complete theme application flow, first visit behavior, manual toggle persistence

### Testing Scope

ThemeContext unit tests must cover:
- Initial state defaults to 'system' mode
- toggleTheme cycles through light → dark → system → light
- localStorage persistence on theme change
- localStorage read on provider mount
- Media query listener registration and cleanup
- Resolved theme calculation for each mode
- Fallback behavior when localStorage unavailable

ThemeToggle component tests must cover:
- Icon changes based on current theme mode (sun/moon icons)
- Click handler calls toggleTheme from context
- Keyboard accessibility (Enter and Space keys trigger toggle)
- ARIA labels present for screen readers
- Visual feedback on hover and focus states

Integration tests must cover:
- First visit without localStorage defaults to system preference
- Manual toggle persists to localStorage
- localStorage preference overrides system preference on next visit
- System preference change listener updates resolved theme in 'system' mode
- Dark class application to html element
- ToastContainer theme updates with theme context
- Theme persistence across page navigation

### Relevant Files

Files that will be tested:
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/ThemeToggle.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/layout.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/globals.css`

Files to reference for accessibility validation:
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/Navbar.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/page.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/login/page.tsx`

### Dependent Files

Existing context for testing patterns:
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/AuthContext.tsx` - Reference for context testing patterns

## Deliverables

- Testing infrastructure configured (Jest or Vitest with React Testing Library)
- Accessibility validation dependencies installed (@axe-core/react or jest-axe)
- Unit tests for ThemeContext with 80%+ coverage **(REQUIRED)**
- Unit tests for ThemeToggle component with 80%+ coverage **(REQUIRED)**
- Integration tests for complete theme flow **(REQUIRED)**
- Accessibility validation report documenting WCAG AA compliance
- Visual regression test suite for light and dark themes
- Test configuration file (jest.config.js or vitest.config.ts)
- CI/CD integration for automated test execution

## Tests

- Unit tests for ThemeContext:
  - [ ] Initial state defaults to 'system' mode
  - [ ] toggleTheme cycles through light → dark → system → light
  - [ ] localStorage writes on theme change
  - [ ] localStorage reads on mount
  - [ ] Media query listener registers on mount
  - [ ] Media query listener cleans up on unmount
  - [ ] Resolved theme calculation for light mode
  - [ ] Resolved theme calculation for dark mode
  - [ ] Resolved theme calculation for system mode (both preferences)
  - [ ] Fallback to system preference when localStorage unavailable
  - [ ] Dark class applied to html element when dark theme active
  - [ ] Dark class removed when light theme active

- Unit tests for ThemeToggle component:
  - [ ] Renders sun icon for light mode
  - [ ] Renders moon icon for dark mode
  - [ ] Renders system icon for system mode
  - [ ] Click handler calls toggleTheme
  - [ ] Enter key triggers toggle
  - [ ] Space key triggers toggle
  - [ ] ARIA label present and descriptive
  - [ ] Focus visible indicator present
  - [ ] Hover state provides visual feedback

- Integration tests for theme flow:
  - [ ] First visit without localStorage uses system preference
  - [ ] Manual toggle persists to localStorage
  - [ ] Stored preference overrides system on subsequent visit
  - [ ] System preference change updates resolved theme in system mode
  - [ ] Theme persists across page navigation
  - [ ] ToastContainer theme updates with context
  - [ ] Multiple page loads maintain theme consistency

- Accessibility validation tests:
  - [ ] Contrast ratio ≥4.5:1 for normal text in dark theme
  - [ ] Contrast ratio ≥3:1 for large text and UI in dark theme
  - [ ] Focus indicators visible in both themes
  - [ ] ThemeToggle keyboard accessible
  - [ ] ThemeToggle screen reader compatible
  - [ ] No accessibility violations detected by axe-core
  - [ ] All interactive elements meet contrast requirements

- Test coverage target: ≥80%
- All tests must pass before deployment

## Success Criteria

- All tests passing with ≥80% coverage for ThemeContext and ThemeToggle
- WCAG AA contrast ratio validation passes for all text and UI elements
- Contrast ratio ≥4.5:1 for normal text on dark backgrounds
- Contrast ratio ≥3:1 for large text and UI components
- ThemeToggle component fully keyboard accessible (Tab, Enter, Space)
- ThemeToggle has proper ARIA labels for screen readers
- Focus indicators visible in both light and dark themes (3px solid ring)
- No axe-core accessibility violations detected
- localStorage persistence working correctly with fallback
- Media query listener lifecycle properly managed (no memory leaks)
- Integration tests validate complete theme flow end-to-end
- CI/CD pipeline includes automated test execution
- Documentation includes accessibility validation report
