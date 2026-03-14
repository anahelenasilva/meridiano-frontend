# Tech Stack

## Core

| Layer      | Technology   | Version | Purpose                              |
| ---------- | ------------ | ------- | ------------------------------------ |
| Framework  | React        | 18      | UI components and state management   |
| Language   | TypeScript   | 5.x     | Type safety across the codebase      |
| Build Tool | Vite         | 5.x     | Dev server, HMR, production bundling |
| Routing    | React Router | 7       | Client-side SPA routing              |

## Styling

| Library      | Purpose                                      |
| ------------ | -------------------------------------------- |
| Tailwind CSS | Utility-first styling, `dark:` variant theme |

Tailwind v4 uses native CSS-based configuration — no `tailwind.config.js` needed.

## HTTP & Data

| Library | Purpose                                           |
| ------- | ------------------------------------------------- |
| Axios   | HTTP client with interceptors for auth and errors |

## Testing

| Tool                  | Purpose                       |
| --------------------- | ----------------------------- |
| Vitest                | Test runner and assertions    |
| React Testing Library | DOM-based component testing   |
| jsdom                 | Browser environment for tests |

## Tooling

| Tool   | Purpose                                       |
| ------ | --------------------------------------------- |
| pnpm   | Package manager (strict deps, disk-efficient) |
| ESLint | Linting (flat config)                         |

## Environment

- **Node:** ≥ 18 (LTS)
- **Env vars:** Prefixed with `VITE_`, loaded from `.env` / `.env.local`
- **CI conventions:** Conventional Commits (see [rules](../.kilocode/rules-code/rules.md))
