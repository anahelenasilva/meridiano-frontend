# Meridiano Frontend

A Vite + React application for viewing news briefings and articles, powered by AI summaries and insights from curated news feeds.

This project was migrated from Next.js to Vite with React Router.

## Features

- **News Briefings**: View AI-powered summaries and insights from curated news feeds
- **Articles**: Browse, search, and filter articles with advanced filtering options
- **Article Details**: View full article content with AI summaries and related articles
- **Briefing Details**: View detailed briefings with markdown rendering
- **Dark Theme**: Full dark mode support with system preference detection

## Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI library
- **React Router** - Client-side routing
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching and caching
- **fetch** - HTTP client, wrapped in `src/services/api.ts`
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **React Markdown** - Markdown rendering

## Getting Started

### Prerequisites

- Node.js 26.12.1 (see .nvmrc)
- pnpm (or npm/yarn)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure the API endpoint (optional):

`pnpm dev` calls the API at `http://localhost:3001`. To point it elsewhere, create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3001
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  components/          # React components
    Layout.tsx        # App shell and navigation
    ui/               # UI components (shadcn/ui style)
  contexts/           # React contexts
    AuthContext.tsx   # Authentication context
    ThemeContext.tsx  # Theme context for dark mode
  hooks/              # Custom React hooks
    useApi.ts         # API fetching hooks
  pages/              # Page components
    ArticlesPage.tsx  # Articles listing page
    ArticleDetailPage.tsx # Article detail page
    BriefingsPage.tsx # Briefings listing page
    BriefingDetailPage.tsx # Briefing detail page
  services/           # API services
    api.ts            # API client and service functions
  types/              # TypeScript type definitions
    api.ts            # API response types
  utils/              # Utility functions
public/               # Static assets
```

## API Configuration

Outside `pnpm dev`, the app calls the API on its own origin, and `vite preview` proxies `/api` to `http://127.0.0.1:3001` (`server.proxy` in `vite.config.ts`). Any hostname the page is opened under (localhost, a LAN IP, a Tailscale name) reaches the API without CORS.

A `VITE_API_BASE_URL` containing `railway.app` overrides this.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm serve` - Start production server (port 8080)
- `pnpm lint` - Run ESLint

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)