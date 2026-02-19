param(
  [switch]$NoBrowser,
  [switch]$Terminal
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not $Terminal) {
  Write-Host '🧩 Starting pipedl-server tray app...' -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot 'run-tray.ps1')
  exit $LASTEXITCODE
}

Write-Host '🚀 Starting PipeDL backend (terminal mode)...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath

if (-not $NoBrowser) {
  Start-Process 'http://localhost:5000' | Out-Null
}

python app.py
