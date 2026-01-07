# RCC-Dash

RCC-Dash is a Turborepo monorepo for a dashboard web app and shared packages.

## Tech Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS v4, shadcn/ui, Base UI
- next-themes, sonner, motion
- TypeScript and Zod-based env validation
- Bun and Turborepo

## Repository Layout

```
RCC-Dash/
├── apps/
│   └── web/           # Next.js web app
└── packages/
    ├── config/        # Shared TS config
    └── env/           # Shared env schemas (server/web/native)
```

## Getting Started

Prerequisite: Bun 1.2+

Install dependencies:

```bash
bun install
```

Run all apps (currently just web):

```bash
bun run dev
```

Run only the web app:

```bash
bun run dev:web
```

Open http://localhost:3000.

## Environment Variables

Edit `apps/web/.env` as needed:

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Shared env schemas live in `packages/env/src/*.ts`.

## Scripts

- `bun run dev`: Start all apps in dev mode
- `bun run dev:web`: Start the web app only
- `bun run build`: Build all apps
- `bun run check-types`: Typecheck across the repo
