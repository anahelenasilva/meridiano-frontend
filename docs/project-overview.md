# Project Overview

> Meridiano Frontend — Vite + React SPA for news briefings and articles.

---

## Summary

Meridiano Frontend is a single-page application for viewing AI-powered news briefings and articles. It consumes a NestJS backend API and provides:

- News briefings with AI summaries
- Article browsing, search, and filtering
- YouTube transcription management
- Bookmarks and dark theme

---

## Tech Stack

| Layer           | Technology                     |
| --------------- | ------------------------------ |
| Framework       | React 19 + TypeScript          |
| Build           | Vite 8                         |
| Styling         | Tailwind CSS v4                |
| Routing         | React Router v8                |
| HTTP            | Native fetch                   |
| Data            | TanStack Query                 |
| Testing         | Vitest + React Testing Library |
| Package manager | pnpm                           |

---

## Architecture

- **Type:** Monolith (single cohesive frontend)
- **Pattern:** Pages → TanStack Query hooks (`src/hooks/useApi.ts`) → fetch wrapper (`src/services/api.ts`)
- **State:** React Context (auth, theme) + TanStack Query + local state

---

## Repository Structure

```
meridiano-frontend/
├── src/           # Application source
├── docs/          # Project documentation
├── public/        # Static assets
└── ...            # Config files
```

---

## Documentation Index

- [Architecture](./ARCHITECTURE.md)
- [Component Inventory](./component-inventory.md)
