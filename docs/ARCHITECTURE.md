# Architecture Overview

> Technical reference for the Meridiano Frontend project.

## Table of Contents

- [Stack](#stack)
- [Architectural Patterns](#architectural-patterns)
- [Project Structure](#project-structure)
- [Context Patterns](#context-patterns)
- [Data Flow & Service Layer](#data-flow--service-layer)
- [Routing & Navigation](#routing--navigation)
- [Testing Approach](#testing-approach)
- [Design Decisions & Rationale](#design-decisions--rationale)

---

## Stack

| Layer       | Technology                         |
| ----------- | ---------------------------------- |
| Framework   | React 18 + TypeScript              |
| Build       | Vite                               |
| Styling     | Tailwind CSS v4 + CSS custom props |
| Routing     | React Router v7                    |
| HTTP        | Axios                              |
| Testing     | Vitest + React Testing Library     |
| Package Mgr | pnpm                               |
| Linting     | ESLint (flat config)               |

---

## Architectural Patterns

### Functional Core / Imperative Shell

The codebase separates **pure logic** from **side-effectful orchestration**:

- **Functional Core** — Pure components, utility functions, type definitions, and context value derivations. These are deterministic and easy to test in isolation.
- **Imperative Shell** — Components and hooks that perform side effects: API calls (`src/services/`), browser storage access (`localStorage`), and router navigation. The shell wires the core to the outside world.

In practice this manifests as:

```text
src/
├── components/   ← Presentational (core)
├── contexts/     ← State + effects boundary (shell)
├── services/     ← HTTP / external IO (shell)
├── pages/        ← Route-level orchestration (shell)
├── types/        ← Pure type definitions (core)
└── utils/        ← Pure helpers (core)
```

### Component Composition over Inheritance

React function components + hooks exclusively. No class components, no HOCs. Shared behavior is extracted into custom hooks or context providers.

### Colocation

Tests live next to the modules they cover (`*.test.ts(x)` siblings). Feature-specific docs live under `docs/<feature>/`.

---

## Context Patterns

### AuthContext

**Location:** `src/contexts/AuthContext.tsx`

Provides authentication state and operations to the entire app.

```text
AuthProvider
├── state: { user, token, isAuthenticated }
├── actions: { login(), logout(), register() }
└── effects: localStorage persistence, token hydration on mount
```

**Key behaviors:**

1. On mount, reads a stored token from `localStorage` and rehydrates session state (imperative shell).
2. Exposes `login` / `logout` / `register` that call the API service layer, then update internal state.
3. Consumed via `useAuth()` custom hook that wraps `useContext` with a guard (`throw` if used outside provider).

**Composition point:** Wraps `<App />` at the router/layout level so every route has access.

### ThemeContext

**Location:** `src/contexts/ThemeContext.tsx`
**Spec:** [`docs/00-dark-theme/tech-spec.md`](./00-dark-theme/tech-spec.md)

Follows the **same provider + custom hook** pattern established by `AuthContext`:

```text
ThemeProvider
├── state: { theme: 'light' | 'dark' }
├── actions: { toggleTheme() }
└── effects: localStorage persistence, system-preference detection, <html> class manipulation
```

**Key behaviors:**

1. Reads initial preference: `localStorage` → OS `prefers-color-scheme` → falls back to `light`.
2. Toggles a `dark` class on `<html>` so Tailwind's `dark:` variant works globally.
3. Consumed via `useTheme()` hook.

### Provider Composition

Providers are nested at the app root following a **top-down dependency order** — outermost providers have no dependencies on inner ones:

```tsx
<ThemeProvider>        {/* no deps */}
  <AuthProvider>       {/* no deps on Theme */}
    <RouterProvider />
  </AuthProvider>
</ThemeProvider>
```

> **Convention:** Every new context must expose a `use<Name>()` hook that throws when called outside its provider. This guarantees fail-fast behavior and clear error messages during development.

---

## Data Flow & Service Layer

### Request Lifecycle

```text
Page/Component
  → calls useAuth() or direct service fn
    → src/services/api.ts (Axios instance, base URL, interceptors)
      → Backend REST API
        ← JSON response
      ← service fn returns typed data
    ← state update (context setState or local useState)
  ← re-render
```

### Service Layer (`src/services/`)

- **`api.ts`** — Shared Axios instance with:
  - `baseURL` from environment variable (`VITE_API_URL`)
  - Request interceptor that attaches `Authorization: Bearer <token>`
  - Response interceptor for global error handling (e.g., 401 → logout)
- **Domain services** (e.g., auth service functions) — Thin wrappers that call `api.get/post/put/delete` and return typed responses.

### Environment Configuration

Vite env vars prefixed with `VITE_` are exposed to client code. `.env` / `.env.local` files are used per-environment; `.env.example` documents required variables.

### State Management Philosophy

No external state library (Redux, Zustand, etc.). State lives in:

1. **React Context** — Global cross-cutting concerns (auth, theme).
2. **Component-local `useState` / `useReducer`** — Page or feature state.
3. **URL state** — React Router params and search params for navigational state.

This is intentional: the app's complexity doesn't warrant a dedicated store. If that changes, context can be swapped for Zustand with minimal surface-area impact since consumers already go through hooks.

---

## Routing & Navigation

React Router v7 with a declarative route config. Routes are code-split at the page level via lazy imports where beneficial.

**Protected routes** check `isAuthenticated` from `useAuth()` and redirect to `/login` if the user is unauthenticated. This is handled by a `ProtectedRoute` wrapper component or layout route.

---

## Testing Approach

### Tools

| Tool                  | Purpose                        |
| --------------------- | ------------------------------ |
| Vitest                | Test runner + assertions       |
| React Testing Library | DOM-based component testing    |
| jsdom                 | Browser environment simulation |

### Conventions

- **File naming:** `<module>.test.ts(x)` colocated with source.
- **Unit tests** for pure utilities and hooks.
- **Integration tests** for components — render with necessary providers, interact via user events, assert on DOM output.
- **No snapshot tests** unless explicitly justified — prefer explicit assertions.
- **Testing Library philosophy:** test behavior, not implementation. Query by role/label/text, not by class or test-id (use `data-testid` only as last resort).

### Running Tests

```bash
pnpm test        # single run
pnpm test:watch  # watch mode
pnpm coverage    # with coverage report
```

### Provider Wrapper

Tests that need context wrap components in a helper that composes required providers (Auth, Theme, Router memory history). This avoids duplicating boilerplate across test files.

---

## Design Decisions & Rationale

| Decision                                    | Rationale                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vite over CRA / Next.js**                 | SPA with no SSR requirement. Vite gives fast HMR and simple config.                                                                                       |
| **Tailwind CSS v4 + CSS custom properties** | Utility-first styling with design-token theming via custom props. v4's native CSS-based config removes the need for `tailwind.config.js`.                 |
| **No state library**                        | Context + hooks cover current needs. Avoids dependency and boilerplate for a modest state surface.                                                        |
| **Axios over fetch**                        | Interceptors for auth token injection and global error handling. Structured request/response transforms.                                                  |
| **pnpm**                                    | Strict dependency resolution, disk-efficient, enforced by project rules.                                                                                  |
| **Conventional Commits**                    | Enforced via project rules (see `.kilocode/rules-code/rules.md`). Enables automated changelogs and semantic versioning.                                   |
| **Colocation**                              | Tests and feature docs next to source reduces navigation friction and makes ownership obvious.                                                            |
| **Provider + hook pattern for contexts**    | Consistent API surface, fail-fast `useContext` guards, easy to mock in tests.                                                                             |
| **Dark theme via CSS class strategy**       | Tailwind `dark:` variant is mature, performant, and avoids runtime style recalculation. `localStorage` + system preference gives good UX with zero flash. |

---

## Related Docs

- [Agent & Workflow Rules](../.kilocode/rules-code/rules.md) — pnpm, conventional commits, coding conventions.
- [Dark Theme Tech Spec](./00-dark-theme/tech-spec.md) — Feature spec for theming implementation.
