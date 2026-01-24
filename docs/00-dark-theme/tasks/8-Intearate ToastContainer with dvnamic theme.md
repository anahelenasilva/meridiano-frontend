# Integrate ToastContainer with dynamic theme

## Overview

Update the ToastContainer component in Providers.tsx to dynamically respond to the theme context, switching between light and dark themes based on the user's theme preference. Currently, the ToastContainer is hardcoded to use light theme, which will create visual inconsistency when users enable dark mode.

<critical>
- **ALWAYS READ** the technical docs from this PRD before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST consume theme context from ThemeContext to determine current resolved theme
- MUST pass dynamic theme value to ToastContainer's theme prop (light or dark)
- MUST maintain existing ToastContainer configuration (pauseOnFocusLoss, limit)
- MUST update theme prop reactively when user changes theme preference
- MUST preserve all existing toast functionality and behavior
</requirements>

## Subtasks

- [ ] 5.1 Import useTheme hook from ThemeContext in Providers.tsx
- [ ] 5.2 Consume resolvedTheme value from ThemeContext
- [ ] 5.3 Update ToastContainer theme prop to use dynamic resolvedTheme value
- [ ] 5.4 Verify ToastContainer updates when theme changes

## Implementation Details

This task updates the existing ToastContainer implementation to integrate with the ThemeContext. The ToastContainer is currently rendered in Providers.tsx with a hardcoded theme prop set to "light" (line 26). This needs to be replaced with a dynamic value from ThemeContext.

Current ToastContainer configuration in Providers.tsx:
- Located at lines 24-28
- Currently uses static theme="light" prop
- Already configured with pauseOnFocusLoss and limit props

The react-toastify library (v11.0.5) supports theme prop values of "light", "dark", "colored", and "auto". For this implementation, use the resolvedTheme value from ThemeContext which returns either "light" or "dark".

Reference TechSpec Section 5 (Integration: ToastContainer theme support) for implementation approach and integration details.

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/components/Providers.tsx`

### Dependent Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/contexts/ThemeContext.tsx` (must exist before this task)
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/src/hooks/useTheme.ts` (must exist before this task)

## Deliverables

- Updated Providers.tsx component with dynamic ToastContainer theme integration
- ToastContainer that responds to theme changes in real-time
- All existing ToastContainer props and behavior preserved
- Unit tests for ToastContainer theme integration **(REQUIRED)**
- Integration tests verifying toast appearance in both themes **(REQUIRED)**

## Tests

- Unit tests for ToastContainer theme integration:
  - [ ] ToastContainer receives correct theme prop when ThemeContext resolvedTheme is "light"
  - [ ] ToastContainer receives correct theme prop when ThemeContext resolvedTheme is "dark"
  - [ ] ToastContainer theme prop updates when ThemeContext resolvedTheme changes
  - [ ] ToastContainer preserves existing configuration props (pauseOnFocusLoss, limit)
- Integration tests:
  - [ ] Toast notifications display with light styling when theme is light
  - [ ] Toast notifications display with dark styling when theme is dark
  - [ ] Toast styling updates when user toggles theme while toast is visible
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- ToastContainer theme prop dynamically reflects ThemeContext resolvedTheme value
- Toast notifications render correctly in both light and dark themes
- Theme changes propagate to visible toasts without requiring page refresh
- No visual inconsistency between application theme and toast notifications
- Linter shows no errors
