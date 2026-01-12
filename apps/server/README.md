# FastAPI Server (apps/server)

Backend for the RCC Dashboard & Engagement Tool. Python lives alongside a JavaScript monorepo; Turbo orchestrates, but Python dependencies stay in a virtual environment.

## Requirements
- Python 3.10+
- bun (or npm/pnpm) for repo scripts
- Node.js (for Turbo)

## Quick start

### Automated?

From the root folder

 - Step 1

``` bash
bun install                  # JS deps
```

 - Step 2
<!-- ! In Mac -->
```bash
bun run server:install
```

<!--  ! In Windows -->
```bash
bun run server:install:windows
```

 - Step 3
```bash
bun run dev
```

 - Step 4
 <!-- ? Health Check -->
 Go to http://localhost:8000/health
If you see
```json
{
    "status": "ok"
}
```

🎉 BACKEND IS ALL SET

else I am sorry! there is something wrong...


### Manual
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

Run the API:
```bash
# via Turbo (recommended, repo root)
bun run dev

# or directly (backend only)
cd apps/server
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints (default)
- API base: http://localhost:8000
- Swagger: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

## Notes
- `server:install` only creates the venv; it does not `pip install`.
- Turbo assumes `python` resolves inside the venv; activate it before `bun run dev`.
- For fresh shells, re-run the venv activation step.

## Troubleshooting
- `python: command not found`: use `python3 -m venv .venv` then activate.
- `No module named uvicorn`: `pip install -r requirements.txt` inside the venv.
- Turbo exits 127: ensure the venv is active so `python` is on PATH.