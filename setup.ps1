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

$startupChoice = Read-Host 'Do you want PipeDL Tray to auto-start when you log in? (Y/N)'
if ($startupChoice -match '^(y|yes)$') {
  try {
    & (Join-Path $PSScriptRoot 'install-tray-autostart.ps1')
  }
  catch {
    Write-Host "⚠️ Could not install startup task automatically: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host 'You can run it later: .\install-tray-autostart.ps1' -ForegroundColor Yellow
  }
} else {
  Write-Host 'Skipping auto-start setup.' -ForegroundColor DarkYellow
}

Write-Host 'Next steps:' -ForegroundColor Green
Write-Host '1) Run backend:  powershell -ExecutionPolicy Bypass -File .\run.ps1'
Write-Host '2) Or run tray app: powershell -ExecutionPolicy Bypass -File .\run-tray.ps1'
Write-Host '3) Load extension: brave://extensions -> Developer mode -> Load unpacked -> yt-dlp-brave-extension'
