#Requires -Version 5.1
<#
.SYNOPSIS
  Bootstrap the gitignored local/ dev environment from committed templates.

.USAGE
  From repo root:  .\dev-setup\init.ps1
#>
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Local = Join-Path $Root "local"
$Templates = Join-Path $PSScriptRoot "templates"
$TanstackEnv = Join-Path $Root "tanstack\.env"
$LocalTanstackEnv = Join-Path $Local "tanstack.env"

Write-Host "GetDoa local dev setup" -ForegroundColor Cyan
Write-Host "Root: $Root`n"

# --- Create local/ structure ---
$dirs = @(
    $Local,
    (Join-Path $Local "scripts")
)
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created $dir"
    }
}

# --- Copy template files (never overwrite existing local secrets) ---
$templateCopies = @{
    "docker-compose.db.yml" = "docker-compose.db.yml"
    "env.db.example"        = ".env.db"
    "local-README.md"       = "README.md"
}

foreach ($entry in $templateCopies.GetEnumerator()) {
    $src = Join-Path $Templates $entry.Key
    $dest = Join-Path $Local $entry.Value
    if (-not (Test-Path $dest)) {
        Copy-Item $src $dest
        Write-Host "Created $dest"
    } else {
        Write-Host "Kept existing $dest"
    }
}

# --- tanstack.env: preserve local copy, seed from tanstack/.env or template ---
if (-not (Test-Path $LocalTanstackEnv)) {
    if (Test-Path $TanstackEnv) {
        Copy-Item $TanstackEnv $LocalTanstackEnv
        Write-Host "Backed up tanstack/.env -> local/tanstack.env"
    } else {
        Copy-Item (Join-Path $Templates "tanstack.env.example") $LocalTanstackEnv
        Write-Host "Created local/tanstack.env from template - fill in secrets!"
    }
}

# --- Sync local/tanstack.env -> tanstack/.env ---
if (Test-Path $LocalTanstackEnv) {
    $sync = $true
    if (Test-Path $TanstackEnv) {
        $localTime = (Get-Item $LocalTanstackEnv).LastWriteTime
        $appTime = (Get-Item $TanstackEnv).LastWriteTime
        if ($appTime -gt $localTime) {
            Write-Host "tanstack/.env is newer than local/tanstack.env - skipping sync (edit local/tanstack.env to re-sync)"
            $sync = $false
        }
    }
    if ($sync) {
        Copy-Item $LocalTanstackEnv $TanstackEnv -Force
        Write-Host "Synced local/tanstack.env -> tanstack/.env"
    }
}

# --- Copy helper scripts into local/scripts/ ---
$scriptNames = @("start-db.ps1", "stop-db.ps1", "db-push.ps1", "status.ps1", "sync-env.ps1")
foreach ($name in $scriptNames) {
    $src = Join-Path $PSScriptRoot "scripts\$name"
    $dest = Join-Path $Local "scripts\$name"
    Copy-Item $src $dest -Force
    Write-Host "Installed local/scripts/$name"
}

# --- Start database ---
Write-Host "`nStarting Postgres..." -ForegroundColor Cyan
& (Join-Path $Local "scripts\start-db.ps1")

# --- Push schema if tanstack is installed ---
$tanstackDir = Join-Path $Root "tanstack"
if (Test-Path (Join-Path $tanstackDir "node_modules")) {
    Write-Host "`nPushing database schema..." -ForegroundColor Cyan
    Push-Location $tanstackDir
    try {
        pnpm db:push
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`nSkip db:push - run: cd tanstack; pnpm install; pnpm db:push" -ForegroundColor Yellow
}

Write-Host "`nDone! Next steps:" -ForegroundColor Green
Write-Host "  1. Edit local/tanstack.env (Google OAuth, etc.) then run: .\local\scripts\sync-env.ps1"
Write-Host "  2. cd tanstack; pnpm dev"
Write-Host "  3. Open http://localhost:3000"
Write-Host "`nSee local/README.md for full reference."
