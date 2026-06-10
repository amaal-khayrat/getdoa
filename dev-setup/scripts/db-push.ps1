#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$TanstackDir = Join-Path $Root "tanstack"

if (-not (Test-Path (Join-Path $TanstackDir "node_modules"))) {
    Write-Error "Run 'cd tanstack && pnpm install' first"
}

Write-Host "Pushing Drizzle schema to local database..." -ForegroundColor Cyan
Push-Location $TanstackDir
try {
    pnpm db:push
} finally {
    Pop-Location
}
