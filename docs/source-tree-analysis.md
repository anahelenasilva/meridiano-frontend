# Source Tree Analysis

> Annotated directory structure for the Meridiano Frontend project.

---

## Directory Tree

```
meridiano-frontend/
├── src/                      # Application source
│   ├── main.tsx              # Entry point — mounts App to #root
│   ├── App.tsx               # Root component — providers, router, routes
│   ├── index.css              # Global styles, Tailwind imports
│   ├── vite-env.d.ts          # Vite type declarations
│   │
│   ├── components/            # UI components (core + shell boundary)
│   │   ├── ui/                # Radix/shadcn primitives (presentational)
│   │   ├── Layout.tsx         # Main app shell
│   │   ├── LayoutWrapper.tsx  # Route-level layout
│   │   ├── Navbar.tsx         # Navigation
│   │   ├── AuthGuard.tsx      # Protected route wrapper
│   │   ├── Providers.tsx      # Context composition
│   │   └── ...                # Feature components (ArticleCard, etc.)
│   │
│   ├── contexts/             # Global state (imperative shell)
│   │   ├── AuthContext.tsx    # Auth state, login/logout
│   │   └── ThemeContext.tsx   # Theme state, toggleTheme
│   │
│   ├── pages/                # Route-level views (shell)
│   │   ├── LoginPage.tsx
│   │   ├── ArticlesPage.tsx
│   │   ├── ArticleDetailPage.tsx
│   │   ├── BookmarksPage.tsx
│   │   ├── BriefingsPage.tsx
│   │   ├── BriefingDetailPage.tsx
│   │   ├── YoutubeTranscriptionsPage.tsx
│   │   ├── YoutubeTranscriptionDetailPage.tsx
│   │   ├── AdminYoutubeChannelsPage.tsx
│   │   └── AdminYoutubeChannelAddPage.tsx
│   │
│   ├── services/             # HTTP / external I/O (shell)
│   │   └── api.ts            # Fetch wrapper, all API calls
│   │
│   ├── hooks/                # Reusable hooks
│   │   ├── useApi.ts         # TanStack Query wrappers for API
│   │   └── useTheme.ts       # Theme hook (re-export)
│   │
│   ├── types/                # Pure type definitions (core)
│   │   ├── index.ts          # API response types
│   │   └── auth.ts           # Auth types
│   │
│   ├── utils/                # Pure helpers (core)
│   │   ├── api-error.ts      # Error parsing
│   │   ├── toast.ts          # Toast helpers
│   │   ├── youtube.ts       # YouTube URL parsing
│   │   ├── s3.ts             # S3 helpers
│   │   └── get-article-image.ts
│   │
│   ├── constants/            # Static config
│   │   └── messages.ts
│   │
│   └── test/                 # Test setup
│       └── setup.ts
│
├── public/                   # Static assets
├── docs/                     # Project documentation
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── index.html                # HTML entry
└── Dockerfile                # Production build
```

---

## Critical Folders

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Entry point; mounts React app |
| `src/App.tsx` | Provider composition, route config, auth gate |
| `src/services/api.ts` | All backend API calls; single source of HTTP |
| `src/contexts/` | Auth and theme state; consumed app-wide |
| `src/pages/` | One component per route |
| `src/components/ui/` | Reusable UI primitives (shadcn) |
| `src/types/` | API response and domain types |
| `src/hooks/useApi.ts` | TanStack Query hooks wrapping API |

---

## Entry Points

- **App:** `src/main.tsx` → `App.tsx`
- **Routes:** Declared in `App.tsx` via `BrowserRouter` + `Routes`
- **Auth gate:** `AppContent` checks `isAuthenticated`; unauthenticated users see `LoginPage`

---

## Integration Points

- **Backend API:** `VITE_API_BASE_URL` (default `http://localhost:3001`)
- **S3:** Presigned URLs from `/api/articles/upload-url` for markdown uploads
