#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Local = Join-Path $Root "local"
$ComposeFile = Join-Path $Local "docker-compose.db.yml"
$EnvFile = Join-Path $Local ".env.db"

if (-not (Test-Path $ComposeFile)) {
    Write-Error "local/ not set up. Run: .\dev-setup\init.ps1"
}

# Reuse an existing getdoa-postgres container (e.g. from a prior docker run)
$existing = docker ps -a --filter "name=^getdoa-postgres$" --format "{{.Names}}|{{.Status}}" 2>$null
if ($existing) {
    $parts = $existing -split "\|"
    if ($parts[1] -match "^Up") {
        Write-Host "Postgres already running (getdoa-postgres)" -ForegroundColor Green
    } else {
        Write-Host "Starting existing getdoa-postgres container..." -ForegroundColor Cyan
        docker start getdoa-postgres | Out-Null
    }
} else {
    Write-Host "Starting GetDoa Postgres via Docker Compose..." -ForegroundColor Cyan
    docker compose -f $ComposeFile --env-file $EnvFile up -d
}

Write-Host "Waiting for database..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    docker exec getdoa-postgres pg_isready -U postgres 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
        break
    }
    Start-Sleep -Seconds 1
}

if ($ready) {
    Write-Host "Postgres is ready on localhost:5423" -ForegroundColor Green
} else {
    Write-Warning "Postgres may still be starting. Run .\local\scripts\status.ps1 to check."
}
