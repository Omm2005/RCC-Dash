# RCC Dashboard and Engagement Tool

RCC Dashboard and Engagement Tool is a Turborepo monorepo for a dashboard web app and shared packages.

## Tech Stack

- Next.js 16 (App Router) and React 19
- Tailwind CSS v4, shadcn/ui, Base UI
- next-themes, sonner, motion
- FastAPI + Uvicorn backend (Python 3.10+)
- TypeScript and Zod-based env validation
- Bun and Turborepo

## Repository Layout

```
Turborepo/
├── apps/
│   ├── web/           # Next.js web app
│   └── server/        # FastAPI backend
└── packages/
    ├── config/        # Shared TS config
    └── env/           # Shared env schemas (server/web/native)
```

## Getting Started (monorepo)

Prerequisites: Bun 1.2+, Python 3.10+, Node.js (for Turbo)

Install dependencies:

```bash
bun install
bun run server:install               # creates .venv in apps/server (no pip yet)
cd apps/server
source .venv/bin/activate            # Windows: .venv\Scripts\Activate
pip install -r requirements.txt
```

Run all apps (web + server):

```bash
bun run dev
```

Run only one app:

```bash
bun run dev:web
bun run dev:server
```

Open:

- Web: http://localhost:3000
- Server: http://localhost:8000 (docs at /docs)

## Backend (apps/server)

### Requirements
- Python 3.10+
- bun (or npm/pnpm) for repo scripts
- Node.js (for Turbo)

### Quick start
From repo root:
```bash
bun install                  # JS deps
bun run server:install       # makes .venv in apps/server
```

Install Python deps (once the venv exists):
```bash
cd apps/server
source .venv/bin/activate         # Windows: .venv\Scripts\Activate
pip install -r requirements.txt
```

### Run the API
```bash
# via Turbo (recommended, repo root)
bun run dev

# or directly (backend only)
cd apps/server
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Endpoints (default)
- API base: http://localhost:8000
- Swagger: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

### Notes
- `server:install` only creates the venv; it does not `pip install`.
- Turbo assumes `python` resolves inside the venv; activate it before `bun run dev`.
- For fresh shells, re-run the venv activation step.

### Troubleshooting
- `python: command not found`: use `python3 -m venv .venv` then activate.
- `No module named uvicorn`: `pip install -r requirements.txt` inside the venv.
- Turbo exits 127: ensure the venv is active so `python` is on PATH.

### Fallback
| OS            | Command                     |
| ------------- | --------------------------- |
| macOS / Linux | `source .venv/bin/activate` |
| Windows       | `.venv\\Scripts\\activate`  |

## Environment Variables

Edit `apps/web/.env` as needed:

```bash
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
```

Shared env schemas live in `packages/env/src/*.ts`.

## Scripts

- `bun run dev`: Start all apps in dev mode
- `bun run dev:web`: Start the web app only
- `bun run build`: Build all apps
- `bun run check-types`: Typecheck across the repo
- `bun run server:install`: Create the server venv in `apps/server` (no pip)
