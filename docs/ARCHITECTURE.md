# Architecture overview

> Technical reference for the Meridiano Frontend project.

## Table of contents

- [Stack](#stack)
- [Shape of the app](#shape-of-the-app)
- [Project structure](#project-structure)
- [Data flow](#data-flow)
- [Contexts](#contexts)
- [Routing and the auth gate](#routing-and-the-auth-gate)
- [Testing](#testing)
- [Design decisions](#design-decisions)

---

## Stack

| Layer       | Technology                                       |
| ----------- | ------------------------------------------------ |
| Framework   | React 19 + TypeScript                            |
| Build       | Vite                                             |
| Styling     | Tailwind CSS v4 + CSS custom props               |
| Routing     | React Router v8                                  |
| Server data | TanStack Query                                   |
| HTTP        | Native `fetch`, wrapped in `src/services/api.ts` |
| Testing     | Vitest + React Testing Library                   |
| Package Mgr | pnpm                                             |
| Linting     | ESLint (flat config)                             |

---

## Shape of the app

Server data moves through three layers:

1. **Pages** (`src/pages/`) render a route. They read and change server data through query hooks, and keep UI state in `useState` or the URL.
2. **Query hooks** (`src/hooks/useApi.ts`) wrap each endpoint in a TanStack Query `useQuery` or `useMutation`. They own query keys and the cache updates after a mutation.
3. **The fetch wrapper** (`src/services/api.ts`) holds `apiFetch` and one typed function per endpoint. It adds the bearer token, parses JSON and turns error responses into thrown errors.

Components in `src/components/` follow the same rule as pages and call query hooks, not the fetch wrapper. `AuthContext` and `useAudioGeneration` are the two other callers of the wrapper.

---

## Project structure

```text
src/
├── pages/        ← one component per route
├── components/   ← shared components; ui/ holds the UI primitives
├── hooks/        ← query hooks (useApi.ts) and other custom hooks
├── services/     ← api.ts, the fetch wrapper and endpoint functions
├── contexts/     ← AuthContext, ThemeContext
├── types/        ← api.ts is generated from the backend OpenAPI spec
├── utils/        ← small helpers (error parsing, toasts, YouTube URLs)
├── constants/    ← user-facing messages
└── lib/          ← cn() class-name helper
```

---

## Data flow

```text
Page or component
  → query hook in src/hooks/useApi.ts (useQuery / useMutation)
    → endpoint function in src/services/api.ts
      → apiFetch (base URL, bearer token, JSON parsing, error handling)
        → backend REST API
  ← TanStack Query caches the result and re-renders consumers
```

### The fetch wrapper (`src/services/api.ts`)

- `getApiBaseUrl()` returns `VITE_API_BASE_URL` in development (default `http://localhost:3001`), and otherwise derives the URL from the current hostname on port 3001 unless `VITE_API_BASE_URL` points at Railway.
- `apiFetch` reads the token from `localStorage` (`auth_token`) and sends it as `Authorization: Bearer <token>`.
- A 401 with a token present expires the session: it clears stored auth and reloads, which drops the query cache and lands on the login form.
- Other non-2xx responses throw the error built by `parseErrorResponse` in `src/utils/api-error.ts`.
- `typedApiFetch` infers request paths and response bodies from the generated `src/types/api.ts`. Run `pnpm generate:api-types` to regenerate it; CI fails if it drifts from the backend spec.

### Query hooks (`src/hooks/useApi.ts`)

- Query keys name the resource and its params, e.g. `["articles", params]` or `["article", id, includeAudio]`.
- Mutations update or invalidate the affected queries once they succeed.
- `App.tsx` sets the defaults: 5 minute `staleTime` and 1 retry.

### State

There is no client state library. State lives in:

1. **TanStack Query** for anything that comes from the backend.
2. **React Context** for auth and theme.
3. **URL search params** for filters and pagination (see `src/hooks/useArticleFilters.ts`).
4. **Component `useState`** for everything else.

---

## Contexts

Each context exposes a `use<Name>()` hook that throws when called outside its provider.

### AuthContext (`src/contexts/AuthContext.tsx`)

- State: `user`, `accessToken`, `isAuthenticated` (true when `user` is set).
- Actions: `login(email, password)` and `logout()`.
- On mount it restores the session from `localStorage` (`auth_token`, `meridiano_user`) only when both are stored and the user has an `id`.
- `logout()` clears the query cache, because query keys are not scoped by user.
- `useUser()` returns a non-null `User` for components behind the auth gate.

### ThemeContext (`src/contexts/ThemeContext.tsx`)

Spec: [`docs/00-dark-theme/tech-spec.md`](./00-dark-theme/tech-spec.md)

- State: `theme` (`light`, `dark` or `system`) and `resolvedTheme` (`light` or `dark`).
- `toggleTheme()` cycles light → dark → system.
- The preference is stored in `localStorage` (`theme-preference`), and `system` follows `prefers-color-scheme`.
- It toggles a `dark` class on `<html>` so Tailwind's `dark:` variant applies.

### Provider order

```tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <AuthProvider>
      <ToastContainerWrapper />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
```

`AuthProvider` sits inside `QueryClientProvider` because `logout()` clears the query cache.

---

## Routing and the auth gate

`App.tsx` declares every route in one `<Routes>` block inside a `<Suspense>` boundary. Pages load with `React.lazy`, except `LoginPage`, which stays eager so logged-out visitors get the form with no extra request.

`AppContent` is the only auth gate. It renders `LoginPage` in place of the routes when `isAuthenticated` is false and leaves the URL alone, so a successful login renders the page that was requested.

---

## Testing

| Tool                  | Purpose                        |
| --------------------- | ------------------------------ |
| Vitest                | Unit and component tests       |
| React Testing Library | DOM-based component testing    |
| jsdom                 | Browser environment simulation |
| Playwright            | End-to-end tests in `e2e/`     |

- Tests sit next to the module they cover as `<module>.test.ts(x)`.
- Page and component tests that need server data either stub the global `fetch` and render in a real `QueryClientProvider`, or mock `@/hooks/useApi`.
- Query hook tests stub the global `fetch` and render the hook in a fresh `QueryClientProvider` with retries off.
- Query by role, label or text, and use `data-testid` only as a last resort.

```bash
pnpm test        # Vitest, single run
pnpm test:e2e    # Playwright, starts the frontend and the backend
```

---

## Design decisions

| Decision                                | Rationale                                                                                                 |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Vite SPA over Next.js**               | The app has no SSR requirement. It was migrated from Next.js.                                             |
| **TanStack Query for server data**      | Caching, refetching and mutation invalidation live in one place, so pages stay small.                     |
| **Native fetch, no HTTP library**       | `apiFetch` covers the token header and 401 handling in a few lines.                                       |
| **Types generated from OpenAPI**        | `src/types/api.ts` comes from the backend spec, and CI catches drift.                                     |
| **No client state library**             | Query cache, two contexts and the URL cover the state the app has.                                        |
| **Dark theme via CSS class strategy**   | Tailwind's `dark:` variant on a `<html>` class, with `localStorage` and system preference for the choice. |

---

## Related docs

- [Dark Theme Tech Spec](./00-dark-theme/tech-spec.md), the feature spec for theming.
