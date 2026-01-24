# Implement ThemeContext and provider setup

## Overview

Create the core theme infrastructure by implementing ThemeContext and ThemeProvider following the existing AuthContext pattern. This establishes the foundation for three-state theme management (light/dark/system), system preference detection via prefers-color-scheme media query, and localStorage persistence. The context exposes theme state and toggleTheme function to all components in the application.

<critical>
- **ALWAYS READ** the technical docs from the PRD before starting
- **REFERENCE TECHSPEC**: Implementation details for ThemeContext, media query listeners, and localStorage handling are in TechSpec Core Interfaces and Integration Points sections
- **FOCUS ON "WHAT"**: This task creates the theme state management infrastructure that other components will consume
- **MINIMIZE CODE**: Code patterns are documented in TechSpec - focus on requirements and integration points here
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST create ThemeContext with three theme modes: 'light', 'dark', 'system'
- MUST resolve 'system' mode to actual theme using window.matchMedia('prefers-color-scheme: dark')
- MUST persist manual theme selection to localStorage key 'theme-preference'
- MUST provide toggleTheme() function that cycles through light → dark → system → light
- MUST apply .dark class to document.documentElement based on resolved theme
- MUST register and cleanup media query listener for system preference changes
- MUST provide custom useTheme hook for consuming theme context
- MUST follow existing AuthContext pattern for consistency
- MUST handle localStorage unavailable scenarios with graceful fallback to system preference
- MUST integrate ThemeProvider into existing Providers component
</requirements>

## Subtasks

- [ ] 1.1 Create ThemeContext.tsx with three-state pattern and media query detection
- [ ] 1.2 Create useTheme.ts custom hook for context consumption
- [ ] 1.3 Integrate ThemeProvider into Providers.tsx alongside QueryClientProvider
- [ ] 1.4 Test localStorage persistence and media query listener lifecycle

## Implementation Details

This task creates the foundation for all theme-related functionality. The ThemeContext manages theme state using React Context API, following the same architectural pattern as AuthContext.

**Key Integration Points:**
- ThemeContext will be consumed by ThemeToggle component (created in separate task)
- ThemeProvider wraps application children in Providers.tsx, positioned alongside QueryClientProvider
- The resolved theme value will be used to update ToastContainer theme prop (separate task)
- Media query listener responds to system preference changes when theme mode is 'system'

**Files to Create:**
- Create `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx`
- Create `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/hooks/useTheme.ts` (new hooks directory)

**Files to Modify:**
- Update `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/Providers.tsx` to wrap children with ThemeProvider

**Reference TechSpec Implementation Section for:**
- Core Interfaces: ThemeMode, ResolvedTheme, ThemeContextType interface definitions
- Data Models: localStorage schema and state management approach
- Integration Points: Browser APIs usage (matchMedia, localStorage, classList)
- Standards Compliance: TypeScript strict mode, error handling patterns

**Testing Approach:**
- Unit tests for state management, toggleTheme cycling, localStorage persistence
- Integration tests for media query listener registration and cleanup
- Mock window.matchMedia and localStorage for deterministic testing

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/AuthContext.tsx` (pattern reference)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/Providers.tsx`

### Dependent Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/layout.tsx` (will add inline script in separate task)
- ThemeToggle component (not yet created, separate task)

## Deliverables

- ThemeContext.tsx with complete three-state theme management
- useTheme.ts custom hook for context consumption
- ThemeProvider integrated into Providers.tsx
- localStorage persistence for manual theme selections
- Media query listener for system preference changes with proper cleanup
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for theme state management flows **(REQUIRED)**

## Tests

- Unit tests for ThemeContext:
  - [ ] Initial state defaults to 'system' mode
  - [ ] toggleTheme cycles through light → dark → system → light sequence
  - [ ] Manual theme selection persists to localStorage with key 'theme-preference'
  - [ ] localStorage read on provider mount loads saved preference
  - [ ] Media query listener registers on mount and cleans up on unmount
  - [ ] Resolved theme calculation for 'system' mode based on matchMedia result
  - [ ] Resolved theme calculation for 'light' mode always returns 'light'
  - [ ] Resolved theme calculation for 'dark' mode always returns 'dark'
  - [ ] .dark class applied to document.documentElement when resolved theme is 'dark'
  - [ ] .dark class removed from document.documentElement when resolved theme is 'light'
  - [ ] localStorage unavailable falls back to system preference without errors
  - [ ] Media query unsupported defaults to light theme
- Unit tests for useTheme hook:
  - [ ] Hook throws error when used outside ThemeProvider
  - [ ] Hook returns context value when used inside ThemeProvider
- Integration tests:
  - [ ] Theme preference persists across provider unmount/remount cycles
  - [ ] System preference change updates resolved theme when mode is 'system'
  - [ ] Manual theme selection overrides system preference on subsequent visits
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- ThemeContext successfully provides theme state and toggleTheme function to consuming components
- useTheme hook accessible throughout application
- localStorage persistence working for manual theme selections
- Media query listener responds to system preference changes in 'system' mode
- .dark class correctly applied to document.documentElement based on resolved theme
- Graceful fallback when localStorage unavailable
- Code follows existing AuthContext pattern for architectural consistency
- No TypeScript errors, no use of any types
- Code follows personal development standards (no comments, clear naming, TDD approach)
