# Configure Tailwind v4 dark mode color system

## Overview

Configure Tailwind v4 dark mode color system using the `@theme` directive to define semantic color tokens for dark theme backgrounds, text, borders, and UI elements. This establishes the foundation for dark theme styling across all components, providing WCAG AA compliant contrast ratios and following Material Design dark theme recommendations.

<critical>
- **ALWAYS READ** the technical docs from the PRD and TechSpec before starting
- **REFERENCE TECHSPEC**: Implementation details for color tokens, `@theme` directive usage, and `@custom-variant` configuration are in TechSpec lines 228-230
- **FOCUS ON "WHAT"**: Define the complete dark color palette, semantic tokens, and custom variant configuration
- **MINIMIZE CODE**: Show current structure only to illustrate what needs extension
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST define dark theme colors using Tailwind v4 `@theme` directive in app/globals.css
- MUST use dark gray (#121212 or similar) base background instead of pure black per Material Design recommendations
- MUST ensure WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for large text/UI elements
- MUST configure `@custom-variant` for `.dark` class selector to enable dark mode styling
- MUST define semantic color tokens for backgrounds, text, borders, and interactive elements
- MUST maintain consistency with existing light theme color naming patterns
</requirements>

## Subtasks

- [ ] 2.1 Add dark color palette to `@theme` directive with semantic tokens for backgrounds (surface levels), text (primary, secondary, tertiary), borders, and interactive elements
- [ ] 2.2 Configure `@custom-variant` directive to enable `.dark` class selector for theme switching
- [ ] 2.3 Create reusable CSS classes for common dark theme patterns (card backgrounds, elevated surfaces, text hierarchies)
- [ ] 2.4 Validate contrast ratios using browser DevTools or automated tools to ensure WCAG AA compliance
- [ ] 2.5 Test color system by temporarily applying `.dark` class to `<html>` element and verifying colors render correctly

## Implementation Details

This task extends the existing Tailwind v4 configuration in app/globals.css. The current file uses `@theme inline` directive (line 8-13) to define light theme colors via CSS variables. The dark mode color system will extend this pattern.

### Current Structure

app/globals.css currently has:
- Lines 1: `@import "tailwindcss";`
- Lines 3-6: `:root` with light theme CSS variables
- Lines 8-13: `@theme inline` directive mapping CSS variables to Tailwind tokens
- Lines 15-20: `@media (prefers-color-scheme: dark)` with basic dark colors (will be replaced)

### What Needs to Be Done

Add dark color definitions using `@theme` directive with comprehensive semantic tokens:
- Surface backgrounds at multiple elevation levels (base, raised, overlay)
- Text colors for hierarchy (primary, secondary, muted, disabled)
- Border and divider colors
- Interactive element colors (buttons, links, focus states)
- Accent colors desaturated for dark backgrounds

Configure `@custom-variant` to enable `.dark` class selector so components can use `dark:` variants.

Create reusable CSS classes for repeated dark theme patterns to avoid duplicating inline `dark:` variants across many components. Examples: dark card styles, dark text hierarchy, dark borders.

Refer to TechSpec implementation section for:
- Specific color token naming conventions
- `@theme` directive syntax and examples
- `@custom-variant` configuration
- Reusable class patterns

### Relevant Files

- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/app/globals.css`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/postcss.config.mjs`
- `/Users/anahelenadasilva/.compozy/worktrees/anahelenasilvameridiano-frontend-c9bee3b55582eeead2d181be480c213e/anahelenarp/update-frontend-theme-to-dark-theme/package.json`

### Dependent Files

- All page components that will consume these color tokens via `dark:` variants
- app/layout.tsx (will apply `.dark` class dynamically in later tasks)

## Deliverables

- Extended `@theme` directive in app/globals.css with complete dark color palette
- `@custom-variant` configuration for `.dark` class selector
- Semantic color tokens following naming conventions: --color-surface-*, --color-text-*, --color-border-*
- Reusable CSS utility classes for common dark theme patterns (3+ usage instances get a class)
- Unit tests verifying color token definitions exist and are accessible **(REQUIRED)**
- Visual validation test applying `.dark` class and checking rendered colors **(REQUIRED)**

## Tests

- Unit tests for this feature:
  - [ ] Verify `@theme` directive includes all required dark color tokens (surface, text, border, interactive)
  - [ ] Verify `@custom-variant` enables `.dark` class selector
  - [ ] Verify WCAG AA contrast ratios: normal text 4.5:1, large text/UI 3:1 minimum
  - [ ] Apply `.dark` class to test element and verify colors render as expected
  - [ ] Edge cases: Verify fallback behavior if CSS variables undefined, verify dark colors don't affect light theme
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- Dark color palette defined in `@theme` directive with semantic tokens for all UI elements
- `@custom-variant` configured for `.dark` class selector
- Contrast ratios meet WCAG AA standards verified with browser DevTools or automated tools
- Reusable CSS classes created for repeated patterns (card-dark, text-dark-primary, etc.)
- Manual verification: Temporarily add `dark` class to `<html>` element in browser DevTools shows dark colors applied correctly
- No breaking changes to light theme colors or existing component styles
