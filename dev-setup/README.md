# Local development bootstrap

This folder is **committed to git**. It contains templates and a one-time setup script.

Your actual working files live in **`local/`** at the repo root, which is **gitignored** and never pushed.

## First-time setup (new machine or missing `local/`)

From the repo root:

```powershell
.\dev-setup\init.ps1
```

This will:

1. Create `local/` from templates
2. Preserve an existing `local/tanstack.env` if you already have one
3. Sync `local/tanstack.env` → `tanstack/.env` (when the app env is missing or older)
4. Start Postgres in Docker
5. Run `pnpm db:push` if `tanstack/node_modules` exists

Then edit **`local/tanstack.env`** with your Google OAuth credentials and run:

```powershell
.\local\scripts\start-db.ps1
cd tanstack
pnpm dev
```

## Daily workflow

```powershell
.\local\scripts\start-db.ps1   # if Docker was restarted
cd tanstack
pnpm dev
```

## What gets ignored by git

| Path | Reason |
|------|--------|
| `local/` | Docker config, personal env copies, notes |
| `tanstack/.env` | App secrets (already ignored) |
| `.env` at repo root | Production Docker secrets (if you create one) |

## Full Docker stack (production-like)

To run the app + Postgres + PgBouncer entirely in Docker (port **3230**), use the root `docker-compose.yml`:

```powershell
# Create root .env with DOCKER_USERNAME, POSTGRES_*, BETTER_AUTH_*, etc.
docker build -t local/getdoa-tanstack:latest ./tanstack
docker compose --env-file .env up -d
```

See `tanstack/CLAUDE.md` for architecture details.
