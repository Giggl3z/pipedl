$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Show-PipeDLBanner {
  $banner = @'
 ____  _            ____  _      
|  _ \(_)_ __   ___|  _ \| |     
| |_) | | '_ \ / _ \ | | | |     
|  __/| | |_) |  __/ |_| | |___  
|_|   |_| .__/ \___|____/|_____| 
        |_|                      
'@
  Write-Host $banner -ForegroundColor Cyan
}

function Assert-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "$name is not installed or not on PATH. $hint"
  }
}

Show-PipeDLBanner
Assert-Command 'python' 'Install Python 3.10+ from https://python.org and enable PATH option.'
Write-Host '🧩 Starting pipedl-server...' -ForegroundColor Cyan

$guiPath = Join-Path $PSScriptRoot 'yt-dlp-gui'
if (-not (Test-Path $guiPath)) {
  throw "yt-dlp-gui folder not found at: $guiPath"
}

Set-Location $guiPath
python tray_app.py
