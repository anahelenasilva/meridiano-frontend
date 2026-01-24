# Create ThemeToggle component and integrate into navigation

## Overview

Create a ThemeToggle component that allows users to manually switch between light, dark, and system theme preferences. Integrate this component into the existing Navbar navigation header, providing users with visible theme control on all pages. The toggle cycles through three states (light → dark → system → light) and consumes the ThemeContext to update theme preferences.

<critical>
- **ALWAYS READ** the technical docs from this PRD before start
- **REFERENCE TECHSPEC**: Implementation details and code patterns are in TechSpec implementation section - do not duplicate here
- **FOCUS ON "WHAT"**: Describe what needs to be accomplished, not how to implement it
- **MINIMIZE CODE**: Show code only to illustrate current structure or problem areas, not implementation examples
- **TESTS REQUIRED**: Every implementation task MUST include tests in deliverables
</critical>

<requirements>
- MUST create a client component marked with 'use client' directive following Next.js 16 App Router patterns
- MUST use lucide-react icons (Sun, Moon, Monitor) to visually represent current theme state
- MUST integrate into existing Navbar component without disrupting current navigation structure
- MUST be keyboard accessible (Tab navigation, Enter/Space key activation)
- MUST provide ARIA labels for screen reader accessibility
- MUST call toggleTheme() from ThemeContext to cycle through theme modes
- MUST display clear visual indication of current active theme mode
- MUST be visible on both desktop and mobile layouts in Navbar
</requirements>

## Subtasks

- [ ] 2.1 Create ThemeToggle.tsx component in src/components/ directory
- [ ] 2.2 Import and integrate ThemeToggle into Navbar.tsx navigation header
- [ ] 2.3 Position ThemeToggle button in desktop layout (between nav links and user menu area)
- [ ] 2.4 Position ThemeToggle button in mobile menu layout
- [ ] 2.5 Add keyboard event handlers for Enter and Space key activation
- [ ] 2.6 Verify theme toggle functionality works end-to-end (click cycles through modes)

## Implementation Details

This task creates a UI component that provides manual theme control to users, satisfying PRD requirement for "Manual Theme Toggle Control" in the navigation header.

**Files to create:**
- `src/components/ThemeToggle.tsx` - New client component for theme toggle button

**Files to modify:**
- `src/components/Navbar.tsx` - Import and render ThemeToggle component

**Integration points:**
- ThemeToggle consumes ThemeContext via useTheme() hook (dependency: task 98e8f869 must be complete)
- Navbar currently renders user menu and mobile menu - ThemeToggle should be positioned near user controls
- Current Navbar structure: logo + nav links (left) | user menu + mobile toggle (right)
- ThemeToggle should be inserted between nav links area and user menu area for desktop layout
- For mobile layout, ThemeToggle should appear in the mobile menu dropdown alongside other navigation items

**Current Navbar structure to integrate with:**
```
Line 95-110: Desktop layout with logo, nav links, and user menu
Line 111-169: User menu area (desktop) and mobile menu toggle
Line 173-212: Mobile menu dropdown with navigation and user info
```

Reference TechSpec "Implementation Design" section for ThemeContext interface, ThemeToggle component specifications, and keyboard accessibility requirements. See TechSpec "Component Overview" for ThemeToggle behavior and icon selection logic.

### Relevant Files

- `src/components/Navbar.tsx` - Current navigation header structure
- `src/contexts/AuthContext.tsx` - Pattern reference for context consumption in components
- `src/components/Providers.tsx` - Provider composition pattern

### Dependent Files

- `src/contexts/ThemeContext.tsx` - Provides theme state and toggleTheme() function (dependency)
- `src/hooks/useTheme.ts` - Custom hook for consuming ThemeContext (dependency)

## Deliverables

- ThemeToggle.tsx component file created in src/components/
- ThemeToggle integrated into Navbar desktop layout
- ThemeToggle integrated into Navbar mobile menu layout
- Keyboard accessibility (Tab, Enter, Space) functional
- ARIA labels present for screen reader support
- Theme toggle cycles through light → dark → system → light modes when clicked
- Unit tests for ThemeToggle component with 80%+ coverage **(REQUIRED)**
- Integration tests for Navbar with ThemeToggle integration **(REQUIRED)**

## Tests

- Unit tests for ThemeToggle component:
  - [ ] Icon changes based on theme prop (Sun for light, Moon for dark, Monitor for system)
  - [ ] Click handler calls toggleTheme() from context
  - [ ] Keyboard activation works (Enter key triggers toggle)
  - [ ] Keyboard activation works (Space key triggers toggle)
  - [ ] ARIA label is present and descriptive
  - [ ] Component renders without errors when theme context is available
- Integration tests:
  - [ ] ThemeToggle appears in Navbar desktop layout
  - [ ] ThemeToggle appears in Navbar mobile menu
  - [ ] Clicking ThemeToggle updates theme state in ThemeContext
  - [ ] Visual state updates after theme change
- Test coverage target: ≥80%
- All tests must pass

## Success Criteria

- All tests passing
- Test coverage ≥80%
- ThemeToggle visible in Navbar on all pages in both desktop and mobile layouts
- Clicking toggle cycles through three theme modes correctly
- Keyboard navigation (Tab) focuses toggle button
- Enter and Space keys activate toggle when focused
- Screen reader announces current theme mode via ARIA labels
- No visual layout disruption to existing Navbar navigation or user menu
- Linter shows no errors
