# Meridiano Frontend

## What It Is

Meridiano is a web application built as a single-page app (SPA) with authentication, theming, and a service-oriented API layer. It provides a responsive, accessible interface with dark mode support and protected routes for authenticated users.

## Key Capabilities

- **User authentication** — Register, login, logout with token-based sessions persisted across reloads.
- **Dark / light theming** — Respects system preference, allows manual toggle, persists choice.
- **Protected routing** — Unauthenticated users are redirected to login; authenticated users access the full app.
- **API integration** — Centralized HTTP layer with automatic token injection and global error handling.
