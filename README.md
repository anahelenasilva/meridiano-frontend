# Meridiano Frontend

A Next.js application for viewing news briefings and articles, powered by AI summaries and insights from curated news feeds.

This project was migrated from a React + Vite application to Next.js 16 with the App Router.

## Features

- **News Briefings**: View AI-powered summaries and insights from curated news feeds
- **Articles**: Browse, search, and filter articles with advanced filtering options
- **Article Details**: View full article content with AI summaries and related articles
- **Briefing Details**: View detailed briefings with markdown rendering

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Moment.js** - Date formatting
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

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

If not set, the app will default to `http://localhost:3001` for API requests.

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (Briefings list)
│   ├── articles/          # Articles listing page
│   ├── article/[id]/      # Article detail page
│   └── briefing/[id]/     # Briefing detail page
├── src/
│   ├── components/        # React components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   └── Providers.tsx # TanStack Query provider
│   ├── services/          # API services
│   │   └── api.ts        # API client and service functions
│   └── types/            # TypeScript type definitions
│       └── api.ts        # API response types
└── public/               # Static assets
```

## API Configuration

The app uses Next.js rewrites to proxy API requests. By default, all requests to `/api/*` are forwarded to `http://localhost:3001/api/*`.

To change the backend URL, set the `NEXT_PUBLIC_API_BASE_URL` environment variable or modify `next.config.ts`.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
