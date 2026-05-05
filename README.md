# StockScope

StockScope is a financial data web application built for CIS 444 (Web Programming, Spring 2026). Users can search any stock or cryptocurrency, view interactive price charts, build a watchlist, set price alerts, execute simulated trades with a starting balance of $10,000, and track their portfolio performance against other users on a public leaderboard.

## Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: PostgreSQL (Neon) via Prisma 7
- **Auth**: JWT (access + refresh) with bcrypt-hashed passwords stored in HttpOnly cookies
- **Market data**: Yahoo Finance (`yahoo-finance2`), CoinGecko, NewsAPI
- **Charts**: Recharts
- **Deployment**: Vercel
- **Tests**: Vitest

## Architecture

Three-tier:

```
Browser (React Client Components)
        │
        ▼
Next.js API Routes  ── Yahoo Finance / CoinGecko / NewsAPI
        │
        ▼
Prisma ORM ──► PostgreSQL (Neon)
```

The frontend talks to its own API routes under `/api/*` for everything that touches user state (auth, trades, watchlist, alerts, chat, notifications, portfolio). Public market data is fetched server-side and cached in-memory with `node-cache` to stay under third-party rate limits.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (we use Neon for development and production)

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file at the project root:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="some-long-random-string"
JWT_REFRESH_SECRET="another-long-random-string"
NEWS_API_KEY="your-newsapi-key"
```

### Database

```bash
npx prisma migrate deploy
npx prisma generate
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test
```

## Project structure

```
src/
├── app/
│   ├── (auth)/             # login, signup
│   ├── api/                # backend route handlers
│   ├── analytics/          # portfolio analytics page
│   ├── crypto/[id]/        # crypto detail page
│   ├── dashboard/          # user dashboard
│   ├── leaderboard/        # public leaderboard
│   ├── markets/            # markets browser
│   ├── profile/            # account settings
│   ├── stock/[symbol]/     # stock detail page
│   └── watchlist/          # watchlist page
├── components/
│   ├── home/               # landing page widgets
│   ├── layout/             # navbar, chat sidebar, notifications
│   ├── stock/              # chart, trade buttons, alert dialog
│   └── ui/                 # shadcn primitives
├── lib/
│   ├── api/                # external API wrappers
│   ├── auth.ts             # JWT + bcrypt helpers
│   ├── cache.ts            # in-memory cache with TTLs
│   ├── prisma.ts           # Prisma client singleton
│   └── rate-limit.ts       # in-memory rate limiter
└── types/                  # shared TypeScript types
```

## Features

- Sign up / log in with JWT cookies (access + refresh, rotation on refresh)
- Search stocks and crypto with debounced autocomplete
- Stock and crypto detail pages with interactive timeframe charts (1d, 1w, 1mo, 3mo, 1y, 5y)
- Buy / sell with simulated balance
- Watchlist (add, remove)
- Price alerts (above / below) with in-app notifications
- Portfolio analytics: allocation pie, P&L bar chart, win rate, best / worst trade
- Global chat with simple polling
- Public leaderboard ranked by portfolio value

## Real-time architecture

The proposal originally described WebSockets for the global chat ("we will evaluate WebSockets") and Server-Sent Events for notifications. In production we ship both as HTTP polling instead:

- Chat polls `GET /api/chat` every **3 seconds**
- Notifications poll `GET /api/notifications` every **20 seconds**

Rationale: Vercel's serverless platform does not support persistent WebSocket connections without a third-party broker (Pusher, Ably, etc.), and SSE adds streaming complexity without changing the user experience at our message volumes. Polling keeps the deployment fully self-contained, stays within Vercel's free tier, and the latency is acceptable for a classroom MVP. The data model and API surface are unchanged, so swapping in a real broker later would be transparent to the frontend.

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT secrets loaded from environment, never committed
- HttpOnly + SameSite cookies for auth tokens
- In-memory rate limiting on auth, trade, and chat endpoints
- All form inputs validated server-side
- Prisma parameterized queries (no raw SQL)

## License

Coursework for CIS 444. Not licensed for external use.
