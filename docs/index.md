# Meridiano Frontend — Documentation Index

> Primary entry point for project documentation and AI-assisted development.

---

## Project Overview

- **Type:** Monolith (single-part web app)
- **Primary Language:** TypeScript
- **Architecture:** Pages call TanStack Query hooks (`src/hooks/useApi.ts`), which call a thin fetch wrapper (`src/services/api.ts`)

---

## Quick Reference

- **Tech Stack:** React 19, Vite 8, TypeScript 5, Tailwind v4, React Router v8
- **Entry Point:** `src/main.tsx` → `App.tsx`
- **API Base:** `VITE_API_BASE_URL` (default: `http://localhost:3001`)

---

## Generated Documentation

- [Project Overview](./project-overview.md)
- [Architecture](./ARCHITECTURE.md)
- [Component Inventory](./component-inventory.md)

---
