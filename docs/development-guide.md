# Development Guide

> Local setup and development workflow for Meridiano Frontend.

---

## Prerequisites

- **Node.js** ≥ 18 (LTS)
- **pnpm** (package manager; project uses pnpm exclusively)

---

## Installation

```bash
pnpm install
```

---

## Environment

Create `.env` or `.env.local` from `.env.sample`:

```env
VITE_API_BASE_URL=http://localhost:3001
```

**Note:** The app auto-detects API URL from hostname + port 3001 when `VITE_API_BASE_URL` is unset. Override only when needed.

---

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (Vite, default port 5173) |
| `pnpm build` | Production build → `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm serve` | Serve production build on port 8080 |
| `pnpm test` | Run Vitest (single run) |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |
| `pnpm lint:biome` | Run Biome linter |
| `pnpm typecheck` | TypeScript check (`tsc --noEmit`) |

---

## Testing

- **Runner:** Vitest
- **DOM:** jsdom
- **Setup:** `src/test/setup.ts`
- **Pattern:** `src/**/*.{test,spec}.{ts,tsx}` (colocated with source)
- **Philosophy:** Test behavior, not implementation; prefer role/label/text queries

---

## Code Conventions

- **Functional Core / Imperative Shell:** Pure logic in utils/types; side effects in services/contexts/pages
- **Provider + hook pattern:** Contexts expose `use<Name>()` hooks; throw if used outside provider
- **Colocation:** Tests next to source; feature docs under `docs/<feature>/`
- **Conventional Commits:** Enforced via project rules (see `.kilocode/rules-code/rules.md`)
