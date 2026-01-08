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

The API URL is **automatically detected** based on your current hostname. This means:
- Accessing via `http://localhost:3000` → API calls go to `http://localhost:3001`
- Accessing via `http://192.168.1.18:3000` → API calls go to `http://192.168.1.18:3001`
- Accessing via Tailscale `http://100.x.x.x:3000` → API calls go to `http://100.x.x.x:3001`

If needed, you can override this by creating a `.env.local` file (used as fallback for SSR):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

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

The app **dynamically detects the API URL** based on the current hostname:
- It automatically uses the same hostname as the frontend but with port `3001`
- This works seamlessly with localhost, local network IPs, and Tailscale IPs
- No configuration needed for different network environments!

For server-side rendering (SSR), you can optionally set `NEXT_PUBLIC_API_BASE_URL` as a fallback in your `.env.local` file.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
