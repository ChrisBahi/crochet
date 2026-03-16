# CLAUDE.md

## Project Overview

Crochet is a SaaS matching platform built with Next.js that connects buyers and sellers. It uses a workspace-based multi-tenant architecture with GitHub OAuth authentication via Supabase.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Database/Auth:** Supabase (PostgreSQL + Realtime + GitHub OAuth)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

## Development Commands

```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Build for production
npm run start  # Run production build
npm run lint   # Run ESLint
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Project Structure

```
src/
├── app/
│   ├── (public)/login/     # GitHub OAuth login page
│   ├── app/                # Protected routes (dashboard, opportunities, matches, rooms)
│   ├── api/match/run/      # Match generation API endpoint
│   └── auth/               # OAuth callback and logout handlers
├── components/             # Reusable React components
├── lib/
│   ├── auth/               # Auth helpers (require-user, require-workspace)
│   ├── db/                 # Database query helpers
│   ├── matching/           # Matching scoring algorithm
│   └── supabase/           # Supabase client setup (server + browser)
└── utils/supabase/         # Additional Supabase utilities
```

## Architecture

### Authentication Flow
- GitHub OAuth handled by Supabase
- `middleware.ts` protects `/app/*` routes, redirecting unauthenticated users to `/login`
- Users must select a workspace after login (stored in `user_settings`)

### Data Model
Key Supabase tables: `workspaces`, `opportunities`, `matches`, `rooms`, `messages`, `user_settings`

### Matching Algorithm (`src/lib/matching/scoreMatch.ts`)
Scores opportunity pairs on a 100-point scale:
- Type compatibility (buyer/seller): 60 pts
- Industry match: 20 pts
- Country match: 10 pts
- Budget/price compatibility: 10 pts

### Component Patterns
- **Server Components (default):** Pages fetch data directly via async Supabase queries
- **Client Components (`"use client"`):** Used for interactive features (chat, forms, OAuth)
- Real-time chat uses Supabase PostgreSQL CDC subscriptions

## Code Conventions

- Path alias `@/*` maps to `src/*`
- Prefer Tailwind utility classes over inline styles
- Server-side data fetching in page components, not in client components
- Use `src/lib/auth/require-user.ts` and `require-workspace.ts` to guard server routes
