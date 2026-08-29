# Android Backup — Web UI
# Starts a local web server. Connect your phone and open the page for one-click backup.

param(
    [int]$Port = 8765,
    [switch]$BindLan
)

$ErrorActionPreference = 'Stop'
$webDir = Join-Path $PSScriptRoot "web"
$serverScript = Join-Path $webDir "server.ps1"

if (-not (Test-Path $serverScript)) {
    Write-Error "Web server not found: $serverScript"
}

try {
    & $serverScript -Port $Port -BindLan:$BindLan
} catch {
    Write-Host ""
    Write-Host "  Startup failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
