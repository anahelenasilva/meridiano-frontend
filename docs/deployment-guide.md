# Deployment Guide

> Production build and container deployment.

---

## Build

```bash
pnpm build
```

Output: `dist/` (static assets). Served via `pnpm serve` (Vite preview on port 8080).

---

## Docker

**Dockerfile** uses multi-stage build:

1. **deps:** Install dependencies with pnpm
2. **builder:** Build with `VITE_API_BASE_URL` build arg
3. **runner:** Serve `dist/` via `pnpm serve` on port 8080

**Build:**

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-api.example.com -t meridiano-frontend .
```

**Run:**

```bash
docker run -p 8080:8080 meridiano-frontend
```

**Health check:** `wget` to `http://127.0.0.1:8080` every 30s.

---

## Environment

| Variable | Purpose |
|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL (build-time; baked into bundle) |

Set at **build time** for production. Runtime override not supported (SPA).

---

## CI/CD

No `.github/workflows` or other CI config detected in repo. Add pipeline as needed for build, test, and deploy.
