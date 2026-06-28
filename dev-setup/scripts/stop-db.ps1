#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Local = Join-Path $Root "local"
$ComposeFile = Join-Path $Local "docker-compose.db.yml"
$EnvFile = Join-Path $Local ".env.db"

if (-not (Test-Path $ComposeFile)) {
    Write-Error "local/ not set up. Run: .\dev-setup\init.ps1"
}

Write-Host "Stopping GetDoa Postgres..." -ForegroundColor Cyan
docker compose -f $ComposeFile --env-file $EnvFile down
Write-Host "Stopped." -ForegroundColor Green
