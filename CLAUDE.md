# Meridiano Frontend

## Development

### Running the app

```bash
pnpm dev
```

### Before using Playwright MCP interactively

1. Start backend: `cd ../meridiano-backend && pnpm dev`
2. Start frontend: `pnpm dev`

### Running E2E tests

Playwright is configured to auto-start both frontend (port 8080) and backend (port 3001) via `webServer` in `playwright.config.ts`.

```bash
npx playwright test
```

To run only mobile layout tests:

```bash
npx playwright test mobile-layout
```

### Running unit tests

```bash
pnpm test
```

### Linting and type checking

```bash
pnpm lint
pnpm typecheck
```
