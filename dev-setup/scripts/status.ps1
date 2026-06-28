#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$Local = Join-Path $Root "local"

Write-Host "GetDoa local dev status`n" -ForegroundColor Cyan

# Docker
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK]  Docker is running" -ForegroundColor Green
    } else {
        Write-Host "[!!]  Docker is not running" -ForegroundColor Red
    }
} catch {
    Write-Host "[!!]  Docker is not available" -ForegroundColor Red
}

# Postgres container
$container = docker ps -a --filter "name=getdoa-postgres" --format "{{.Names}}|{{.Status}}|{{.Ports}}" 2>$null
if ($container) {
    $parts = $container -split "\|"
    $running = $parts[1] -match "^Up"
    if ($running) {
        Write-Host "[OK]  Container: $($parts[0]) — $($parts[1]) — $($parts[2])" -ForegroundColor Green
        docker exec getdoa-postgres pg_isready -U postgres 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK]  Postgres accepting connections" -ForegroundColor Green
        } else {
            Write-Host "[!!]  Container up but Postgres not ready yet" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[!!]  Container exists but stopped: $($parts[1])" -ForegroundColor Yellow
        Write-Host "      Run: .\local\scripts\start-db.ps1"
    }
} else {
    Write-Host "[!!]  No getdoa-postgres container" -ForegroundColor Yellow
    Write-Host "      Run: .\dev-setup\init.ps1  or  .\local\scripts\start-db.ps1"
}

# Env files
$tanstackEnv = Join-Path $Root "tanstack\.env"
$localTanstackEnv = Join-Path $Local "tanstack.env"
if (Test-Path $tanstackEnv) {
    Write-Host "[OK]  tanstack/.env exists" -ForegroundColor Green
} else {
    Write-Host "[!!]  tanstack/.env missing — run .\dev-setup\init.ps1" -ForegroundColor Red
}
if (Test-Path $localTanstackEnv) {
    Write-Host "[OK]  local/tanstack.env exists (gitignored backup)" -ForegroundColor Green
}

# DATABASE_URL port hint
if (Test-Path $tanstackEnv) {
    $content = Get-Content $tanstackEnv -Raw
    if ($content -match "localhost:5423") {
        Write-Host "[OK]  DATABASE_URL uses port 5423" -ForegroundColor Green
    } elseif ($content -match "DATABASE_URL=postgresql://") {
        Write-Host "[!!]  DATABASE_URL may not match local Postgres (expected port 5423)" -ForegroundColor Yellow
    } else {
        Write-Host "[!!]  DATABASE_URL not set in tanstack/.env" -ForegroundColor Yellow
    }
}

Write-Host ""
