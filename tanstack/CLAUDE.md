# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GetDoa is an Islamic prayer (doa/supplication) application built with TanStack Start, a full-stack React framework. The app provides personalized prayer experiences with features like prayer collections, smart reminders, and multi-language support.

## Development Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Build & Production
pnpm build            # Build for production (outputs to .output/)
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Run Prettier
pnpm check            # Format + lint fix

# Testing
pnpm test             # Run Vitest tests

# Database
pnpm drizzle-kit push    # Push schema changes to database (no migrations)
pnpm drizzle-kit studio  # Open Drizzle Studio GUI
```

## Architecture

### Framework Stack

- **TanStack Start** - Full-stack React meta-framework with file-based routing
- **Nitro** - Server runtime (Vite plugin integrated)
- **Vite** - Build tool with Tailwind CSS v4 integration
- **TypeScript** - Strict mode enabled

### Key Technologies

- **UI**: shadcn/ui (base-vega style) + Radix primitives + Tailwind CSS v4
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Google OAuth
- **Animations**: Framer Motion

### File Structure

```
src/
├── routes/              # TanStack file-based routing
│   ├── __root.tsx       # Root layout with devtools
│   ├── index.tsx        # Landing page
│   ├── doa.route.tsx    # Doa section layout with LanguageProvider
│   ├── doa.$slug.tsx    # Dynamic doa pages
│   └── api/auth/$.ts    # Better Auth API handler
├── components/
│   ├── ui/              # shadcn/ui components
│   └── landing/         # Landing page components
│       ├── sections/    # Page sections (hero, features, etc.)
│       ├── components/  # Reusable landing components
│       └── layout/      # Landing layout wrapper
├── db/
│   ├── schema.ts        # Drizzle schema (user, session, account, verification)
│   └── index.ts         # Database connection
├── lib/
│   ├── auth.ts          # Better Auth server config
│   ├── auth-client.ts   # Better Auth React client
│   ├── constants.ts     # Landing page content constants
│   ├── sedekah-je-api.ts # External API integration
│   └── utils.ts         # cn() utility for classnames
├── contexts/            # React context providers
├── router.tsx           # Router configuration
└── styles.css           # Tailwind + custom CSS (oklch colors, fonts)
```

### Routing Patterns

TanStack Start uses file-based routing:

- `routes/index.tsx` → `/`
- `routes/about.tsx` → `/about`
- `routes/doa.route.tsx` → Layout for `/doa/*` routes
- `routes/doa.$slug.tsx` → `/doa/:slug` dynamic routes
- `routes/api/auth/$.ts` → API catch-all route for auth

Route files export a `Route` constant created with `createFileRoute()`:

```tsx
export const Route = createFileRoute('/path')({
  component: Component,
  head: () => ({ title: '...', meta: [...] }),
})
```

### Authentication

Better Auth is configured with:

- Google OAuth provider
- Drizzle adapter for PostgreSQL
- Session management via `user`, `session`, `account`, `verification` tables

Client-side auth:

```tsx
import { signIn, signOut, useSession } from '@/lib/auth-client'
```

### Database

Drizzle ORM with PostgreSQL. Schema in `src/db/schema.ts` includes auth tables with relations.

Push schema changes directly (no migrations):

```bash
pnpm drizzle-kit push
```

### Styling

- Tailwind CSS v4 with oklch color system
- CSS variables for theming (light/dark mode)
- Custom fonts: Roboto (sans), Playfair Display (serif), Simpo (Arabic)
- shadcn/ui with `@/components/ui` path alias

### Path Aliases

Configured in `tsconfig.json`:

- `@/*` → `./src/*`

## Environment Variables

Required in `.env`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Docker

Multi-stage Dockerfile for production deployment:

- Uses Node 24 Alpine
- Runs on port 3230
- Timezone: Asia/Kuala_Lumpur
- Health check endpoint: `/health`
