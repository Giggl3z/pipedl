$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host '🛠 PipeDL setup starting...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath

Write-Host '📦 Installing Python dependencies...' -ForegroundColor Yellow
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host ''
Write-Host '✅ Setup complete!' -ForegroundColor Green
Write-Host 'Next steps:' -ForegroundColor Green
Write-Host '1) Run backend:  powershell -ExecutionPolicy Bypass -File .\run.ps1'
Write-Host '2) Or run tray app: powershell -ExecutionPolicy Bypass -File .\run-tray.ps1'
Write-Host '3) Load extension: brave://extensions -> Developer mode -> Load unpacked -> yt-dlp-brave-extension'
