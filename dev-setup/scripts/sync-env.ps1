#Requires -Version 5.1
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$LocalTanstackEnv = Join-Path $Root "local\tanstack.env"
$TanstackEnv = Join-Path $Root "tanstack\.env"

if (-not (Test-Path $LocalTanstackEnv)) {
    Write-Error "local/tanstack.env not found. Run: .\dev-setup\init.ps1"
}

Copy-Item $LocalTanstackEnv $TanstackEnv -Force
Write-Host "Synced local/tanstack.env -> tanstack/.env" -ForegroundColor Green
