$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '🧩 Starting pipedl-server...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath
python tray_app.py
