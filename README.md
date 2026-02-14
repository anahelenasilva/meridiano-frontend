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
- **React 18** - UI library
- **React Router** - Client-side routing
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting
- **React Markdown** - Markdown rendering

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure the API endpoint (optional):

The API URL is **automatically detected** based on your current hostname. This means:
- Accessing via `http://localhost:5173` (default Vite port) -> API calls go to `http://localhost:3001`
- Accessing via `http://192.168.1.18:5173` -> API calls go to `http://192.168.1.18:3001`
- Accessing via Tailscale `http://100.x.x.x:5173` -> API calls go to `http://100.x.x.x:3001`

If needed, you can override this by creating a `.env` file:

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
    Navbar.tsx        # Navigation bar
    Providers.tsx     # Context providers
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

The app **dynamically detects the API URL** based on the current hostname:
- It automatically uses the same hostname as the frontend but with port `3001`
- This works seamlessly with localhost, local network IPs, and Tailscale IPs
- No configuration needed for different network environments!

For production builds, you can set `VITE_API_BASE_URL` as a fallback in your `.env` file.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm serve` - Start production server (port 8080)
- `pnpm lint` - Run ESLint
- `pnpm lint:biome` - Run Biome linter

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)