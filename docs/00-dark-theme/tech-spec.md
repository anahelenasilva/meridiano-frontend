## Executive Summary

Implement a comprehensive dark theme for the Meridiano news application using a custom ThemeContext that manages three theme modes: 'light', 'dark', and 'system'. The solution detects user system preferences via `prefers-color-scheme` media query on first visit, provides manual theme toggle in the navigation header, and persists preferences to localStorage. An inline script in the document `<head>` applies the correct theme class before React hydration to prevent flash. Dark theme colors are defined using Tailwind v4's `@theme` directive with semantic color tokens. Components are updated using a hybrid approach: `dark:` variants for unique styles, reusable CSS classes for repeated patterns. This architecture follows the existing AuthContext pattern and fully satisfies PRD requirements for WCAG AA contrast compliance.

## System Architecture

### Domain Placement

**New Files:**

- `src/contexts/ThemeContext.tsx` - Theme state management, system preference detection, media query listener, localStorage persistence
- `src/hooks/useTheme.ts` - Custom hook for consuming ThemeContext in components
- `src/components/ThemeToggle.tsx` - Toggle button component for navigation header

**Modified Files:**

- `app/layout.tsx` - Add inline script to `<head>`, apply dynamic `dark` class to `<html>` element
- `src/components/Providers.tsx` - Add ThemeProvider alongside QueryClientProvider
- `src/components/Navbar.tsx` - Integrate ThemeToggle button
- `app/globals.css` - Add Tailwind v4 `@theme` directive with dark color tokens and `@custom-variant` for `.dark` class
- `app/page.tsx`, `app/articles/page.tsx`, `app/login/page.tsx`, `app/briefing/[id]/page.tsx` - Add `dark:` variants to Tailwind classes
- `src/components/LayoutWrapper.tsx`, `src/components/BookmarkButton.tsx` - Update with dark theme support
- `app/bookmarks/page.tsx` - Add dark theme support for bookmarks listing page (Task 10)
- `app/youtube-transcriptions/page.tsx` - Add dark theme support for transcriptions listing page (Task 11)
- `app/youtube-transcription/[id]/page.tsx` - Add dark theme support for transcription detail page (Task 12)
- `app/admin/youtube-channels/page.tsx`, `app/admin/youtube-channels/add/page.tsx` - Add dark theme support for admin pages (Task 13)

### Component Overview

**ThemeContext:**

- Manages theme state: `'light' | 'dark' | 'system'`
- Resolves `'system'` mode to actual theme using `prefers-color-scheme` media query
- Exposes `toggleTheme()` to cycle between light → dark → system → light
- Persists manual selections to localStorage key `theme-preference`
- Applies `.dark` class to `document.documentElement` based on resolved theme
- Handles media query listener lifecycle for system preference changes

**Inline Script:**

- Executes synchronously in `<head>` before React hydration
- Reads `theme-preference` from localStorage
- Detects system preference using `window.matchMedia('(prefers-color-scheme: dark)')`
- Applies `.dark` class to `<html>` element if dark theme should be active
- Prevents flash of incorrect theme (FOIT)

**ThemeToggle Component:**

- Client component with sun/moon icons from lucide-react
- Displays current theme mode with visual indicator
- Calls `toggleTheme()` from ThemeContext on click
- Accessible with keyboard navigation and screen reader support

## Implementation Design

### Core Interfaces

```typescript
// src/contexts/ThemeContext.tsx
type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
```

### Data Models

**localStorage Schema:**

```typescript
// Key: 'theme-preference'
// Value: 'light' | 'dark' | 'system' | null
// null indicates no manual preference, use system default
```

**ThemeContext State:**

```typescript
const [theme, setTheme] = useState<ThemeMode>('system');
const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
```

### API Endpoints

Not applicable - theme management is client-side only.

## Integration Points

**Browser APIs:**

- `window.matchMedia('(prefers-color-scheme: dark)')` - System preference detection
- `window.localStorage` - Theme preference persistence
- `MediaQueryList.addEventListener('change', handler)` - System preference change listener
- `document.documentElement.classList` - Apply `.dark` class for theme styling

**Fallback Handling:**

- If localStorage unavailable (private browsing, disabled): Fall back to system preference
- If media query unsupported: Default to light theme
- Graceful degradation ensures theme functionality works in all environments

## Impact Analysis

| Affected Component                | Type of Impact        | Description & Risk Level                                                                                              | Required Action                           |
| --------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `app/layout.tsx`                  | Content Injection     | Add inline script to `<head>`. Low risk - standard Next.js pattern.                                                   | Add script with `dangerouslySetInnerHTML` |
| `src/components/Providers.tsx`    | Component Composition | Add ThemeProvider wrapper. Low risk - follows QueryClientProvider pattern.                                            | Wrap children with ThemeProvider          |
| `src/components/Navbar.tsx`       | UI Addition           | Add ThemeToggle button. Low risk - append to existing nav.                                                            | Import and render ThemeToggle             |
| `app/globals.css`                 | Style System Change   | Add `@theme` directive and dark variants. Medium risk - could affect existing styles if not careful with specificity. | Test all pages after CSS changes          |
| All page components               | Style Updates         | Add `dark:` variants to Tailwind classes. Medium risk - \~15 files, potential for missing styles.                     | Systematic review and testing             |
| `react-toastify` (ToastContainer) | Theme Integration     | Update theme prop to respect dark mode. Low risk - supported by library.                                              | Pass dynamic theme to ToastContainer      |

## Testing Approach

### Unit Tests

**ThemeContext (**`src/contexts/ThemeContext.test.tsx`**):**

- Test initial state defaults to 'system' mode
- Test `toggleTheme()` cycles through light → dark → system → light
- Test localStorage persistence on theme change
- Test localStorage read on provider mount
- Test media query listener registration and cleanup
- Test resolved theme calculation for each mode
- Mock `window.matchMedia` and `localStorage` for deterministic tests

**ThemeToggle Component (**`src/components/ThemeToggle.test.tsx`**):**

- Test icon changes based on current theme mode
- Test click handler calls `toggleTheme()`
- Test keyboard accessibility (Enter, Space keys)
- Test ARIA labels for screen readers

### Integration Tests

**Theme Application Flow (**`__tests__/integration/theme-flow.test.tsx`**):**

- Test first visit without localStorage defaults to system preference
- Test manual toggle persists to localStorage
- Test localStorage preference overrides system preference on next visit
- Test system preference change listener updates resolved theme in 'system' mode
- Test theme class application to `<html>` element
- Test ToastContainer theme updates with theme context

**Visual Regression Tests:**

- Capture screenshots of key pages in light and dark themes
- Verify contrast ratios using automated tools (axe-core, pa11y)
- Validate WCAG AA compliance (4.5:1 for normal text, 3:1 for large text/UI)

## Development Sequencing

### Build Order

1. **Foundation: ThemeContext and inline script** (blocks all other work)

   - Create `ThemeContext.tsx` with three-state pattern
   - Create `useTheme.ts` hook
   - Add inline script to `app/layout.tsx`
   - Add ThemeProvider to `Providers.tsx`
   - **Rationale:** Core infrastructure must exist before components can consume theme state

2. **Styling: Tailwind v4 dark mode configuration** (blocks component updates)

   - Define dark color palette using `@theme` directive in `globals.css`
   - Configure `@custom-variant` for `.dark` class
   - Create reusable CSS classes for common patterns (card backgrounds, text colors)
   - **Rationale:** Color system must be defined before applying dark variants

3. **UI: ThemeToggle component and navigation integration**

   - Create `ThemeToggle.tsx` component
   - Integrate into `Navbar.tsx`
   - Test toggle functionality end-to-end
   - **Rationale:** Provides manual control for testing remaining components

4. **Component updates: Systematic dark mode application** (can parallelize)

   - Priority 1: High-traffic pages (`app/page.tsx`, `app/articles/page.tsx`)
   - Priority 2: Authentication and forms (`app/login/page.tsx`)
   - Priority 3: Detail pages and components (`app/briefing/[id]/page.tsx`, `BookmarkButton`, `LayoutWrapper`)
   - Priority 4: Bookmarks page (`app/bookmarks/page.tsx`) - Task 10
   - Priority 5: YouTube transcriptions pages (`app/youtube-transcriptions/page.tsx`, `app/youtube-transcription/[id]/page.tsx`) - Tasks 11-12
   - Priority 6: Admin pages (`app/admin/youtube-channels/page.tsx`, `app/admin/youtube-channels/add/page.tsx`) - Task 13
   - **Rationale:** Prioritize user-facing pages for incremental value delivery

5. **Integration: ToastContainer theme support**

   - Update `Providers.tsx` to pass dynamic theme prop to ToastContainer
   - Test toast appearance in both themes
   - **Rationale:** Depends on ThemeContext being fully functional

6. **Validation: Testing and accessibility audit**

   - Write unit tests for ThemeContext and ThemeToggle
   - Run contrast ratio validation tools
   - Perform keyboard navigation and screen reader testing
   - **Rationale:** Final validation before deployment

### Technical Dependencies

- **No external dependencies required** - All necessary libraries already present
- **Tailwind v4** - Already installed, supports `@theme` directive and dark mode
- **lucide-react** - Already installed, provides sun/moon icons for toggle
- **Next.js 16 + React 19** - Already installed, supports inline scripts and client components

## Monitoring & Observability

**Metrics to Expose:**

- `theme_preference_selected` - Track which theme mode users select (light/dark/system)
- `theme_toggle_clicks` - Count manual theme toggle interactions
- `system_preference_detected` - Track initial system preference on first visit (dark/light)
- `localstorage_fallback_triggered` - Count instances where localStorage is unavailable

**Logging Strategy:**

- Log theme initialization with resolved theme and source (system/localStorage) at `debug` level
- Log theme changes with previous and new theme modes at `info` level
- Log localStorage access failures at `warn` level with fallback behavior
- Log media query listener errors at `error` level

**Implementation:**

- Use existing logging infrastructure (console methods in development, structured logging in production)
- Add theme context to error boundaries to include theme state in error reports
- Integrate with existing monitoring dashboards to track theme adoption metrics

**Tools:**

- Browser DevTools for client-side debugging
- Existing application monitoring solution for metric collection
- Lighthouse for WCAG contrast validation in CI/CD

## Technical Considerations

### Key Decisions

**Decision: Custom ThemeContext over next-themes library**

- **Rationale:** Follows existing AuthContext pattern, provides full control over implementation, avoids additional dependency. Team is already familiar with React Context pattern from AuthContext.
- **Trade-offs:** More implementation work vs. battle-tested library. Mitigated by using next-themes as reference implementation.

**Decision: Three-state pattern (light/dark/system) over binary toggle**

- **Rationale:** Provides transparent user control, follows industry standard, allows users to return to system preference after manual override.
- **Trade-offs:** Slightly higher complexity vs. simpler binary toggle. Justified by better UX and full PRD compliance.

**Decision: Inline script in** `<head>` **over client-side only**

- **Rationale:** Prevents flash of incorrect theme on page load, critical for good UX in SSR context.
- **Trade-offs:** Small inline script increases HTML size marginally. Acceptable given 10-15 lines of code and significant UX improvement.

**Decision: Tailwind v4** `@theme` **directive over CSS variables only**

- **Rationale:** Leverages Tailwind's design token system, provides semantic color naming, integrates with `dark:` variant system.
- **Trade-offs:** Requires Tailwind v4 (already installed), learning curve for `@theme` syntax. Mitigated by clear documentation and examples.

**Decision: Hybrid component update approach (dark: variants + CSS classes)**

- **Rationale:** Balances flexibility and maintainability. Unique styles use `dark:` variants inline, repeated patterns use reusable classes.
- **Trade-offs:** Requires judgment calls on when to use each approach. Mitigated by establishing guidelines: 3+ usage instances → CSS class.

### Known Risks

**Risk: Media query listener memory leaks**

- **Impact:** If listener not properly cleaned up, could cause memory leaks over time
- **Mitigation:** Use React `useEffect` cleanup function to remove listener on unmount. Add unit tests to verify cleanup.

**Risk: Inline script execution timing issues**

- **Impact:** If script executes after React hydration, flash could still occur
- **Mitigation:** Place script as first child of `<head>` element. Use `blocking="render"` attribute if needed. Test across browsers.

**Risk: Incomplete dark mode coverage across components**

- **Impact:** Some UI elements may remain in light colors when dark theme active
- **Mitigation:** Systematic review of all components using checklist. Visual regression testing. QA pass on all pages in dark theme.

**Risk: Contrast ratio violations in dark theme**

- **Impact:** WCAG AA compliance failures, poor readability
- **Mitigation:** Use color contrast checker tools during development. Automated Lighthouse audits in CI. Manual testing with different monitors/screens.

**Risk: localStorage quota exceeded or disabled**

- **Impact:** Theme preference cannot be saved, falls back to system preference every visit
- **Mitigation:** Graceful fallback implemented. Use minimal storage (single string value). Catch and log localStorage errors.

### Special Requirements

**Performance:**

- Inline script must execute in &lt;5ms to prevent noticeable delay
- Theme toggle should apply class change synchronously for immediate visual feedback
- Media query listener should debounce rapid system preference changes (unlikely but possible)

**Accessibility (WCAG AA Compliance):**

- Dark theme background: `#121212` (Material Design dark gray)
- Normal text contrast: 4.5:1 minimum (e.g., `#e0e0e0` text on `#121212` background = 11.6:1)
- Large text/UI contrast: 3:1 minimum
- Focus indicators: 3px solid ring with sufficient contrast in both themes
- Theme toggle: ARIA label "Toggle theme mode", keyboard accessible (Tab + Enter)

**Browser Compatibility:**

- Modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+) support `prefers-color-scheme`
- Fallback to light theme for older browsers without media query support
- localStorage supported in all modern browsers, fallback to system preference if unavailable

### Standards Compliance

**Architectural Principles:**

- Follows existing AuthContext pattern for consistency
- Uses React Context for cross-cutting concerns
- Client components marked with `'use client'` directive
- Separates concerns: state management (ThemeContext), UI (ThemeToggle), styling (globals.css)

**Coding Standards:**

- TypeScript strict mode enabled, no `any` types
- 2-space indentation per `.editorconfig`
- No comments in code (self-documenting via clear naming)
- Pure functions for theme resolution logic (Functional Core, Imperative Shell)
- Path alias `@/*` for imports

**Testing Standards:**

- Unit tests for all stateful logic (ThemeContext, ThemeToggle)
- Integration tests for end-to-end theme flows
- Mock external dependencies (localStorage, matchMedia) using stubs
- No `.skip()` or `.only()` left in committed tests

**Error Handling:**

- Catch localStorage errors explicitly, log and fall back to system preference
- Catch media query errors, log and default to light theme
- No empty catch blocks or silent failures
- Meaningful error messages for debugging

**Framework Standards:**

- Next.js 16 App Router patterns
- React 19 best practices (hooks, context, effects)
- Tailwind CSS utility-first approach with semantic class names for reuse
- Follows react-toastify theming API for toast notifications
