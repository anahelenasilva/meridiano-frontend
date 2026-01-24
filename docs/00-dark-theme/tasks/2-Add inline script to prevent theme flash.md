# Add inline script to prevent theme flash

## Overview

Add an inline script to the document head in app/layout.tsx that executes synchronously before React hydration to prevent flash of incorrect theme on page load. The script reads theme preference from localStorage, detects system preference using prefers-color-scheme media query, and applies the .dark class to the html element before any content renders. This is critical for providing a seamless user experience in the server-side rendered Next.js application.

<critical>
- **ALWAYS READ** the technical docs from this PRD before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST execute inline script synchronously in document head before React hydration
- MUST read theme preference from localStorage key 'theme-preference'
- MUST detect system preference using window.matchMedia for prefers-color-scheme
- MUST apply .dark class to html element when dark theme should be active
- MUST handle three theme modes: 'light', 'dark', and 'system'
- MUST resolve 'system' mode to actual theme based on browser media query
- MUST execute in under 5ms to prevent noticeable delay
- MUST use dangerouslySetInnerHTML in Next.js layout for inline script injection
- MUST handle edge cases: localStorage unavailable, media query unsupported
- MUST place script as first child of head element for earliest execution
</requirements>

## Subtasks

- [ ] 5.1 Add inline script to app/layout.tsx head section using dangerouslySetInnerHTML
- [ ] 5.2 Implement theme resolution logic in script: read localStorage, detect system preference, resolve final theme
- [ ] 5.3 Apply .dark class to document.documentElement when dark theme resolved
- [ ] 5.4 Handle fallback cases: localStorage disabled, media query unsupported
- [ ] 5.5 Position script as first child of head element for earliest execution timing

## Implementation Details

The inline script prevents flash of incorrect theme (FOIT) by executing before React hydration in the SSR context. Current app/layout.tsx structure shows html and body elements with Next.js font configuration but no head customization. The script needs to be injected into the head section.

### Current Structure
- app/layout.tsx: RootLayout component with html/body elements, Providers wrapper, AuthProvider wrapper
- app/globals.css: Contains :root CSS variables and prefers-color-scheme media query (lines 15-20)
- src/components/Providers.tsx: Client component with QueryClientProvider and ToastContainer

### Integration Points
- Script must execute before Providers component renders
- Script uses same localStorage key as ThemeContext: 'theme-preference'
- Script uses same theme resolution logic as ThemeContext
- Script applies class that Tailwind dark mode will respond to

### Key Technical Details
- Place script in head section of app/layout.tsx before body
- Use dangerouslySetInnerHTML to inject inline JavaScript
- Script must be self-contained with no external dependencies
- Handle localStorage access errors gracefully
- Default to light theme if media query unsupported
- Reference TechSpec section "Inline Script" for implementation approach

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/layout.tsx`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/globals.css`

### Dependent Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx` (will be created in Task 1)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/Providers.tsx`

## Deliverables

- Inline script added to app/layout.tsx head section
- Theme flash prevention working on initial page load
- Correct .dark class applied based on localStorage and system preference
- Graceful fallback for localStorage disabled or media query unsupported
- Script execution time under 5ms measured
- Integration tests verifying no theme flash **(REQUIRED)**
- Unit tests for theme resolution logic in script context **(REQUIRED)**

## Tests

- Integration tests for inline script behavior:
  - [ ] First visit with no localStorage and system light mode defaults to light theme
  - [ ] First visit with no localStorage and system dark mode defaults to dark theme
  - [ ] Returning visit with localStorage 'light' applies light theme regardless of system
  - [ ] Returning visit with localStorage 'dark' applies dark theme regardless of system
  - [ ] Returning visit with localStorage 'system' respects current system preference
  - [ ] localStorage unavailable falls back to system preference detection
  - [ ] Media query unsupported defaults to light theme
  - [ ] .dark class correctly applied to html element when dark theme active
  - [ ] .dark class not present when light theme active
  - [ ] Script execution completes before React hydration (no flash observable)
- Performance test: Script execution time under 5ms threshold
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- No flash of incorrect theme observable on page load in any scenario
- Theme correctly applied before React hydration in all test cases
- Script executes in under 5ms measured in performance tests
- Graceful fallback behavior verified for edge cases (localStorage disabled, media query unsupported)
- Code follows Next.js inline script patterns with dangerouslySetInnerHTML
- Linter shows no errors
