# GetDoa — local development

Personal local setup. This folder is **gitignored** — it stays on your machine and is never pushed to GitHub.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (`corepack enable`)

## Quick start

From the **repo root** (`E:\SQA\getdoa`):

```powershell
# 1. Start Postgres
.\local\scripts\start-db.ps1

# 2. Install deps & push schema (first time, or after schema changes)
cd tanstack
pnpm install
pnpm db:push

# 3. Run the app
pnpm dev
```

Open http://localhost:3000

## What's in this folder

| File | Purpose |
|------|---------|
| `docker-compose.db.yml` | Postgres 18 on port 5423 |
| `.env.db` | DB credentials for Docker Compose |
| `tanstack.env` | App env vars — synced to `tanstack/.env` by init/start scripts |
| `scripts/` | Helper scripts for DB and dev workflow |

## Common commands

```powershell
.\local\scripts\start-db.ps1    # start Postgres container
.\local\scripts\stop-db.ps1     # stop Postgres
.\local\scripts\db-push.ps1     # apply Drizzle schema to local DB
.\local\scripts\status.ps1      # check Docker + DB health
```

## Google OAuth (local)

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials:

- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `tanstack.env` (then re-run init or copy to `tanstack/.env`).

## Troubleshooting

### `ECONNREFUSED` on sign-in / Better Auth errors

Postgres is not running or `DATABASE_URL` port is wrong.

1. Run `.\local\scripts\status.ps1`
2. Ensure `DATABASE_URL` in `tanstack/.env` uses port **5423** (matches `POSTGRES_PORT` in `.env.db`)
3. Run `.\local\scripts\start-db.ps1`

### Fresh clone on this machine

```powershell
.\dev-setup\init.ps1
```

This recreates `local/` from templates. You'll need to fill in secrets in `local/tanstack.env` again.

### Full production-like stack (app + DB in Docker)

Use the root `docker-compose.yml` with a root `.env` — see `dev-setup/README.md`.

## Port reference

| Service | Port |
|---------|------|
| `pnpm dev` (TanStack) | 3000 |
| Local Postgres (Docker) | 5423 |
| Production Docker app | 3230 |
