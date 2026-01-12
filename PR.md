**Summary**
- Adds Supabase password-reset flow with request/update forms, toast feedback, and redirect handling when already signed in.
- Redesigns dashboard shell with inset sidebar, header chrome, and richer KPI/chart components for engagement metrics.
- Improves backend bootstrapping via a minimal FastAPI app with CORS and `/health`, plus a cross-platform uvicorn runner and updated docs/ignores.

**Changes**
- Auth: new `/reset-password` page plus request/update forms; toast messaging; redirect guard (`apps/web/src/app/(auth)/reset-password/page.tsx`, `apps/web/src/components/auth/reset-password-request-form.tsx`, `apps/web/src/components/auth/reset-password-update-form.tsx`).
- Server actions: password reset/update logic with base URL helper and validation (`apps/web/src/lib/actions.ts`).
- Dashboard UI: inset sidebar + header; KPI cards; multiple chart components (line, stacked bar, pie, horizontal) with supporting UI (drawer, sheet, tooltip, toggle, tabs, table, skeleton) (`apps/web/src/app/(dashboard)/layout.tsx`, `apps/web/src/app/(dashboard)/page.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/components/ui/*`, `apps/web/src/components/sidebar/*`, `apps/web/src/components/ui/kpi.tsx`).
- Misc UI tweaks including OAuth button/layout adjustments (`apps/web/src/components/oauth-button.tsx`, related UI).
- Backend: FastAPI app with CORS + `/health`; JS uvicorn runner using repo venv; server README and gitignore updates (`apps/server/app/main.py`, `apps/server/scripts/run-uvicorn.js`, `apps/server/README.md`, `.gitignore` files).
- Data/lockfile updates for analytics seeds and package versions (`apps/web/src/lib/analytics/dashboard/seed.json`, `apps/server/analytics/dashboard/seed.json`, `bun.lock`, `package.json`).

**Testing**
- Not run (specify if you want `bun run lint`, `bun run test`, or backend health check).
